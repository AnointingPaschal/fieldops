'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Truck, Users, AlertTriangle, Plus, Package, Calendar, FileText,
  RefreshCw, Bell, TrendingUp, ArrowUpRight, Clock
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS, MOCK_INVENTORY, STATUS_CONFIG } from '@/data/mockData';

const STATS = [
  { label: 'Active Tasks', value: '4', delta: '+2 today', icon: Zap, color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.2)' },
  { label: 'In Transit', value: '1', delta: 'Live now', icon: Truck, color: '#FFB800', bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.2)' },
  { label: 'Workers On', value: '3', delta: '2 off today', icon: Users, color: '#22D46E', bg: 'rgba(34,212,110,0.1)', border: 'rgba(34,212,110,0.2)' },
  { label: 'Low Stock', value: '2', delta: 'Needs reorder', icon: AlertTriangle, color: '#FF3B5C', bg: 'rgba(255,59,92,0.1)', border: 'rgba(255,59,92,0.2)' },
];

const STATUS_FILTERS = ['all', 'in_transit', 'assigned', 'pending', 'completed'];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === 'all' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const today = new Date().toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm">{today}</p>
            <h1 className="text-xl font-black text-white">Good morning, Justin 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="btn-ghost p-2.5 rounded-xl" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button className="relative btn-ghost p-2.5 rounded-xl">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button
              onClick={() => router.push('/supervisor/create-task')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-5">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="stat-card"
                style={{ borderColor: stat.border, background: `linear-gradient(135deg, ${stat.bg}, transparent)` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.delta}</p>
              </div>
            ))}
          </div>

          {/* Alert banner */}
          <div className="bg-amber/10 border border-amber/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber text-sm">Return Reminder</p>
              <p className="text-text-secondary text-sm mt-0.5">ATCO — Arrow Board due back today at 4:00 PM</p>
            </div>
            <button className="text-xs text-amber font-semibold hover:underline">View Task →</button>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'New Task', desc: 'Create assignment', href: '/supervisor/create-task', color: '#FF6B35', gradient: true },
                { icon: Package, label: 'Inventory', desc: 'Check stock levels', href: '/supervisor/inventory', color: '#3B9EFF' },
                { icon: Calendar, label: 'Schedule', desc: 'Worker availability', href: '/supervisor/schedule', color: '#22D46E' },
                { icon: FileText, label: 'Reports', desc: 'Weekly PDF reports', href: '/supervisor/history', color: '#FFB800' },
              ].map(({ icon: Icon, label, desc, href, color, gradient }, i) => (
                <button
                  key={i}
                  onClick={() => router.push(href)}
                  className={`p-5 rounded-2xl border text-left hover:scale-[1.02] transition-all ${
                    gradient
                      ? 'bg-gradient-primary border-transparent shadow-glow'
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${gradient ? 'bg-white/20' : ''}`}
                    style={!gradient ? { background: color + '20' } : {}}
                  >
                    <Icon className="w-5 h-5" style={{ color: gradient ? '#fff' : color }} />
                  </div>
                  <p className={`font-bold text-sm ${gradient ? 'text-white' : 'text-white'}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${gradient ? 'text-white/70' : 'text-text-muted'}`}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks + Inventory split */}
          <div className="grid grid-cols-3 gap-6">
            {/* Tasks - 2/3 width */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Active Tasks</h2>
                <div className="flex items-center gap-2">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                        filter === f ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-elevated text-text-muted border border-border hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => {}} />
                ))}
              </div>
            </div>

            {/* Inventory alerts - 1/3 width */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Inventory</h2>
                <button onClick={() => router.push('/supervisor/inventory')} className="text-xs text-primary font-semibold hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_INVENTORY.slice(0, 6).map(item => {
                  const pct = item.available / item.total;
                  const color = pct < 0.2 ? '#FF3B5C' : pct < 0.4 ? '#FFB800' : '#22D46E';
                  return (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white text-sm">{item.name}</p>
                        <span className="text-xs font-bold" style={{ color }}>
                          {item.available}/{item.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct * 100}%`, background: color }}
                        />
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
