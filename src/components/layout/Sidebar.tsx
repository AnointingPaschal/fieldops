'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plus, Package, Calendar, ClockIcon, History,
  Home, Bell, Shield, LogOut, ChevronRight, Settings,
} from 'lucide-react';
import clsx from 'clsx';

type NavItem = {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  accent?: boolean;
};

const SUPERVISOR_NAV: NavItem[] = [
  { href: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supervisor/create-task', label: 'Create Task', icon: Plus, accent: true },
  { href: '/supervisor/inventory', label: 'Inventory', icon: Package },
  { href: '/supervisor/schedule', label: 'Scheduling', icon: Calendar },
  { href: '/supervisor/history', label: 'History', icon: History },
];

const WORKER_NAV: NavItem[] = [
  { href: '/worker/dashboard', label: 'Dashboard', icon: Home },
  { href: '/worker/timesheet', label: 'Timesheet', icon: ClockIcon },
];

interface SidebarProps {
  role: 'supervisor' | 'worker';
  userName: string;
  userInitials: string;
}

export default function Sidebar({ role, userName, userInitials }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === 'supervisor' ? SUPERVISOR_NAV : WORKER_NAV;

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-white text-base leading-none">FieldOps</p>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Alberta Safety</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-5 pb-2">
        <div className={clsx(
          'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5',
          role === 'supervisor'
            ? 'bg-primary/15 text-primary border border-primary/30'
            : 'bg-info/15 text-info border border-info/30'
        )}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', role === 'supervisor' ? 'bg-primary' : 'bg-info')} />
          {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {nav.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href || (href !== '/supervisor/dashboard' && href !== '/worker/dashboard' && pathname.startsWith(href));
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={clsx(
                'sidebar-item w-full text-left',
                active && 'active',
                accent && !active && 'bg-primary/8 text-primary border border-primary/20'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-1">
        <button className="sidebar-item w-full text-left">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button onClick={() => router.push('/')} className="sidebar-item w-full text-left text-danger/80 hover:text-danger hover:bg-danger/10">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* User card */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center font-black text-white text-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-text-muted truncate">{role === 'supervisor' ? 'Operations Supervisor' : 'Field Worker'}</p>
          </div>
          <button className="relative">
            <Bell className="w-4 h-4 text-text-muted hover:text-white transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full" />
          </button>
        </div>
      </div>
    </aside>
  );
}
