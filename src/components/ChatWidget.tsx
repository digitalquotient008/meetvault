'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FAQ_ITEMS, matchFAQ, type FAQItem } from '@/lib/faq';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FAQItem | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<FAQItem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (item: FAQItem) => {
    setSelected(item);
    setInputValue('');
    setSearchResult(null);
  };

  const handleSearch = () => {
    const result = matchFAQ(inputValue);
    setSearchResult(result);
    if (result) setSelected(result);
    else setSelected(null);
  };

  const showList = !selected && !searchResult;
  const showAnswer = selected ?? searchResult;
  const showNoMatch = inputValue.trim() && !showAnswer;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {open && (
        <div className="absolute bottom-14 right-0 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Quick answers</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-3 max-h-[min(60vh,400px)] overflow-y-auto">
            {/* Optional search */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Type a question..."
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg bg-amber-600 text-white px-3 py-2 text-sm font-medium hover:bg-amber-500"
              >
                Search
              </button>
            </div>
            {showList && (
              <p className="text-xs text-slate-500 mb-2">Or choose a question:</p>
            )}
            {showList && (
              <ul className="space-y-1">
                {FAQ_ITEMS.map((item, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full text-left text-sm text-slate-200 hover:bg-slate-800 rounded-lg px-3 py-2"
                    >
                      {item.question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showAnswer && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{showAnswer.answer}</p>
                {showAnswer.link && (
                  <Link
                    href={showAnswer.link}
                    className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300"
                    onClick={() => setOpen(false)}
                  >
                    {showAnswer.linkLabel ?? 'Learn more'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setSelected(null); setSearchResult(null); }}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  ← Back to questions
                </button>
              </div>
            )}
            {showNoMatch && (
              <p className="text-sm text-slate-400">
                No match for &quot;{inputValue}&quot;. Try &quot;pricing&quot;, &quot;book a demo&quot;, or pick a question above.
              </p>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-500 transition-colors"
        aria-label="Open quick answers"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
