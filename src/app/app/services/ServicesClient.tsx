'use client';

import { useState } from 'react';
import { Scissors, Plus, Pencil, Trash2, X } from 'lucide-react';
import { addServiceAction, updateServiceAction, deleteServiceAction } from './actions';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: unknown;
  category: string | null;
  isActive: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  durationMin: number;
  price: number;
  category: string;
}

const EMPTY_FORM: ServiceFormData = { name: '', description: '', durationMin: 30, price: 0, category: '' };

const DURATION_OPTIONS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120, 150, 180, 240,
];

export default function ServicesClient({ services }: { services: Service[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(s: Service) {
    setEditingService(s);
    setForm({
      name: s.name,
      description: s.description || '',
      durationMin: s.durationMin,
      price: Number(s.price),
      category: s.category || '',
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Service name is required'); return; }
    if (form.price < 0) { setError('Price cannot be negative'); return; }
    if (form.durationMin < 5) { setError('Duration must be at least 5 minutes'); return; }

    setSaving(true);
    setError(null);
    try {
      if (editingService) {
        await updateServiceAction(editingService.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          durationMin: form.durationMin,
          price: form.price,
          category: form.category.trim() || undefined,
        });
      } else {
        await addServiceAction({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          durationMin: form.durationMin,
          price: form.price,
          category: form.category.trim() || undefined,
        });
      }
      setShowModal(false);
    } catch {
      setError('Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Delete this service? Services with past appointments will be deactivated instead.')) return;
    setDeletingId(serviceId);
    try {
      await deleteServiceAction(serviceId);
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(s: Service) {
    try {
      await updateServiceAction(s.id, { isActive: !s.isActive });
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your service menu and pricing</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No services yet</p>
          <p className="text-slate-500 text-sm mb-4">Add your first service to start accepting bookings.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className={`bg-slate-900 border rounded-xl p-4 transition-colors ${
                s.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white truncate">{s.name}</h3>
                      {s.category && (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{s.category}</span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-sm text-slate-400 mb-1 line-clamp-2">{s.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400">{s.durationMin} min</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-white font-medium">${Number(s.price).toFixed(2)}</span>
                      <span className="text-slate-700">·</span>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          s.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                        } transition-colors`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingService ? 'Edit Service' : 'Add Service'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Skin Fade"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description shown to clients on your booking page"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
                />
              </div>

              {/* Duration + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration *</label>
                  <select
                    value={form.durationMin}
                    onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}` : `${d} min`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. mens, kids, addon"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
