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
  ListOrdered,
  List,
  ClipboardList,
  TrendingUp,
  Megaphone,
  CreditCard,
  Receipt,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/calendar', label: 'Calendar', icon: Calendar },
  { href: '/app/appointments', label: 'Appointments', icon: ListOrdered },
  { href: '/app/customers', label: 'Customers', icon: Users },
  { href: '/app/services', label: 'Services', icon: Scissors },
  { href: '/app/staff', label: 'Staff', icon: UserCog },
  { href: '/app/queue', label: 'Queue', icon: List },
  { href: '/app/waitlist', label: 'Waitlist', icon: ClipboardList },
  { href: '/app/growth', label: 'Growth', icon: TrendingUp },
  { href: '/app/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/app/reports', label: 'Reports', icon: FileText },
  { href: '/app/payments', label: 'Payments', icon: CreditCard },
  { href: '/app/settings/shop', label: 'Settings', icon: Settings },
  { href: '/app/settings/billing', label: 'Billing', icon: Receipt },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'Account';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '');

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <Link href="/app" className="text-xl font-bold text-amber-400">
          MeetingVault
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="p-3 border-t border-slate-800">
        <div className="relative">
          {/* Popup menu */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-white text-sm font-medium truncate">{displayName}</p>
                  <p className="text-slate-400 text-xs truncate">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); openUserProfile(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Manage account
                </button>
                <Link
                  href="/app/settings/shop"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Shop settings
                </Link>
                <div className="border-t border-slate-700" />
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}

          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden">
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
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-slate-500 text-xs truncate">{email}</p>
            </div>
            <ChevronUp
              className={cn(
                'w-4 h-4 text-slate-500 shrink-0 transition-transform',
                menuOpen ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
