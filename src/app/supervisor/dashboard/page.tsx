'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Truck, Users, AlertTriangle, Plus, Package, Calendar, FileText, RefreshCw, Bell, ArrowUpRight, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS, MOCK_INVENTORY, STATUS_CONFIG } from '@/data/mockData';

const STATS = [
  { label: 'Active Tasks', value: '4', delta: '+2 today',     icon: Zap,           color: '#FF6B35', bg: '#FFF4F0', border: '#FFDDD0' },
  { label: 'In Transit',   value: '1', delta: 'Live now',     icon: Truck,         color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Workers On',   value: '3', delta: '2 off today',  icon: Users,         color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Low Stock',    value: '2', delta: 'Needs reorder',icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
];

const FILTERS = ['all', 'in_transit', 'assigned', 'pending', 'completed'];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === 'all' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter);
  const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-muted text-sm">{today}</p>
            <h1 className="text-xl font-black text-text-primary">Good morning, Justin 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRefreshing(r => !r)} className="btn-ghost p-2.5 rounded-xl">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button className="relative btn-ghost p-2.5 rounded-xl">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button onClick={() => router.push('/supervisor/create-task')} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </header>

        <div className="p-8 space-y-7">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-5">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 border cursor-pointer hover:shadow-card-md transition-all group"
                style={{ backgroundColor: s.bg, borderColor: s.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
                </div>
                <p className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{s.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.delta}</p>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 text-sm">Return Reminder</p>
              <p className="text-amber-700 text-sm mt-0.5">ATCO — Arrow Board due back today at 4:00 PM</p>
            </div>
            <button className="text-xs text-amber font-semibold hover:underline">View →</button>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus,     label: 'New Task',  desc: 'Create assignment',   href: '/supervisor/create-task', primary: true },
                { icon: Package,  label: 'Inventory', desc: 'Check stock levels',  href: '/supervisor/inventory',   color: '#2563EB', bg: '#EFF6FF' },
                { icon: Calendar, label: 'Schedule',  desc: 'Worker availability', href: '/supervisor/schedule',    color: '#16A34A', bg: '#F0FDF4' },
                { icon: FileText, label: 'Reports',   desc: 'Weekly PDF reports',  href: '/supervisor/history',     color: '#F59E0B', bg: '#FFFBEB' },
              ].map(({ icon: Icon, label, desc, href, primary, color, bg }, i) => (
                <button key={i} onClick={() => router.push(href)}
                  className={`p-5 rounded-2xl border text-left hover:scale-[1.02] transition-all ${
                    primary ? 'bg-gradient-primary border-transparent shadow-glow text-white' : 'bg-white border-border hover:border-primary/25 shadow-card hover:shadow-card-md'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`}
                    style={primary ? { background: 'rgba(255,255,255,0.2)' } : { background: bg }}>
                    <Icon className="w-5 h-5" style={{ color: primary ? '#fff' : color }} />
                  </div>
                  <p className={`font-bold text-sm ${primary ? 'text-white' : 'text-text-primary'}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${primary ? 'text-white/70' : 'text-text-muted'}`}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks + Inventory */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">Active Tasks</h2>
                <div className="flex items-center gap-2">
                  {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                        filter === f
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-text-muted border border-border hover:border-slate-300'
                      }`}>
                      {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.map(task => <TaskCard key={task.id} task={task} onClick={() => {}} />)}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">Inventory</h2>
                <button onClick={() => router.push('/supervisor/inventory')} className="text-xs text-primary font-semibold hover:underline">View All →</button>
              </div>
              <div className="space-y-2">
                {MOCK_INVENTORY.slice(0, 7).map(item => {
                  const pct = item.available / item.total;
                  const color = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#F59E0B' : '#16A34A';
                  return (
                    <div key={item.id} className="bg-white border border-border rounded-xl p-3.5 hover:border-primary/20 transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-text-primary text-sm">{item.name}</p>
                        <span className="text-xs font-bold" style={{ color }}>{item.available}/{item.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                      </div>
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
