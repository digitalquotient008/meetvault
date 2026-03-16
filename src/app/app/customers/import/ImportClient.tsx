'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, X, RotateCcw } from 'lucide-react';
import { parseImportFile, importCustomers } from './actions';

type Step = 'upload' | 'mapping' | 'importing' | 'done';

const FIELD_OPTIONS = [
  { value: '', label: '— Skip column —' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'notes', label: 'Notes' },
];

export default function ImportClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [preview, setPreview] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validTypes = [
      'text/csv',
      'text/tab-separated-values',
      'text/plain',
      'application/vnd.ms-excel',
      'application/csv',
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && ext !== 'csv' && ext !== 'tsv' && ext !== 'txt') {
      setError('Please upload a CSV, TSV, or TXT file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10 MB.');
      return;
    }

    const text = await file.text();
    setRawText(text);
    setFileName(file.name);

    try {
      const parsed = await parseImportFile(text);
      setHeaders(parsed.headers);
      setMapping(parsed.mapping);
      setPreview(parsed.preview);
      setTotalRows(parsed.totalRows);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateMapping = (header: string, field: string) => {
    setMapping((prev) => ({ ...prev, [header]: field || null }));
  };

  const mappedFields = Object.values(mapping).filter(Boolean);
  const hasName = mappedFields.includes('firstName') || mappedFields.includes('fullName');

  const handleImport = async () => {
    setStep('importing');
    setError(null);
    try {
      const res = await importCustomers(rawText, mapping);
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
      setStep('mapping');
    }
  };

  const reset = () => {
    setStep('upload');
    setRawText('');
    setFileName('');
    setHeaders([]);
    setMapping({});
    setPreview([]);
    setTotalRows(0);
    setError(null);
    setResult(null);
  };

  /* ─── Upload Step ─── */
  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-amber-500/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Drop your file here or click to browse</p>
          <p className="text-slate-500 text-sm">CSV, TSV, or TXT — up to 10 MB</p>
          <input
            id="file-input"
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Supported formats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              'Square — Customers CSV export',
              'Vagaro — Client list export',
              'Squire — Customer export',
              'Boulevard — Client CSV',
              'Booksy — Client export',
              'Any CSV with name, email, phone',
            ].map((s) => (
              <div key={s} className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {s}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              We auto-detect columns like <code className="text-slate-400">First Name</code>,{' '}
              <code className="text-slate-400">Last Name</code>,{' '}
              <code className="text-slate-400">Email</code>,{' '}
              <code className="text-slate-400">Phone</code>, and{' '}
              <code className="text-slate-400">Notes</code>.
              You can adjust the mapping before importing.
              Duplicates are matched by email or phone and updated — no data is lost.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Mapping Step ─── */
  if (step === 'mapping') {
    return (
      <div className="space-y-6">
        {/* File badge */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">{fileName}</p>
              <p className="text-xs text-slate-500">{totalRows.toLocaleString()} rows detected</p>
            </div>
          </div>
          <button type="button" onClick={reset} className="text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Column mapping */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Map columns</h3>
            <p className="text-xs text-slate-500 mt-1">
              We auto-detected most columns. Adjust if needed.
            </p>
          </div>
          <div className="divide-y divide-slate-800">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm text-slate-300 w-48 truncate shrink-0" title={header}>
                  {header}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                <select
                  value={mapping[header] ?? ''}
                  onChange={(e) => updateMapping(header, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {FIELD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {mapping[header] && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Preview (first {preview.length} rows)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-800 text-slate-400 text-left">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 whitespace-nowrap">
                        {mapping[h] ? (
                          <span className="text-amber-400">{FIELD_OPTIONS.find((o) => o.value === mapping[h])?.label}</span>
                        ) : (
                          <span className="text-slate-600 line-through">{h}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri} className="border-t border-slate-800">
                      {headers.map((h, ci) => (
                        <td
                          key={ci}
                          className={`px-3 py-2 whitespace-nowrap max-w-[200px] truncate ${
                            mapping[h] ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={reset} className="text-sm text-slate-400 hover:text-white">
            ← Choose another file
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!hasName}
            className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import {totalRows.toLocaleString()} clients
          </button>
        </div>
        {!hasName && (
          <p className="text-red-400 text-xs text-right">
            Map at least a &quot;First Name&quot; or &quot;Full Name&quot; column to continue.
          </p>
        )}
      </div>
    );
  }

  /* ─── Importing Step ─── */
  if (step === 'importing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-6" />
        <p className="text-white font-medium">Importing {totalRows.toLocaleString()} clients…</p>
        <p className="text-slate-500 text-sm mt-1">This may take a moment for large files.</p>
      </div>
    );
  }

  /* ─── Done Step ─── */
  if (step === 'done' && result) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Import complete</h2>
          <p className="text-slate-400 text-sm">
            Processed {result.total.toLocaleString()} rows from <span className="text-white">{fileName}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-emerald-400">{result.created}</p>
            <p className="text-xs text-slate-400 mt-1">New clients added</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-amber-400">{result.updated}</p>
            <p className="text-xs text-slate-400 mt-1">Existing updated</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-slate-400">{result.skipped}</p>
            <p className="text-xs text-slate-400 mt-1">Skipped</p>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">
              Issues ({result.errors.length > 20 ? '20+' : result.errors.length})
            </h3>
            <ul className="space-y-1 text-xs text-slate-500 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Import another file
          </button>
          <button
            type="button"
            onClick={() => router.push('/app/customers')}
            className="flex-1 px-4 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            View all clients →
          </button>
        </div>
      </div>
    );
  }

  return null;
}
