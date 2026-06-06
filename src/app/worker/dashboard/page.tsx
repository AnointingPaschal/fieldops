'use client';
import { useState } from 'react';
import { LogIn, LogOut, MapPin, Camera, FileText, AlertCircle, ChevronRight, Package } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_TASKS, STATUS_CONFIG } from '@/data/mockData';

export default function WorkerDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState('');

  const handleClock = () => {
    if (!clockedIn) {
      const now = new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
      setClockTime(now); setClockedIn(true);
    } else { setClockedIn(false); setClockTime(''); }
  };

  const myTasks = MOCK_TASKS.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="worker" userName="Marcus Reid" userInitials="MR" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 shadow-sm">
          <p className="text-xs text-text-muted">Saturday, June 6, 2026</p>
          <h1 className="text-[17px] font-black text-text-primary">Good morning, Marcus 👷</h1>
        </header>

        <div className="p-6 space-y-5">
          {/* Navy hero clock card — Stilex style */}
          <div className="rounded-3xl p-6 shadow-navy relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1A2744 0%, #0F1A2E 100%)' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Today's Shift</p>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-4xl font-black text-white">{clockedIn ? clockTime : '—'}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      clockedIn ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${clockedIn ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                      {clockedIn ? 'Clocked In' : 'Not Clocked In'}
                    </span>
                    {clockedIn && <span className="text-white/30 text-xs">📍 GPS recorded</span>}
                  </div>
                </div>
              </div>

              {/* Dark pill actions */}
              <div className="grid grid-cols-4 gap-2">
                <button onClick={handleClock}
                  className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:scale-105"
                  style={{ background: clockedIn ? '#DC2626' : '#FF6B35' }}>
                  {clockedIn ? <><LogOut className="w-4 h-4" />Clock Out</> : <><LogIn className="w-4 h-4" />Clock In</>}
                </button>
                {[
                  { icon: MapPin,    label: 'Location' },
                  { icon: Camera,    label: 'Photo' },
                ].map(({ icon: Icon, label }, i) => (
                  <button key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-white text-[10px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText,    label: 'Add Note',     color: '#16A34A', bg: '#F0FDF4' },
              { icon: AlertCircle, label: 'Report Issue', color: '#DC2626', bg: '#FEF2F2' },
            ].map(({ icon: Icon, label, color, bg }, i) => (
              <button key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-card hover:shadow-card-md hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="font-semibold text-text-primary text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* My Tasks */}
          <div>
            <h2 className="text-base font-black text-text-primary mb-3">My Tasks</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              {myTasks.map(task => {
                const typeColors: Record<string, string> = { delivery: '#2563EB', pickup: '#F59E0B', setup: '#16A34A', teardown: '#DC2626' };
                const color = typeColors[task.type] || '#64748B';
                const statusConf = STATUS_CONFIG[task.status];
                return (
                  <div key={task.id} className="list-row group cursor-pointer">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: color + '15' }}>
                      {task.type === 'delivery' ? '📦' : task.type === 'pickup' ? '🔄' : task.type === 'setup' ? '🔧' : '🗑️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">{task.contractor.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{task.items.length} items · {task.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="badge text-[10px]" style={{ background: statusConf.bg, color: statusConf.color }}>
                        {statusConf.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-muted mt-1 ml-auto" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
