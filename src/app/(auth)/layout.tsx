import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Top-left back link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Centered auth card */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Link href="/" className="text-2xl font-bold text-amber-400 mb-8 tracking-tight">
          MeetVault
        </Link>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
