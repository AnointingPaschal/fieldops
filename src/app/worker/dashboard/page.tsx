'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, LogOut, MapPin, Camera, FileText, AlertCircle,
  ChevronRight, Loader2, Package, RefreshCw, Wrench, Trash2,
  CheckCircle, X, Navigation,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchWorkerTasks, clockIn, clockOut, fetchCurrentUser,
  fetchTodayEntry, updateWorkerLocation, addTaskUpdate, uploadTaskPhoto,
} from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

// ── GPS hook ─────────────────────────────────────────────────
function useGPS() {
  const [gps,    setGps]    = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);

  const request = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('GPS not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        p => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          setGps(loc); resolve(loc);
        },
        e => { setDenied(true); reject(e); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  return { gps, denied, request };
}

// ── Modal ─────────────────────────────────────────────────────
function ActionModal({
  title, placeholder, onClose, onSubmit, isPhoto = false,
}: {
  title: string; placeholder: string; isPhoto?: boolean;
  onClose: () => void; onSubmit: (text: string, file?: File) => Promise<void>;
}) {
  const [text,    setText]    = useState('');
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving,  setSaving]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!text.trim() && !file) return;
    setSaving(true);
    await onSubmit(text, file || undefined);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:16, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:360 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-line overflow-hidden mb-20 md:mb-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-bold text-text-primary text-[15px]">{title}</h3>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4 text-text-muted" /></button>
        </div>
        <div className="p-5 space-y-3">
          {isPhoto && (
            <div onClick={() => fileRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-line hover:border-sky/50 bg-slate-50 hover:bg-sky/5 flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-1.5 text-text-muted">
                    <Camera className="w-6 h-6" />
                    <p className="text-[12px] font-medium">Tap to take / choose photo</p>
                  </div>}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                }} />
            </div>
          )}
          <textarea
            className="textarea"
            rows={3}
            placeholder={placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <motion.button whileTap={{ scale:0.97 }} onClick={submit}
            disabled={saving || (!text.trim() && !file)}
            className="btn-navy flex-1 justify-center disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function WorkerDashboard() {
  const router   = useRouter();
  const { gps, denied, request: requestGPS } = useGPS();

  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [user,      setUser]      = useState<Profile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [clocking,  setClocking]  = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const [modal,     setModal]     = useState<'note' | 'photo' | 'issue' | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [locating,  setLocating]  = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u);
    if (u) {
      const [myTasks, todayEntry] = await Promise.all([
        fetchWorkerTasks(u.id),
        fetchTodayEntry(u.id),
      ]);
      setTasks(myTasks);
      // Restore clock-in state from DB
      if (todayEntry?.clock_in && !todayEntry?.clock_out) {
        setClockedIn(true);
        setClockTime(todayEntry.clock_in.slice(0, 5));
      }
      setActiveTask(myTasks.find((t: Task) =>
        ['Assigned','Accepted','In Transit'].includes(t.status)
      ) || null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Clock In / Out with GPS ──
  const handleClock = async () => {
    if (!user) return;
    setClocking(true);
    try {
      // Require GPS for clock-in
      const loc = await requestGPS().catch(() => null);
      if (!clockedIn && !loc) {
        showToast('Please allow location access to clock in.', false);
        setClocking(false); return;
      }

      if (!clockedIn) {
        await clockIn(user.id);
        if (loc) await updateWorkerLocation(user.id, loc.lat, loc.lng);
        const now = new Date().toLocaleTimeString('en-CA', { hour:'2-digit', minute:'2-digit' });
        setClockTime(now); setClockedIn(true);
        showToast('Clocked in · GPS location recorded.');
      } else {
        await clockOut(user.id);
        if (loc) await updateWorkerLocation(user.id, loc.lat, loc.lng);
        setClockedIn(false); setClockTime('');
        showToast('Clocked out successfully.');
      }
    } catch {
      showToast('Action failed. Please try again.', false);
    }
    setClocking(false);
  };

  // ── Update Location ──
  const handleUpdateLocation = async () => {
    if (!user) return;
    setLocating(true);
    try {
      const loc = await requestGPS();
      await updateWorkerLocation(user.id, loc.lat, loc.lng);
      showToast('Location updated successfully.');
    } catch {
      showToast('Could not get GPS. Please allow location access.', false);
    }
    setLocating(false);
  };

  // ── Note / Photo / Issue submit ──
  const handleActionSubmit = async (text: string, file?: File) => {
    if (!user || !activeTask) {
      showToast('No active task to attach this to.', false); return;
    }
    let photo_url: string | undefined;
    if (file) {
      const { uploadTaskPhoto: upload } = await import('@/lib/api');
      photo_url = upload ? await upload(file, activeTask.id, user.id) || undefined : undefined;
    }
    await addTaskUpdate({
      task_id:   activeTask.id,
      worker_id: user.id,
      type:      modal as any,
      content:   text || undefined,
      photo_url,
    });
    showToast(
      modal === 'note'  ? 'Note added to task.'   :
      modal === 'photo' ? 'Photo uploaded.'        :
      'Issue reported to supervisor.'
    );
  };

  const activeTasks = tasks.filter(t => !['Completed','Cancelled'].includes(t.status));

  return (
    <AppShell role="worker" userName={user?.name || 'Worker'}>
      <div className="space-y-4">

        {/* GPS denied warning */}
        <AnimatePresence>
          {denied && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 bg-warn/10 border border-warn/30 rounded-xl px-4 py-3">
              <Navigation className="w-4 h-4 text-warn shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-warn">Location access denied</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Enable location in your browser settings to clock in and use GPS features.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Clock card ── */}
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
                {clockedIn
                  ? `Clocked in${gps ? ' · GPS active' : ''}`
                  : 'Not clocked in'}
              </span>
            </div>
            <motion.button whileTap={{ scale:0.97 }} onClick={handleClock}
              disabled={clocking || loading}
              className={`inline-flex items-center gap-2 font-semibold text-[13px] px-5 py-2.5 rounded-lg text-white transition-all disabled:opacity-60 ${
                clockedIn ? 'bg-fail' : 'bg-sky'
              }`}>
              {clocking ? <Loader2 className="w-4 h-4 animate-spin" />
                : clockedIn ? <><LogOut className="w-4 h-4" />Clock Out</>
                : <><LogIn className="w-4 h-4" />Clock In — GPS Required</>}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Active task banner ── */}
        <AnimatePresence>
          {activeTask && clockedIn && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              onClick={() => router.push(`/worker/tasks/${activeTask.id}`)}
              className="flex items-center gap-3 bg-sky/10 border border-sky/25 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-sky/15 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-sky animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-sky uppercase tracking-wide">Active Task</p>
                <p className="font-bold text-text-primary text-[13px] truncate">{activeTask.contractor?.name}</p>
                <p className="text-[11px] text-text-muted">{activeTask.type} · {activeTask.status}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-sky shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick actions ── */}
        {clockedIn && (
          <div>
            <p className="sec-title mb-2">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { icon: locating ? Loader2 : MapPin, label:'Update Location', color:'text-sky',  bg:'bg-sky/10',  action: handleUpdateLocation, spin: locating },
                { icon: Camera,    label:'Upload Photo',    color:'text-warn', bg:'bg-warn/10', action: () => setModal('photo') },
                { icon: FileText,  label:'Add Note',        color:'text-pass', bg:'bg-pass/10', action: () => setModal('note')  },
                { icon: AlertCircle,label:'Report Issue',   color:'text-fail', bg:'bg-fail/10', action: () => setModal('issue') },
              ].map(({ icon: Icon, label, color, bg, action, spin }, i) => (
                <motion.button key={i} whileTap={{ scale:0.97 }}
                  initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={action}
                  className="card-sm flex items-center gap-2.5 text-left hover:shadow-md transition-shadow active:scale-[0.98]">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color} ${spin ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="font-medium text-[12px] text-text-primary leading-tight">{label}</span>
                </motion.button>
              ))}
            </div>
            {!activeTask && (
              <p className="text-[11px] text-text-muted mt-2 text-center">
                Note: select an active task first to attach photos/notes to it.
              </p>
            )}
          </div>
        )}

        {/* ── My Tasks ── */}
        <div>
          <div className="sec-hd">
            <h2 className="sec-title">My Tasks</h2>
            {!loading && <span className="text-[11px] text-text-muted">{activeTasks.length} active</span>}
          </div>
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">
                {[1,2,3].map(i => <div key={i} className="skel h-16 rounded-lg" />)}
              </div>
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
                    <motion.div key={task.id}
                      initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/worker/tasks/${task.id}`)}
                      className="row cursor-pointer group hover:bg-slate-50 active:bg-slate-100 transition-colors">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: tm.color + '18' }}>
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
                          {task.rental_end && ` · Due ${new Date(task.rental_end).toLocaleDateString('en-CA',{ month:'short', day:'numeric' })}`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-sky transition-colors" />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Action modals */}
      <AnimatePresence>
        {modal === 'note' && (
          <ActionModal key="note" title="Add Note" placeholder="Write a note about this task…"
            onClose={() => setModal(null)} onSubmit={handleActionSubmit} />
        )}
        {modal === 'photo' && (
          <ActionModal key="photo" title="Upload Photo" placeholder="Add a caption (optional)…"
            isPhoto onClose={() => setModal(null)} onSubmit={handleActionSubmit} />
        )}
        {modal === 'issue' && (
          <ActionModal key="issue" title="Report Issue"
            placeholder="Describe the issue so your supervisor can act on it…"
            onClose={() => setModal(null)} onSubmit={handleActionSubmit} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok ? 'bg-pass' : 'bg-fail'}`}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
