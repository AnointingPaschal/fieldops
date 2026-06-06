'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Truck, Users, AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TASKS, INVENTORY, STATUS_STYLE, TYPE_COLOR } from '@/data/mockData';

const STAT_FILTERS = ['All','In Transit','Assigned','Pending','Completed'];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? TASKS : TASKS.filter(t => t.status === filter || t.type === filter);

  return (
    <AppShell role="supervisor" userName="Justin Okeke">
      <div className="p-4 md:p-6 space-y-5 md:space-y-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label:'Active Tasks', value:'4', sub:'+2 today',       icon:Zap,           color:'text-sky',  bg:'bg-sky-soft'  },
            { label:'In Transit',   value:'1', sub:'Live update',     icon:Truck,         color:'text-warn', bg:'bg-warn-soft' },
            { label:'Workers On',   value:'3', sub:'2 off today',     icon:Users,         color:'text-pass', bg:'bg-pass-soft' },
            { label:'Low Stock',    value:'2', sub:'Needs reorder',   icon:AlertTriangle, color:'text-fail', bg:'bg-fail-soft' },
          ].map((s,i) => (
            <div key={i} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-text-primary">{s.value}</p>
              <p className="text-sm font-semibold text-text-secondary">{s.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div>
          <div className="section-hd">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'New Task',  sub:'Create assignment',   href:'/supervisor/create-task', primary:true },
              { label:'Inventory', sub:'Check stock levels',  href:'/supervisor/inventory'              },
              { label:'Schedule',  sub:'Worker availability', href:'/supervisor/schedule'               },
              { label:'Reports',   sub:'Weekly PDF reports',  href:'/supervisor/history'                },
            ].map(({ label, sub, href, primary },i) => (
              <button key={i} onClick={() => router.push(href)}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.98] ${
                  primary ? 'bg-navy border-navy text-white' : 'bg-white border-line text-text-primary hover:border-slate-300'
                }`}>
                <div>
                  <p className={`font-bold text-sm ${primary ? 'text-white' : 'text-text-primary'}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${primary ? 'text-slate-400' : 'text-text-muted'}`}>{sub}</p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${primary ? 'text-slate-400' : 'text-text-muted'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Return alert ── */}
        <div className="bg-warn-soft border border-warn-border rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-warn text-lg">⏰</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-warn">Return Reminder</p>
            <p className="text-xs text-amber-700 truncate">ATCO — Arrow Board due back today at 4:00 PM</p>
          </div>
          <button className="text-xs font-bold text-warn hover:underline whitespace-nowrap">View →</button>
        </div>

        {/* ── Tasks + Inventory ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Task list — full width mobile, 2/3 desktop */}
          <div className="md:col-span-2">
            <div className="section-hd">
              <h2 className="section-title">Active Tasks</h2>
              <button onClick={() => router.push('/supervisor/history')} className="link-sm">See all</button>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {STAT_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} className={filter===f?'chip-on':'chip-off'}>{f}</button>
              ))}
            </div>

            <div className="card !p-0 overflow-hidden">
              {filtered.map((task, i) => {
                const s = STATUS_STYLE[task.status] || STATUS_STYLE['Pending'];
                const tc = TYPE_COLOR[task.type]    || '#1D4ED8';
                return (
                  <div key={task.id} className="row cursor-pointer" style={{ borderLeft: i===0?'none':'', }}>
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl"
                      style={{ background: tc+'18' }}>
                      {task.type==='Delivery'?'📦':task.type==='Pick Up'?'🔄':task.type==='Set Up'?'🔧':'🗑️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-primary text-sm">{task.contractor}</p>
                        <span className="badge" style={{ background:s.bg, color:s.text }}>
                          <span className="w-1 h-1 rounded-full" style={{ background:s.dot }} />
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{task.address}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span>👥 {task.workers.map(w=>w.split(' ')[0]).join(', ')}</span>
                        <span>📦 {task.items} items</span>
                        <span>📅 {task.due}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory side panel */}
          <div>
            <div className="section-hd">
              <h2 className="section-title">Inventory</h2>
              <button onClick={() => router.push('/supervisor/inventory')} className="link-sm">View all</button>
            </div>
            <div className="card !p-0 overflow-hidden">
              {INVENTORY.slice(0,6).map(item => {
                const pct = item.avail / item.total;
                const c   = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#D97706' : '#16A34A';
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0 hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                      <div className="progress-track mt-1.5">
                        <div className="progress-fill" style={{ width:`${pct*100}%`, background:c }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color:c }}>
                      {item.avail}<span className="text-text-muted font-normal">/{item.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
