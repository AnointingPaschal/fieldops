'use client';
import { useState } from 'react';
import { LogIn, LogOut, MapPin, Camera, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS } from '@/data/mockData';

export default function WorkerDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState('');

  const handleClock = () => {
    if (!clockedIn) {
      const now = new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
      setClockTime(now);
      setClockedIn(true);
    } else {
      setClockedIn(false);
      setClockTime('');
    }
  };

  const myTasks = MOCK_TASKS.slice(0, 3);
  const activeTask = myTasks.find(t => t.status === 'in_transit' || t.status === 'assigned');

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="worker" userName="Marcus Reid" userInitials="MR" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-lg border-b border-border px-8 py-4">
          <p className="text-text-muted text-sm">Saturday, June 6, 2026</p>
          <h1 className="text-xl font-black text-white">Good morning, Marcus 👷</h1>
        </header>

        <div className="p-8 space-y-6">
          {/* Clock card */}
          <div className={`relative rounded-3xl p-6 overflow-hidden border ${
            clockedIn ? 'border-success/30 bg-success/5' : 'border-border bg-card'
          }`}>
            <div className="absolute inset-0 opacity-30"
              style={{ background: clockedIn
                ? 'radial-gradient(circle at 80% 50%, rgba(34,212,110,0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle at 80% 50%, rgba(255,107,53,0.1) 0%, transparent 70%)' }}
            />
            <div className="relative flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${clockedIn ? 'bg-success animate-pulse' : 'bg-text-muted'}`} />
                  <span className={`text-sm font-semibold ${clockedIn ? 'text-success' : 'text-text-muted'}`}>
                    {clockedIn ? 'Clocked In' : 'Not Clocked In'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">{clockedIn ? clockTime : '—'}</h2>
                {clockedIn && <p className="text-text-muted text-sm">GPS location recorded</p>}
                {!clockedIn && <p className="text-text-muted text-sm text-xs">Your supervisor has marked you available</p>}
              </div>
              <button
                onClick={handleClock}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 ${
                  clockedIn
                    ? 'bg-danger hover:shadow-[0_0_20px_rgba(255,59,92,0.4)]'
                    : 'bg-gradient-primary hover:shadow-glow'
                }`}>
                {clockedIn ? <><LogOut className="w-4 h-4" /> Clock Out</> : <><LogIn className="w-4 h-4" /> Clock In</>}
              </button>
            </div>
          </div>

          {/* Active task */}
          {activeTask && clockedIn && (
            <div className="bg-info/10 border border-info/30 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-info animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-info text-sm mb-0.5">Active Task</p>
                <p className="font-bold text-white">{activeTask.contractor.name}</p>
                <p className="text-xs text-text-secondary">{activeTask.contractor.address}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-info" />
            </div>
          )}

          {/* Quick actions */}
          {clockedIn && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: MapPin, label: 'Update Location', color: '#3B9EFF' },
                  { icon: Camera, label: 'Upload Photo', color: '#FFB800' },
                  { icon: FileText, label: 'Add Note', color: '#22D46E' },
                  { icon: AlertCircle, label: 'Report Issue', color: '#FF3B5C' },
                ].map(({ icon: Icon, label, color }, i) => (
                  <button key={i} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all hover:scale-[1.02] text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <p className="text-sm font-semibold text-text-secondary">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* My tasks */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">My Tasks</h2>
            <div className="grid gap-4">
              {myTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
