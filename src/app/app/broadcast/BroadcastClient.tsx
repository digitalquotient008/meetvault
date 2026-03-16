'use client';

import { useState } from 'react';
import {
  Users,
  Clock,
  UserX,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Sparkles,
  CalendarOff,
  Megaphone,
  PartyPopper,
  RotateCcw,
} from 'lucide-react';
import { sendBroadcast, type BroadcastAudience, type BroadcastResult } from './actions';

type Step = 'compose' | 'preview' | 'sending' | 'done';

const audiences = [
  {
    id: 'all' as const,
    label: 'All clients',
    description: 'Every client in your book',
    icon: Users,
  },
  {
    id: 'recent' as const,
    label: 'Recent (30 days)',
    description: 'Visited in the last 30 days',
    icon: Clock,
  },
  {
    id: 'dormant' as const,
    label: 'Dormant (60+ days)',
    description: 'Haven\u2019t visited in 60+ days',
    icon: UserX,
  },
];

const templates = [
  {
    label: 'Out of office',
    icon: CalendarOff,
    subject: 'Heads up — I\u2019ll be away',
    body: 'Hey {{first_name}},\n\nJust a quick heads up — I\u2019ll be out of the shop from [DATE] to [DATE].\n\nIf you need to get in before then, book now while spots are still open. I\u2019ll be back and ready to go after that.\n\nSee you soon!',
  },
  {
    label: 'Upcoming event',
    icon: PartyPopper,
    subject: 'You\u2019re invited \u2014 [EVENT NAME]',
    body: 'Hey {{first_name}},\n\nWe\u2019re hosting [EVENT NAME] on [DATE] at [TIME].\n\n[Add details about the event — what it is, why they should come, any specials or giveaways.]\n\nWould love to see you there!',
  },
  {
    label: 'Promotion',
    icon: Sparkles,
    subject: 'Special deal just for you',
    body: 'Hey {{first_name}},\n\n[Describe the offer — e.g. 20% off your next cut, free beard trim with any service, etc.]\n\nThis is only available until [DATE], so don\u2019t wait.\n\nBook your spot now!',
  },
  {
    label: 'General update',
    icon: Megaphone,
    subject: 'Quick update from the shop',
    body: 'Hey {{first_name}},\n\n[Write your message here.]\n\nThanks for being a loyal client!',
  },
];

type Counts = {
  all: number;
  allWithEmail: number;
  recent: number;
  recentWithEmail: number;
  dormant: number;
  dormantWithEmail: number;
};

export default function BroadcastClient({ counts }: { counts: Counts }) {
  const [step, setStep] = useState<Step>('compose');
  const [audience, setAudience] = useState<BroadcastAudience>('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BroadcastResult | null>(null);

  const emailCount = audience === 'all'
    ? counts.allWithEmail
    : audience === 'recent'
      ? counts.recentWithEmail
      : counts.dormantWithEmail;

  const totalCount = audience === 'all'
    ? counts.all
    : audience === 'recent'
      ? counts.recent
      : counts.dormant;

  const applyTemplate = (t: typeof templates[number]) => {
    setSubject(t.subject);
    setBody(t.body);
  };

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && emailCount > 0;

  const handleSend = async () => {
    setStep('sending');
    setError(null);
    try {
      const res = await sendBroadcast({ audience, subject: subject.trim(), body: body.trim() });
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast.');
      setStep('compose');
    }
  };

  const reset = () => {
    setStep('compose');
    setSubject('');
    setBody('');
    setError(null);
    setResult(null);
  };

  /* ─── Compose ─── */
  if (step === 'compose') {
    return (
      <div className="space-y-8">
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Audience */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">1. Who should receive this?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {audiences.map((a) => {
              const Icon = a.icon;
              const isSelected = audience === a.id;
              const count = a.id === 'all'
                ? counts.allWithEmail
                : a.id === 'recent'
                  ? counts.recentWithEmail
                  : counts.dormantWithEmail;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAudience(a.id)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{a.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                  <span className={`absolute top-3 right-3 text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {emailCount === 0 && totalCount > 0 && (
            <p className="text-amber-400 text-xs mt-2">No clients in this group have an email address or have opted in to marketing emails.</p>
          )}
          {totalCount === 0 && (
            <p className="text-slate-500 text-xs mt-2">No clients in this group yet.</p>
          )}
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">2. Start from a template (optional)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center group"
                >
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compose */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">3. Write your message</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="subject" className="text-xs text-slate-500 mb-1 block">Subject line</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quick update from the shop"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="body" className="text-xs text-slate-500">Message body</label>
                <span className="text-xs text-slate-600">
                  Use <code className="text-amber-500/70">{'{{first_name}}'}</code> to personalize
                </span>
              </div>
              <textarea
                id="body"
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hey {{first_name}},&#10;&#10;Write your message here..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            <Mail className="w-4 h-4 inline mr-1 -mt-0.5" />
            Will send to <span className="text-white font-semibold">{emailCount}</span> client{emailCount !== 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={() => setStep('preview')}
            disabled={!canSend}
            className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Preview &amp; send
          </button>
        </div>
      </div>
    );
  }

  /* ─── Preview ─── */
  if (step === 'preview') {
    const previewBody = body
      .replace(/\{\{first_name\}\}/gi, 'Alex')
      .replace(/\{\{name\}\}/gi, 'Alex');
    const previewSubject = subject
      .replace(/\{\{first_name\}\}/gi, 'Alex')
      .replace(/\{\{name\}\}/gi, 'Alex');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setStep('compose')} className="text-sm text-slate-400 hover:text-white">
            ← Edit message
          </button>
          <span className="text-xs text-slate-500">Preview — how clients will see it</span>
        </div>

        {/* Email preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
            <p className="text-xs text-slate-500">From: Your Shop</p>
            <p className="text-xs text-slate-500">To: client@example.com</p>
          </div>
          <div className="px-6 py-4 border-b border-slate-200">
            <p className="text-lg font-semibold text-slate-900">{previewSubject}</p>
          </div>
          <div className="px-6 py-6">
            {previewBody.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed" style={{ marginBottom: line.trim() === '' ? '12px' : '4px' }}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {/* Send summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Send summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-white">{emailCount}</p>
              <p className="text-xs text-slate-500">Recipients</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white capitalize">{audience}</p>
              <p className="text-xs text-slate-500">Audience</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{totalCount - emailCount}</p>
              <p className="text-xs text-slate-500">Skipped (no email)</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('compose')}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Back to edit
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send to {emailCount} client{emailCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    );
  }

  /* ─── Sending ─── */
  if (step === 'sending') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-6" />
        <p className="text-white font-medium">Sending to {emailCount} clients…</p>
        <p className="text-slate-500 text-sm mt-1">This may take a moment for large lists.</p>
      </div>
    );
  }

  /* ─── Done ─── */
  if (step === 'done' && result) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Broadcast sent!</h2>
          <p className="text-slate-400 text-sm">
            Your message has been delivered.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{result.sent}</p>
            <p className="text-xs text-slate-400 mt-1">Sent</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{result.failed}</p>
            <p className="text-xs text-slate-400 mt-1">Failed</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-400">{result.skippedNoEmail}</p>
            <p className="text-xs text-slate-400 mt-1">No email</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-400">{result.skippedOptOut}</p>
            <p className="text-xs text-slate-400 mt-1">Opted out</p>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Errors</h3>
            <ul className="space-y-1 text-xs text-slate-500 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Send another
          </button>
        </div>
      </div>
    );
  }

  return null;
}
