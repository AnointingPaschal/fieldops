'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, RefreshCw, Plus, Package, Calendar, History, Bell, ChevronRight, Clock, Zap, Users, AlertTriangle, Truck } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_TASKS, MOCK_INVENTORY, STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/data/mockData';

export default function SupervisorDashboard() {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  const activeTasks = MOCK_TASKS.filter(t => !['completed','cancelled'].includes(t.status)).length;
  const inTransit   = MOCK_TASKS.filter(t => t.status === 'in_transit').length;

  return (
    <div className="app-shell">
      <div className="page-content">

        {/* ── Top header — like 0xcca9...f383 | BNB Chain ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="pill">
            <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-[10px] font-black text-white">JO</div>
            <span className="text-sm">Justin Okeke</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="pill">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Supervisor</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
            <button className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white" />
            </button>
          </div>
        </div>

        {/* ── Navy Hero Card — Portfolio Balance style ── */}
        <div className="hero-card">
          {/* Decorative orb */}
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full" style={{background:'rgba(255,255,255,0.05)'}} />
          <div className="absolute bottom-[-20px] right-[80px] w-24 h-24 rounded-full" style={{background:'rgba(255,255,255,0.04)'}} />

          {/* Card header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white/60 text-sm font-semibold">Operations Dashboard</span>
            </div>
            <button onClick={() => setHidden(h => !h)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Big value */}
          <div className="mb-1">
            <p className="text-white text-5xl font-black tracking-tight leading-none mt-3">
              {hidden ? '••••' : activeTasks}
            </p>
            <p className="text-white/40 text-sm mt-1">Active Tasks</p>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{background:'rgba(220,38,38,0.25)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-red-300 text-xs font-bold">2 Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{background:'rgba(255,255,255,0.08)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-xs font-semibold">Jun 6, 2026</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-4" />

          {/* 3 glass sub-cards — BNB / Assets / Network style */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: 'Active',   value: `${activeTasks}`,  sub: 'tasks' },
              { label: 'Workers',  value: '3',               sub: 'on duty' },
              { label: 'Network',  value: 'BSC',             sub: 'Calgary AB' },
            ].map((s, i) => (
              <div key={i} className="glass-card">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{s.label}</p>
                <p className="text-white font-black text-lg leading-tight mt-0.5">{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Action buttons — Send / Receive / Swap / History / Discipline style ── */}
          <div className="bg-white/5 rounded-2xl p-3">
            <div className="grid grid-cols-5 gap-1">
              {[
                { icon: Plus,     label: 'New Task',  href: '/supervisor/create-task', active: true },
                { icon: Package,  label: 'Inventory', href: '/supervisor/inventory' },
                { icon: Calendar, label: 'Schedule',  href: '/supervisor/schedule' },
                { icon: History,  label: 'Reports',   href: '/supervisor/history' },
                { icon: Clock,    label: 'Alerts',    href: '#' },
              ].map(({ icon: Icon, label, href, active }, i) => (
                <button key={i} onClick={() => router.push(href)}
                  className="action-btn flex-1"
                  style={active ? { background: 'linear-gradient(135deg,#FF6B35,#FF9A00)' } : {}}>
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.10)'}}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white text-[10px] font-semibold leading-tight text-center px-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Return alert */}
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800">Return Reminder</p>
            <p className="text-xs text-amber-600 truncate">ATCO — Arrow Board due today 4:00 PM</p>
          </div>
          <ChevronRight className="w-4 h-4 text-warning flex-shrink-0" />
        </div>

        {/* ── My Tasks — My Assets style ── */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-black text-text-primary">Active Tasks</h2>
            <button className="flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-3.5 py-2 rounded-full">
              <Plus className="w-3.5 h-3.5" /> Assign
            </button>
          </div>

          <div className="section-card">
            {MOCK_TASKS.map((task, i) => {
              const type   = TASK_TYPE_CONFIG[task.type]   || TASK_TYPE_CONFIG.delivery;
              const status = STATUS_CONFIG[task.status]    || STATUS_CONFIG.pending;
              return (
                <div key={task.id} className="list-row">
                  {/* Type icon — like token circle */}
                  <div className="token-icon" style={{ background: type.color + '18', fontSize: '20px' }}>
                    {type.icon}
                  </div>
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-[15px] leading-snug">{task.contractor.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-text-muted">{type.label}</span>
                      <span className="text-text-muted text-xs">·</span>
                      <span className="text-xs" style={{ color: type.color }}>{task.items.length} items</span>
                    </div>
                  </div>
                  {/* Right value — like $1.20 / 0.00208629 BNB */}
                  <div className="text-right flex-shrink-0">
                    <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: status.dot }} />
                      {status.label}
                    </span>
                    <p className="text-xs text-text-muted mt-1">
                      {task.employees.map((e: any) => e.name.split(' ')[0]).join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Inventory — quick view ── */}
        <div className="px-4 mt-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-black text-text-primary">Inventory</h2>
            <button onClick={() => router.push('/supervisor/inventory')} className="text-xs font-bold text-primary">View All</button>
          </div>
          <div className="section-card">
            {MOCK_INVENTORY.slice(0, 5).map(item => {
              const pct   = item.available / item.total;
              const color = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#F59E0B' : '#16A34A';
              return (
                <div key={item.id} className="list-row">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                      </div>
                      <span className="text-[11px] font-bold flex-shrink-0" style={{ color }}>{item.available}/{item.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <BottomNav role="supervisor" />
    </div>
  );
}
