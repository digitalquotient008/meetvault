import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Upload, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';

export default async function CustomersPage() {
  const { shopId } = await requireShopAccess();
  const customers = await prisma.customer.findMany({
    where: { shopId },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Customers"
        description={customers.length > 0 ? `${customers.length} client${customers.length !== 1 ? 's' : ''}` : 'Your client list'}
        actions={
          <Button href="/app/customers/import" size="sm">
            <Upload className="w-4 h-4" />
            Import clients
          </Button>
        }
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No customers yet"
          description="Import your existing client list or customers will appear here after their first booking."
          action={
            <Button href="/app/customers/import" variant="secondary" size="sm">
              <Upload className="w-4 h-4" />
              Import client list
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Name</TableHeader>
            <TableHeader className="hidden sm:table-cell">Email</TableHeader>
            <TableHeader className="hidden md:table-cell">Phone</TableHeader>
            <TableHeader className="text-right">Visits</TableHeader>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/app/customers/${c.id}`} className="font-medium text-white hover:text-amber-400 transition-colors">
                    {c.firstName} {c.lastName}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{c.email ?? '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{c.phone ?? '—'}</TableCell>
                <TableCell className="text-right text-white font-medium">{c.totalVisits}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
