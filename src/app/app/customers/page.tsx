import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Upload, Users } from 'lucide-react';

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
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {customers.length > 0
              ? `${customers.length} client${customers.length !== 1 ? 's' : ''}`
              : 'Your client list'}
          </p>
        </div>
        <Link
          href="/app/customers/import"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import clients
        </Link>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-1">No customers yet</p>
            <p className="text-slate-500 text-sm mb-4">
              Import your existing client list or customers will appear here after their first booking.
            </p>
            <Link
              href="/app/customers/import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import client list
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/app/customers/${c.id}`} className="font-medium text-amber-400 hover:text-amber-300">
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{c.email ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-400">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-300 text-right">{c.totalVisits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
