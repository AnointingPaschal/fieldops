'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Plus, Package, Calendar, History,
  Home, Clock, Settings, LogOut, Shield, Bell, ChevronRight,
} from 'lucide-react';
import type { Role } from '@/types';

const SUP_NAV = [
  { href:'/supervisor/dashboard',   label:'Dashboard',  icon:LayoutDashboard },
  { href:'/supervisor/create-task', label:'New Task',   icon:Plus },
  { href:'/supervisor/inventory',   label:'Inventory',  icon:Package },
  { href:'/supervisor/schedule',    label:'Schedule',   icon:Calendar },
  { href:'/supervisor/history',     label:'History',    icon:History },
];
const WRK_NAV = [
  { href:'/worker/dashboard', label:'Dashboard', icon:Home },
  { href:'/worker/timesheet', label:'Timesheet', icon:Clock },
];

function isActive(href: string, p: string) {
  if (href.endsWith('/dashboard')) return p === href;
  return p.startsWith(href);
}

const pageVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export default function AppShell({
  role, userName, children,
}: { role: Role; userName: string; children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const nav      = role === 'supervisor' ? SUP_NAV : WRK_NAV;
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar hidden md:flex shadow-sm">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-navy-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">FieldOps</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Alberta Safety</p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="px-3 py-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            role === 'supervisor' ? 'bg-sky/15 text-sky border border-sky/25' : 'bg-slate-700 text-slate-300 border border-slate-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 pb-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const on = isActive(href, pathname);
            return (
              <button key={href} onClick={() => router.push(href)}
                className={`nav-item w-full text-left ${on ? 'on' : ''}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-2 space-y-0.5 border-t border-navy-border pt-2">
          <button className="nav-item w-full text-left">
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
          <button onClick={handleSignOut} className="nav-item w-full text-left hover:!text-red-400">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-navy-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky/80 flex items-center justify-center text-white text-[11px] font-black shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="md:hidden w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted hidden md:block">
                {new Date().toLocaleDateString('en-CA',{ weekday:'long', month:'long', day:'numeric', year:'numeric' })}
              </p>
              <p className="text-[15px] font-bold text-text-primary">
                <span className="md:hidden">FieldOps</span>
                <span className="hidden md:inline">Hello, {userName.split(' ')[0]}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative btn-icon">
              <Bell className="w-4 h-4 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-fail rounded-full border border-white" />
            </button>
            <button onClick={() => router.push('/supervisor/create-task')} className="btn-navy hidden md:flex">
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        </header>

        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="page pb-20 md:pb-5"
        >
          {children}
        </motion.div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="bnav">
        {nav.map(({ href, label, icon: Icon }) => {
          const on = isActive(href, pathname);
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
