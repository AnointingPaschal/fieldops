'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Package, RotateCcw, Wrench, Trash2, Check, Minus, Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_WORKERS, MOCK_CONTRACTORS, MOCK_INVENTORY } from '@/data/mockData';

const STEPS = ['Task Type','Workers','Contractor','Items','Review'];

const TASK_TYPES = [
  { id:'delivery',  label:'Delivery',   desc:'Deliver equipment to contractor site', icon:Package,  color:'#2563EB', bg:'#EFF6FF' },
  { id:'pickup',    label:'Pick Up',    desc:'Collect equipment from contractor',     icon:RotateCcw, color:'#F59E0B', bg:'#FFFBEB' },
  { id:'setup',     label:'Set Up',     desc:'Install equipment on site',             icon:Wrench,   color:'#16A34A', bg:'#F0FDF4' },
  { id:'teardown',  label:'Tear Down',  desc:'Dismantle and remove equipment',        icon:Trash2,   color:'#DC2626', bg:'#FEF2F2' },
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [step,setStep] = useState(1);
  const [taskType,setTaskType] = useState('');
  const [selectedWorkers,setSelectedWorkers] = useState<string[]>([]);
  const [selectedContractor,setSelectedContractor] = useState('');
  const [quantities,setQuantities] = useState<Record<string,number>>({});
  const [notes,setNotes] = useState('');
  const [submitting,setSubmitting] = useState(false);

  const canNext = () => {
    if(step===1) return !!taskType;
    if(step===2) return selectedWorkers.length>0;
    if(step===3) return !!selectedContractor;
    if(step===4) return Object.values(quantities).some(q=>q>0);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1500));
    router.push('/supervisor/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center gap-4 shadow-sm">
          <button onClick={() => step>1 ? setStep(s=>s-1) : router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center hover:border-primary/40 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-lg font-black text-text-primary">Create Task</h1>
            <p className="text-xs text-text-muted">Step {step} of {STEPS.length} — {STEPS[step-1]}</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((label,i) => {
              const n=i+1; const done=n<step; const active=n===step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      done ? 'bg-success border-success text-white' :
                      active ? 'border-primary bg-primary/10 text-primary' :
                      'border-slate-200 bg-slate-50 text-text-muted'
                    }`}>
                      {done ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ${active?'text-primary':done?'text-success':'text-text-muted'}`}>{label}</span>
                  </div>
                  {i<STEPS.length-1 && <div className={`flex-1 h-0.5 mb-5 rounded-full ${done?'bg-success':'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>

          {/* Step 1 */}
          {step===1 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-black text-text-primary mb-1">Select Task Type</h2>
              <p className="text-text-secondary mb-8">What kind of field operation is this?</p>
              <div className="grid grid-cols-2 gap-4">
                {TASK_TYPES.map(({id,label,desc,icon:Icon,color,bg})=>{
                  const sel=taskType===id;
                  return (
                    <button key={id} onClick={()=>setTaskType(id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] shadow-sm ${sel?'':'border-border bg-white hover:border-primary/30 hover:shadow-card-md'}`}
                      style={sel?{borderColor:color,background:bg}:{}}>
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: sel ? color : bg }}>
                        <Icon className="w-7 h-7" style={{ color: sel?'#fff':color }} />
                      </div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: sel?color:'#0F172A' }}>{label}</h3>
                      <p className="text-sm text-text-muted">{desc}</p>
                      {sel && <div className="mt-3 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{color}} /><span className="text-xs font-bold" style={{color}}>Selected</span></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step===2 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-black text-text-primary mb-1">Assign Workers</h2>
              <p className="text-text-secondary mb-8">Select available employees for this task.</p>
              <div className="space-y-3">
                {MOCK_WORKERS.map(w=>{
                  const sel=selectedWorkers.includes(w.id);
                  return (
                    <button key={w.id} onClick={()=>w.available&&setSelectedWorkers(p=>p.includes(w.id)?p.filter(id=>id!==w.id):[...p,w.id])}
                      disabled={!w.available}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all shadow-sm ${
                        !w.available?'opacity-40 cursor-not-allowed border-border bg-slate-50':
                        sel?'border-primary bg-primary/5':'border-border bg-white hover:border-primary/30 hover:shadow-card-md'
                      }`}>
                      <div className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-sm relative flex-shrink-0"
                        style={{background:w.color+'15',borderColor:w.color+'40',color:w.color}}>
                        {w.initials}
                        {w.available&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full"/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-primary">{w.name}</p>
                        <p className="text-sm text-text-muted">{w.title}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${w.available?'bg-green-50 text-green-700':'bg-slate-100 text-slate-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${w.available?'bg-success':'bg-slate-400'}`}/>
                          {w.available?'Available':'Unavailable'}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${sel?'bg-primary border-primary':'border-slate-300'}`}>
                        {sel&&<Check className="w-4 h-4 text-white"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step===3 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-black text-text-primary mb-1">Select Contractor</h2>
              <p className="text-text-secondary mb-8">Which contractor is this task for?</p>
              <div className="space-y-4">
                {MOCK_CONTRACTORS.map((c,i)=>{
                  const colors=['#2563EB','#16A34A','#7C3AED'];
                  const bgs=['#EFF6FF','#F0FDF4','#F5F3FF'];
                  const color=colors[i%3];
                  const bg=bgs[i%3];
                  const sel=selectedContractor===c.id;
                  return (
                    <button key={c.id} onClick={()=>setSelectedContractor(c.id)}
                      className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all shadow-sm ${sel?'':'border-border bg-white hover:border-primary/30 hover:shadow-card-md'}`}
                      style={sel?{borderColor:color,background:bg}:{}}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                        style={{background:sel?color:bg,color:sel?'#fff':color}}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1" style={{color:sel?color:'#0F172A'}}>{c.name}</p>
                        <p className="text-sm text-text-secondary">📍 {c.address}</p>
                        <p className="text-sm text-text-muted mt-0.5">👤 {c.contactName} · {c.phone}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1`}
                        style={{borderColor:sel?color:'#CBD5E1'}}>
                        {sel&&<div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step===4 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-black text-text-primary mb-1">Select Items</h2>
              <p className="text-text-secondary mb-8">Choose equipment and quantities.</p>
              <div className="space-y-3">
                {MOCK_INVENTORY.map(item=>{
                  const qty=quantities[item.id]||0;
                  const pct=item.available/item.total;
                  const color=pct<0.2?'#DC2626':pct<0.4?'#F59E0B':'#16A34A';
                  return (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all shadow-sm ${qty>0?'border-primary bg-primary/5':'border-border bg-white'}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary">{item.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-text-muted">{item.category}</span>
                          <span className="text-xs font-semibold" style={{color}}>{item.available} available</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setQuantities(p=>({...p,[item.id]:Math.max(0,(p[item.id]||0)-1)}))
                        } disabled={qty===0} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:border-slate-300">
                          <Minus className="w-3 h-3 text-text-secondary"/>
                        </button>
                        <span className={`w-8 text-center font-bold text-sm ${qty>0?'text-primary':'text-text-muted'}`}>{qty}</span>
                        <button onClick={()=>setQuantities(p=>({...p,[item.id]:Math.min(item.available,(p[item.id]||0)+1)}))} disabled={qty>=item.available}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:border-slate-300">
                          <Plus className="w-3 h-3 text-text-secondary"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step===5 && (
            <div className="animate-slide-up space-y-5">
              <div><h2 className="text-2xl font-black text-text-primary mb-1">Review & Confirm</h2>
                <p className="text-text-secondary">Double check everything before assigning.</p></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Task Type</p>
                  <p className="text-xl font-black text-text-primary capitalize">{taskType}</p>
                </div>
                <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Workers</p>
                  <p className="text-xl font-black text-text-primary">{selectedWorkers.length} assigned</p>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Contractor</p>
                <p className="text-lg font-bold text-text-primary">{MOCK_CONTRACTORS.find(c=>c.id===selectedContractor)?.name||'—'}</p>
              </div>

              <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Selected Items</p>
                {Object.entries(quantities).filter(([,q])=>q>0).map(([id,qty])=>{
                  const item=MOCK_INVENTORY.find(i=>i.id===id);
                  return item?(<div key={id} className="flex justify-between py-1 border-b border-border last:border-0">
                    <span className="text-text-secondary text-sm">{item.name}</span>
                    <span className="font-bold text-primary">×{qty}</span>
                  </div>):null;
                })}
              </div>

              <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Supervisor Notes</p>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                  placeholder="Add any special instructions..." className="input min-h-[80px] resize-none text-sm"/>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-text-secondary">Confirming will immediately notify assigned workers and update live inventory.</p>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <button onClick={()=>step>1?setStep(s=>s-1):router.back()} className="btn-ghost flex items-center gap-2">
              <ArrowLeft className="w-4 h-4"/>{step>1?'Back':'Cancel'}
            </button>
            {step<5?(
              <button onClick={()=>setStep(s=>s+1)} disabled={!canNext()} className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                Continue <ArrowRight className="w-4 h-4"/>
              </button>
            ):(
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 min-w-[180px] justify-center">
                {submitting?<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Assigning…</span>
                :<span className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Confirm & Assign</span>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
