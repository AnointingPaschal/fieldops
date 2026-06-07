'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Loader2, Users, Phone, Briefcase,
  Mail, Lock, CheckCircle, AlertCircle, UserCheck, UserX,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkers, updateWorkerAvailability, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.05 }}};
const item = { hidden:{ opacity:0, y:6 }, visible:{ opacity:1, y:0, transition:{ duration:0.18 }}};

export default function WorkersPage() {
  const [workers,  setWorkers]  = useState<Profile[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:'', email:'', password:'', job_title:'', phone:'',
  });
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    const [w, u] = await Promise.all([fetchWorkers(), fetchCurrentUser()]);
    setWorkers(w); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      setFormError('Name, email and password are required.'); return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.'); return;
    }
    setFormError(''); setSaving(true);

    const res  = await fetch('/api/create-worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setFormError(json.error || 'Failed to create worker.'); return;
    }

    setShowAdd(false);
    setForm({ name:'', email:'', password:'', job_title:'', phone:'' });
    showToast(`${form.name} added successfully.`, true);
    load();
  };

  const toggle = async (w: Profile) => {
    setToggling(w.id);
    await updateWorkerAvailability(w.id, !w.available);
    setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, available: !x.available } : x));
    setToggling(null);
  };

  const available   = workers.filter(w => w.available).length;
  const unavailable = workers.length - available;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Workers</h1>
            <p className="text-[11px] text-text-muted">Manage field worker accounts</p>
          </div>
          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => setShowAdd(true)}
            className="btn-navy flex items-center gap-1.5 text-[13px]">
            <Plus className="w-4 h-4" /> Add Worker
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Total Workers', value: workers.length,  color:'text-sky'  },
            { label:'Available',     value: available,       color:'text-pass' },
            { label:'Off Today',     value: unavailable,     color:'text-fail' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }} className="card text-center py-3">
              {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1" />
                : <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>}
              <p className="text-[11px] text-text-muted font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Worker list */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skel h-16 rounded-xl" />)}
            </div>
          ) : workers.length === 0 ? (
            <div className="empty py-14">
              <div className="empty-icon"><Users className="w-5 h-5 text-text-muted" /></div>
              <p className="text-[13px] font-medium">No workers yet</p>
              <p className="text-[11px]">Add your first field worker to get started</p>
            </div>
          ) : (
            <motion.div variants={list} initial="hidden" animate="visible">
              {workers.map(w => (
                <motion.div key={w.id} variants={item} layout
                  className="row items-center">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black shrink-0 relative">
                    {w.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${w.available ? 'bg-pass' : 'bg-slate-300'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-text-primary">{w.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {w.job_title && (
                        <span className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Briefcase className="w-3 h-3" />{w.job_title}
                        </span>
                      )}
                      {w.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Phone className="w-3 h-3" />{w.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`badge shrink-0 hidden sm:inline-flex ${w.available ? 'bg-pass/10 text-pass' : 'bg-slate-100 text-slate-400'}`}>
                    {w.available ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    {w.available ? 'Available' : 'Unavailable'}
                  </span>

                  {/* Toggle */}
                  <button onClick={() => toggle(w)} disabled={!!toggling}
                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${w.available ? 'bg-pass' : 'bg-slate-200'} disabled:opacity-60`}>
                    {toggling === w.id
                      ? <Loader2 className="w-3 h-3 text-white animate-spin absolute inset-0 m-auto" />
                      : <motion.span layout className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${w.available ? 'left-5' : 'left-0.5'}`} />}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Add Worker Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4 md:p-6"
            onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
            <motion.div
              initial={{ y:24, opacity:0, scale:0.97 }}
              animate={{ y:0,  opacity:1, scale:1   }}
              exit={{   y:16, opacity:0, scale:0.97 }}
              transition={{ type:'spring', damping:28, stiffness:380 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-line overflow-hidden mb-20 md:mb-0"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <h3 className="font-bold text-text-primary text-[15px]">Add New Worker</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Create a field worker account</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="btn-icon">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="Marcus Reid"
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="email" className="input pl-10" placeholder="worker@company.com"
                        value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="password" className="input pl-10" placeholder="Min. 6 characters"
                        value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input className="input pl-10" placeholder="Field Technician"
                        value={form.job_title} onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input className="input pl-10" placeholder="+1 (587) 000-0000"
                        value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Form error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="flex items-center gap-2 text-fail text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />{formError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal footer */}
              <div className="flex gap-2 px-5 pb-5">
                <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
                <motion.button whileTap={{ scale:0.97 }}
                  onClick={handleAdd} disabled={saving}
                  className="btn-navy flex-1 disabled:opacity-40 justify-center">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Worker'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-50 ${toast.ok ? 'bg-pass' : 'bg-fail'}`}
          >
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
