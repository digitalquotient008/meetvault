'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <Link href="/app" className="text-xl font-bold text-amber-400">
          MeetingVault
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
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
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
