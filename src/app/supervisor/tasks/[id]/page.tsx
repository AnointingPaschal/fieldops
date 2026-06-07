'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, RefreshCw, Wrench, Trash2, AlertTriangle,
  MapPin, Phone, Calendar, Clock, Users, CheckCircle,
  AlertCircle, Loader2, ChevronRight, FileText,
  Image as ImageIcon, User, X, Download,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Map from '@/components/ui/Map';
import { fetchTask, updateTaskStatus, fetchCurrentUser, fetchTaskUpdates, fetchItemRecovery } from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

const STATUS_FLOW: Record<string, string | null> = {
  'Pending':    'Assigned',
  'Assigned':   null,
  'Accepted':   null,
  'In Transit': null,
  'Completed':  null,
  'Cancelled':  null,
};

export default function SupervisorTaskDetail() {
  const router  = useRouter();
  const params  = useParams();
  const taskId  = params?.id as string;

  const [task,    setTask]    = useState<Task | null>(null);
  const [user,    setUser]    = useState<Profile | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [toast,   setToast]   = useState<{ msg:string; ok:boolean } | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [recovery,   setRecovery]   = useState<any[]>([]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const [t, u, upd, rec] = await Promise.all([
      fetchTask(taskId), fetchCurrentUser(), fetchTaskUpdates(taskId), fetchItemRecovery(taskId),
    ]);
    setTask(t); setUser(u); setUpdates(upd); setRecovery(rec);
    setLoading(false);
  };
  useEffect(() => { if (taskId) load(); }, [taskId]);

  const handleCancel = async () => {
    if (!task) return;
    setActing(true);
    await updateTaskStatus(task.id, 'Cancelled');
    setShowCancel(false);
    showToast('Task cancelled.');
    load();
    setActing(false);
  };

  if (loading) return (
    <AppShell role="supervisor" userName="Supervisor">
      <div className="space-y-3 max-w-2xl">
        {[1,2,3,4].map(i => <div key={i} className="skel h-20 rounded-xl" />)}
      </div>
    </AppShell>
  );

  if (!task) return (
    <AppShell role="supervisor" userName="Supervisor">
      <div className="empty mt-10">
        <div className="empty-icon"><FileText className="w-6 h-6 text-text-muted" /></div>
        <p className="text-[13px] font-medium">Task not found</p>
        <button onClick={() => router.back()} className="btn-ghost mt-2">Go back</button>
      </div>
    </AppShell>
  );

  const sm   = STATUS_META[task.status] || STATUS_META['Pending'];
  const tm   = TYPE_META[task.type]     || TYPE_META['Delivery'];
  const Icon = taskIcon[task.type] || Package;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4 max-w-2xl">

        {/* Back */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-icon">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Task Detail</h1>
            <p className="text-[11px] text-text-muted">
              Created {new Date(task.created_at).toLocaleDateString('en-CA',{
                month:'long', day:'numeric', year:'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Type + Status card */}
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: tm.color + '18' }}>
                <Icon className="w-6 h-6" style={{ color: tm.color }} />
              </div>
              <div>
                <p className="font-black text-[17px] text-text-primary">{task.type}</p>
                <span className="badge mt-1" style={{ background: sm.bg, color: sm.text }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                  {task.status}
                </span>
              </div>
            </div>

            {/* Cancel button */}
            {!['Completed','Cancelled'].includes(task.status) && (
              <button onClick={() => setShowCancel(true)}
                className="text-[11px] text-fail font-semibold hover:underline shrink-0">
                Cancel Task
              </button>
            )}
          </div>

          {/* Workers */}
          {task.workers && task.workers.length > 0 && (
            <div className="pt-3 border-t border-line">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-2">Assigned Workers</p>
              <div className="flex flex-wrap gap-2">
                {task.workers.map(w => (
                  <div key={w.id} className="flex items-center gap-2 bg-slate-50 border border-line rounded-lg px-2.5 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-white text-[9px] font-black shrink-0">
                      {w.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-text-primary">{w.name}</p>
                      <p className="text-[10px] text-text-muted">{w.job_title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contractor + Map */}
        <div className="card space-y-3">
          <p className="sec-title">Contractor &amp; Site</p>
          {task.contractor ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
                  {task.contractor.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-text-primary">{task.contractor.name}</p>
                  {task.contractor.address && (
                    <p className="text-[12px] text-text-secondary flex items-start gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                      {task.contractor.address}
                    </p>
                  )}
                  {task.contractor.contact_name && (
                    <p className="text-[12px] text-text-muted flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      {task.contractor.contact_name}
                    </p>
                  )}
                  {task.contractor.phone && (
                    <a href={`tel:${task.contractor.phone}`}
                      className="text-[12px] text-sky flex items-center gap-1.5 mt-1 hover:underline font-semibold">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {task.contractor.phone}
                    </a>
                  )}
                </div>
              </div>
              {task.contractor.address && (
                <Map address={task.contractor.address} label={task.contractor.name} height={200} />
              )}
            </>
          ) : (
            <p className="text-[12px] text-text-muted">No contractor assigned</p>
          )}
        </div>

        {/* Rental window */}
        {(task.rental_start || task.rental_end) && (
          <div className="card">
            <p className="sec-title mb-3">Rental Window</p>
            <div className="grid grid-cols-2 gap-3">
              {task.rental_start && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Start
                  </p>
                  <p className="font-semibold text-[13px] text-text-primary">
                    {new Date(task.rental_start).toLocaleDateString('en-CA',{
                      month:'short', day:'numeric', year:'numeric'
                    })}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {new Date(task.rental_start).toLocaleTimeString('en-CA',{
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </p>
                </div>
              )}
              {task.rental_end && (
                <div className="bg-warn/5 border border-warn/20 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-warn uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due Back
                  </p>
                  <p className="font-semibold text-[13px] text-text-primary">
                    {new Date(task.rental_end).toLocaleDateString('en-CA',{
                      month:'short', day:'numeric', year:'numeric'
                    })}
                  </p>
                  <p className="text-[11px] text-warn">
                    {new Date(task.rental_end).toLocaleTimeString('en-CA',{
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        {task.items && task.items.length > 0 && (
          <div className="card">
            <p className="sec-title mb-3">Equipment ({task.items.length})</p>
            <div className="space-y-2">
              {task.items.map(({ item, quantity }, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {(item as any)?.image_url
                      ? <img src={(item as any).image_url} alt={item.name} className="w-full h-full object-cover" />
                      : <Package className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="flex-1 text-[13px] font-medium text-text-primary">{item.name}</p>
                  <span className="text-[12px] font-bold text-text-primary">×{quantity}</span>
                  <span className="text-[11px] text-text-muted">{item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor notes */}
        {task.supervisor_notes && (
          <div className="bg-sky/5 border border-sky/20 rounded-xl p-4">
            <p className="text-[10px] font-bold text-sky uppercase tracking-wide mb-1.5">Supervisor Notes</p>
            <p className="text-[13px] text-text-secondary leading-relaxed">{task.supervisor_notes}</p>
          </div>
        )}

        {/* Completion location */}
        {(task as any).completion_lat && (task as any).completion_lng && (
          <div className="card">
            <p className="sec-title mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-pass" /> Completion Location
            </p>
            {(task as any).completion_address && (
              <p className="text-[12px] text-text-muted mb-3 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {(task as any).completion_address}
              </p>
            )}
            <Map lat={(task as any).completion_lat} lng={(task as any).completion_lng}
              label="Completed here" height={180} />
          </div>
        )}

        {/* Worker activity feed */}
        {updates.length > 0 && (
          <div>
            <p className="sec-title mb-3">Worker Activity ({updates.length})</p>
            <div className="space-y-2">
              {updates.map((u: any) => (
                <motion.div key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="card-sm flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    u.type==='note'   ? 'bg-pass/10' :
                    u.type==='photo'  ? 'bg-warn/10' :
                    u.type==='issue'  ? 'bg-fail/10' : 'bg-sky/10'
                  }`}>
                    {u.type==='note'   ? <FileText    className="w-3.5 h-3.5 text-pass" />
                    :u.type==='photo'  ? <ImageIcon   className="w-3.5 h-3.5 text-warn" />
                    :u.type==='issue'  ? <AlertCircle className="w-3.5 h-3.5 text-fail" />
                    :                   <CheckCircle  className="w-3.5 h-3.5 text-sky"  />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-text-muted capitalize">
                      {u.type} — {u.worker?.name}
                    </p>
                    {u.content   && <p className="text-[12px] text-text-secondary mt-0.5">{u.content}</p>}
                    {u.photo_url && (
                      <img src={u.photo_url} alt="update"
                        className="w-full rounded-lg mt-2 max-h-48 object-cover border border-line" />
                    )}
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(u.created_at).toLocaleString('en-CA',{
                        month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <AnimatePresence>
        {showCancel && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowCancel(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.95, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:380 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-line text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="w-5 h-5 text-fail" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">Cancel Task</h3>
              <p className="text-text-muted text-sm mb-5">
                This will notify assigned workers and stop the task.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowCancel(false)} className="btn-ghost flex-1">Keep Task</button>
                <button onClick={handleCancel} disabled={acting}
                  className="btn flex-1 bg-fail text-white hover:opacity-90 disabled:opacity-50 justify-center">
                  {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
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
