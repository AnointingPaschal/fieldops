'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, Package, Calendar, History,
  Home, Clock, Settings, LogOut, Shield, Bell,
  ChevronRight, Users,
} from 'lucide-react';
import type { Role } from '@/types';

const SUP_NAV = [
  { href:'/supervisor/dashboard',   label:'Dashboard',  icon:LayoutDashboard },
  { href:'/supervisor/create-task', label:'New Task',   icon:Plus            },
  { href:'/supervisor/workers',     label:'Workers',    icon:Users           },
  { href:'/supervisor/inventory',   label:'Inventory',  icon:Package         },
  { href:'/supervisor/schedule',    label:'Schedule',   icon:Calendar        },
  { href:'/supervisor/history',     label:'History',    icon:History         },
];
const WRK_NAV = [
  { href:'/worker/dashboard', label:'Dashboard', icon:Home  },
  { href:'/worker/timesheet', label:'Timesheet', icon:Clock },
];

function isActive(href: string, p: string) {
  if (href.endsWith('/dashboard')) return p === href;
  return p.startsWith(href);
}

const pageVariants = {
  hidden:  { opacity:0, y:6 },
  visible: { opacity:1, y:0, transition:{ duration:0.2, ease:'easeOut' }},
};

export default function AppShell({
  role, userName, children,
}: { role: Role; userName: string; children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const nav      = role === 'supervisor' ? SUP_NAV : WRK_NAV;
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await sb.auth.signOut();
    router.push('/');
  };

  return (
    <div className="shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar hidden md:flex shadow-panel">
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

        {/* Role badge */}
        <div className="px-3 py-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            role === 'supervisor'
              ? 'bg-sky/15 text-sky border border-sky/25'
              : 'bg-slate-700 text-slate-300 border border-slate-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {role === 'supervisor' ? 'Supervisor' : 'Field Worker'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 pb-2 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const on = isActive(href, pathname);
            return (
              <button key={href} onClick={() => router.push(href)}
                className={`nav-item w-full text-left ${on ? 'on' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  on ? 'bg-white/20' : 'bg-navy-light'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[13px]">{label}</span>
                {on && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-2 space-y-0.5 border-t border-navy-border pt-2">
          <button className="nav-item w-full text-left">
            <div className="w-7 h-7 rounded-lg bg-navy-light flex items-center justify-center shrink-0">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span className="text-[13px]">Settings</span>
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="nav-item w-full text-left group hover:!text-red-400 hover:!bg-red-500/10"
          >
            <div className="w-7 h-7 rounded-lg bg-navy-light group-hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span className="text-[13px]">Sign Out</span>
          </button>
        </div>

        {/* User card */}
        <div className="px-3 py-3 border-t border-navy-border bg-navy-light">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky flex items-center justify-center text-white text-[11px] font-black shrink-0">
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
            {/* Mobile logout */}
            <button
              onClick={() => setShowLogout(true)}
              className="md:hidden btn-icon"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-text-secondary" />
            </button>
            {role === 'supervisor' && (
              <button
                onClick={() => router.push('/supervisor/create-task')}
                className="btn-navy hidden md:flex text-[13px]"
              >
                <Plus className="w-3.5 h-3.5" /> New Task
              </button>
            )}
          </div>
        </header>

        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="page pb-24 md:pb-6"
        >
          {children}
        </motion.div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="bnav">
        {nav.map(({ href, label, icon: Icon }) => {
          const on = isActive(href, pathname);
          return (
            <button key={href} onClick={() => router.push(href)}
              className={`bnav-item ${on ? 'on' : ''}`}>
              <Icon className="w-5 h-5" strokeWidth={on ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Logout confirmation modal ── */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowLogout(false)}
          >
            <motion.div
              initial={{ scale:0.95, opacity:0 }}
              animate={{ scale:1,    opacity:1 }}
              exit={{   scale:0.95, opacity:0 }}
              transition={{ type:'spring', damping:28, stiffness:380 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl border border-line text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-5 h-5 text-fail" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">Sign Out</h3>
              <p className="text-text-muted text-sm mb-5">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogout(false)} className="btn-ghost flex-1">Cancel</button>
                <button onClick={handleSignOut} disabled={loggingOut}
                  className="btn flex-1 bg-fail text-white hover:opacity-90 disabled:opacity-50">
                  {loggingOut
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    : 'Sign Out'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
