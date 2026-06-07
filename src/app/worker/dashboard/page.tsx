'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { triggerNav } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, LogOut, MapPin, Camera, FileText, AlertCircle,
  ChevronRight, Loader2, Package, RefreshCw, Wrench, Trash2,
  CheckCircle, X, Navigation, Signal,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchWorkerTasks, clockIn, clockOut, fetchCurrentUser,
  fetchTodayEntry, updateWorkerLocation, addTaskUpdate, uploadTaskPhoto, saveLocationPoint,
} from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

// ── Action modal ──────────────────────────────────────────────
function ActionModal({ title, placeholder, isPhoto, onClose, onSubmit }: {
  title: string; placeholder: string; isPhoto?: boolean;
  onClose: () => void; onSubmit: (text: string, file?: File) => Promise<void>;
}) {
  const [text, setText]     = useState('');
  const [file, setFile]     = useState<File | null>(null);
  const [prev, setPrev]     = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

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
            <div onClick={() => ref.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-line hover:border-sky/50 bg-slate-50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
              {prev
                ? <img src={prev} alt="preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-1.5 text-text-muted">
                    <Camera className="w-6 h-6" />
                    <p className="text-[12px] font-medium">Tap to take / choose photo</p>
                  </div>}
              <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFile(f); setPrev(URL.createObjectURL(f));
                }} />
            </div>
          )}
          <textarea className="textarea" rows={3} placeholder={placeholder}
            value={text} onChange={e => setText(e.target.value)} />
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

