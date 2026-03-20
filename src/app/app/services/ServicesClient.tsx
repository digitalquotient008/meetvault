'use client';

import { useState } from 'react';
import { Scissors, Plus, Pencil, Trash2 } from 'lucide-react';
import { addServiceAction, updateServiceAction, deleteServiceAction } from './actions';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Services"
        description="Your service menu and pricing"
        actions={
          <Button onClick={openAdd} size="sm">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors className="w-6 h-6" />}
          title="No services yet"
          description="Add your first service to start accepting bookings."
          action={
            <Button onClick={openAdd} size="sm">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all ${
                s.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{s.name}</h3>
                      {s.category && (
                        <Badge variant="default">{s.category}</Badge>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">{s.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">{s.durationMin} min</span>
                      <span className="text-slate-800">·</span>
                      <span className="text-white font-semibold">${Number(s.price).toFixed(2)}</span>
                      <span className="text-slate-800">·</span>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className="transition-colors"
                      >
                        <Badge variant={s.isActive ? 'success' : 'neutral'} dot>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
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
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Skin Fade"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description shown to clients"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Duration *</label>
              <select
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}` : `${d} min`}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. mens, kids, addon"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
