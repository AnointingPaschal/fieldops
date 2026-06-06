'use client';
import { useState } from 'react';
import { Share2, FileText, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/task/TaskCard';
import { MOCK_TASKS } from '@/data/mockData';

export default function HistoryPage() {
  const [tab, setTab] = useState<'tasks'|'reports'>('tasks');
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-black text-text-primary">History</h1>
            <p className="text-xs text-text-muted">Task log and weekly reports</p>
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm"><Share2 className="w-4 h-4" /> Export</button>
        </header>
        <div className="p-8">
          <div className="flex gap-3 mb-6">
            {(['tasks','reports'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full font-semibold text-sm border transition-all ${
                  tab === t ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-muted border-border hover:border-slate-300'
                }`}>
                {t === 'tasks' ? 'All Tasks' : 'Weekly Reports'}
              </button>
            ))}
          </div>

          {tab === 'tasks' ? (
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">This Week — Jun 1–7, 2026</p>
              <div className="grid gap-4">{MOCK_TASKS.map(t => <TaskCard key={t.id} task={t} />)}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Automated Reports</p>
              {[
                { label:'Week of Jun 1–7',    date:'Jun 6, 2026',  tasks:8,  status:'Generating…', Icon:Clock,     color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
                { label:'Week of May 25–31',   date:'May 30, 2026', tasks:12, status:'Ready',       Icon:FileText,  color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE' },
                { label:'Week of May 18–24',   date:'May 23, 2026', tasks:9,  status:'Ready',       Icon:FileText,  color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE' },
              ].map((r,i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-5 hover:border-primary/25 hover:shadow-card-md transition-all shadow-card">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>
                    <r.Icon className="w-6 h-6" style={{ color: r.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text-primary">{r.label}</p>
                    <p className="text-sm text-text-muted mt-0.5">{r.tasks} tasks · {r.date}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: r.bg, color: r.color }}>{r.status}</span>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 mt-4">
                <FileText className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">Reports auto-generate every Friday at 11:00 PM and are emailed to management.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