// ── Main ──────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const router = useRouter();

  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [user,       setUser]       = useState<Profile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [clocking,   setClocking]   = useState(false);
  const [clockedIn,  setClockedIn]  = useState(false);
  const [clockTime,  setClockTime]  = useState('');
  const [gps,        setGps]        = useState<{ lat:number; lng:number } | null>(null);
  const [gpsStatus,  setGpsStatus]  = useState<'idle'|'active'|'denied'>('idle');
  const [modal,      setModal]      = useState<'note'|'photo'|'issue'|null>(null);
  const [toast,      setToast]      = useState<{ msg:string; ok:boolean } | null>(null);
  const [locating,   setLocating]   = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const watchRef    = useRef<number | null>(null);
  const activeTaskRef = useRef<Task | null>(null);
  const userRef    = useRef<Profile | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u); userRef.current = u;
    if (u) {
      const [myTasks, todayEntry] = await Promise.all([
        fetchWorkerTasks(u.id), fetchTodayEntry(u.id),
      ]);
      setTasks(myTasks);
      const active = myTasks.find((t: Task) =>
        ['Assigned','Accepted','In Transit'].includes(t.status)
      ) || null;
      setActiveTask(active); activeTaskRef.current = active;

      // Restore clock-in state from DB
      if (todayEntry?.clock_in && !todayEntry?.clock_out) {
        setClockedIn(true);
        setClockTime(todayEntry.clock_in.slice(0,5));
        // If was clocked in + has active task, restart GPS tracking
        if (active) startTracking();
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── GPS watch: auto-update location every ~60s while clocked in ──
  const startTracking = () => {
    if (!navigator.geolocation) return;
    setGpsStatus('active');

    // watchPosition: fires on every significant movement
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGps(loc);
        if (userRef.current) {
          updateWorkerLocation(userRef.current.id, loc.lat, loc.lng);
          // Save to route history for track playback
          const taskId = activeTaskRef.current?.id || null;
          saveLocationPoint(userRef.current.id, loc.lat, loc.lng, taskId);
        }
      },
      err => {
        if (err.code === 1) setGpsStatus('denied');
        console.warn('GPS error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 }
    );

    // Also force-update every 60s (in case device is stationary)
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGps(loc);
          if (userRef.current) {
            updateWorkerLocation(userRef.current.id, loc.lat, loc.lng);
            const taskId = activeTaskRef.current?.id || null;
            saveLocationPoint(userRef.current.id, loc.lat, loc.lng, taskId);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    }, 60_000);
  };

  const stopTracking = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setGpsStatus('idle');
  };

  useEffect(() => () => stopTracking(), []);

  // ── Clock In / Out ──
  const handleClock = async () => {
    if (!user) return;
    setClocking(true);

    if (!clockedIn) {
      // Request GPS first
      try {
        const loc = await new Promise<{ lat:number; lng:number }>((res, rej) =>
          navigator.geolocation.getCurrentPosition(
            p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
            rej, { enableHighAccuracy: true, timeout: 10_000 }
          )
        );
        await clockIn(user.id);
        await updateWorkerLocation(user.id, loc.lat, loc.lng);
        setGps(loc);
        const now = new Date().toLocaleTimeString('en-CA',{ hour:'2-digit', minute:'2-digit' });
        setClockTime(now); setClockedIn(true);
        startTracking();
        showToast('Clocked in · GPS tracking started.');
      } catch {
        setGpsStatus('denied');
        showToast('Please allow location access to clock in.', false);
      }
    } else {
      await clockOut(user.id);
      stopTracking();
      setClockedIn(false); setClockTime(''); setGps(null);
      showToast('Clocked out. GPS tracking stopped.');
    }
    setClocking(false);
  };

  // ── Manual location update ──
  const handleUpdateLocation = async () => {
    if (!user) return;
    setLocating(true);
    try {
      const loc = await new Promise<{ lat:number; lng:number }>((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
          rej, { enableHighAccuracy: true, timeout: 10_000 }
        )
      );
      await updateWorkerLocation(user.id, loc.lat, loc.lng);
      setGps(loc);
      showToast('Location updated.');
    } catch {
      showToast('Could not get GPS. Please allow location access.', false);
    }
    setLocating(false);
  };

  // ── Note / Photo / Issue submit ──
  const handleActionSubmit = async (text: string, file?: File) => {
    if (!user || !activeTask) {
      showToast('Select an active task first.', false); return;
    }
    let photo_url: string | undefined;
    if (file) photo_url = await uploadTaskPhoto(file, activeTask.id, user.id) || undefined;
    await addTaskUpdate({
      task_id: activeTask.id, worker_id: user.id,
      type: modal as any, content: text || undefined, photo_url,
    });
    showToast(
      modal === 'note'  ? 'Note added.' :
      modal === 'photo' ? 'Photo uploaded.' : 'Issue reported.'
    );
  };

  const activeTasks = tasks.filter(t => !['Completed','Cancelled'].includes(t.status));

  return (
    <AppShell role="worker" userName={user?.name || 'Worker'}>
      <div className="space-y-4">

        {/* GPS denied warning */}
        <AnimatePresence>
          {gpsStatus === 'denied' && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 bg-warn/10 border border-warn/30 rounded-xl px-4 py-3">
              <Navigation className="w-4 h-4 text-warn shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-warn">Location access denied</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Enable location in your browser/device settings to clock in and use GPS features.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Clock card ── */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          className="rounded-xl bg-navy p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                {new Date().toLocaleDateString('en-CA',{ weekday:'long', month:'long', day:'numeric' })}
              </p>
              {/* GPS indicator */}
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                gpsStatus === 'active' ? 'bg-pass/20 text-green-300' : 'bg-white/10 text-slate-500'
              }`}>
                <Signal className={`w-3 h-3 ${gpsStatus === 'active' ? 'animate-pulse' : ''}`} />
                {gpsStatus === 'active' ? 'GPS Active' : 'GPS Off'}
              </div>
            </div>

            <p className="text-white text-4xl font-black tracking-tight leading-none mb-2">
              {clockedIn ? clockTime : '—'}
            </p>

            {/* GPS coords */}
            {gps && (
              <p className="text-white/30 text-[10px] font-mono mb-1">
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
              </p>
            )}

            <div className="flex items-center gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                clockedIn ? 'bg-pass/20 text-green-300' : 'bg-white/10 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${clockedIn ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                {clockedIn ? 'Clocked in · Auto-tracking on' : 'Not clocked in'}
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

        {/* Active task banner */}
        <AnimatePresence>
          {activeTask && clockedIn && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              onClick={() => { triggerNav(); router.push(`/worker/tasks/${activeTask.id}`); }}
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

        {/* Quick actions */}
        {clockedIn && (
          <div>
            <p className="sec-title mb-2">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { icon: locating ? Loader2 : MapPin, label:'Update Location', color:'text-sky',  bg:'bg-sky/10',  action: handleUpdateLocation, spin: locating },
                { icon: Camera,      label:'Upload Photo',   color:'text-warn', bg:'bg-warn/10', action: () => setModal('photo') },
                { icon: FileText,    label:'Add Note',       color:'text-pass', bg:'bg-pass/10', action: () => setModal('note') },
                { icon: AlertCircle, label:'Report Issue',   color:'text-fail', bg:'bg-fail/10', action: () => setModal('issue') },
              ].map(({ icon:Icon, label, color, bg, action, spin }, i) => (
                <motion.button key={i} whileTap={{ scale:0.97 }}
                  initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={action}
                  className="card-sm flex items-center gap-2.5 text-left hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color} ${spin ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="font-medium text-[12px] text-text-primary leading-tight">{label}</span>
                </motion.button>
              ))}
            </div>
            {!activeTask && (
              <p className="text-[11px] text-text-muted mt-2 px-1">
                Tap a task below to make it active — photos and notes will attach to it.
              </p>
            )}
          </div>
        )}

        {/* My Tasks */}
        <div>
          <div className="sec-hd">
            <h2 className="sec-title">My Tasks</h2>
            {!loading && <span className="text-[11px] text-text-muted">{activeTasks.length} active</span>}
          </div>
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">{[1,2,3].map(i => <div key={i} className="skel h-16 rounded-lg" />)}</div>
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
                      onClick={() => { triggerNav(); router.push(`/worker/tasks/${task.id}`); }}
                      className="row cursor-pointer group hover:bg-slate-50 transition-colors">
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

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <ActionModal key={modal}
            title={modal === 'note' ? 'Add Note' : modal === 'photo' ? 'Upload Photo' : 'Report Issue'}
            placeholder={modal === 'note' ? 'Write a note about this task…' : modal === 'photo' ? 'Caption (optional)…' : 'Describe the issue…'}
            isPhoto={modal === 'photo'}
            onClose={() => setModal(null)}
            onSubmit={handleActionSubmit}
          />
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
