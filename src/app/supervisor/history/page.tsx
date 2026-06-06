'use client';
import { useState } from 'react';
import { Share2, FileText, Clock, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_TASKS, STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/data/mockData';

export default function HistoryPage() {
  const [tab, setTab] = useState<'tasks'|'reports'>('tasks');
  return (
    <div className="app-shell">
      <div className="page-content">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h1 className="text-2xl font-black text-text-primary">History</h1>
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Share2 className="w-4 h-4 text-text-secondary"/>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mb-5">
          {(['tasks','reports'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm border transition-all ${
                tab===t?'bg-navy text-white border-navy':'bg-white text-text-muted border-gray-200'
              }`}>
              {t==='tasks'?'All Tasks':'Reports'}
            </button>
          ))}
        </div>

        {tab==='tasks'?(
          <div className="px-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Jun 1–7, 2026</p>
            <div className="section-card">
              {MOCK_TASKS.map(task=>{
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
                      <p className="text-xs text-text-muted mt-1">{task.employees.map((e:any)=>e.name.split(' ')[0]).join(', ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ):(
          <div className="px-4 space-y-3">
            {[
              {l:'Week of Jun 1–7',  d:'Jun 6',  n:8,  s:'Generating…', I:Clock,    c:'#F59E0B',bg:'#FFFBEB'},
              {l:'Week of May 25–31',d:'May 30', n:12, s:'Ready',       I:FileText, c:'#2563EB',bg:'#EFF6FF'},
              {l:'Week of May 18–24',d:'May 23', n:9,  s:'Ready',       I:FileText, c:'#2563EB',bg:'#EFF6FF'},
            ].map((r,i)=>(
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-card border border-gray-100">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:r.bg}}>
                  <r.I className="w-6 h-6" style={{color:r.c}}/>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary text-sm">{r.l}</p>
                  <p className="text-xs text-text-muted mt-0.5">{r.n} tasks · {r.d}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:r.bg,color:r.c}}>{r.s}</span>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-info flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-text-secondary leading-relaxed">Reports auto-generated every Friday at 11:00 PM and emailed to management.</p>
            </div>
          </div>
        )}
        <div className="h-4"/>
      </div>
      <BottomNav role="supervisor"/>
    </div>
  );
}
