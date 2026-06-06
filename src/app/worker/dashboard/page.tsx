'use client';
import { useState } from 'react';
import { LogIn, LogOut, MapPin, Camera, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS } from '@/data/mockData';

export default function WorkerDashboard() {
  const [clockedIn,setClockedIn]=useState(false);
  const [clockTime,setClockTime]=useState('');

  const handleClock=()=>{
    if(!clockedIn){const now=new Date().toLocaleTimeString('en-CA',{hour:'2-digit',minute:'2-digit'});setClockTime(now);setClockedIn(true);}
    else{setClockedIn(false);setClockTime('');}
  };

  const myTasks=MOCK_TASKS.slice(0,3);
  const activeTask=myTasks.find(t=>t.status==='in_transit'||t.status==='assigned');

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="worker" userName="Marcus Reid" userInitials="MR"/>
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 shadow-sm">
          <p className="text-text-muted text-sm">Saturday, June 6, 2026</p>
          <h1 className="text-xl font-black text-text-primary">Good morning, Marcus 👷</h1>
        </header>
        <div className="p-8 space-y-6">
          {/* Clock card */}
          <div className={`rounded-3xl p-6 border-2 shadow-card-md transition-all ${clockedIn?'bg-green-50 border-green-200':'bg-white border-border'}`}>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${clockedIn?'bg-success animate-pulse':'bg-slate-300'}`}/>
                  <span className={`text-sm font-semibold ${clockedIn?'text-green-700':'text-text-muted'}`}>
                    {clockedIn?'Clocked In':'Not Clocked In'}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-text-primary">{clockedIn?clockTime:'—'}</h2>
                {clockedIn&&<p className="text-green-600 text-sm mt-1">📍 GPS location recorded</p>}
                {!clockedIn&&<p className="text-text-muted text-xs mt-1">Your supervisor has marked you available today</p>}
              </div>
              <button onClick={handleClock}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 shadow-sm ${
                  clockedIn?'bg-danger hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)]':'bg-gradient-primary hover:shadow-glow'
                }`}>
                {clockedIn?<><LogOut className="w-4 h-4"/>Clock Out</>:<><LogIn className="w-4 h-4"/>Clock In</>}
              </button>
            </div>
          </div>

          {/* Active task */}
          {activeTask&&clockedIn&&(
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-info animate-pulse flex-shrink-0"/>
              <div className="flex-1">
                <p className="font-bold text-info text-sm mb-0.5">Active Task</p>
                <p className="font-bold text-text-primary">{activeTask.contractor.name}</p>
                <p className="text-xs text-text-secondary">{activeTask.contractor.address}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-info"/>
            </div>
          )}

          {/* Quick actions */}
          {clockedIn&&(
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  {icon:MapPin,  label:'Update Location', color:'#2563EB',bg:'#EFF6FF'},
                  {icon:Camera,  label:'Upload Photo',    color:'#F59E0B',bg:'#FFFBEB'},
                  {icon:FileText,label:'Add Note',        color:'#16A34A',bg:'#F0FDF4'},
                  {icon:AlertCircle,label:'Report Issue', color:'#DC2626',bg:'#FEF2F2'},
                ].map(({icon:Icon,label,color,bg},i)=>(
                  <button key={i} className="bg-white border border-border rounded-2xl p-5 hover:border-primary/25 hover:shadow-card-md transition-all text-center shadow-card">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{background:bg}}>
                      <Icon className="w-5 h-5" style={{color}}/>
                    </div>
                    <p className="text-sm font-semibold text-text-secondary">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">My Tasks</h2>
            <div className="grid gap-4">{myTasks.map(t=><TaskCard key={t.id} task={t}/>)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
