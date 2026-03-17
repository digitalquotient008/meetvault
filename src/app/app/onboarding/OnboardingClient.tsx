'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createShopAction, addServiceAction, addBulkServicesAction, addStaffAction, setHoursAction } from './actions';

type Step = 'shop' | 'services' | 'staff' | 'hours' | 'done';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return opts;
})();

function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface ServiceTemplate {
  name: string;
  durationMin: number;
  price: number;
  category: string;
}

interface AddedService {
  name: string;
  durationMin: number;
  price: number;
}

const SERVICE_TEMPLATES: { heading: string; category: string; items: ServiceTemplate[] }[] = [
  {
    heading: "Men's Services",
    category: 'mens',
    items: [
      { name: 'Haircut', durationMin: 30, price: 30, category: 'mens' },
      { name: 'Skin Fade', durationMin: 40, price: 35, category: 'mens' },
      { name: 'Buzz Cut', durationMin: 20, price: 20, category: 'mens' },
      { name: 'Beard Trim', durationMin: 15, price: 15, category: 'mens' },
      { name: 'Haircut + Beard', durationMin: 45, price: 40, category: 'mens' },
      { name: 'Lineup / Edge Up', durationMin: 15, price: 15, category: 'mens' },
      { name: 'Hot Towel Shave', durationMin: 30, price: 25, category: 'mens' },
      { name: 'Hair Design / Part', durationMin: 15, price: 10, category: 'mens' },
    ],
  },
  {
    heading: "Kids' Services",
    category: 'kids',
    items: [
      { name: 'Kids Haircut (under 12)', durationMin: 25, price: 20, category: 'kids' },
      { name: 'Kids Fade', durationMin: 30, price: 25, category: 'kids' },
    ],
  },
  {
    heading: "Women's Services",
    category: 'womens',
    items: [
      { name: 'Women\'s Haircut', durationMin: 45, price: 45, category: 'womens' },
      { name: 'Blowout / Blow Dry', durationMin: 30, price: 35, category: 'womens' },
      { name: 'Bang Trim', durationMin: 10, price: 10, category: 'womens' },
      { name: 'Deep Conditioning', durationMin: 30, price: 25, category: 'womens' },
    ],
  },
  {
    heading: 'Add-Ons',
    category: 'addon',
    items: [
      { name: 'Eyebrow Cleanup', durationMin: 10, price: 8, category: 'addon' },
      { name: 'Scalp Treatment', durationMin: 15, price: 15, category: 'addon' },
      { name: 'Hair Wash', durationMin: 10, price: 10, category: 'addon' },
    ],
  },
];

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('shop');
  const [shopId, setShopId] = useState<string | null>(null);
  const [barberProfileId, setBarberProfileId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Day schedule — default Mon-Fri 9am-5pm, Sat-Sun off
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { enabled: false, startTime: '09:00', endTime: '17:00' }, // Sun (0)
    { enabled: true, startTime: '09:00', endTime: '17:00' },  // Mon (1)
    { enabled: true, startTime: '09:00', endTime: '17:00' },  // Tue (2)
    { enabled: true, startTime: '09:00', endTime: '17:00' },  // Wed (3)
    { enabled: true, startTime: '09:00', endTime: '17:00' },  // Thu (4)
    { enabled: true, startTime: '09:00', endTime: '17:00' },  // Fri (5)
    { enabled: false, startTime: '09:00', endTime: '17:00' }, // Sat (6)
  ]);

  const updateDay = (dayIdx: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, ...updates } : d)));
  };

  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [addedServices, setAddedServices] = useState<AddedService[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const toggleTemplate = (name: string) => {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAllInGroup = (items: ServiceTemplate[]) => {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      const allSelected = items.every((t) => next.has(t.name));
      if (allSelected) {
        items.forEach((t) => next.delete(t.name));
      } else {
        items.forEach((t) => next.add(t.name));
      }
      return next;
    });
  };

  const handleCreateShop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const slugVal = (form.elements.namedItem('slug') as HTMLInputElement).value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!name || !slugVal) {
      setError('Name and booking URL are required.');
      setLoading(false);
      return;
    }
    try {
      const shop = await createShopAction(userId, { name, slug: slugVal, timezone: 'America/New_York' });
      setShopId(shop.id);
      setSlug(shop.slug);
      setBarberProfileId(null);
      setStep('services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplates = async () => {
    if (!shopId || selectedTemplates.size === 0) return;
    setError(null);
    setLoading(true);
    const allTemplates = SERVICE_TEMPLATES.flatMap((g) => g.items);
    const toAdd = allTemplates.filter((t) => selectedTemplates.has(t.name));
    try {
      await addBulkServicesAction(shopId, toAdd);
      setAddedServices((prev) => [...prev, ...toAdd.map((t) => ({ name: t.name, durationMin: t.durationMin, price: t.price }))]);
      setSelectedTemplates(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shopId) return;
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem('serviceName') as HTMLInputElement).value.trim();
    const durationMin = parseInt((form.elements.namedItem('durationMin') as HTMLInputElement).value, 10) || 30;
    const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value) || 0;
    if (!name) {
      setError('Service name is required.');
      setLoading(false);
      return;
    }
    try {
      await addServiceAction(shopId, { name, durationMin, price });
      setAddedServices((prev) => [...prev, { name, durationMin, price }]);
      form.reset();
      setShowCustomForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shopId) return;
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const displayName = (form.elements.namedItem('displayName') as HTMLInputElement).value.trim();
    if (!displayName) {
      setError('Display name is required.');
      setLoading(false);
      return;
    }
    try {
      const barber = await addStaffAction(shopId, userId, { displayName });
      setBarberProfileId(barber.id);
      setStep('hours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSetHours = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shopId || !barberProfileId) return;
    setError(null);

    // Validate: at least one day enabled
    const enabledDays = schedule.filter((d) => d.enabled);
    if (enabledDays.length === 0) {
      setError('Enable at least one day.');
      return;
    }

    // Validate: endTime > startTime for each enabled day
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].enabled && schedule[i].endTime <= schedule[i].startTime) {
        setError(`${DAY_LABELS[i]}: end time must be after start time.`);
        return;
      }
    }

    setLoading(true);
    try {
      const rules = schedule
        .map((d, i) => ({ dayOfWeek: i, startTime: d.startTime, endTime: d.endTime, enabled: d.enabled }))
        .filter((r) => r.enabled)
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
      await setHoursAction(shopId, barberProfileId, rules);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set hours');
    } finally {
      setLoading(false);
    }
  };

  const skipToDone = () => setStep('done');

  /* ─── Step: Create shop ─── */
  if (step === 'shop') {
    return (
      <form onSubmit={handleCreateShop} className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Shop name</label>
          <input name="name" type="text" required placeholder="e.g. Classic Cuts" className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Booking URL slug</label>
          <input name="slug" type="text" required placeholder="e.g. classic-cuts" className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
          <p className="text-xs text-slate-500 mt-1">Only lowercase letters, numbers, hyphens. Your link: /book/your-slug</p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create shop'}
        </button>
      </form>
    );
  }

  /* ─── Step: Services (templates + custom) ─── */
  if (step === 'services') {
    return (
      <div className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Added services list */}
        {addedServices.length > 0 && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-400 mb-3">
              Added ({addedServices.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {addedServices.map((s, i) => (
                <span key={i} className="bg-emerald-900/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full">
                  {s.name} &middot; {s.durationMin}min &middot; ${s.price}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Template groups */}
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Tap to select common services, then hit &quot;Add selected&quot;. You can edit prices later.
          </p>

          {SERVICE_TEMPLATES.map((group) => {
            const alreadyAdded = new Set(addedServices.map((s) => s.name));
            const available = group.items.filter((t) => !alreadyAdded.has(t.name));
            if (available.length === 0) return null;

            const allSelected = available.every((t) => selectedTemplates.has(t.name));

            return (
              <div key={group.category} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{group.heading}</h3>
                  <button
                    type="button"
                    onClick={() => selectAllInGroup(available)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {available.map((t) => {
                    const selected = selectedTemplates.has(t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => toggleTemplate(t.name)}
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                          selected
                            ? 'bg-amber-600/15 border-amber-500/50 ring-1 ring-amber-500/30'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                            selected ? 'bg-amber-600 border-amber-600' : 'border-slate-500'
                          }`}>
                            {selected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-slate-200'}`}>
                            {t.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0 ml-2">
                          <span>{t.durationMin}min</span>
                          <span className="font-medium text-slate-300">${t.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add selected button */}
        {selectedTemplates.size > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={handleAddTemplates}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : `Add ${selectedTemplates.size} selected service${selectedTemplates.size > 1 ? 's' : ''}`}
          </button>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950 px-3 text-xs text-slate-500">or add your own</span>
          </div>
        </div>

        {/* Custom service form */}
        {showCustomForm ? (
          <form onSubmit={handleAddCustomService} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Service name</label>
              <input name="serviceName" type="text" required placeholder="e.g. Premium Fade + Design" className="w-full rounded-lg bg-slate-900 border border-slate-600 text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Duration (min)</label>
                <input name="durationMin" type="number" defaultValue={30} min={5} max={480} className="w-full rounded-lg bg-slate-900 border border-slate-600 text-white px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                <input name="price" type="number" step="0.01" defaultValue={25} min={0} className="w-full rounded-lg bg-slate-900 border border-slate-600 text-white px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-500 disabled:opacity-50">
                {loading ? 'Adding...' : 'Add service'}
              </button>
              <button type="button" onClick={() => setShowCustomForm(false)} className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-400 text-sm hover:bg-slate-800">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="w-full py-3 rounded-lg border border-dashed border-slate-600 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition-colors"
          >
            + Add a custom service
          </button>
        )}

        {/* Continue / Skip */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep('staff')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              addedServices.length > 0
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {addedServices.length > 0 ? 'Continue' : 'Skip for now'}
          </button>
        </div>
      </div>
    );
  }

  /* ─── Step: Staff ─── */
  if (step === 'staff') {
    return (
      <form onSubmit={handleAddStaff} className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your display name (as barber)</label>
          <input name="displayName" type="text" required placeholder="e.g. Mike" className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50">
          {loading ? 'Adding...' : 'Add me as staff'}
        </button>
      </form>
    );
  }

  /* ─── Step: Hours ─── */
  if (step === 'hours') {
    return (
      <form onSubmit={handleSetHours} className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Set your working hours</h2>
          <p className="text-slate-400 text-sm">Toggle each day on or off and set your start and end times. You can change this later.</p>
        </div>

        <div className="space-y-2">
          {schedule.map((day, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                day.enabled ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              {/* Day toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={day.enabled}
                onClick={() => updateDay(i, { enabled: !day.enabled })}
                className={`relative w-10 h-5 rounded-full shrink-0 transition-colors ${
                  day.enabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  day.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>

              {/* Day label */}
              <span className={`w-10 text-sm font-medium shrink-0 ${day.enabled ? 'text-white' : 'text-slate-500'}`}>
                {DAY_LABELS[i]}
              </span>

              {/* Time pickers */}
              {day.enabled ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <select
                    value={day.startTime}
                    onChange={(e) => updateDay(i, { startTime: e.target.value })}
                    className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg px-2 py-1.5 focus:border-amber-500 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{formatTime12(t)}</option>
                    ))}
                  </select>
                  <span className="text-slate-500 text-sm">to</span>
                  <select
                    value={day.endTime}
                    onChange={(e) => updateDay(i, { endTime: e.target.value })}
                    className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg px-2 py-1.5 focus:border-amber-500 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{formatTime12(t)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-slate-500 text-sm">Closed</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50">
            {loading ? 'Saving...' : 'Set hours & finish'}
          </button>
          <button type="button" onClick={skipToDone} className="px-4 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
            Skip for now
          </button>
        </div>
      </form>
    );
  }

  /* ─── Step: Done ─── */
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Shop setup complete!</h2>
      <p className="text-slate-400 mb-4">One last step — start your free 14-day trial to activate your booking page.</p>
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <code className="text-amber-400 text-sm break-all">
          {typeof window !== 'undefined' ? `${window.location.origin}/book/${slug}` : `/book/${slug}`}
        </code>
      </div>
      <button
        type="button"
        onClick={() => router.push('/app/onboarding/subscribe')}
        className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500"
      >
        Start free trial →
      </button>
    </div>
  );
}
