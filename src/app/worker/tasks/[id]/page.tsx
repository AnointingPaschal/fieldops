'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, RefreshCw, Wrench, Trash2,
  MapPin, Phone, Calendar, Clock, Users, Loader2,
  Camera, FileText, AlertCircle, CheckCircle, X,
  Navigation, Image as ImageIcon, Minus, Plus,
  AlertTriangle, ClipboardCheck,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Map from '@/components/ui/Map';
import {
  fetchTask, updateTaskStatus, fetchCurrentUser,
  completeTaskWithLocation, addTaskUpdate, uploadTaskPhoto,
  fetchTaskUpdates, saveItemRecovery,
} from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';
import { triggerNav } from '@/lib/navigation';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

const STATUS_FLOW: Record<string, { next: string; label: string; color: string } | null> = {
  'Pending':    { next:'Accepted',   label:'Accept Task',   color:'bg-sky'  },
  'Assigned':   { next:'Accepted',   label:'Accept Task',   color:'bg-sky'  },
  'Accepted':   { next:'In Transit', label:'Start Journey', color:'bg-warn' },
  'In Transit': { next:'Completed',  label:'Mark Complete', color:'bg-pass' },
  'Completed':  null,
  'Cancelled':  null,
};

const isPickup = (t: string) => t === 'Pick Up' || t === 'Tear Down';

type RecoveryRow = {
  item_id:   string;
  name:      string;
  unit:      string;
  assigned:  number;
  recovered: number;
  damaged:   number;
  missing:   number;
  notes:     string;
};

