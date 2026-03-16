import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function CustomersPage() {
  const { shopId } = await requireShopAccess();
  const customers = await prisma.customer.findMany({
    where: { shopId },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Customers</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Visits</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="p-3">
                  <Link href={`/app/customers/${c.id}`} className="text-amber-400 hover:text-amber-300">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="p-3 text-slate-300">{c.email ?? '—'}</td>
                <td className="p-3 text-slate-300">{c.totalVisits}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-6 text-slate-500">No customers yet.</p>}
      </div>
    </div>
  );
}
