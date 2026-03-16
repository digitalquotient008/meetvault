import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Upload } from 'lucide-react';

export default async function CustomersPage() {
  const { shopId } = await requireShopAccess();
  const customers = await prisma.customer.findMany({
    where: { shopId },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <Link
          href="/app/customers/import"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import clients
        </Link>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Visits</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-3">
                  <Link href={`/app/customers/${c.id}`} className="text-amber-400 hover:text-amber-300">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="p-3 text-slate-300">{c.email ?? '—'}</td>
                <td className="p-3 text-slate-300">{c.phone ?? '—'}</td>
                <td className="p-3 text-slate-300">{c.totalVisits}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-3">No customers yet.</p>
            <Link
              href="/app/customers/import"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Import your client list
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
