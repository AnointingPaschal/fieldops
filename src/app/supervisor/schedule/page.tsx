'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, Loader2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkers, updateWorkerAvailability, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TODAY = new Date();
const WEEK  = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(TODAY);
  const day = TODAY.getDay();
  const monday = day === 0 ? -6 : 1 - day;
  d.setDate(TODAY.getDate() + monday + i);
  return { label: DAYS[i], date: d.getDate(), full: d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) };
});

export default function SchedulePage() {
  const [workers,  setWorkers]  = useState<Profile[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [day,      setDay]      = useState(Math.min((TODAY.getDay() + 6) % 7, 6));
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [w, u] = await Promise.all([fetchWorkers(), fetchCurrentUser()]);
    setWorkers(w); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (worker: Profile) => {
    setToggling(worker.id);
    await updateWorkerAvailability(worker.id, !worker.available);
    setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, available: !w.available } : w));
    setToggling(null);
  };

  const available = workers.filter(w => w.available).length;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Scheduling</h1>
            <p className="text-[11px] text-text-muted">Manage worker availability</p>
          </div>
          <button className="btn-ghost text-[12px]"><Download className="w-3.5 h-3.5" />Export</button>
        </div>

        {/* Day picker */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {WEEK.map((d, i) => (
            <motion.button key={i} whileTap={{ scale:0.95 }} onClick={() => setDay(i)}
              className={`flex flex-col items-center px-3.5 py-2.5 rounded-xl border-2 shrink-0 transition-all ${
                day === i ? 'bg-navy border-navy text-white' : 'bg-white border-line text-text-secondary hover:border-slate-300'
              }`}>
              <span className="text-[10px] font-bold uppercase">{d.label}</span>
              <span className="text-lg font-black mt-0.5">{d.date}</span>
            </motion.button>
          ))}
        </div>

        {/* Count */}
        <div className="bg-pass/10 border border-pass/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pass/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-pass" />
          </div>
          <div>
            {loading ? <div className="skel h-4 w-32 rounded mb-1" /> : (
              <p className="font-semibold text-pass text-[13px]">{available} of {workers.length} workers available</p>
            )}
            <p className="text-[11px] text-green-600">{WEEK[day]?.full}</p>
          </div>
        </div>

        {/* Worker list */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-3 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skel h-16 rounded-lg" />)}</div>
          ) : workers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Users className="w-5 h-5 text-text-muted" /></div>
              <p className="text-[13px] font-medium">No workers found</p>
              <p className="text-[11px]">Add workers via Supabase authentication</p>
            </div>
          ) : (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {workers.map(w => (
                <motion.div key={w.id} layout className="row">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black shrink-0 relative">
                    {w.name.split(' ').map(n => n[0]).join('')}
                    {w.available && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-pass border-2 border-white rounded-full" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-text-primary">{w.name}</p>
                    <p className="text-[11px] text-text-muted">{w.job_title}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${w.available ? 'bg-pass/10 text-pass' : 'bg-slate-100 text-slate-400'}`}>
                      <span className={`w-1 h-1 rounded-full ${w.available ? 'bg-pass animate-pulse' : 'bg-slate-400'}`} />
                      {w.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Toggle */}
                  <button onClick={() => toggle(w)} disabled={toggling === w.id}
                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${w.available ? 'bg-pass' : 'bg-slate-200'} disabled:opacity-60`}>
                    {toggling === w.id
                      ? <Loader2 className="w-3 h-3 text-white animate-spin absolute top-1.5 left-1/2 -translate-x-1/2" />
                      : <motion.span layout className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${w.available ? 'left-5' : 'left-0.5'}`} />}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