export default function WorkerTaskDetail() {
  const router  = useRouter();
  const params  = useParams();
  const taskId  = params?.id as string;
  const fileRef = useRef<HTMLInputElement>(null);

  const [task,     setTask]     = useState<Task | null>(null);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [updates,  setUpdates]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);
  const [modal,    setModal]    = useState<'note'|'photo'|'issue'|'complete'|'verify'|null>(null);
  const [text,     setText]     = useState('');
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState('');
  const [toast,    setToast]    = useState<{ msg:string; ok:boolean }|null>(null);
  const [recovery, setRecovery] = useState<RecoveryRow[]>([]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const [t, u, upd] = await Promise.all([
      fetchTask(taskId), fetchCurrentUser(), fetchTaskUpdates(taskId),
    ]);
    setTask(t); setUser(u); setUpdates(upd);
    setLoading(false);
  };
  useEffect(() => { if (taskId) load(); }, [taskId]);

  // Build recovery rows from task items when opening verify modal
  const openVerify = () => {
    if (!task?.items?.length) return;
    setRecovery(task.items.map(({ item, quantity }) => ({
      item_id:   item.id,
      name:      item.name,
      unit:      item.unit,
      assigned:  quantity,
      recovered: quantity,
      damaged:   0,
      missing:   0,
      notes:     '',
    })));
    setModal('verify');
  };

  const updateRow = (idx: number, field: keyof RecoveryRow, val: any) => {
    setRecovery(prev => {
      const rows = [...prev];
      rows[idx] = { ...rows[idx], [field]: val };
      // Auto-calc: recovered + damaged + missing ≤ assigned
      const r = rows[idx];
      const used = (field === 'recovered' ? val : r.recovered)
                 + (field === 'damaged'   ? val : r.damaged)
                 + (field === 'missing'   ? val : r.missing);
      if (used > r.assigned) {
        // clamp the just-changed field
        rows[idx] = { ...rows[idx], [field]: Math.max(0, val - (used - r.assigned)) };
      }
      return rows;
    });
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (!task || !user) return;
    if (nextStatus === 'Completed') {
      if (isPickup(task.type)) { openVerify(); return; }
      setModal('complete'); return;
    }
    setActing(true);
    await updateTaskStatus(task.id, nextStatus);
    await addTaskUpdate({ task_id:task.id, worker_id:user.id, type:'status', content:nextStatus });
    showToast(`Status updated to ${nextStatus}`);
    load(); setActing(false);
  };

  // Submit verify + complete
  const handleVerifyComplete = async () => {
    if (!task || !user) return;
    if (!file) { showToast('Please take a completion photo.', false); return; }
    setActing(true);

    // Save recovery records
    await saveItemRecovery(recovery.map(r => ({
      task_id:            task.id,
      item_id:            r.item_id,
      quantity_assigned:  r.assigned,
      quantity_recovered: r.recovered,
      quantity_damaged:   r.damaged,
      quantity_missing:   r.missing,
      notes:              r.notes || undefined,
    })));

    // GPS
    let lat: number|null = null, lng: number|null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((res,rej) =>
        navigator.geolocation.getCurrentPosition(res,rej,{ enableHighAccuracy:true, timeout:8000 })
      );
      lat = pos.coords.latitude; lng = pos.coords.longitude;
    } catch {}

    const photo_url = await uploadTaskPhoto(file, task.id, user.id) || undefined;
    const hasDiscrepancy = recovery.some(r => r.damaged > 0 || r.missing > 0);
    await completeTaskWithLocation(task.id, user.id, lat, lng,
      text || (hasDiscrepancy ? 'Items recovered with discrepancies — see breakdown.' : undefined),
      photo_url
    );

    setModal(null); setText(''); setFile(null); setPreview('');
    showToast('Task completed! Recovery logged.');
    load(); setActing(false);
  };

  // Standard complete (Delivery / Set Up)
  const handleComplete = async () => {
    if (!task || !user || !file) { showToast('Please take a completion photo.', false); return; }
    setActing(true);
    let lat: number|null = null, lng: number|null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((res,rej) =>
        navigator.geolocation.getCurrentPosition(res,rej,{ enableHighAccuracy:true, timeout:8000 })
      );
      lat = pos.coords.latitude; lng = pos.coords.longitude;
    } catch {}
    const photo_url = await uploadTaskPhoto(file, task.id, user.id) || undefined;
    await completeTaskWithLocation(task.id, user.id, lat, lng, text || undefined, photo_url);
    setModal(null); setText(''); setFile(null); setPreview('');
    showToast('Task completed!');
    load(); setActing(false);
  };

  const handleAddUpdate = async (type: 'note'|'photo'|'issue') => {
    if (!task || !user) return;
    setActing(true);
    let photo_url: string|undefined;
    if (file) photo_url = await uploadTaskPhoto(file, task.id, user.id) || undefined;
    await addTaskUpdate({ task_id:task.id, worker_id:user.id, type, content:text||undefined, photo_url });
    setModal(null); setText(''); setFile(null); setPreview('');
    showToast(type === 'note' ? 'Note added.' : type === 'photo' ? 'Photo saved.' : 'Issue reported.');
    load(); setActing(false);
  };

  if (loading) return (
    <AppShell role="worker" userName="Worker">
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skel h-20 rounded-xl" />)}</div>
    </AppShell>
  );

  if (!task) return (
    <AppShell role="worker" userName="Worker">
      <div className="empty mt-10">
        <div className="empty-icon"><Package className="w-6 h-6 text-text-muted" /></div>
        <p className="text-[13px]">Task not found</p>
        <button onClick={() => router.back()} className="btn-ghost mt-2">Go back</button>
      </div>
    </AppShell>
  );

  const sm         = STATUS_META[task.status] || STATUS_META['Pending'];
  const tm         = TYPE_META[task.type]     || TYPE_META['Delivery'];
  const Icon       = taskIcon[task.type] || Package;
  const nextAction = STATUS_FLOW[task.status];
  const canAct     = !['Completed','Cancelled'].includes(task.status);
  const pickup     = isPickup(task.type);

  return (
    <AppShell role="worker" userName={user?.name || 'Worker'}>
      <div className="space-y-4 max-w-2xl">

        {/* Back */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-icon">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Task Detail</h1>
            <p className="text-[11px] text-text-muted">
              {new Date(task.created_at).toLocaleDateString('en-CA',{ month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
        </div>

        {/* Type + Status */}
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: tm.color + '18' }}>
                <Icon className="w-5 h-5" style={{ color: tm.color }} />
              </div>
              <div>
                <p className="font-black text-[15px] text-text-primary">{task.type}</p>
                <span className="badge mt-1" style={{ background:sm.bg, color:sm.text }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background:sm.dot }} />{task.status}
                </span>
              </div>
            </div>
            {pickup && task.status === 'Completed' && (
              <button
                onClick={() => { triggerNav(); router.push(`/worker/tasks/${task.id}/report`); }}
                className="btn-ghost text-[12px] shrink-0">
                <FileText className="w-3.5 h-3.5" /> View Report
              </button>
            )}
          </div>

          {nextAction && canAct && (
            <motion.button whileTap={{ scale:0.97 }} onClick={() => handleStatusChange(nextAction.next)}
              disabled={acting}
              className={`w-full py-3 rounded-xl text-white font-bold text-[13px] flex items-center justify-center gap-2 ${nextAction.color} disabled:opacity-50`}>
              {acting ? <Loader2 className="w-4 h-4 animate-spin" />
                : nextAction.next === 'Completed'
                  ? <><ClipboardCheck className="w-4 h-4" />{pickup ? 'Verify & Complete' : 'Mark Complete'}</>
                  : <><CheckCircle className="w-4 h-4" />{nextAction.label}</>}
            </motion.button>
          )}
          {task.status === 'Completed' && (
            <div className="w-full py-3 rounded-xl bg-pass/10 border border-pass/20 text-pass font-bold text-[13px] flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Completed
            </div>
          )}
        </div>

        {/* Contractor + map */}
        <div className="card space-y-3">
          <p className="sec-title">Contractor &amp; Site</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
              {task.contractor?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-text-primary">{task.contractor?.name || '—'}</p>
              {task.contractor?.address && (
                <p className="text-[12px] text-text-secondary flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{task.contractor.address}
                </p>
              )}
              {task.contractor?.phone && (
                <a href={`tel:${task.contractor.phone}`}
                  className="text-[12px] text-sky font-semibold flex items-center gap-1.5 mt-1 hover:underline">
                  <Phone className="w-3.5 h-3.5" />{task.contractor.phone}
                </a>
              )}
            </div>
          </div>
          {task.contractor?.address && (
            <Map address={task.contractor.address} label={task.contractor.name||'Site'} height={190} />
          )}
        </div>

        {/* Items */}
        {task.items && task.items.length > 0 && (
          <div className="card">
            <p className="sec-title mb-3">
              {pickup ? 'Items to Collect' : 'Equipment'} ({task.items.length})
            </p>
            <div className="space-y-1.5">
              {task.items.map(({ item, quantity }, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {(item as any)?.image_url
                      ? <img src={(item as any).image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      : <Package className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="flex-1 text-[13px] font-medium text-text-primary">{item.name}</p>
                  <span className="text-[12px] font-bold text-text-primary">×{quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {task.supervisor_notes && (
          <div className="bg-sky/5 border border-sky/20 rounded-xl p-4">
            <p className="text-[10px] font-bold text-sky uppercase tracking-wide mb-1.5">Supervisor Notes</p>
            <p className="text-[13px] text-text-secondary leading-relaxed">{task.supervisor_notes}</p>
          </div>
        )}

        {/* Completion map */}
        {(task as any).completion_lat && (task as any).completion_lng && (
          <div className="card">
            <p className="sec-title mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-pass" /> Completion Location
            </p>
            {(task as any).completion_address && (
              <p className="text-[12px] text-text-muted mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{(task as any).completion_address}
              </p>
            )}
            <Map lat={(task as any).completion_lat} lng={(task as any).completion_lng} height={180} />
          </div>
        )}

        {/* Quick actions */}
        {canAct && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon:Camera,       label:'Photo',  type:'photo', c:'text-warn', bg:'bg-warn/10' },
              { icon:FileText,     label:'Note',   type:'note',  c:'text-pass', bg:'bg-pass/10' },
              { icon:AlertCircle,  label:'Issue',  type:'issue', c:'text-fail', bg:'bg-fail/10' },
            ].map(({ icon:I, label, type:t, c, bg }) => (
              <button key={label} onClick={() => setModal(t as any)}
                className="card-sm flex flex-col items-center gap-1.5 py-3 hover:shadow-md transition-shadow">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <I className={`w-4 h-4 ${c}`} />
                </div>
                <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Activity */}
        {updates.length > 0 && (
          <div>
            <p className="sec-title mb-3">Activity</p>
            <div className="space-y-2">
              {updates.map((u: any) => (
                <div key={u.id} className="card-sm flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    u.type==='note' ? 'bg-pass/10' : u.type==='photo' ? 'bg-warn/10' : u.type==='issue' ? 'bg-fail/10' : 'bg-sky/10'
                  }`}>
                    {u.type==='note' ? <FileText className="w-3.5 h-3.5 text-pass" />
                    :u.type==='photo' ? <ImageIcon className="w-3.5 h-3.5 text-warn" />
                    :u.type==='issue' ? <AlertCircle className="w-3.5 h-3.5 text-fail" />
                    :<CheckCircle className="w-3.5 h-3.5 text-sky" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-text-muted capitalize">{u.type} — {u.worker?.name}</p>
                    {u.content   && <p className="text-[12px] text-text-secondary mt-0.5">{u.content}</p>}
                    {u.photo_url && <img src={u.photo_url} alt="" className="w-full rounded-lg mt-2 max-h-48 object-cover" />}
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(u.created_at).toLocaleString('en-CA',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── VERIFY ITEMS MODAL (Pick Up / Tear Down) ── */}
      <AnimatePresence>
        {modal === 'verify' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-3"
            onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ y:32, opacity:0 }} animate={{ y:0, opacity:1 }}
              exit={{ y:16, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:340 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-line overflow-hidden mb-20 md:mb-0">

              <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-navy">
                <div>
                  <h3 className="font-bold text-white text-[15px]">Verify Items — {task?.type}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Confirm quantities recovered</p>
                </div>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg bg-navy-light flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[55vh]">
                {/* Item rows */}
                {recovery.map((row, i) => {
                  const hasDiscrepancy = row.damaged > 0 || row.missing > 0;
                  return (
                    <div key={row.item_id}
                      className={`px-4 py-4 border-b border-line ${hasDiscrepancy ? 'bg-red-50/50' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-[13px] text-text-primary">{row.name}</p>
                          <p className="text-[11px] text-text-muted">Assigned: <strong>{row.assigned}</strong> {row.unit}</p>
                        </div>
                        {hasDiscrepancy && (
                          <span className="badge bg-fail/10 text-fail text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Discrepancy
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {([
                          { key:'recovered', label:'Recovered', color:'#16A34A' },
                          { key:'damaged',   label:'Damaged',   color:'#D97706' },
                          { key:'missing',   label:'Not Found', color:'#DC2626' },
                        ] as const).map(({ key, label, color }) => (
                          <div key={key}>
                            <p className="text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color }}>{label}</p>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateRow(i, key, Math.max(0, row[key]-1))}
                                className="w-7 h-7 rounded-lg bg-slate-100 border border-line flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <Minus className="w-3 h-3 text-text-secondary" />
                              </button>
                              <span className="w-8 text-center font-black text-[14px]"
                                style={{ color: row[key] > 0 ? color : '#94A3B8' }}>
                                {row[key]}
                              </span>
                              <button onClick={() => updateRow(i, key, Math.min(row.assigned, row[key]+1))}
                                className="w-7 h-7 rounded-lg bg-slate-100 border border-line flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <Plus className="w-3 h-3 text-text-secondary" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Item notes */}
                      {hasDiscrepancy && (
                        <input className="input text-[12px] h-8 mt-1"
                          placeholder="Notes on condition / location last seen…"
                          value={row.notes}
                          onChange={e => updateRow(i, 'notes', e.target.value)} />
                      )}
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="px-4 py-3 bg-slate-50 border-b border-line">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label:'Recovered', val: recovery.reduce((s,r)=>s+r.recovered,0), c:'text-pass' },
                      { label:'Damaged',   val: recovery.reduce((s,r)=>s+r.damaged,0),   c:'text-warn' },
                      { label:'Not Found', val: recovery.reduce((s,r)=>s+r.missing,0),   c:'text-fail' },
                    ].map(({ label, val, c }) => (
                      <div key={label}>
                        <p className={`text-xl font-black ${c}`}>{val}</p>
                        <p className="text-[10px] text-text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo + notes */}
                <div className="px-4 py-4 space-y-3">
                  <div onClick={() => fileRef.current?.click()}
                    className="w-full h-28 rounded-xl border-2 border-dashed border-line hover:border-sky/50 bg-slate-50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
                    {preview
                      ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      : <div className="flex flex-col items-center gap-1.5 text-text-muted">
                          <Camera className="w-5 h-5" />
                          <p className="text-[12px] font-medium">Take completion photo (required)</p>
                        </div>}
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => { const f=e.target.files?.[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)); }} />
                  </div>
                  <textarea className="textarea text-[12px]" rows={2}
                    placeholder="General completion notes…" value={text} onChange={e => setText(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 px-4 py-4 border-t border-line">
                <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
                <motion.button whileTap={{ scale:0.97 }} onClick={handleVerifyComplete}
                  disabled={acting || !file}
                  className="btn-navy flex-1 justify-center disabled:opacity-40">
                  {acting ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><ClipboardCheck className="w-4 h-4" />Confirm &amp; Complete</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STANDARD COMPLETE / NOTE / PHOTO / ISSUE MODALS ── */}
      <AnimatePresence>
        {(modal === 'complete' || modal === 'note' || modal === 'photo' || modal === 'issue') && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
              exit={{ y:16, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:360 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-line overflow-hidden mb-20 md:mb-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <h3 className="font-bold text-text-primary text-[15px]">
                  {modal==='complete'?'Complete Task':modal==='note'?'Add Note':modal==='photo'?'Upload Photo':'Report Issue'}
                </h3>
                <button onClick={() => setModal(null)} className="btn-icon"><X className="w-4 h-4 text-text-muted" /></button>
              </div>
              <div className="p-5 space-y-3">
                {(modal==='photo'||modal==='complete') && (
                  <div onClick={() => fileRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-line hover:border-sky/50 bg-slate-50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      : <div className="flex flex-col items-center gap-1.5 text-text-muted">
                          <Camera className="w-6 h-6" />
                          <p className="text-[12px] font-medium">{modal==='complete'?'Completion photo (required)':'Tap to take / choose photo'}</p>
                        </div>}
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => { const f=e.target.files?.[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)); }} />
                  </div>
                )}
                <textarea className="textarea" rows={3}
                  placeholder={modal==='complete'?'Final notes…':modal==='note'?'Write note…':modal==='photo'?'Caption…':'Describe issue…'}
                  value={text} onChange={e => setText(e.target.value)} />
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
                <motion.button whileTap={{ scale:0.97 }}
                  disabled={acting || (modal==='complete' && !file)}
                  onClick={() => modal==='complete' ? handleComplete() : handleAddUpdate(modal as any)}
                  className="btn-navy flex-1 justify-center disabled:opacity-40">
                  {acting ? <Loader2 className="w-4 h-4 animate-spin" />
                    : modal==='complete' ? 'Confirm Complete' : 'Submit'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok?'bg-pass':'bg-fail'}`}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
