'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCog,
  Settings,
  FileText,
  List,
  ClipboardList,
  TrendingUp,
  Megaphone,
  CreditCard,
  Receipt,
  LogOut,
  ChevronUp,
  ListOrdered,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const mainNav: NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/calendar', label: 'Calendar', icon: Calendar },
  { href: '/app/appointments', label: 'Appointments', icon: ListOrdered },
];

const manageNav: NavItem[] = [
  { href: '/app/customers', label: 'Customers', icon: Users },
  { href: '/app/services', label: 'Services', icon: Scissors },
  { href: '/app/staff', label: 'Staff', icon: UserCog },
];

const operationsNav: NavItem[] = [
  { href: '/app/queue', label: 'Queue', icon: List },
  { href: '/app/waitlist', label: 'Waitlist', icon: ClipboardList },
  { href: '/app/growth', label: 'Growth', icon: TrendingUp },
  { href: '/app/broadcast', label: 'Broadcast', icon: Megaphone },
];

const financeNav: NavItem[] = [
  { href: '/app/reports', label: 'Reports', icon: FileText },
  { href: '/app/payments', label: 'Payments', icon: CreditCard },
  { href: '/app/settings/billing', label: 'Billing', icon: Receipt },
  { href: '/app/settings/api', label: 'API', icon: Code },
  { href: '/app/settings/shop', label: 'Settings', icon: Settings },
];

function NavSection({ label, items, pathname }: { label?: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      {label && (
        <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{label}</p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Account';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '');

  return (
    <aside className="w-60 min-h-screen bg-slate-950 border-r border-slate-800/50 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800/50">
        <Link href="/app" className="text-lg font-bold text-amber-400 tracking-tight">
          MeetVault
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <NavSection items={mainNav} pathname={pathname} />
        <NavSection label="Manage" items={manageNav} pathname={pathname} />
        <NavSection label="Operations" items={operationsNav} pathname={pathname} />
        <NavSection label="Finance" items={financeNav} pathname={pathname} />
      </nav>

      {/* User profile section */}
      <div className="px-3 py-3 border-t border-slate-800/50">
        <div className="relative">
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-4 py-3 border-b border-slate-800/50">
                  <p className="text-white text-sm font-medium truncate">{displayName}</p>
                  <p className="text-slate-500 text-xs truncate">{email}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); openUserProfile(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Manage account
                  </button>
                  <Link
                    href="/app/settings/shop"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Shop settings
                  </Link>
                </div>
                <div className="border-t border-slate-800/50 py-1">
                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 overflow-hidden">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-400 text-xs font-bold uppercase">
                  {initials || displayName[0]}
                </span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">{displayName}</p>
              <p className="text-slate-600 text-xs truncate leading-tight">{email}</p>
            </div>
            <ChevronUp
              className={cn(
                'w-4 h-4 text-slate-600 shrink-0 transition-transform',
                menuOpen ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
