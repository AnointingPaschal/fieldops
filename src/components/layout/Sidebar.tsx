'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plus, Package, Calendar, History,
  Home, ClockIcon, Bell, Shield, LogOut, ChevronRight, Settings,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  accent?: boolean;
};

const SUPERVISOR_NAV: NavItem[] = [
  { href: '/supervisor/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/supervisor/create-task', label: 'New Task',    icon: Plus, accent: true },
  { href: '/supervisor/inventory',   label: 'Inventory',   icon: Package },
  { href: '/supervisor/schedule',    label: 'Schedule',    icon: Calendar },
  { href: '/supervisor/history',     label: 'History',     icon: History },
];

const WORKER_NAV: NavItem[] = [
  { href: '/worker/dashboard',  label: 'Dashboard',  icon: Home },
  { href: '/worker/timesheet',  label: 'Timesheet',  icon: ClockIcon },
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
    <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-text-primary text-[15px] leading-none tracking-tight">FieldOps</p>
            <p className="text-[9px] text-text-muted font-semibold uppercase tracking-widest mt-0.5">Alberta Safety</p>
          </div>
        </div>
      </div>

      {/* Role pill */}
      <div className="px-4 pt-4 pb-1">
        <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
          role === 'supervisor' ? 'bg-orange-50 text-primary border border-orange-200' : 'bg-blue-50 text-info border border-blue-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${role === 'supervisor' ? 'bg-primary' : 'bg-info'}`} />
          {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href ||
            (href !== '/supervisor/dashboard' && href !== '/worker/dashboard' && pathname.startsWith(href));
          return (
            <button key={href} onClick={() => router.push(href)}
              className={`sidebar-item w-full text-left group ${active ? 'active' : ''} ${
                accent && !active ? 'bg-orange-50 text-primary border border-orange-100' : ''
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                active ? 'bg-primary text-white' : accent && !active ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-text-muted group-hover:bg-slate-200'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-0.5 border-t border-slate-100">
        <button className="sidebar-item w-full text-left group">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4 text-text-muted" />
          </div>
          <span>Settings</span>
        </button>
        <button onClick={() => router.push('/')}
          className="sidebar-item w-full text-left group hover:bg-red-50 hover:text-danger">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-text-muted group-hover:text-danger" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center font-black text-white text-sm shadow-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-muted truncate">
              {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
            </p>
          </div>
          <button className="relative p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <Bell className="w-4 h-4 text-text-muted" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border border-white" />
          </button>
        </div>
      </div>
    </aside>
  );
}
