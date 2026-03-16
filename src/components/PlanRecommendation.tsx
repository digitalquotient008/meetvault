'use client';

import { useState } from 'react';
import Link from 'next/link';

type Size = 'solo' | 'team' | 'enterprise' | '';
type Need = 'scheduling' | 'crm' | 'full' | '';

const RECOMMENDATIONS: Record<string, { plan: string; blurb: string; planValue: string }> = {
  'solo-scheduling': { plan: 'Free / Solo', planValue: 'solo', blurb: 'Start with the free tier. Perfect for solo barbers and stylists who need simple booking.' },
  'solo-crm': { plan: 'Solo', planValue: 'solo', blurb: 'MeetVault includes client history on all plans. The free tier gives you contacts and booking history.' },
  'solo-full': { plan: 'Solo', planValue: 'solo', blurb: 'The free tier includes booking, client history, and reminders. Upgrade when you need multiple chairs.' },
  'team-scheduling': { plan: 'Teams', planValue: 'teams', blurb: 'Teams plan gives you multiple barbers or stylists, each with a booking link. Ideal for shops.' },
  'team-crm': { plan: 'Teams', planValue: 'teams', blurb: 'Teams plan includes booking and client history for the whole shop. Book on behalf of others.' },
  'team-full': { plan: 'Teams', planValue: 'teams', blurb: 'Teams plan is the best fit for barbershops and salons with multiple chairs.' },
  'enterprise-scheduling': { plan: 'Custom', planValue: 'custom', blurb: 'For multi-location or large shops we recommend a custom solution. Contact us.' },
  'enterprise-crm': { plan: 'Custom', planValue: 'custom', blurb: 'Custom deployments for multi-location or enterprise. We can tailor MeetVault to your shop.' },
  'enterprise-full': { plan: 'Custom', planValue: 'custom', blurb: 'Custom solutions for multi-location salons or barbershop chains. Schedule a demo.' },
};

function getRecommendation(size: Size, need: Need) {
  if (!size || !need) return null;
  const key = `${size}-${need}`;
  return RECOMMENDATIONS[key] ?? RECOMMENDATIONS['solo-scheduling'];
}

export default function PlanRecommendation() {
  const [size, setSize] = useState<Size>('');
  const [need, setNeed] = useState<Need>('');
  const rec = getRecommendation(size, need);

  const applyToForm = () => {
    if (!rec) return;
    const planSelect = document.getElementById('plan') as HTMLSelectElement | null;
    if (planSelect) {
      planSelect.value = rec.planValue;
    }
  };

  return (
    <div className="mb-8 p-6 rounded-xl border border-slate-700 bg-slate-800/50">
      <h2 className="text-lg font-semibold text-white mb-3">Get a plan recommendation</h2>
      <p className="text-sm text-slate-400 mb-4">Answer two questions and we&apos;ll suggest the best plan for you.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">What best describes you?</label>
          <div className="flex flex-wrap gap-2">
            {(['solo', 'team', 'enterprise'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  size === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {s === 'solo' ? 'Solo barber / stylist' : s === 'team' ? 'Shop (multiple chairs)' : 'Multi-location'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Primary need?</label>
          <div className="flex flex-wrap gap-2">
            {(['scheduling', 'crm', 'full'] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNeed(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  need === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {n === 'scheduling' ? 'Booking only' : n === 'crm' ? 'Booking + client history' : 'Full (payments, etc.)'}
              </button>
            ))}
          </div>
        </div>
      </div>
      {rec && (
        <div className="mt-4 p-4 rounded-lg bg-slate-900/80 border border-slate-600">
          <p className="font-medium text-white">{rec.plan}</p>
          <p className="text-sm text-slate-400 mt-1">{rec.blurb}</p>
          <button
            type="button"
            onClick={applyToForm}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Use this plan in the form below →
          </button>
        </div>
      )}
    </div>
  );
}
