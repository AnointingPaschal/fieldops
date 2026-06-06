'use client';
import { useState } from 'react';
import { LogIn, LogOut, MapPin, Camera, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TASKS, STATUS_STYLE, TYPE_COLOR } from '@/data/mockData';

export default function WorkerDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const toggle=()=>{
    if(!clockedIn){const n=new Date().toLocaleTimeString('en-CA',{hour:'2-digit',minute:'2-digit'});setClockTime(n);setClockedIn(true);}
    else{setClockedIn(false);setClockTime('');}
  };
  const myTasks = TASKS.slice(0,3);

  return (
    <AppShell role="worker" userName="Marcus Reid">
      <div className="p-4 md:p-6 space-y-5">

        {/* Clock card */}
        <div className="rounded-2xl bg-navy p-6 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border border-white/5"/>
          <div className="relative">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Today's Shift — Jun 6, 2026</p>
            <p className="text-white text-5xl font-black tracking-tight leading-none mb-2">
              {clockedIn ? clockTime : '—'}
            </p>
            <div className="flex items-center gap-2 mb-6">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                clockedIn?'bg-pass/20 text-green-300':'bg-white/10 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${clockedIn?'bg-green-400 animate-pulse':'bg-slate-500'}`}/>
                {clockedIn?`Clocked in · GPS recorded`:'Not clocked in'}
              </span>
            </div>
            <button onClick={toggle}
              className={`inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] ${
                clockedIn?'bg-fail':'bg-sky'
              }`}>
              {clockedIn?<><LogOut className="w-4 h-4"/>Clock Out</>:<><LogIn className="w-4 h-4"/>Clock In for Today</>}
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {I:MapPin,    l:'Update Location', c:'text-sky',  bg:'bg-sky-soft' },
            {I:Camera,    l:'Upload Photo',     c:'text-warn', bg:'bg-warn-soft'},
            {I:FileText,  l:'Add Note',         c:'text-pass', bg:'bg-pass-soft'},
            {I:AlertCircle,l:'Report Issue',    c:'text-fail', bg:'bg-fail-soft'},
          ].map(({I,l,c,bg},i)=>(
            <button key={i} className="card-sm flex items-center gap-3 text-left hover:shadow-md transition-all active:scale-[0.98]">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <I className={`w-5 h-5 ${c}`}/>
              </div>
              <span className="font-semibold text-text-primary text-sm">{l}</span>
            </button>
          ))}
        </div>

        {/* My Tasks */}
        <div>
          <div className="section-hd">
            <h2 className="section-title">My Tasks</h2>
          </div>
          <div className="card !p-0 overflow-hidden">
            {myTasks.map(task=>{
              const s=STATUS_STYLE[task.status]||STATUS_STYLE['Pending'];
              const c=TYPE_COLOR[task.type]||'#1D4ED8';
              return (
                <div key={task.id} className="row cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl" style={{background:c+'18'}}>
                    {task.type==='Delivery'?'📦':task.type==='Pick Up'?'🔄':task.type==='Set Up'?'🔧':'🗑️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-text-primary text-sm group-hover:text-sky transition-colors">{task.contractor}</p>
                      <span className="badge" style={{background:s.bg,color:s.text}}>
                        <span className="w-1 h-1 rounded-full" style={{background:s.dot}}/>{task.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{task.type} · {task.items} items · Due {task.due}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0"/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
