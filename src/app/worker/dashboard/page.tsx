'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LogIn, LogOut, MapPin, Camera, FileText, AlertCircle,
  ChevronRight, Loader2, Package, RefreshCw, Wrench, Trash2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTasks, clockIn, clockOut, fetchCurrentUser } from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon = { 'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2 };

export default function WorkerDashboard() {
  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [user,       setUser]       = useState<Profile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [clocking,   setClocking]   = useState(false);
  const [clockedIn,  setClockedIn]  = useState(false);
  const [clockTime,  setClockTime]  = useState('');

  const load = async () => {
    setLoading(true);
    const [u] = await Promise.all([fetchCurrentUser()]);
    setUser(u);
    if (u) {
      const t = await fetchTasks();
      setTasks(t.filter(task => task.workers?.some(w => w.id === u.id)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleClock = async () => {
    if (!user) return;
    setClocking(true);
    if (!clockedIn) {
      await clockIn(user.id);
      setClockTime(new Date().toLocaleTimeString('en-CA', { hour:'2-digit', minute:'2-digit' }));
      setClockedIn(true);
    } else {
      await clockOut(user.id);
      setClockedIn(false);
      setClockTime('');
    }
    setClocking(false);
  };

  const activeTasks = tasks.filter(t => !['Completed','Cancelled'].includes(t.status));

  return (
    <AppShell role="worker" userName={user?.name || 'Worker'}>
      <div className="space-y-4">

        {/* Clock card */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          className="rounded-xl bg-navy p-5 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full border border-white/5" />
          <div className="relative">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
              {new Date().toLocaleDateString('en-CA', { weekday:'long', month:'long', day:'numeric' })}
            </p>
            <p className="text-white text-4xl font-black tracking-tight leading-none mb-2">
              {clockedIn ? clockTime : '—'}
            </p>
            <div className="flex items-center gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                clockedIn ? 'bg-pass/20 text-green-300' : 'bg-white/10 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${clockedIn ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                {clockedIn ? 'Clocked in · GPS recorded' : 'Not clocked in'}
              </span>
            </div>
            <motion.button whileTap={{ scale:0.97 }} onClick={handleClock} disabled={clocking || loading}
              className={`inline-flex items-center gap-2 font-semibold text-[13px] px-5 py-2.5 rounded-lg text-white transition-all disabled:opacity-60 ${
                clockedIn ? 'bg-fail' : 'bg-sky'
              }`}>
              {clocking ? <Loader2 className="w-4 h-4 animate-spin" />
                : clockedIn ? <><LogOut className="w-4 h-4" />Clock Out</>
                : <><LogIn className="w-4 h-4" />Clock In for Today</>}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { I:MapPin,     l:'Update Location', c:'text-sky',  bg:'bg-sky/10'  },
            { I:Camera,     l:'Upload Photo',     c:'text-warn', bg:'bg-warn/10' },
            { I:FileText,   l:'Add Note',         c:'text-pass', bg:'bg-pass/10' },
            { I:AlertCircle,l:'Report Issue',     c:'text-fail', bg:'bg-fail/10' },
          ].map(({ I, l, c, bg }, i) => (
            <motion.button key={i} whileTap={{ scale:0.97 }}
              initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="card-sm flex items-center gap-2.5 text-left hover:shadow-md transition-shadow active:scale-[0.98]">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <I className={`w-4 h-4 ${c}`} />
              </div>
              <span className="font-medium text-[12px] text-text-primary">{l}</span>
            </motion.button>
          ))}
        </div>

        {/* My Tasks */}
        <div>
          <div className="sec-hd">
            <h2 className="sec-title">My Tasks</h2>
            {!loading && <span className="text-[11px] text-text-muted">{activeTasks.length} active</span>}
          </div>
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">{[1,2,3].map(i => <div key={i} className="skel h-14 rounded-lg" />)}</div>
            ) : tasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><FileText className="w-5 h-5 text-text-muted" /></div>
                <p className="text-[13px] font-medium">No tasks assigned</p>
                <p className="text-[11px]">Your supervisor will assign tasks here</p>
              </div>
            ) : (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {tasks.map((task, i) => {
                  const sm   = STATUS_META[task.status] || STATUS_META['Pending'];
                  const tm   = TYPE_META[task.type]     || TYPE_META['Delivery'];
                  const Icon = taskIcon[task.type] || Package;
                  return (
                    <motion.div key={task.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i*0.05 }} className="row cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: tm.color + '18' }}>
                        <Icon className="w-4 h-4" style={{ color: tm.color }} />
                      </div>
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
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {task.type}
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
      </div>
    </AppShell>
  );
}
