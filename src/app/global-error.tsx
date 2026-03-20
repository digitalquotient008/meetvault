'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <button
            onClick={reset}
            className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-400"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
