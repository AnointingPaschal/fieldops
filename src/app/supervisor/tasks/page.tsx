'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus, Package, RefreshCw, Wrench, Trash2,
  ChevronRight, FileText, Filter,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTasks, fetchCurrentUser } from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

const FILTERS = ['All', 'Pending', 'Assigned', 'Accepted', 'In Transit', 'Completed', 'Cancelled'];

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.04 }}};
const row  = { hidden:{ opacity:0, y:5 }, visible:{ opacity:1, y:0, transition:{ duration:0.16 }}};

export default function TasksPage() {
  const router = useRouter();
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [user,    setUser]    = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');

  const load = async () => {
    setLoading(true);
    const [t, u] = await Promise.all([fetchTasks(), fetchCurrentUser()]);
    setTasks(t); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  const counts: Record<string, number> = { All: tasks.length };
  FILTERS.slice(1).forEach(s => {
    counts[s] = tasks.filter(t => t.status === s).length;
  });

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Tasks</h1>
            <p className="text-[11px] text-text-muted">
              {loading ? '—' : `${tasks.length} total · ${counts['In Transit'] || 0} in transit`}
            </p>
          </div>
          <button onClick={() => router.push('/supervisor/create-task')}
            className="btn-navy text-[13px]">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`chip shrink-0 ${filter === f ? 'chip-on' : 'chip-off'}`}>
              {f}
              {counts[f] > 0 && (
                <span className={`ml-1 text-[10px] font-black ${filter === f ? 'text-white/70' : 'text-text-muted'}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="skel h-16 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty py-14">
              <div className="empty-icon">
                <FileText className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-[13px] font-medium">
                {filter === 'All' ? 'No tasks yet' : `No ${filter.toLowerCase()} tasks`}
              </p>
              <p className="text-[11px]">
                {filter === 'All' ? 'Create your first task to get started' : 'Try a different filter'}
              </p>
              {filter === 'All' && (
                <button onClick={() => router.push('/supervisor/create-task')}
                  className="btn-navy mt-3 text-[12px]">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
            </div>
          ) : (
            <motion.div variants={list} initial="hidden" animate="visible">
              {filtered.map(task => {
                const sm   = STATUS_META[task.status] || STATUS_META['Pending'];
                const tm   = TYPE_META[task.type]     || TYPE_META['Delivery'];
                const Icon = taskIcon[task.type] || Package;
                return (
                  <motion.div key={task.id} variants={row}
                    onClick={() => router.push(`/supervisor/tasks/${task.id}`)}
                    className="row cursor-pointer group hover:bg-slate-50 transition-colors"
                    style={{ borderLeft: `3px solid ${tm.color}` }}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: tm.color + '15' }}>
                      <Icon className="w-4 h-4" style={{ color: tm.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[13px] text-text-primary group-hover:text-sky transition-colors">
                          {task.contractor?.name || 'No contractor'}
                        </p>
                        <span className="badge" style={{ background: sm.bg, color: sm.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-muted">
                        <span>{task.type}</span>
                        {task.workers && task.workers.length > 0 && (
                          <span>· {task.workers.map(w => w.name.split(' ')[0]).join(', ')}</span>
                        )}
                        {task.rental_end && (
                          <span>· Due {new Date(task.rental_end).toLocaleDateString('en-CA',{
                            month:'short', day:'numeric'
                          })}</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-sky transition-colors" />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
