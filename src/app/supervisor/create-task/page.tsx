'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, Minus, Plus,
  Package, RefreshCw, Wrench, Trash2, Loader2, AlertCircle,
  Users, MapPin, Calendar, ChevronRight, Building2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchWorkers, fetchContractors, fetchInventory,
  fetchDeployedTasks, createTask, fetchCurrentUser,
} from '@/lib/api';
import type { Profile, Contractor, InventoryItem, Task } from '@/types';
import { triggerNav } from '@/lib/navigation';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type TaskType   = 'Delivery' | 'Pick Up' | 'Set Up' | 'Tear Down';
type PickupType = 'Pick Up' | 'Tear Down';
const isPickup  = (t: string): t is PickupType => t === 'Pick Up' || t === 'Tear Down';

const TYPES = [
  { id:'Delivery',  desc:'Deliver equipment to site',  icon:Package,  color:'#1D4ED8', bg:'#EFF6FF' },
  { id:'Pick Up',   desc:'Collect deployed items back', icon:RefreshCw,color:'#D97706', bg:'#FFFBEB' },
  { id:'Set Up',    desc:'Install equipment on site',   icon:Wrench,   color:'#16A34A', bg:'#F0FDF4' },
  { id:'Tear Down', desc:'Dismantle and remove items',  icon:Trash2,   color:'#DC2626', bg:'#FEF2F2' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  'Assigned':'Assigned','Accepted':'Accepted','In Transit':'In Transit','Completed':'Completed',
};

/* Steps differ by type:
   Delivery / Set Up  : Type → Workers → Contractor → Items → Review   (5 steps)
   Pick Up / Tear Down: Type → Workers → Select Task → Review           (4 steps)
*/
function getSteps(type: string) {
  return isPickup(type)
    ? ['Type', 'Workers', 'Select Task', 'Review']
    : ['Type', 'Workers', 'Contractor', 'Items', 'Review'];
}

const slide = {
  hidden:  { opacity:0, x:12 },
  visible: { opacity:1, x:0, transition:{ duration:0.2 } },
  exit:    { opacity:0, x:-12, transition:{ duration:0.15 } },
};

export default function CreateTaskPage() {
  const router = useRouter();
  const [step,          setStep]         = useState(1);
  const [type,          setType]         = useState<string>('');
  const [workerIds,     setWorkerIds]    = useState<string[]>([]);
  const [contractorId,  setContractorId] = useState('');
  const [qty,           setQty]          = useState<Record<string, number>>({});
  const [start,         setStart]        = useState('');
  const [end,           setEnd]          = useState('');
  const [notes,         setNotes]        = useState('');
  const [selectedTask,  setSelectedTask] = useState<any>(null);
  const [saving,        setSaving]       = useState(false);
  const [error,         setError]        = useState('');
  const [loading,       setLoading]      = useState(true);

  const [allWorkers,      setAllWorkers]      = useState<Profile[]>([]);
  const [allContractors,  setAllContractors]  = useState<Contractor[]>([]);
  const [allInventory,    setAllInventory]    = useState<InventoryItem[]>([]);
  const [deployedTasks,   setDeployedTasks]   = useState<any[]>([]);
  const [currentUser,     setCurrentUser]     = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [w, c, inv, dt, u] = await Promise.all([
        fetchWorkers(), fetchContractors(), fetchInventory(),
        fetchDeployedTasks(), fetchCurrentUser(),
      ]);
      setAllWorkers(w); setAllContractors(c); setAllInventory(inv);
      setDeployedTasks(dt); setCurrentUser(u);
      setLoading(false);
    };
    load();
  }, []);

  const steps    = getSteps(type || 'Delivery');
  const maxSteps = steps.length;

  const canNext = () => {
    if (step === 1) return !!type;
    if (step === 2) return workerIds.length > 0;
    if (step === 3 && isPickup(type)) return !!selectedTask;
    if (step === 3 && !isPickup(type)) return !!contractorId;
    if (step === 4 && !isPickup(type)) return Object.values(qty).some(q => q > 0) && !!start && !!end;
    return true;
  };

  const submit = async () => {
    if (!currentUser) return;
    setSaving(true); setError('');

    if (isPickup(type)) {
      // For Pick Up / Tear Down — reference the original deployed task
      const items = (selectedTask.items || []).map(({ item, quantity }: any) => ({
        item_id: item.id, quantity,
      }));
      const { error: err } = await createTask({
        type, contractor_id: selectedTask.contractor_id,
        rental_start: new Date().toISOString(),
        rental_end:   new Date(Date.now() + 86400000).toISOString(),
        supervisor_notes: `${type} from: ${selectedTask.contractor?.name || '—'}${notes ? `\n${notes}` : ''}`,
        created_by: currentUser.id,
        workerIds,
        items,
      });
      setSaving(false);
      if (err) { setError((err as any).message || 'Failed to create task.'); return; }
    } else {
      const items = Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([item_id, quantity]) => ({ item_id, quantity }));
      const { error: err } = await createTask({
        type, contractor_id: contractorId,
        rental_start: new Date(start).toISOString(),
        rental_end:   new Date(end).toISOString(),
        supervisor_notes: notes,
        created_by: currentUser.id,
        workerIds, items,
      });
      setSaving(false);
      if (err) { setError((err as any).message || 'Failed to create task.'); return; }
    }

    triggerNav(); router.push('/supervisor/tasks');
  };

  const contractor = allContractors.find(c => c.id === contractorId);

  return (
    <AppShell role="supervisor" userName={currentUser?.name || 'Supervisor'}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s-1) : router.back()} className="btn-icon">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Create Task</h1>
            <p className="text-[11px] text-text-muted">Step {step} of {maxSteps} — {steps[step-1]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {steps.map((label, i) => {
            const n = i+1; const done = n < step; const on = n === step;
            return (
              <div key={i} className="flex items-center gap-1.5 flex-1">
                <motion.div animate={{ scale: on ? 1.1 : 1 }}
                  className={`step-dot ${done ? 'bg-pass border-pass text-white' : on ? 'bg-white border-sky text-sky' : 'bg-white border-line text-text-muted'}`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : n}
                </motion.div>
                {i < steps.length-1 && (
                  <div className="flex-1 h-0.5 rounded-full" style={{ background: done ? '#16A34A' : '#E2E8F0' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={`${step}-${type}`} variants={slide} initial="hidden" animate="visible" exit="exit">

            {/* ── Step 1: Type ── */}
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Select Task Type</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {TYPES.map(({ id, desc, icon: Icon, color, bg }) => {
                    const sel = type === id;
                    return (
                      <motion.button key={id} whileTap={{ scale:0.98 }}
                        onClick={() => { setType(id); setStep(1); setSelectedTask(null); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${sel ? '' : 'border-line bg-white hover:border-slate-300'}`}
                        style={sel ? { borderColor: color, background: bg } : {}}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
                          style={{ background: sel ? color : bg }}>
                          <Icon className="w-4 h-4" style={{ color: sel ? '#fff' : color }} />
                        </div>
                        <p className="font-bold text-[13px] mb-0.5" style={{ color: sel ? color : '#0F172A' }}>{id}</p>
                        <p className="text-[11px] text-text-muted">{desc}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Context hint for pickup/teardown */}
                {isPickup(type) && (
                  <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    className="flex items-start gap-2.5 bg-warn/8 border border-warn/25 rounded-xl p-3.5">
                    <RefreshCw className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                      You'll choose from tasks where equipment is currently deployed in the field.
                      No need to select items or rental period — they're pulled from the original task.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 2: Workers ── */}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Assign Workers</h2>
                {loading ? <div className="skel h-40 rounded-xl" /> : (
                  allWorkers.length === 0 ? (
                    <div className="empty py-10">
                      <div className="empty-icon"><Users className="w-5 h-5 text-text-muted" /></div>
                      <p className="text-[13px] font-medium">No workers found</p>
                    </div>
                  ) : (
                    <div className="card !p-0 overflow-hidden">
                      {allWorkers.map(w => {
                        const sel = workerIds.includes(w.id);
                        return (
                          <motion.button key={w.id} whileTap={{ scale:0.99 }}
                            onClick={() => w.available && setWorkerIds(p => p.includes(w.id) ? p.filter(id => id !== w.id) : [...p, w.id])}
                            disabled={!w.available}
                            className={`row w-full text-left ${sel ? 'bg-sky/5' : ''} ${!w.available ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black shrink-0 relative">
                              {w.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                              {w.available && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-pass border-2 border-white rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[13px] text-text-primary">{w.name}</p>
                              <p className="text-[11px] text-text-muted">{w.job_title}</p>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${w.available ? 'bg-pass/10 text-pass' : 'bg-slate-100 text-slate-400'}`}>
                                <span className={`w-1 h-1 rounded-full ${w.available ? 'bg-pass' : 'bg-slate-400'}`} />
                                {w.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${sel ? 'bg-sky border-sky' : 'border-line'}`}>
                              {sel && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── Step 3A (Pick Up / Tear Down): Select deployed task ── */}
            {step === 3 && isPickup(type) && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Items Still Out in Field</h2>
                  <p className="text-[12px] text-text-muted mt-0.5">
                    Select a task to {type === 'Pick Up' ? 'collect from' : 'tear down at'}.
                  </p>
                </div>

                {loading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skel h-24 rounded-xl" />)}</div>
                ) : deployedTasks.length === 0 ? (
                  <div className="empty py-12">
                    <div className="empty-icon"><Package className="w-5 h-5 text-text-muted" /></div>
                    <p className="text-[13px] font-medium">No deployed items found</p>
                    <p className="text-[11px]">All previously deployed equipment has already been collected.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deployedTasks.map(task => {
                      const sel   = selectedTask?.id === task.id;
                      const color = task.type === 'Delivery' ? '#1D4ED8' : '#16A34A';
                      const sm    = { 'Assigned':'#1D4ED8', 'Accepted':'#1D4ED8', 'In Transit':'#D97706', 'Completed':'#16A34A' }[task.status as string] || '#94A3B8';
                      return (
                        <motion.button key={task.id} whileTap={{ scale:0.99 }}
                          onClick={() => setSelectedTask(sel ? null : task)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            sel ? 'shadow-sm' : 'border-line bg-white hover:border-slate-300'
                          }`}
                          style={sel ? { borderColor: color, background: color + '06' } : {}}>

                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: color + '15' }}>
                              {task.type === 'Delivery'
                                ? <Package className="w-5 h-5" style={{ color }} />
                                : <Wrench  className="w-5 h-5" style={{ color }} />}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Contractor */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-[13px] text-text-primary">
                                  {task.contractor?.name || 'No contractor'}
                                </p>
                                <span className="badge text-[10px] px-1.5" style={{
                                  background: sm + '15', color: sm,
                                }}>
                                  <span className="w-1 h-1 rounded-full" style={{ background: sm }} />
                                  {task.status}
                                </span>
                              </div>

                              {/* Address */}
                              {task.contractor?.address && (
                                <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {task.contractor.address}
                                </p>
                              )}

                              {/* Original type */}
                              <p className="text-[11px] text-text-muted mt-0.5">
                                Originally: {task.type} · {new Date(task.created_at).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' })}
                              </p>

                              {/* Items list */}
                              {task.items?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {task.items.slice(0, 5).map(({ item, quantity }: any, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                      <Package className="w-2.5 h-2.5" />
                                      {item?.name} ×{quantity}
                                    </span>
                                  ))}
                                  {task.items.length > 5 && (
                                    <span className="text-[10px] text-text-muted px-1">+{task.items.length - 5} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Radio */}
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                              style={{ borderColor: sel ? color : '#CBD5E1' }}>
                              {sel && <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3B (Delivery / Set Up): Contractor ── */}
            {step === 3 && !isPickup(type) && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Select Contractor</h2>
                {loading ? <div className="skel h-40 rounded-xl" /> : (
                  allContractors.length === 0 ? (
                    <div className="empty py-10">
                      <div className="empty-icon"><Building2 className="w-5 h-5 text-text-muted" /></div>
                      <p className="text-[13px] font-medium">No contractors yet</p>
                      <p className="text-[11px]">Add contractors first via the Contractors page</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allContractors.map((c, i) => {
                        const colors = ['#1D4ED8','#16A34A','#7C3AED'];
                        const color  = colors[i % 3];
                        const sel    = contractorId === c.id;
                        return (
                          <motion.button key={c.id} whileTap={{ scale:0.99 }}
                            onClick={() => setContractorId(c.id)}
                            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${sel ? '' : 'border-line bg-white hover:border-slate-300'}`}
                            style={sel ? { borderColor: color, background: color + '08' } : {}}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shrink-0"
                              style={{ background: sel ? color : color + '18', color: sel ? '#fff' : color }}>
                              {c.name[0]}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-[13px]" style={{ color: sel ? color : '#0F172A' }}>{c.name}</p>
                              {c.address    && <p className="text-[11px] text-text-muted mt-0.5">{c.address}</p>}
                              {c.contact_name && <p className="text-[11px] text-text-muted">{c.contact_name} · {c.phone}</p>}
                            </div>
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                              style={{ borderColor: sel ? color : '#CBD5E1' }}>
                              {sel && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── Step 4 (Delivery / Set Up): Items + Rental Period ── */}
            {step === 4 && !isPickup(type) && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-text-primary">Items &amp; Rental Period</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Rental Start</label>
                    <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Return By</label>
                    <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="input" />
                  </div>
                </div>
                {loading ? <div className="skel h-48 rounded-xl" /> : (
                  <div className="card !p-0 overflow-hidden">
                    {allInventory.length === 0 ? (
                      <div className="empty py-8"><div className="empty-icon"><Package className="w-4 h-4 text-text-muted" /></div><p className="text-[13px]">No inventory</p></div>
                    ) : allInventory.map(inv => {
                      const q   = qty[inv.id] || 0;
                      const pct = inv.total_stock > 0 ? inv.available_stock / inv.total_stock : 0;
                      const c   = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#D97706' : '#16A34A';
                      return (
                        <div key={inv.id} className={`row ${q > 0 ? 'bg-sky/5' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[13px] text-text-primary">{inv.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: c }}>{inv.available_stock} of {inv.total_stock} available</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setQty(p => ({ ...p, [inv.id]: Math.max(0,(p[inv.id]||0)-1) }))} disabled={q===0}
                              className="w-7 h-7 rounded-md bg-slate-100 border border-line flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 transition-colors">
                              <Minus className="w-3 h-3 text-text-secondary" />
                            </button>
                            <span className={`w-7 text-center font-bold text-[13px] ${q > 0 ? 'text-sky' : 'text-text-muted'}`}>{q}</span>
                            <button onClick={() => setQty(p => ({ ...p, [inv.id]: Math.min(inv.available_stock,(p[inv.id]||0)+1) }))} disabled={q >= inv.available_stock}
                              className="w-7 h-7 rounded-md bg-slate-100 border border-line flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 transition-colors">
                              <Plus className="w-3 h-3 text-text-secondary" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Final step: Review ── */}
            {step === maxSteps && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Review &amp; Confirm</h2>

                <div className="grid grid-cols-2 gap-2">
                  <div className="card-sm">
                    <p className="label mb-1">Task Type</p>
                    <p className="font-bold text-text-primary">{type}</p>
                  </div>
                  <div className="card-sm">
                    <p className="label mb-1">Workers</p>
                    <p className="font-bold text-text-primary">{workerIds.length} assigned</p>
                  </div>

                  {isPickup(type) && selectedTask && (
                    <div className="card-sm col-span-2">
                      <p className="label mb-1">Collecting from</p>
                      <p className="font-bold text-text-primary">{selectedTask.contractor?.name}</p>
                      {selectedTask.contractor?.address && <p className="text-[11px] text-text-muted mt-0.5">{selectedTask.contractor.address}</p>}
                    </div>
                  )}

                  {!isPickup(type) && (
                    <div className="card-sm col-span-2">
                      <p className="label mb-1">Contractor</p>
                      <p className="font-bold text-text-primary">{contractor?.name || '—'}</p>
                      {contractor?.address && <p className="text-[11px] text-text-muted">{contractor.address}</p>}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="card-sm">
                  <p className="label mb-2">Items</p>
                  {isPickup(type) && selectedTask ? (
                    selectedTask.items?.length > 0 ? (
                      selectedTask.items.map(({ item, quantity }: any, i: number) => (
                        <div key={i} className="flex justify-between py-1.5 border-b border-line last:border-0">
                          <p className="text-[12px] text-text-secondary">{item?.name}</p>
                          <p className="text-[12px] font-bold text-text-primary">×{quantity}</p>
                        </div>
                      ))
                    ) : <p className="text-[12px] text-text-muted">No items on original task</p>
                  ) : (
                    Object.entries(qty).filter(([,q]) => q > 0).length === 0
                      ? <p className="text-[12px] text-text-muted">No items selected</p>
                      : Object.entries(qty).filter(([,q]) => q > 0).map(([id, q]) => {
                          const inv = allInventory.find(i => i.id === id);
                          return inv ? (
                            <div key={id} className="flex justify-between py-1.5 border-b border-line last:border-0">
                              <p className="text-[12px] text-text-secondary">{inv.name}</p>
                              <p className="text-[12px] font-bold text-text-primary">{q} {inv.unit}</p>
                            </div>
                          ) : null;
                        })
                  )}
                </div>

                <div className="card-sm">
                  <label className="label">Supervisor Notes <span className="normal-case font-normal text-text-muted">(optional)</span></label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Special instructions…" className="textarea mt-1" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-fail text-[12px] bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-line">
          <button onClick={() => step > 1 ? setStep(s => s-1) : router.back()} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />{step > 1 ? 'Back' : 'Cancel'}
          </button>
          <motion.button whileTap={{ scale:0.97 }}
            onClick={step < maxSteps ? () => setStep(s => s+1) : submit}
            disabled={!canNext() || saving}
            className="btn btn-navy disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" />
              : step < maxSteps
                ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                : <><CheckCircle className="w-4 h-4" /><span>Confirm &amp; Assign</span></>}
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
