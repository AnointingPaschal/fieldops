'use client';
import { useState } from 'react';
import { LogIn, LogOut, MapPin, Camera, FileText, AlertCircle, ChevronRight, Bell, Eye } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_TASKS, STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/data/mockData';

export default function WorkerDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const toggle=()=>{
    if(!clockedIn){const n=new Date().toLocaleTimeString('en-CA',{hour:'2-digit',minute:'2-digit'});setClockTime(n);setClockedIn(true);}
    else{setClockedIn(false);setClockTime('');}
  };
  const myTasks=MOCK_TASKS.slice(0,3);

  return (
    <div className="app-shell">
      <div className="page-content">
        {/* Header pills */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="pill">
            <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-[10px] font-black text-white">MR</div>
            <span className="text-sm">Marcus Reid</span>
            <ChevronRight className="w-3 h-3 text-gray-400"/>
          </div>
          <div className="flex items-center gap-2">
            <div className="pill">
              <span className="w-2 h-2 rounded-full bg-info"/>
              <span className="text-sm">Worker</span>
            </div>
            <button className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4 text-gray-500"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white"/>
            </button>
          </div>
        </div>

        {/* Navy hero clock card */}
        <div className="hero-card">
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}/>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-sm">👷</span>
                </div>
                <span className="text-white/60 text-sm font-semibold">Today's Shift</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white/60"/>
              </button>
            </div>

            <p className="text-white text-5xl font-black tracking-tight leading-none mt-3">
              {clockedIn ? clockTime : '—'}
            </p>
            <div className="flex items-center gap-2 mt-2 mb-5">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                clockedIn?'bg-green-500/20 text-green-300':'bg-white/10 text-white/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${clockedIn?'bg-green-400 animate-pulse':'bg-white/30'}`}/>
                {clockedIn?'Clocked In · GPS Active':'Not Clocked In'}
              </span>
            </div>

            <div className="h-px bg-white/10 mb-4"/>

            {/* Sub stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[
                {l:'Tasks',   v: myTasks.length.toString(), s:'assigned'},
                {l:'Shift',   v: clockedIn?'Active':'—',    s:'status'},
                {l:'Network', v:'BSC',                       s:'Calgary AB'},
              ].map((s,i)=>(
                <div key={i} className="glass-card">
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{s.l}</p>
                  <p className="text-white font-black text-lg leading-tight mt-0.5">{s.v}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.s}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="bg-white/5 rounded-2xl p-3">
              <div className="grid grid-cols-4 gap-1">
                <button onClick={toggle}
                  className="action-btn col-span-2 flex-row gap-2 py-3"
                  style={{background:clockedIn?'#DC2626':'linear-gradient(135deg,#FF6B35,#FF9A00)'}}>
                  {clockedIn?<LogOut className="w-5 h-5 text-white"/>:<LogIn className="w-5 h-5 text-white"/>}
                  <span className="text-white text-sm font-bold">{clockedIn?'Clock Out':'Clock In'}</span>
                </button>
                {[
                  {I:MapPin, l:'Location'},
                  {I:Camera, l:'Photo'},
                ].map(({I,l},i)=>(
                  <button key={i} className="action-btn">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.10)'}}>
                      <I className="w-5 h-5 text-white"/>
                    </div>
                    <span className="text-white text-[10px] font-semibold">{l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          {[
            {I:FileText,    l:'Add Note',     c:'#16A34A',bg:'#F0FDF4'},
            {I:AlertCircle, l:'Report Issue', c:'#DC2626',bg:'#FEF2F2'},
          ].map(({I,l,c,bg},i)=>(
            <button key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-card active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:bg}}>
                <I className="w-5 h-5" style={{color:c}}/>
              </div>
              <span className="font-bold text-text-primary text-sm">{l}</span>
            </button>
          ))}
        </div>

        {/* My Tasks */}
        <div className="px-4 mt-5 mb-4">
          <h2 className="text-[17px] font-black text-text-primary mb-3">My Tasks</h2>
          <div className="section-card">
            {myTasks.map(task=>{
              const type=TASK_TYPE_CONFIG[task.type]||TASK_TYPE_CONFIG.delivery;
              const status=STATUS_CONFIG[task.status]||STATUS_CONFIG.pending;
              return (
                <div key={task.id} className="list-row">
                  <div className="token-icon" style={{background:type.color+'18',fontSize:'20px'}}>{type.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-[15px]">{task.contractor.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{type.label} · {task.items.length} items</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="status-badge" style={{background:status.bg,color:status.color}}>{status.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 mt-1 ml-auto"/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav role="worker"/>
    </div>
  );
}
