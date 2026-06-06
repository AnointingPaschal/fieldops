'use client';
import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_TIMESHEET } from '@/data/mockData';

export default function TimesheetPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalHours = MOCK_TIMESHEET.reduce((s, e) => s + e.hours, 0);
  const totalOT = MOCK_TIMESHEET.reduce((s, e) => s + e.ot, 0);
  const totalTasks = MOCK_TIMESHEET.reduce((s, e) => s + e.tasks, 0);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="worker" userName="Marcus Reid" userInitials="MR" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Timesheet</h1>
            <p className="text-xs text-text-muted">Week of Jun 1–7, 2026</p>
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Summary card */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at 90% 50%, rgba(255,107,53,0.3) 0%, transparent 60%)' }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Current Week</p>
                  <h2 className="text-2xl font-black text-white">Jun 1 — Jun 7, 2026</h2>
                </div>
                <span className="badge bg-amber/15 text-amber border border-amber/30">In Progress</span>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Total Hours', value: totalHours.toFixed(1), color: '#FF6B35' },
                  { label: 'Overtime', value: totalOT.toFixed(1), color: '#FFB800' },
                  { label: 'Tasks Done', value: totalTasks, color: '#3B9EFF' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-4xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-sm text-text-secondary font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-2">
                  <span>Weekly progress (40h standard)</span>
                  <span className="text-primary font-bold">{Math.round((totalHours / 40) * 100)}%</span>
                </div>
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${Math.min((totalHours / 50) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Daily log */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Daily Log</h2>
            <div className="space-y-3">
              {MOCK_TIMESHEET.map(entry => {
                const isExp = expanded === entry.id;
                return (
                  <div key={entry.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${isExp ? 'border-primary/40' : 'border-border'}`}>
                    <button
                      onClick={() => setExpanded(isExp ? null : entry.id)}
                      className="w-full flex items-center gap-5 p-5 text-left">
                      {/* Day badge */}
                      <div className="w-14 h-14 rounded-xl bg-elevated flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{entry.day.slice(0, 3)}</span>
                        <span className="text-2xl font-black text-white leading-none">{entry.date.split(' ')[1]}</span>
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-white">{entry.day}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1.5 text-xs bg-success/15 text-success px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {entry.clockIn}
                          </span>
                          <span className="text-text-muted text-xs">→</span>
                          <span className="flex items-center gap-1.5 text-xs bg-danger/15 text-danger px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {entry.clockOut}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-black text-white">{entry.hours.toFixed(2)}h</p>
                        {entry.ot > 0 && <p className="text-xs font-bold text-amber">+{entry.ot.toFixed(2)}h OT</p>}
                      </div>
                      {isExp ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
                    </button>

                    {isExp && (
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        {entry.tasks > 0 ? (
                          <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tasks Completed</p>
                            <p className="text-sm text-success flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center text-[10px]">✓</span>
                              {entry.tasks} task{entry.tasks > 1 ? 's' : ''} completed this day
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted italic">No tasks this day</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-border flex justify-between">
                          <span className="text-sm text-text-muted">Shift total</span>
                          <span className="font-black text-primary">{entry.hours.toFixed(2)} hours</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-info/10 border border-info/30 rounded-2xl p-4 flex items-start gap-3 mt-4">
              <Clock className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">Your weekly timesheet PDF is automatically generated every Friday at 11:00 PM and sent to management for payroll processing.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
