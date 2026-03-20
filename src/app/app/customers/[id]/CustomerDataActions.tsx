'use client';

import { useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import { deleteCustomerDataAction, exportCustomerDataAction } from '../actions';

export default function CustomerDataActions({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm(`Permanently delete all data for ${customerName}? This anonymizes their record and removes all notes. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCustomerDataAction(customerId);
      setDeleted(true);
    } catch {
      alert('Failed to delete customer data');
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportCustomerDataAction(customerId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-${customerId}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export customer data');
    } finally {
      setExporting(false);
    }
  }

  if (deleted) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <p className="text-slate-400 text-sm">Customer data has been deleted and anonymized.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5" />
        {exporting ? 'Exporting...' : 'Export Data'}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {deleting ? 'Deleting...' : 'Delete Data'}
      </button>
    </div>
  );
}
