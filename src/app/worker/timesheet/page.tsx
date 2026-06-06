'use client';
import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_TIMESHEET } from '@/data/mockData';

export default function TimesheetPage() {
  const [expanded, setExpanded] = useState<string|null>(null);
  const totalH=MOCK_TIMESHEET.reduce((s,e)=>s+e.hours,0);
  const totalOT=MOCK_TIMESHEET.reduce((s,e)=>s+e.ot,0);
  const totalT=MOCK_TIMESHEET.reduce((s,e)=>s+e.tasks,0);

  return (
    <div className="app-shell">
      <div className="page-content">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h1 className="text-2xl font-black text-text-primary">Timesheet</h1>
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Download className="w-4 h-4 text-text-secondary"/>
          </button>
        </div>

        {/* Navy summary card */}
        <div className="hero-card mb-5">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}/>
          <div className="relative">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Current Week</p>
            <p className="text-3xl font-black text-white mb-0.5">Jun 1 — Jun 7, 2026</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5" style={{background:'rgba(245,158,11,0.25)',color:'#FCD34D'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse"/>In Progress
            </span>
            <div className="h-px bg-white/10 mb-4"/>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                {l:'Total Hrs',  v:totalH.toFixed(1), c:'text-white'},
                {l:'Overtime',   v:totalOT.toFixed(1),c:'text-yellow-300'},
                {l:'Tasks Done', v:totalT,            c:'text-blue-300'},
              ].map((s,i)=>(
                <div key={i} className="glass-card">
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{s.l}</p>
                  <p className={`font-black text-xl leading-tight mt-0.5 ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>Progress (40h standard)</span>
                <span className="text-white font-bold">{Math.round((totalH/40)*100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.12)'}}>
                <div className="h-full rounded-full" style={{width:`${Math.min((totalH/50)*100,100)}%`,background:'linear-gradient(135deg,#FF6B35,#FF9A00)'}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Daily log */}
        <div className="px-4">
          <h2 className="text-[17px] font-black text-text-primary mb-3">Daily Log</h2>
          <div className="section-card mb-4">
            {MOCK_TIMESHEET.map(entry=>{
              const exp=expanded===entry.id;
              return (
                <div key={entry.id}>
                  <button onClick={()=>setExpanded(exp?null:entry.id)} className="list-row w-full text-left">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-black text-text-muted uppercase">{entry.day.slice(0,3)}</span>
                      <span className="text-xl font-black text-text-primary leading-none">{entry.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-text-primary text-sm">{entry.day}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{entry.clockIn}</span>
                        <span className="text-text-muted text-xs">→</span>
                        <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{entry.clockOut}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-black text-text-primary">{entry.hours.toFixed(1)}h</p>
                      {entry.ot>0&&<p className="text-[11px] font-bold text-warning">+{entry.ot.toFixed(1)}h OT</p>}
                      {exp?<ChevronUp className="w-4 h-4 text-gray-300 mt-1 ml-auto"/>:<ChevronDown className="w-4 h-4 text-gray-300 mt-1 ml-auto"/>}
                    </div>
                  </button>
                  {exp&&(
                    <div className="px-4 pb-4 bg-gray-50/60 border-t border-gray-50">
                      <div className="pt-3">
                        {entry.tasks>0
                          ?<p className="text-sm text-success flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>{entry.tasks} task{entry.tasks>1?'s':''} completed</p>
                          :<p className="text-sm text-text-muted italic">No tasks this day</p>}
                        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-text-muted">Shift total</span>
                          <span className="font-black text-primary">{entry.hours.toFixed(2)} hours</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 mb-4">
            <Clock className="w-5 h-5 text-info flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-text-secondary leading-relaxed">PDF timesheet auto-generated every Friday at 11:00 PM and emailed to management.</p>
          </div>
        </div>
      </div>
      <BottomNav role="worker"/>
    </div>
  );
}
