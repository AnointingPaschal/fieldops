'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plus, Package, Calendar, History,
  Home, Clock, Settings, LogOut, Shield, Bell, Menu,
} from 'lucide-react';

type Role = 'supervisor' | 'worker';

const SUP_NAV = [
  { href:'/supervisor/dashboard',   label:'Dashboard',   icon:LayoutDashboard },
  { href:'/supervisor/create-task', label:'New Task',    icon:Plus },
  { href:'/supervisor/inventory',   label:'Inventory',   icon:Package },
  { href:'/supervisor/schedule',    label:'Schedule',    icon:Calendar },
  { href:'/supervisor/history',     label:'History',     icon:History },
];
const WRK_NAV = [
  { href:'/worker/dashboard',  label:'Dashboard', icon:Home },
  { href:'/worker/timesheet',  label:'Timesheet', icon:Clock },
];

function active(href: string, pathname: string) {
  if (href.endsWith('/dashboard')) return pathname === href;
  return pathname.startsWith(href);
}

export default function AppShell({
  role, userName, children,
}: {
  role: Role; userName: string; children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const nav      = role === 'supervisor' ? SUP_NAV : WRK_NAV;

  return (
    <div className="shell">
      {/* ─── Sidebar (desktop) ─── */}
      <aside className="sidebar hidden md:flex shadow-panel">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-[15px] leading-none">FieldOps</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Alberta Safety</p>
            </div>
          </div>
        </div>

        {/* Role pill */}
        <div className="px-4 py-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
            role === 'supervisor' ? 'bg-sky/20 text-sky-light border border-sky/30' : 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const on = active(href, pathname);
            return (
              <button key={href} onClick={() => router.push(href)}
                className={`nav-item w-full text-left ${on ? 'on' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  on ? 'bg-white/20' : 'bg-navy-light'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-navy-border pt-3">
          <button className="nav-item w-full text-left">
            <div className="w-8 h-8 rounded-lg bg-navy-light flex items-center justify-center"><Settings className="w-4 h-4" /></div>
            <span>Settings</span>
          </button>
          <button onClick={() => router.push('/')} className="nav-item w-full text-left hover:text-red-400">
            <div className="w-8 h-8 rounded-lg bg-navy-light flex items-center justify-center"><LogOut className="w-4 h-4" /></div>
            <span>Sign Out</span>
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-navy-border bg-navy-light">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky flex items-center justify-center text-white text-xs font-black shrink-0">
              {userName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{role === 'supervisor' ? 'Operations Supervisor' : 'Field Technician'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="main min-w-0">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="md:hidden w-8 h-8 rounded-lg bg-sky flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="hidden md:block text-xs text-text-muted">
                {new Date().toLocaleDateString('en-CA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </p>
              <p className="text-base md:text-lg font-black text-text-primary">
                <span className="md:hidden">FieldOps</span>
                <span className="hidden md:inline">Welcome back, {userName.split(' ')[0]} 👋</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative btn-icon">
              <Bell className="w-4 h-4 text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fail rounded-full border border-white" />
            </button>
            <button onClick={() => router.push('/supervisor/create-task')} className="btn-navy hidden md:flex">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>
      </div>

      {/* ─── Bottom nav (mobile) ─── */}
      <nav className="bnav">
        {nav.map(({ href, label, icon: Icon }) => {
          const on = active(href, pathname);
          return (
            <button key={href} onClick={() => router.push(href)} className={`bnav-item ${on ? 'on' : ''}`}>
              <Icon className="w-5 h-5" strokeWidth={on ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
