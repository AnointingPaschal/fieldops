'use client';
import { useState } from 'react';
import { Share2, FileText, Clock } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TASKS, STATUS_STYLE, TYPE_COLOR } from '@/data/mockData';

export default function HistoryPage() {
  const [tab, setTab] = useState<'tasks'|'reports'>('tasks');
  return (
    <AppShell role="supervisor" userName="Justin Okeke">
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">History</h1>
            <p className="text-sm text-text-muted">Task log &amp; weekly reports</p>
          </div>
          <button className="btn-ghost"><Share2 className="w-4 h-4"/>Export</button>
        </div>

        <div className="flex gap-2">
          {(['tasks','reports'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={tab===t?'chip-on':'chip-off'}>
              {t==='tasks'?'All Tasks':'Weekly Reports'}
            </button>
          ))}
        </div>

        {tab==='tasks'&&(
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Week of Jun 1–7, 2026</p>
            <div className="card !p-0 overflow-hidden">
              {TASKS.map(task=>{
                const s=STATUS_STYLE[task.status]||STATUS_STYLE['Pending'];
                const c=TYPE_COLOR[task.type]||'#1D4ED8';
                return (
                  <div key={task.id} className="row">
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl" style={{background:c+'18'}}>
                      {task.type==='Delivery'?'📦':task.type==='Pick Up'?'🔄':task.type==='Set Up'?'🔧':'🗑️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-primary text-sm">{task.contractor}</p>
                        <span className="badge" style={{background:s.bg,color:s.text}}>
                          <span className="w-1 h-1 rounded-full" style={{background:s.dot}}/>{task.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{task.type} · {task.items} items · Due {task.due}</p>
                    </div>
                    <div className="text-xs text-text-muted shrink-0 text-right hidden sm:block">
                      {task.workers.map(w=>w.split(' ')[0]).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==='reports'&&(
          <div className="space-y-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Automated Reports</p>
            {[
              {l:'Week of Jun 1–7',  d:'Jun 6',  n:8,  s:'Generating…', I:Clock,    c:'#D97706', bg:'#FFFBEB' },
              {l:'Week of May 25–31',d:'May 30', n:12, s:'Ready',       I:FileText, c:'#1D4ED8', bg:'#EFF6FF' },
              {l:'Week of May 18–24',d:'May 23', n:9,  s:'Ready',       I:FileText, c:'#1D4ED8', bg:'#EFF6FF' },
            ].map((r,i)=>(
              <div key={i} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:r.bg}}>
                  <r.I className="w-6 h-6" style={{color:r.c}}/>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary">{r.l}</p>
                  <p className="text-sm text-text-muted">{r.n} tasks · {r.d}</p>
                </div>
                <span className="badge shrink-0" style={{background:r.bg,color:r.c}}>{r.s}</span>
              </div>
            ))}
            <div className="bg-sky-soft border border-sky/20 rounded-2xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-sky shrink-0 mt-0.5"/>
              <p className="text-sm text-text-secondary">Reports auto-generate every Friday at 11 PM and are emailed to management for payroll.</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
