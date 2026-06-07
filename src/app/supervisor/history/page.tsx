'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, FileText, History, Package, RefreshCw, Truck, Wrench, Trash2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTasks, fetchCurrentUser } from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon = { 'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2 };

export default function HistoryPage() {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [user,    setUser]    = useState<Profile | null>(null);
  const [tab,     setTab]     = useState<'tasks'|'reports'>('tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [t, u] = await Promise.all([fetchTasks(), fetchCurrentUser()]);
      setTasks(t); setUser(u); setLoading(false);
    };
    load();
  }, []);

  const completed = tasks.filter(t => t.status === 'Completed');

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">History &amp; Reports</h1>
            <p className="text-[11px] text-text-muted">Task log and weekly reports</p>
          </div>
          <button className="btn-ghost text-[12px]"><Share2 className="w-3.5 h-3.5" />Export</button>
        </div>

        <div className="flex gap-1.5">
          {(['tasks','reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'chip-on' : 'chip-off'}>
              {t === 'tasks' ? 'All Tasks' : 'Reports'}
            </button>
          ))}
        </div>

        {tab === 'tasks' && (
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">{[1,2,3].map(i => <div key={i} className="skel h-14 rounded-lg" />)}</div>
            ) : tasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><History className="w-5 h-5 text-text-muted" /></div>
                <p className="text-[13px] font-medium">No tasks yet</p>
                <p className="text-[11px]">Completed tasks will appear here</p>
              </div>
            ) : (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {tasks.map(task => {
                  const sm   = STATUS_META[task.status] || STATUS_META['Pending'];
                  const tm   = TYPE_META[task.type]     || TYPE_META['Delivery'];
                  const Icon = taskIcon[task.type] || Package;
                  return (
                    <motion.div key={task.id} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} className="row">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: tm.color + '18' }}>
                        <Icon className="w-4 h-4" style={{ color: tm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[13px] text-text-primary">{task.contractor?.name || 'No contractor'}</p>
                          <span className="badge" style={{ background: sm.bg, color: sm.text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />{task.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {task.type} · {new Date(task.created_at).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' })}
                        </p>
                      </div>
                      {task.completed_at && (
                        <p className="text-[11px] text-text-muted shrink-0 hidden sm:block">
                          {new Date(task.completed_at).toLocaleDateString('en-CA', { month:'short', day:'numeric' })}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="card text-center py-3">
                {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1" /> : <p className="text-2xl font-black text-sky">{tasks.length}</p>}
                <p className="text-[11px] text-text-muted">Total Tasks</p>
              </div>
              <div className="card text-center py-3">
                {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1" /> : <p className="text-2xl font-black text-pass">{completed.length}</p>}
                <p className="text-[11px] text-text-muted">Completed</p>
              </div>
            </div>

            {/* Report cards */}
            <div className="card-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[13px] text-text-primary">Current Week Report</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{tasks.length} tasks logged</p>
                </div>
                <span className="badge bg-warn/10 text-warn border border-warn/20">Generating</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
                <FileText className="w-3.5 h-3.5" />
                Auto-generates every Friday at 11:00 PM
              </div>
            </div>

            <div className="bg-sky/5 border border-sky/15 rounded-xl p-3.5 flex items-start gap-3">
              <FileText className="w-4 h-4 text-sky shrink-0 mt-0.5" />
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Weekly PDF reports are auto-generated and emailed to management. Historical reports are stored and downloadable from this dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
