import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="text-2xl font-bold text-amber-400 mb-8">
        MeetingVault
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-sm text-slate-500">
        <Link href="/" className="text-amber-400/80 hover:text-amber-400">← Back to home</Link>
      </p>
    </div>
  );
}
