'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createShopAction, addServiceAction, addStaffAction, setHoursAction } from './actions';

type Step = 'shop' | 'services' | 'staff' | 'hours' | 'done';

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('shop');
  const [shopId, setShopId] = useState<string | null>(null);
  const [barberProfileId, setBarberProfileId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
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
      form.reset();
      setStep('staff');
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
    setLoading(true);
    try {
      await setHoursAction(shopId, barberProfileId);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set hours');
    } finally {
      setLoading(false);
    }
  };

  const skipToDone = () => setStep('done');

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

  if (step === 'services') {
    return (
      <form onSubmit={handleAddService} className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Service name</label>
          <input name="serviceName" type="text" required placeholder="e.g. Haircut" className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duration (min)</label>
            <input name="durationMin" type="number" defaultValue={30} min={5} max={480} className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price ($)</label>
            <input name="price" type="number" step="0.01" defaultValue={25} min={0} className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add service'}
          </button>
          <button type="button" onClick={() => setStep('staff')} className="px-4 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
            Skip
          </button>
        </div>
      </form>
    );
  }

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

  if (step === 'hours') {
    return (
      <form onSubmit={handleSetHours} className="space-y-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-slate-400">Default hours: Mon–Fri 9am–5pm. You can change this later in Staff → Availability.</p>
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">You&apos;re all set</h2>
      <p className="text-slate-400 mb-4">Your booking page is live. Share it with clients.</p>
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <code className="text-amber-400 text-sm break-all">
          {typeof window !== 'undefined' ? `${window.location.origin}/book/${slug}` : `/book/${slug}`}
        </code>
      </div>
      <button
        type="button"
        onClick={() => router.push('/app')}
        className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500"
      >
        Go to dashboard
      </button>
    </div>
  );
}
