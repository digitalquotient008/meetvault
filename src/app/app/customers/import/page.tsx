import Link from 'next/link';
import ImportClient from './ImportClient';

export const metadata = { title: 'Import Customers' };

export default function ImportCustomersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/app/customers" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← Customers
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">Import clients</h1>
      <p className="text-slate-400 text-sm mb-8">
        Upload a CSV or TSV file from Square, Vagaro, Squire, Boulevard, Booksy, or any other system.
        We auto-detect columns and let you review before importing.
      </p>
      <ImportClient />
    </div>
  );
}
