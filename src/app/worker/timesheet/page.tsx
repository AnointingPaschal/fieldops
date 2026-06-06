'use client';
import { useState } from 'react';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TIMESHEET } from '@/data/mockData';

export default function TimesheetPage() {
  const [expanded, setExpanded] = useState<string|null>(null);
  const totalH  = TIMESHEET.reduce((s,e)=>s+e.h,0);
  const totalOT = TIMESHEET.reduce((s,e)=>s+e.ot,0);
  const totalT  = TIMESHEET.reduce((s,e)=>s+e.tasks,0);

  return (
    <AppShell role="worker" userName="Marcus Reid">
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">Timesheet</h1>
            <p className="text-sm text-text-muted">Week of Jun 1–7, 2026</p>
          </div>
          <button className="btn-ghost"><Download className="w-4 h-4"/>Export PDF</button>
        </div>

        {/* Summary */}
        <div className="card bg-navy !text-white border-navy">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current Week</p>
              <p className="text-white text-lg font-black">Jun 1 — Jun 7, 2026</p>
            </div>
            <span className="badge bg-sky/20 text-sky-light border border-sky/30">In Progress</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              {l:'Total Hours', v:totalH.toFixed(1), c:'text-white'},
              {l:'Overtime',    v:totalOT.toFixed(1),c:'text-warn'},
              {l:'Tasks Done',  v:totalT,             c:'text-sky-light'},
            ].map((s,i)=>(
              <div key={i}>
                <p className={`text-3xl font-black ${s.c}`}>{s.v}</p>
                <p className="text-slate-400 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Weekly progress (40h standard)</span>
              <span className="text-white font-bold">{Math.round((totalH/40)*100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-sky rounded-full" style={{width:`${Math.min((totalH/50)*100,100)}%`}}/>
            </div>
          </div>
        </div>

        {/* Daily log */}
        <div>
          <h2 className="section-title mb-3">Daily Log</h2>
          <div className="card !p-0 overflow-hidden">
            {TIMESHEET.map(entry=>{
              const exp=expanded===entry.id;
              return (
                <div key={entry.id} className={exp?'bg-slate-50/50':''}>
                  <button onClick={()=>setExpanded(exp?null:entry.id)}
                    className="row w-full text-left hover:bg-slate-50">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-line flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-text-muted uppercase">{entry.day.slice(0,3)}</span>
                      <span className="text-xl font-black text-text-primary leading-none">{entry.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm">{entry.day}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge bg-pass-soft text-pass">{entry.in}</span>
                        <span className="text-text-muted text-xs">→</span>
                        <span className="badge bg-fail-soft text-fail">{entry.out}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-text-primary">{entry.h.toFixed(2)}h</p>
                      {entry.ot>0&&<p className="text-xs font-bold text-warn">+{entry.ot.toFixed(2)}h OT</p>}
                      {exp?<ChevronUp className="w-4 h-4 text-slate-300 mt-1 ml-auto"/>:<ChevronDown className="w-4 h-4 text-slate-300 mt-1 ml-auto"/>}
                    </div>
                  </button>
                  {exp&&(
                    <div className="px-5 pb-4 pt-2 border-t border-line">
                      {entry.tasks>0
                        ?<p className="text-sm text-pass flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-pass-soft flex items-center justify-center text-xs">✓</span>{entry.tasks} task{entry.tasks>1?'s':''} completed</p>
                        :<p className="text-sm text-text-muted italic">No tasks this day</p>}
                      <div className="flex justify-between mt-3 pt-3 border-t border-line">
                        <span className="text-sm text-text-muted">Shift total</span>
                        <span className="font-black text-navy">{entry.h.toFixed(2)} hours</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-sky-soft border border-sky/20 rounded-2xl p-4 flex gap-3">
          <span className="text-sky text-lg shrink-0">📄</span>
          <p className="text-sm text-text-secondary">Timesheet PDF is auto-generated every Friday at 11 PM and sent to management for payroll processing.</p>
        </div>
      </div>
    </AppShell>
  );
}
