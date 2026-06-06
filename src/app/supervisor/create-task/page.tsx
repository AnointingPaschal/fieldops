'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Minus, Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { WORKERS, CONTRACTORS, INVENTORY } from '@/data/mockData';

const STEPS = ['Task Type','Workers','Contractor','Items','Review'];
const TYPES = [
  { id:'Delivery',  desc:'Deliver equipment to contractor site', emoji:'📦', color:'#1D4ED8', bg:'#EFF6FF' },
  { id:'Pick Up',   desc:'Collect equipment from contractor',     emoji:'🔄', color:'#D97706', bg:'#FFFBEB' },
  { id:'Set Up',    desc:'Install and arrange equipment on site', emoji:'🔧', color:'#16A34A', bg:'#F0FDF4' },
  { id:'Tear Down', desc:'Dismantle and remove equipment',        emoji:'🗑️', color:'#DC2626', bg:'#FEF2F2' },
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [type, setType]       = useState('');
  const [workers, setWorkers] = useState<string[]>([]);
  const [contr,   setContr]   = useState('');
  const [qty,     setQty]     = useState<Record<string,number>>({});
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);

  const canNext = () => {
    if(step===1) return !!type;
    if(step===2) return workers.length>0;
    if(step===3) return !!contr;
    if(step===4) return Object.values(qty).some(q=>q>0);
    return true;
  };

  const submit = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    router.push('/supervisor/dashboard');
  };

  const C_COLORS = ['#1D4ED8','#16A34A','#7C3AED'];

  return (
    <AppShell role="supervisor" userName="Justin Okeke">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step>1?setStep(s=>s-1):router.back()} className="btn-icon">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-lg font-black text-text-primary">Create Task</h1>
            <p className="text-xs text-text-muted">Step {step} of {STEPS.length} — {STEPS[step-1]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((l,i) => {
            const n=i+1; const done=n<step; const on=n===step;
            return (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`step-dot ${done?'bg-pass border-pass text-white':on?'bg-white border-sky text-sky':'bg-white border-line text-text-muted'}`}>
                    {done ? <Check className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide hidden md:block ${on?'text-sky':done?'text-pass':'text-text-muted'}`}>{l}</span>
                </div>
                {i<STEPS.length-1&&<div className={`flex-1 h-0.5 ${done?'bg-pass':'bg-line'}`}/>}
              </div>
            );
          })}
        </div>

        <div className="animate-in">
          {/* Step 1 */}
          {step===1&&(
            <div>
              <h2 className="text-xl font-black text-text-primary mb-1">Select Task Type</h2>
              <p className="text-text-muted text-sm mb-5">What kind of field operation is this?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TYPES.map(({id,desc,emoji,color,bg})=>{
                  const sel=type===id;
                  return (
                    <button key={id} onClick={()=>setType(id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md active:scale-[0.98] ${
                        sel?'':'border-line bg-white'}`}
                      style={sel?{borderColor:color,background:bg}:{}}>
                      <div className="text-3xl mb-3">{emoji}</div>
                      <p className="font-bold text-base mb-1" style={{color:sel?color:'#0F172A'}}>{id}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                      {sel&&<div className="flex items-center gap-1.5 mt-3"><CheckCircle className="w-4 h-4" style={{color}}/><span className="text-xs font-bold" style={{color}}>Selected</span></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step===2&&(
            <div>
              <h2 className="text-xl font-black text-text-primary mb-1">Assign Workers</h2>
              <p className="text-text-muted text-sm mb-5">Select available field workers for this task.</p>
              <div className="card !p-0 overflow-hidden">
                {WORKERS.map(w=>{
                  const sel=workers.includes(w.id);
                  return (
                    <button key={w.id} onClick={()=>w.avail&&setWorkers(p=>p.includes(w.id)?p.filter(id=>id!==w.id):[...p,w.id])}
                      disabled={!w.avail}
                      className={`row w-full text-left transition-all ${sel?'bg-sky-soft':''} ${!w.avail?'opacity-40 cursor-not-allowed':''}`}>
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-xs font-black relative shrink-0">
                        {w.name.split(' ').map(n=>n[0]).join('')}
                        {w.avail&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pass border-2 border-white rounded-full"/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">{w.name}</p>
                        <p className="text-xs text-text-muted">{w.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${w.avail?'bg-pass-soft text-pass':'bg-slate-100 text-slate-400'}`}>
                          <span className={`w-1 h-1 rounded-full ${w.avail?'bg-pass':'bg-slate-400'}`}/>
                          {w.avail?'Available':'Unavailable'}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${sel?'bg-sky border-sky':'border-line'}`}>
                        {sel&&<Check className="w-4 h-4 text-white"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step===3&&(
            <div>
              <h2 className="text-xl font-black text-text-primary mb-1">Select Contractor</h2>
              <p className="text-text-muted text-sm mb-5">Which contractor is this task for?</p>
              <div className="space-y-3">
                {CONTRACTORS.map((c,i)=>{
                  const color=C_COLORS[i%3]; const sel=contr===c.id;
                  return (
                    <button key={c.id} onClick={()=>setContr(c.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md active:scale-[0.99] ${sel?'':'border-line bg-white'}`}
                      style={sel?{borderColor:color,background:color+'08'}:{}}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 text-white"
                        style={{background:sel?color:color+'20',color:sel?'white':color}}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-base mb-1" style={{color:sel?color:'#0F172A'}}>{c.name}</p>
                        <p className="text-xs text-text-muted">📍 {c.address}</p>
                        <p className="text-xs text-text-muted mt-0.5">👤 {c.contact} · {c.phone}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1" style={{borderColor:sel?color:'#CBD5E1'}}>
                        {sel&&<div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step===4&&(
            <div>
              <h2 className="text-xl font-black text-text-primary mb-1">Select Items</h2>
              <p className="text-text-muted text-sm mb-5">Choose equipment and quantities.</p>
              <div className="card !p-0 overflow-hidden">
                {INVENTORY.map(item=>{
                  const q=qty[item.id]||0;
                  const pct=item.avail/item.total;
                  const c=pct<0.2?'#DC2626':pct<0.4?'#D97706':'#16A34A';
                  return (
                    <div key={item.id} className={`row ${q>0?'bg-sky-soft/30':''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{item.name}</p>
                        <p className="text-xs mt-0.5" style={{color:c}}>{item.avail} available · {item.cat}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={()=>setQty(p=>({...p,[item.id]:Math.max(0,(p[item.id]||0)-1)}))} disabled={q===0}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-line flex items-center justify-center disabled:opacity-30 hover:bg-slate-200">
                          <Minus className="w-3.5 h-3.5 text-text-secondary"/>
                        </button>
                        <span className={`w-8 text-center font-black text-sm ${q>0?'text-sky':'text-text-muted'}`}>{q}</span>
                        <button onClick={()=>setQty(p=>({...p,[item.id]:Math.min(item.avail,(p[item.id]||0)+1)}))} disabled={q>=item.avail}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-line flex items-center justify-center disabled:opacity-30 hover:bg-slate-200">
                          <Plus className="w-3.5 h-3.5 text-text-secondary"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step===5&&(
            <div>
              <h2 className="text-xl font-black text-text-primary mb-1">Review & Confirm</h2>
              <p className="text-text-muted text-sm mb-5">Double-check everything before assigning.</p>
              <div className="space-y-3">
                {[
                  {l:'Task Type',  v:type||'—'},
                  {l:'Workers',    v:`${workers.length} assigned`},
                  {l:'Contractor', v:CONTRACTORS.find(c=>c.id===contr)?.name||'—'},
                  {l:'Items',      v:`${Object.values(qty).filter(q=>q>0).length} types`},
                ].map((r,i)=>(
                  <div key={i} className="card-sm flex items-center justify-between">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{r.l}</p>
                    <p className="font-bold text-text-primary capitalize">{r.v}</p>
                  </div>
                ))}
                <div className="card-sm">
                  <label className="label">Supervisor Notes <span className="normal-case text-text-muted font-normal">(optional)</span></label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder="Add special instructions or site notes…" className="textarea"/>
                </div>
                <div className="bg-sky-soft border border-sky/20 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-sky shrink-0 mt-0.5"/>
                  <p className="text-sm text-text-secondary">Confirming will immediately notify assigned workers and update live inventory counts.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
          <button onClick={()=>step>1?setStep(s=>s-1):router.back()} className="btn-ghost">
            <ArrowLeft className="w-4 h-4"/>{step>1?'Back':'Cancel'}
          </button>
          <button onClick={step<5?()=>setStep(s=>s+1):submit} disabled={!canNext()||loading}
            className="btn btn-navy disabled:opacity-40">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : step<5
                ? <><span>Continue</span><ArrowRight className="w-4 h-4"/></>
                : <><CheckCircle className="w-4 h-4"/><span>Confirm & Assign</span></>}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
