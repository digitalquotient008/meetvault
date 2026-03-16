'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Shop, Service, BarberProfile } from '@prisma/client';
import { bookAppointmentAction, joinWaitlistAction } from './actions';

type ShopWithRelations = Shop & {
  services: Service[];
  barberProfiles: BarberProfile[];
};

type Step = 'service' | 'barber' | 'datetime' | 'details' | 'confirm';

export default function BookingFlow({ shop }: { shop: ShopWithRelations }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberProfile | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; barberProfileId: string } | null>(null);
  const [slots, setSlots] = useState<Array<{ start: Date; barberProfileId: string }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingBook, setLoadingBook] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [waitlistForm, setWaitlistForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const fetchSlots = async (date: Date) => {
    if (!selectedService) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      const result = await fetch(
        `/api/book/slots?shopId=${shop.id}&serviceId=${selectedService.id}&barberProfileId=${selectedBarber?.id ?? ''}&dateFrom=${dateStart.toISOString()}&dateTo=${dateEnd.toISOString()}`
      );
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? 'Failed to load slots');
      setSlots(data.slots ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceSelect = (s: Service) => {
    setSelectedService(s);
    setStep('barber');
  };

  const handleBarberSelect = (b: BarberProfile | null) => {
    setSelectedBarber(b);
    setStep('datetime');
    setSelectedSlot(null);
    setSlots([]);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleSlotSelect = (slot: { start: Date; barberProfileId: string }) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistForm.firstName.trim() || !waitlistForm.lastName.trim()) return;
    setWaitlistLoading(true);
    setError(null);
    try {
      await joinWaitlistAction(shop.slug, {
        firstName: waitlistForm.firstName.trim(),
        lastName: waitlistForm.lastName.trim(),
        email: waitlistForm.email.trim() || undefined,
        phone: waitlistForm.phone.trim() || undefined,
        preferredServiceId: selectedService?.id,
        preferredBarberProfileId: selectedBarber?.id ?? undefined,
      });
      setWaitlistSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirmBook = async () => {
    if (!selectedService || !selectedSlot || !details.firstName || !details.lastName) return;
    setLoadingBook(true);
    setError(null);
    try {
      const appointment = await bookAppointmentAction({
        shopId: shop.id,
        barberProfileId: selectedSlot.barberProfileId,
        serviceId: selectedService.id,
        startDateTime: typeof selectedSlot.start === 'string' ? new Date(selectedSlot.start) : selectedSlot.start,
        customer: {
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email || undefined,
          phone: details.phone || undefined,
        },
      });
      if (appointment) {
        if (shop.depositRequired) {
          router.push(`/book/${shop.slug}/pay/${appointment.id}?type=deposit`);
        } else {
          router.push(`/book/${shop.slug}/confirm/${appointment.id}`);
        }
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoadingBook(false);
    }
  };

  if (step === 'service') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Select service</h2>
        <div className="space-y-2">
          {shop.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleServiceSelect(s)}
              className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
            >
              <span className="font-medium text-white">{s.name}</span>
              <span className="block text-sm text-slate-400">{s.durationMin} min · ${Number(s.price)}</span>
            </button>
          ))}
        </div>
        {shop.services.length === 0 && (
          <p className="text-slate-400">No services available. Please check back later.</p>
        )}
      </div>
    );
  }

  if (step === 'barber') {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setStep('service')} className="text-sm text-slate-400 hover:text-white">
          ← Change service
        </button>
        <h2 className="text-lg font-semibold text-white">Select barber</h2>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleBarberSelect(null)}
            className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50"
          >
            <span className="font-medium text-white">Any available barber</span>
          </button>
          {shop.barberProfiles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBarberSelect(b)}
              className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50"
            >
              <span className="font-medium text-white">{b.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'datetime') {
    const today = new Date();
    const nextDays = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setStep('barber')} className="text-sm text-slate-400 hover:text-white">
          ← Change barber
        </button>
        <h2 className="text-lg font-semibold text-white">Select date</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {nextDays.map((d) => (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => handleDateSelect(d)}
              className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-500/50 text-sm"
            >
              {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
        {loadingSlots && <p className="text-slate-400 text-sm">Loading times...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {slots.length > 0 && !loadingSlots && (
          <>
            <h3 className="font-medium text-white">Available times</h3>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={typeof slot.start === 'string' ? slot.start : slot.start.toISOString()}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className="py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-500/50 text-sm"
                >
                  {new Date(slot.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </>
        )}
        {selectedDate && slots.length === 0 && !loadingSlots && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm mb-3">No slots available for this date. Join the waitlist and we&apos;ll get in touch when something opens.</p>
            {waitlistSuccess ? (
              <p className="text-emerald-400 text-sm">You&apos;re on the list! We&apos;ll be in touch.</p>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" required placeholder="First name" value={waitlistForm.firstName} onChange={(e) => setWaitlistForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded bg-slate-900 border border-slate-600 text-white px-3 py-2 text-sm" />
                  <input type="text" required placeholder="Last name" value={waitlistForm.lastName} onChange={(e) => setWaitlistForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded bg-slate-900 border border-slate-600 text-white px-3 py-2 text-sm" />
                </div>
                <input type="email" placeholder="Email" value={waitlistForm.email} onChange={(e) => setWaitlistForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded bg-slate-900 border border-slate-600 text-white px-3 py-2 text-sm" />
                <input type="tel" placeholder="Phone" value={waitlistForm.phone} onChange={(e) => setWaitlistForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded bg-slate-900 border border-slate-600 text-white px-3 py-2 text-sm" />
                <button type="submit" disabled={waitlistLoading} className="w-full py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-50">
                  {waitlistLoading ? 'Joining…' : 'Join waitlist'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  if (step === 'details') {
    return (
      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <button type="button" onClick={() => setStep('datetime')} className="text-sm text-slate-400 hover:text-white">
          ← Change time
        </button>
        <h2 className="text-lg font-semibold text-white">Your details</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="First name"
            value={details.firstName}
            onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
            className="rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3"
          />
          <input
            type="text"
            required
            placeholder="Last name"
            value={details.lastName}
            onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
            className="rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={details.email}
          onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
          className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={details.phone}
          onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
          className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3"
        />
        <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500">
          Continue
        </button>
      </form>
    );
  }

  if (step === 'confirm') {
    const barberName = shop.barberProfiles.find((b) => b.id === selectedSlot?.barberProfileId)?.displayName ?? 'Barber';
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Confirm booking</h2>
        <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-sm">
          <p><span className="text-slate-400">Service:</span> {selectedService?.name} · ${selectedService && Number(selectedService.price)}</p>
          <p><span className="text-slate-400">With:</span> {barberName}</p>
          <p><span className="text-slate-400">When:</span> {selectedSlot && new Date(selectedSlot.start).toLocaleString()}</p>
          <p><span className="text-slate-400">Name:</span> {details.firstName} {details.lastName}</p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('details')}
            className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirmBook}
            disabled={loadingBook}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50"
          >
            {loadingBook ? 'Booking...' : 'Confirm booking'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
