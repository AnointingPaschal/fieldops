'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, Package, Calendar, Clock, History } from 'lucide-react';

type NavItem = { href: string; label: string; icon: any; fab?: boolean };

const SUPERVISOR_NAV: NavItem[] = [
  { href: '/supervisor/dashboard',   label: 'Home',      icon: Home },
  { href: '/supervisor/inventory',   label: 'Inventory', icon: Package },
  { href: '/supervisor/create-task', label: '',          icon: Plus, fab: true },
  { href: '/supervisor/schedule',    label: 'Schedule',  icon: Calendar },
  { href: '/supervisor/history',     label: 'History',   icon: History },
];

const WORKER_NAV: NavItem[] = [
  { href: '/worker/dashboard',  label: 'Home',      icon: Home },
  { href: '/worker/timesheet',  label: 'Timesheet', icon: Clock },
];

export default function BottomNav({ role }: { role: 'supervisor' | 'worker' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const nav = role === 'supervisor' ? SUPERVISOR_NAV : WORKER_NAV;

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-2">
        {nav.map(({ href, label, icon: Icon, fab }) => {
          const active = pathname === href || (!fab && pathname.startsWith(href) && href !== '/supervisor/dashboard' && href !== '/worker/dashboard')
            || (pathname === href);

          if (fab) return (
            <button key={href} onClick={() => router.push(href)}
              className="flex flex-col items-center -mt-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-glow"
                style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A00)' }}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-primary mt-1">New</span>
            </button>
          );

          return (
            <button key={href} onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 py-1 px-3 min-w-[52px] transition-all">
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-gray-400'}`} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
