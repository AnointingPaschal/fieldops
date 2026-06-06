'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Truck, Users, AlertTriangle, Plus, Package, Calendar,
  FileText, RefreshCw, Bell, ArrowUpRight, Clock, ChevronRight,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS, MOCK_INVENTORY, STATUS_CONFIG } from '@/data/mockData';

const FILTERS = ['all', 'in_transit', 'assigned', 'pending', 'completed'];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter);
  const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-text-muted">{today}</p>
            <h1 className="text-[17px] font-black text-text-primary tracking-tight">Good morning, Justin 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white" />
            </button>
            <button onClick={() => router.push('/supervisor/create-task')}
              className="btn-primary flex items-center gap-1.5 text-sm py-2.5">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">

          {/* ── Stilex-style Navy Hero Card ── */}
          <div className="rounded-3xl p-6 shadow-navy relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1A2744 0%, #0F1A2E 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Operations Overview</p>
                  <p className="text-4xl font-black text-white tracking-tight">4 Active</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 bg-orange-500/20 text-orange-300 text-xs font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      1 In Transit
                    </span>
                    <span className="text-white/40 text-xs">· Jun 6, 2026</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white/60" />
                </div>
              </div>

              {/* 3-stat row — like BNB / Assets / Network */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Tasks', value: '4', sub: 'active' },
                  { label: 'Workers', value: '3', sub: 'on duty' },
                  { label: 'Network', value: 'BSC', sub: 'Calgary' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/8 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{s.label}</p>
                    <p className="text-white font-black text-lg leading-tight mt-0.5">{s.value}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Dark pill action buttons — like Send / Receive / Swap ── */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { icon: Plus,      label: 'New Task',  href: '/supervisor/create-task', active: true },
                  { icon: Package,   label: 'Inventory', href: '/supervisor/inventory' },
                  { icon: Calendar,  label: 'Schedule',  href: '/supervisor/schedule' },
                  { icon: FileText,  label: 'Reports',   href: '/supervisor/history' },
                  { icon: Clock,     label: 'Alerts',    href: '/supervisor/history' },
                ].map(({ icon: Icon, label, href, active }, i) => (
                  <button key={i} onClick={() => router.push(href)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all hover:scale-105"
                    style={{ background: active ? '#FF6B35' : 'rgba(255,255,255,0.10)' }}>
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-white text-[10px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Return alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Return Reminder</p>
              <p className="text-xs text-amber-600 mt-0.5">ATCO — Arrow Board due back today at 4:00 PM</p>
            </div>
            <button className="text-xs text-amber font-bold hover:underline whitespace-nowrap">View →</button>
          </div>

          {/* Tasks + Inventory */}
          <div className="grid grid-cols-3 gap-5">
            {/* Task list — 2/3 */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-text-primary">Active Tasks</h2>
                <div className="flex items-center gap-1.5">
                  {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all border ${
                        filter === f ? 'bg-navy text-white border-navy shadow-sm' : 'bg-white text-text-muted border-slate-200 hover:border-slate-300'
                      }`}>
                      {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task list in Stilex-style white card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                {filtered.map((task, i) => {
                  const type = task.type;
                  const typeColors: Record<string, string> = { delivery: '#2563EB', pickup: '#F59E0B', setup: '#16A34A', teardown: '#DC2626' };
                  const color = typeColors[type] || '#64748B';
                  const statusConf = STATUS_CONFIG[task.status];
                  return (
                    <div key={task.id} className="list-row group">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: color + '15' }}>
                        {type === 'delivery' ? '📦' : type === 'pickup' ? '🔄' : type === 'setup' ? '🔧' : '🗑️'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">{task.contractor.name}</p>
                        <p className="text-xs text-text-muted truncate mt-0.5">{task.contractor.address}</p>
                      </div>
                      {/* Right */}
                      <div className="text-right flex-shrink-0">
                        <span className="badge text-[10px]" style={{ background: statusConf.bg, color: statusConf.color }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: statusConf.dot }} />
                          {statusConf.label}
                        </span>
                        <p className="text-xs text-text-muted mt-1">
                          {task.items.length} items · {task.employees.map((e: any) => e.name.split(' ')[0]).join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory — 1/3 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-text-primary">Inventory</h2>
                <button onClick={() => router.push('/supervisor/inventory')}
                  className="text-[11px] text-primary font-bold hover:underline">All →</button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                {MOCK_INVENTORY.slice(0, 7).map(item => {
                  const pct = item.available / item.total;
                  const color = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#F59E0B' : '#16A34A';
                  return (
                    <div key={item.id} className="list-row">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>{item.available}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
