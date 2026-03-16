'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';

type ImportRow = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

const COLUMN_ALIASES: Record<string, string[]> = {
  firstName: [
    'first name', 'firstname', 'first', 'given name', 'givenname',
    'client first name', 'customer first name', 'fname',
  ],
  lastName: [
    'last name', 'lastname', 'last', 'surname', 'family name', 'familyname',
    'client last name', 'customer last name', 'lname',
  ],
  fullName: [
    'name', 'full name', 'fullname', 'client name', 'customer name',
    'client', 'customer',
  ],
  email: [
    'email', 'e-mail', 'email address', 'emailaddress',
    'client email', 'customer email',
  ],
  phone: [
    'phone', 'phone number', 'phonenumber', 'mobile', 'mobile phone',
    'cell', 'cell phone', 'telephone', 'tel',
    'client phone', 'customer phone',
  ],
  notes: [
    'notes', 'note', 'comments', 'comment', 'memo', 'description',
    'client notes', 'customer notes',
  ],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_\-]/g, ' ').replace(/\s+/g, ' ');
}

function matchColumn(header: string): string | null {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }
  return null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',' || ch === '\t') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export async function parseImportFile(rawText: string): Promise<{
  headers: string[];
  mapping: Record<string, string | null>;
  preview: string[][];
  totalRows: number;
}> {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) throw new Error('File must have a header row and at least one data row.');

  const headers = parseCSVLine(lines[0]);
  const mapping: Record<string, string | null> = {};

  for (const header of headers) {
    mapping[header] = matchColumn(header);
  }

  const preview = lines.slice(1, 6).map((line) => parseCSVLine(line));

  return { headers, mapping, preview, totalRows: lines.length - 1 };
}

export async function importCustomers(
  rawText: string,
  columnMapping: Record<string, string | null>
): Promise<ImportResult> {
  const { shopId } = await requireShopAccess();

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) throw new Error('No data rows found.');

  const headers = parseCSVLine(lines[0]);
  const dataLines = lines.slice(1);

  const headerIndex: Record<string, number> = {};
  for (const [header, field] of Object.entries(columnMapping)) {
    if (field) {
      const idx = headers.indexOf(header);
      if (idx >= 0) headerIndex[field] = idx;
    }
  }

  const hasFirst = 'firstName' in headerIndex;
  const hasLast = 'lastName' in headerIndex;
  const hasFullName = 'fullName' in headerIndex;
  if (!hasFirst && !hasLast && !hasFullName) {
    throw new Error('At least a name column must be mapped.');
  }

  const rows: ImportRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const cols = parseCSVLine(dataLines[i]);
    const rowNum = i + 2;

    let firstName = '';
    let lastName = '';

    if (hasFullName && !hasFirst && !hasLast) {
      const full = (cols[headerIndex.fullName] ?? '').trim();
      if (!full) {
        errors.push(`Row ${rowNum}: empty name, skipped.`);
        continue;
      }
      const parts = full.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '—';
    } else {
      firstName = (hasFirst ? cols[headerIndex.firstName] ?? '' : '').trim();
      lastName = (hasLast ? cols[headerIndex.lastName] ?? '' : '').trim();

      if (!firstName && !lastName && hasFullName) {
        const full = (cols[headerIndex.fullName] ?? '').trim();
        const parts = full.split(/\s+/);
        firstName = parts[0] ?? '';
        lastName = parts.slice(1).join(' ') || '';
      }
    }

    if (!firstName && !lastName) {
      errors.push(`Row ${rowNum}: empty name, skipped.`);
      continue;
    }
    if (!firstName) firstName = '—';
    if (!lastName) lastName = '—';

    const email = 'email' in headerIndex ? (cols[headerIndex.email] ?? '').trim() || null : null;
    const phone = 'phone' in headerIndex ? (cols[headerIndex.phone] ?? '').trim() || null : null;
    const notes = 'notes' in headerIndex ? (cols[headerIndex.notes] ?? '').trim() || null : null;

    rows.push({ firstName, lastName, email, phone, notes });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(async (tx) => {
      for (const row of batch) {
        try {
          let existing = null;

          if (row.email) {
            existing = await tx.customer.findFirst({
              where: { shopId, email: row.email },
            });
          }
          if (!existing && row.phone) {
            existing = await tx.customer.findFirst({
              where: { shopId, phone: row.phone },
            });
          }

          if (existing) {
            await tx.customer.update({
              where: { id: existing.id },
              data: {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email ?? existing.email,
                phone: row.phone ?? existing.phone,
                notes: row.notes
                  ? existing.notes
                    ? `${existing.notes}\n${row.notes}`
                    : row.notes
                  : existing.notes,
              },
            });
            updated++;
          } else {
            await tx.customer.create({
              data: {
                shopId,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                phone: row.phone,
                notes: row.notes,
              },
            });
            created++;
          }
        } catch {
          skipped++;
          errors.push(`Row ${i + batch.indexOf(row) + 2}: database error, skipped.`);
        }
      }
    });
  }

  return {
    total: rows.length,
    created,
    updated,
    skipped,
    errors: errors.slice(0, 20),
  };
}
