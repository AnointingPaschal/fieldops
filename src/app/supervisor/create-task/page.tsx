'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, Minus, Plus,
  Package, RefreshCw, Wrench, Trash2, Loader2, AlertCircle, Users,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkers, fetchContractors, fetchInventory, createTask, fetchCurrentUser } from '@/lib/api';
import type { Profile, Contractor, InventoryItem } from '@/types';

const STEPS = ['Type','Workers','Contractor','Items','Review'];
const TYPES = [
  { id:'Delivery',  desc:'Deliver equipment to site', icon:Package,  color:'#1D4ED8', bg:'#EFF6FF' },
  { id:'Pick Up',   desc:'Collect from contractor',   icon:RefreshCw,color:'#D97706', bg:'#FFFBEB' },
  { id:'Set Up',    desc:'Install equipment on site', icon:Wrench,   color:'#16A34A', bg:'#F0FDF4' },
  { id:'Tear Down', desc:'Dismantle and remove',      icon:Trash2,   color:'#DC2626', bg:'#FEF2F2' },
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(1);
  const [type,    setType]    = useState('');
  const [workers, setWorkers] = useState<string[]>([]);
  const [contr,   setContr]   = useState('');
  const [qty,     setQty]     = useState<Record<string, number>>({});
  const [start,   setStart]   = useState('');
  const [end,     setEnd]     = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const [allWorkers,     setAllWorkers]     = useState<Profile[]>([]);
  const [allContractors, setAllContractors] = useState<Contractor[]>([]);
  const [allInventory,   setAllInventory]   = useState<InventoryItem[]>([]);
  const [currentUser,    setCurrentUser]    = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [w, c, inv, u] = await Promise.all([
        fetchWorkers(), fetchContractors(), fetchInventory(), fetchCurrentUser()
      ]);
      setAllWorkers(w); setAllContractors(c); setAllInventory(inv); setCurrentUser(u);
      setLoading(false);
    };
    load();
  }, []);

  const canNext = () => {
    if (step === 1) return !!type;
    if (step === 2) return workers.length > 0;
    if (step === 3) return !!contr;
    if (step === 4) return Object.values(qty).some(q => q > 0) && !!start && !!end;
    return true;
  };

  const submit = async () => {
    if (!currentUser) return;
    setSaving(true);
    setError('');
    const items = Object.entries(qty)
      .filter(([, q]) => q > 0)
      .map(([item_id, quantity]) => ({ item_id, quantity }));

    const { error: err } = await createTask({
      type, contractor_id: contr,
      rental_start: new Date(start).toISOString(),
      rental_end: new Date(end).toISOString(),
      supervisor_notes: notes,
      created_by: currentUser.id,
      workerIds: workers, items,
    });

    setSaving(false);
    if (err) { setError((err as any).message || 'Failed to create task.'); return; }
    router.push('/supervisor/dashboard');
  };

  const slide = {
    hidden:  { opacity: 0, x: 12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit:    { opacity: 0, x: -12, transition: { duration: 0.15 } },
  };

  const contractor = allContractors.find(c => c.id === contr);
  const selectedItems = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => ({ item: allInventory.find(i => i.id === id), qty: q }))
    .filter(x => x.item);

  return (
    <AppShell role="supervisor" userName={currentUser?.name || 'Supervisor'}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="btn-icon">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Create Task</h1>
            <p className="text-[11px] text-text-muted">Step {step} / {STEPS.length} — {STEPS[step-1]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((l, i) => {
            const n = i + 1; const done = n < step; const on = n === step;
            return (
              <div key={i} className="flex items-center gap-1.5 flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <motion.div
                    animate={{ scale: on ? 1.1 : 1 }}
                    className={`step-dot ${done ? 'bg-pass border-pass text-white' : on ? 'bg-white border-sky text-sky' : 'bg-white border-line text-text-muted'}`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : n}
                  </motion.div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full" style={{ background: done ? '#16A34A' : '#E2E8F0' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slide} initial="hidden" animate="visible" exit="exit">

            {/* Step 1 — Task Type */}
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Select Task Type</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {TYPES.map(({ id, desc, icon: Icon, color, bg }) => {
                    const sel = type === id;
                    return (
                      <motion.button key={id} whileTap={{ scale: 0.98 }}
                        onClick={() => setType(id)}
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
              </div>
            )}

            {/* Step 2 — Workers */}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Assign Workers</h2>
                {loading ? <div className="skel h-40 rounded-xl" /> : (
                  allWorkers.length === 0 ? (
                    <div className="empty"><div className="empty-icon"><Users className="w-4 h-4 text-text-muted"/></div><p className="text-[13px]">No workers found</p><p className="text-[11px]">Add workers via Supabase dashboard</p></div>
                  ) : (
                    <div className="card !p-0 overflow-hidden">
                      {allWorkers.map(w => {
                        const sel = workers.includes(w.id);
                        return (
                          <motion.button key={w.id} whileTap={{ scale: 0.99 }}
                            onClick={() => w.available && setWorkers(p => p.includes(w.id) ? p.filter(id => id !== w.id) : [...p, w.id])}
                            disabled={!w.available}
                            className={`row w-full text-left ${sel ? 'bg-sky/5' : ''} ${!w.available ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black shrink-0 relative">
                              {w.name.split(' ').map(n => n[0]).join('')}
                              {w.available && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-pass border-2 border-white rounded-full" />}
                            </div>
                            <div className="flex-1">
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

            {/* Step 3 — Contractor */}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Select Contractor</h2>
                {loading ? <div className="skel h-40 rounded-xl" /> : (
                  allContractors.length === 0 ? (
                    <div className="empty"><div className="empty-icon"><Package className="w-4 h-4 text-text-muted"/></div><p className="text-[13px]">No contractors found</p></div>
                  ) : (
                    <div className="space-y-2">
                      {allContractors.map((c, i) => {
                        const colors = ['#1D4ED8','#16A34A','#7C3AED'];
                        const color  = colors[i % 3];
                        const sel    = contr === c.id;
                        return (
                          <motion.button key={c.id} whileTap={{ scale: 0.99 }}
                            onClick={() => setContr(c.id)}
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

            {/* Step 4 — Items + Rental Period */}
            {step === 4 && (
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
                      <div className="empty py-8"><div className="empty-icon"><Package className="w-4 h-4 text-text-muted"/></div><p className="text-[13px]">No inventory items</p></div>
                    ) : allInventory.map(inv => {
                      const q   = qty[inv.id] || 0;
                      const pct = inv.total_stock > 0 ? inv.available_stock / inv.total_stock : 0;
                      const c   = pct < 0.2 ? '#DC2626' : pct < 0.4 ? '#D97706' : '#16A34A';
                      return (
                        <div key={inv.id} className={`row ${q > 0 ? 'bg-sky/5' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[13px] text-text-primary">{inv.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: c }}>{inv.available_stock} of {inv.total_stock} {inv.unit}s available</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setQty(p => ({ ...p, [inv.id]: Math.max(0, (p[inv.id]||0)-1) }))} disabled={q===0}
                              className="w-7 h-7 rounded-md bg-slate-100 border border-line flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 transition-colors">
                              <Minus className="w-3 h-3 text-text-secondary" />
                            </button>
                            <span className={`w-7 text-center font-bold text-[13px] ${q > 0 ? 'text-sky' : 'text-text-muted'}`}>{q}</span>
                            <button onClick={() => setQty(p => ({ ...p, [inv.id]: Math.min(inv.available_stock, (p[inv.id]||0)+1) }))} disabled={q >= inv.available_stock}
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

            {/* Step 5 — Review */}
            {step === 5 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary">Review &amp; Confirm</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="card-sm"><p className="label mb-1">Task Type</p><p className="font-bold text-text-primary">{type}</p></div>
                  <div className="card-sm"><p className="label mb-1">Workers</p><p className="font-bold text-text-primary">{workers.length} assigned</p></div>
                  <div className="card-sm col-span-2"><p className="label mb-1">Contractor</p><p className="font-bold text-text-primary">{contractor?.name || '—'}</p><p className="text-[11px] text-text-muted">{contractor?.address}</p></div>
                </div>
                <div className="card-sm">
                  <p className="label mb-2">Items</p>
                  {selectedItems.length === 0 ? <p className="text-[12px] text-text-muted">No items selected</p>
                    : selectedItems.map(({ item, qty: q }) => (
                      <div key={item!.id} className="flex justify-between py-1 border-b border-line last:border-0">
                        <p className="text-[12px] text-text-secondary">{item!.name}</p>
                        <p className="text-[12px] font-bold text-text-primary">{q} {item!.unit}</p>
                      </div>
                    ))}
                </div>
                <div className="card-sm">
                  <label className="label">Supervisor Notes <span className="normal-case font-normal text-text-muted">(optional)</span></label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Special instructions or site notes…" className="textarea mt-1" />
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
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={step < 5 ? () => setStep(s => s+1) : submit}
            disabled={!canNext() || saving}
            className="btn btn-navy disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" />
              : step < 5 ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
              : <><CheckCircle className="w-4 h-4" /><span>Confirm &amp; Assign</span></>}
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
