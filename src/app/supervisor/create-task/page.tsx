'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Package, RotateCcw, Wrench, Trash2, Minus, Plus, X } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_WORKERS, MOCK_CONTRACTORS, MOCK_INVENTORY } from '@/data/mockData';

const STEPS = ['Type','Workers','Client','Items','Review'];

const TYPES = [
  {id:'delivery', l:'Delivery',  d:'Deliver equipment to site', I:Package,  c:'#2563EB', bg:'#EFF6FF'},
  {id:'pickup',   l:'Pick Up',   d:'Collect from contractor',   I:RotateCcw,c:'#F59E0B', bg:'#FFFBEB'},
  {id:'setup',    l:'Set Up',    d:'Install equipment on site', I:Wrench,   c:'#16A34A', bg:'#F0FDF4'},
  {id:'teardown', l:'Tear Down', d:'Dismantle and remove',      I:Trash2,   c:'#DC2626', bg:'#FEF2F2'},
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [step, setStep]    = useState(1);
  const [type, setType]    = useState('');
  const [workers, setWorkers] = useState<string[]>([]);
  const [contractor, setContractor] = useState('');
  const [qty, setQty]      = useState<Record<string,number>>({});
  const [notes, setNotes]  = useState('');
  const [loading, setLoading] = useState(false);

  const canNext=()=>{if(step===1)return!!type;if(step===2)return workers.length>0;if(step===3)return!!contractor;if(step===4)return Object.values(qty).some(q=>q>0);return true;};
  const submit=async()=>{setLoading(true);await new Promise(r=>setTimeout(r,1200));router.push('/supervisor/dashboard');};

  const CONTRACTOR_COLORS=['#2563EB','#16A34A','#7C3AED'];

  return (
    <div className="app-shell">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button onClick={()=>step>1?setStep(s=>s-1):router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-text-secondary"/>
          </button>
          <div className="flex-1">
            <p className="text-xs text-text-muted">Step {step}/{STEPS.length} — {STEPS[step-1]}</p>
            <h1 className="text-lg font-black text-text-primary">Create Task</h1>
          </div>
          <button onClick={()=>router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted"/>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-4 mb-6">
          {STEPS.map((_,i)=>(
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i+1<=step?'bg-primary':'bg-gray-200'}`}/>
          ))}
        </div>

        <div className="px-4 animate-slide-up">
          {/* Step 1: Task Type */}
          {step===1&&(
            <>
              <h2 className="text-xl font-black text-text-primary mb-1">Task Type</h2>
              <p className="text-text-muted text-sm mb-5">What kind of operation is this?</p>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map(({id,l,d,I,c,bg})=>{
                  const sel=type===id;
                  return (
                    <button key={id} onClick={()=>setType(id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all active:scale-95 ${sel?'':'border-gray-200 bg-white'}`}
                      style={sel?{borderColor:c,background:bg}:{}}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{background:sel?c:bg}}>
                        <I className="w-6 h-6" style={{color:sel?'#fff':c}}/>
                      </div>
                      <p className="font-black text-base mb-0.5" style={{color:sel?c:'#0F172A'}}>{l}</p>
                      <p className="text-[11px] text-text-muted leading-tight">{d}</p>
                      {sel&&<div className="flex items-center gap-1 mt-2"><CheckCircle className="w-3.5 h-3.5" style={{color:c}}/><span className="text-[11px] font-bold" style={{color:c}}>Selected</span></div>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 2: Workers */}
          {step===2&&(
            <>
              <h2 className="text-xl font-black text-text-primary mb-1">Assign Workers</h2>
              <p className="text-text-muted text-sm mb-5">Select available field workers.</p>
              <div className="section-card">
                {MOCK_WORKERS.map(w=>{
                  const sel=workers.includes(w.id);
                  return (
                    <button key={w.id} onClick={()=>w.available&&setWorkers(p=>p.includes(w.id)?p.filter(id=>id!==w.id):[...p,w.id])}
                      disabled={!w.available}
                      className={`list-row w-full text-left transition-all ${sel?'bg-orange-50':''} ${!w.available?'opacity-40 cursor-not-allowed':''}`}>
                      <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center font-black text-sm relative flex-shrink-0"
                        style={{background:w.color+'18',borderColor:w.color+'50',color:w.color}}>
                        {w.initials}
                        {w.available&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full"/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-primary text-sm">{w.name}</p>
                        <p className="text-xs text-text-muted">{w.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${w.available?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>
                          <span className={`w-1 h-1 rounded-full ${w.available?'bg-success':'bg-gray-400'}`}/>
                          {w.available?'Available':'Off'}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${sel?'bg-primary border-primary':'border-gray-300'}`}>
                        {sel&&<Check className="w-4 h-4 text-white"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3: Contractor */}
          {step===3&&(
            <>
              <h2 className="text-xl font-black text-text-primary mb-1">Select Contractor</h2>
              <p className="text-text-muted text-sm mb-5">Which contractor is this for?</p>
              <div className="space-y-3">
                {MOCK_CONTRACTORS.map((c,i)=>{
                  const color=CONTRACTOR_COLORS[i%3];
                  const sel=contractor===c.id;
                  return (
                    <button key={c.id} onClick={()=>setContractor(c.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-3xl border-2 text-left transition-all active:scale-[0.99] bg-white ${sel?'':'border-gray-200'}`}
                      style={sel?{borderColor:color,background:color+'08'}:{}}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
                        style={{background:color+(sel?'':'18'),color:sel?'#fff':color}}
                        >
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg mb-0.5" style={{color:sel?color:'#0F172A'}}>{c.name}</p>
                        <p className="text-xs text-text-muted">📍 {c.address}</p>
                        <p className="text-xs text-text-muted mt-0.5">👤 {c.contactName} · {c.phone}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1`} style={{borderColor:sel?color:'#D1D5DB'}}>
                        {sel&&<div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 4: Items */}
          {step===4&&(
            <>
              <h2 className="text-xl font-black text-text-primary mb-1">Select Items</h2>
              <p className="text-text-muted text-sm mb-5">Choose equipment and quantities.</p>
              <div className="section-card">
                {MOCK_INVENTORY.map(item=>{
                  const q=qty[item.id]||0;
                  const pct=item.available/item.total;
                  const c=pct<0.2?'#DC2626':pct<0.4?'#F59E0B':'#16A34A';
                  return (
                    <div key={item.id} className={`list-row ${q>0?'bg-orange-50/40':''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-primary text-sm">{item.name}</p>
                        <p className="text-[11px]" style={{color:c}}>{item.available} available · {item.category}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={()=>setQty(p=>({...p,[item.id]:Math.max(0,(p[item.id]||0)-1)}))} disabled={q===0}
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center disabled:opacity-30">
                          <Minus className="w-3.5 h-3.5 text-text-secondary"/>
                        </button>
                        <span className={`w-6 text-center font-black text-sm ${q>0?'text-primary':'text-text-muted'}`}>{q}</span>
                        <button onClick={()=>setQty(p=>({...p,[item.id]:Math.min(item.available,(p[item.id]||0)+1)}))} disabled={q>=item.available}
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center disabled:opacity-30">
                          <Plus className="w-3.5 h-3.5 text-text-secondary"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step===5&&(
            <>
              <h2 className="text-xl font-black text-text-primary mb-1">Review</h2>
              <p className="text-text-muted text-sm mb-5">Confirm before sending to worker.</p>
              <div className="space-y-3">
                {[
                  {l:'Task Type', v:type||'—'},
                  {l:'Workers',   v:`${workers.length} assigned`},
                  {l:'Contractor',v:MOCK_CONTRACTORS.find(c=>c.id===contractor)?.name||'—'},
                  {l:'Items',     v:`${Object.values(qty).filter(q=>q>0).length} types selected`},
                ].map((r,i)=>(
                  <div key={i} className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-card border border-gray-100">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{r.l}</p>
                    <p className="font-black text-text-primary capitalize">{r.v}</p>
                  </div>
                ))}
                <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Notes</p>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder="Special instructions…" className="input min-h-[70px] resize-none text-sm"/>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fixed bottom action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-100 px-4 py-4 safe-bottom z-50">
        <button onClick={step<5?()=>setStep(s=>s+1):submit}
          disabled={!canNext()||loading}
          className="btn-primary shadow-glow disabled:opacity-40 disabled:shadow-none">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Assigning…</>
            : step<5
              ? <><span>{step===4?'Review':'Continue'}</span><ArrowRight className="w-4 h-4"/></>
              : <><CheckCircle className="w-4 h-4"/><span>Confirm & Assign</span></>}
        </button>
      </div>
    </div>
  );
}
