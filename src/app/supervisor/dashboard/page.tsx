'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { triggerNav } from '@/lib/navigation';
import { motion } from 'framer-motion';
import {
  Zap, Truck, Users, AlertTriangle, Plus, ChevronRight,
  Package, Calendar, FileText, RefreshCw, Clock, Loader2, History,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTasks, fetchInventory, fetchCurrentUser } from '@/lib/api';
import type { Task, InventoryItem, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon = { 'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Zap, 'Tear Down': Truck };

const list = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

export default function SupervisorDashboard() {
  const router = useRouter();
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [user,      setUser]      = useState<Profile | null>(null);
  const [filter,    setFilter]    = useState('All');
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    const [t, inv, u] = await Promise.all([fetchTasks(), fetchInventory(), fetchCurrentUser()]);
    setTasks(t); setInventory(inv); setUser(u);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const active   = tasks.filter(t => !['Completed','Cancelled'].includes(t.status));
  const transit  = tasks.filter(t => t.status === 'In Transit');
  const workers  = new Set(tasks.flatMap(t => t.workers?.map(w => w.id) || [])).size;
  const lowStock = inventory.filter(i => i.available_stock / i.total_stock < 0.3).length;

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  const STATS = [
    { label:'Active Tasks', value: active.length,   icon: Zap,           color:'text-sky',  bg:'bg-sky/10'  },
    { label:'In Transit',   value: transit.length,  icon: Truck,         color:'text-warn', bg:'bg-warn/10' },
    { label:'Workers On',   value: workers,         icon: Users,         color:'text-pass', bg:'bg-pass/10' },
    { label:'Low Stock',    value: lowStock,        icon: AlertTriangle, color:'text-fail', bg:'bg-fail/10' },
  ];

  const FILTERS = ['All','Pending','Assigned','In Transit','Completed','Cancelled'];

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-5">

        {/* Stats */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={list} initial="hidden" animate="visible">
          {STATS.map((s, i) => (
            <motion.div key={i} variants={item} className="card flex flex-col gap-1">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-1`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              {loading
                ? <div className="skel h-7 w-10 rounded" />
                : <p className="text-2xl font-black text-text-primary leading-none">{s.value}</p>}
              <p className="text-[12px] font-medium text-text-muted">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <div>
          <div className="sec-hd">
            <h2 className="sec-title">Quick Actions</h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2"
            variants={list} initial="hidden" animate="visible">
            {[
              { label:'New Task',  sub:'Create assignment',   href:'/supervisor/create-task', primary:true   },
              { label:'Inventory', sub:'Check stock',         href:'/supervisor/inventory'                   },
              { label:'Schedule',  sub:'Worker availability', href:'/supervisor/schedule'                    },
              { label:'Reports',   sub:'Weekly reports',      href:'/supervisor/history'                     },
            ].map(({ label, sub, href, primary }, i) => (
              <motion.button key={i} variants={item}
                onClick={() => { triggerNav(); router.push(href); }}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.98] ${
                  primary ? 'bg-navy border-navy text-white' : 'bg-white border-line hover:border-slate-300'
                }`}>
                <div>
                  <p className={`font-semibold text-[13px] ${primary ? 'text-white' : 'text-text-primary'}`}>{label}</p>
                  <p className={`text-[11px] mt-0.5 ${primary ? 'text-slate-400' : 'text-text-muted'}`}>{sub}</p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${primary ? 'text-slate-400' : 'text-slate-300'}`} />
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Tasks + Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Task list — 2/3 */}
          <div className="md:col-span-2 space-y-3">
            <div className="sec-hd">
              <h2 className="sec-title">Tasks</h2>
              <button onClick={load} className="btn-icon" title="Refresh">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : 'text-text-muted'}`} />
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'chip-on' : 'chip-off'}>{f}</button>
              ))}
            </div>

            <div className="card !p-0 overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="skel h-14 rounded-lg" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon"><FileText className="w-5 h-5 text-text-muted" /></div>
                  <p className="text-[13px] font-medium">No tasks yet</p>
                  <p className="text-[11px]">Create your first task to get started</p>
                </div>
              ) : (
                <motion.div variants={list} initial="hidden" animate="visible">
                  {filtered.map(task => {
                    const sm = STATUS_META[task.status] || STATUS_META['Pending'];
                    const tm = TYPE_META[task.type]     || TYPE_META['Delivery'];
                    const Icon = taskIcon[task.type] || Package;
                    return (
                      <motion.div key={task.id} variants={item}
                        className="row cursor-pointer"
                        onClick={() => { triggerNav(); router.push(`/supervisor/tasks/${task.id}`); }}>
                        <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: tm.color + '18' }}>
                          <Icon className="w-4 h-4" style={{ color: tm.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[13px] text-text-primary truncate">
                              {task.contractor?.name || 'No contractor'}
                            </p>
                            <span className="badge shrink-0" style={{ background: sm.bg, color: sm.text }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                              {task.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">
                            {task.type}
                            {task.workers && task.workers.length > 0 && ` · ${task.workers.map(w => w.name.split(' ')[0]).join(', ')}`}
                            {task.rental_end && ` · Due ${new Date(task.rental_end).toLocaleDateString('en-CA', { month:'short', day:'numeric' })}`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* Inventory — 1/3 */}
          <div>
            <div className="sec-hd">
              <h2 className="sec-title">Inventory</h2>
              <button onClick={() => { triggerNav(); router.push('/supervisor/inventory'); }} className="link-sm">View all</button>
            </div>
            <div className="card !p-0 overflow-hidden">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="skel h-10 rounded" />)}
                </div>
              ) : inventory.length === 0 ? (
                <div className="empty py-8">
                  <div className="empty-icon"><Package className="w-4 h-4 text-text-muted" /></div>
                  <p className="text-[12px]">No inventory</p>
                </div>
              ) : (
                <motion.div variants={list} initial="hidden" animate="visible">
                  {inventory.slice(0, 7).map(inv => {
                    const pct = inv.total_stock > 0 ? inv.available_stock / inv.total_stock : 0;
                    const c   = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#D97706' : '#16A34A';
                    return (
                      <motion.div key={inv.id} variants={item}
                        className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-slate-50/60">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-text-primary truncate">{inv.name}</p>
                          <div className="prog-track mt-1.5">
                            <div className="prog-fill" style={{ width:`${pct*100}%`, background:c }} />
                          </div>
                        </div>
                        <span className="text-[12px] font-bold shrink-0" style={{ color:c }}>
                          {inv.available_stock}<span className="text-text-muted font-normal text-[11px]">/{inv.total_stock}</span>
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
