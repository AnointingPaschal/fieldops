'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTimesheetWeek, fetchCurrentUser } from '@/lib/api';
import type { TimesheetEntry, Profile } from '@/types';

function getWeekStart(d = new Date()) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().split('T')[0];
}

function hoursFromEntry(e: TimesheetEntry): number {
  if (!e.clock_in || !e.clock_out) return 0;
  const [ih, im] = e.clock_in.split(':').map(Number);
  const [oh, om] = e.clock_out.split(':').map(Number);
  return Math.max(0, (oh * 60 + om - ih * 60 - im) / 60);
}

export default function TimesheetPage() {
  const [entries,  setEntries]  = useState<TimesheetEntry[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const weekStart = getWeekStart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const u = await fetchCurrentUser();
      setUser(u);
      if (u) {
        const e = await fetchTimesheetWeek(u.id, weekStart);
        setEntries(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const totalH  = entries.reduce((s, e) => s + hoursFromEntry(e), 0);
  const totalOT = Math.max(0, totalH - 40);
  const daysWorked = entries.filter(e => e.clock_in).length;

  // Build full week grid (Mon–Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const entry   = entries.find(e => e.date === dateStr) || null;
    return {
      label: d.toLocaleDateString('en-CA', { weekday:'short' }),
      date:  d.toLocaleDateString('en-CA', { month:'short', day:'numeric' }),
      full:  d.toLocaleDateString('en-CA', { weekday:'long' }),
      dateStr,
      entry,
      hours: entry ? hoursFromEntry(entry) : 0,
    };
  });

  return (
    <AppShell role="worker" userName={user?.name || 'Worker'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Timesheet</h1>
            <p className="text-[11px] text-text-muted">
              Week of {new Date(weekStart).toLocaleDateString('en-CA', { month:'long', day:'numeric' })}
            </p>
          </div>
          <button className="btn-ghost text-[12px]"><Download className="w-3.5 h-3.5" />Export PDF</button>
        </div>

        {/* Summary card */}
        <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
          className="card bg-navy border-navy text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Current Week</p>
              <p className="text-white text-[15px] font-bold">
                {new Date(weekStart).toLocaleDateString('en-CA',{ month:'long', day:'numeric' })}
                {' — '}
                {new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6))
                  .toLocaleDateString('en-CA',{ month:'long', day:'numeric', year:'numeric' })}
              </p>
            </div>
            <span className="badge bg-sky/20 text-sky border border-sky/25 text-[10px]">Active</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { l:'Total Hours',  v: loading ? '—' : `${totalH.toFixed(1)}h`,  c:'text-white'      },
              { l:'Overtime',     v: loading ? '—' : `${totalOT.toFixed(1)}h`, c:'text-warn'       },
              { l:'Days Worked',  v: loading ? '—' : `${daysWorked}`,           c:'text-sky-light'  },
            ].map((s, i) => (
              <div key={i}>
                <p className={`text-2xl font-black leading-none ${s.c}`}>{s.v}</p>
                <p className="text-slate-400 text-[10px] mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Weekly progress (40h standard)</span>
              <span className="text-white font-bold">
                {loading ? '—' : `${Math.min(Math.round((totalH/40)*100), 100)}%`}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-sky rounded-full"
                initial={{ width:0 }} animate={{ width: `${Math.min((totalH/50)*100, 100)}%` }}
                transition={{ duration:0.6, ease:'easeOut' }} />
            </div>
          </div>
        </motion.div>

        {/* Daily log */}
        <div>
          <h2 className="sec-title mb-3">Daily Log</h2>
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skel h-14 rounded-lg" />)}</div>
            ) : (
              <div>
                {weekDays.map(({ label, date, full, dateStr, entry, hours }) => {
                  const exp   = expanded === dateStr;
                  const ot    = Math.max(0, hours - 8);
                  const hasData = !!entry?.clock_in;
                  return (
                    <div key={dateStr} className={exp ? 'bg-slate-50/50' : ''}>
                      <button onClick={() => setExpanded(exp ? null : dateStr)}
                        className="row w-full text-left hover:bg-slate-50 transition-colors">
                        {/* Day badge */}
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-line flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-black text-text-muted uppercase">{label}</span>
                          <span className="text-base font-black text-text-primary leading-none">{date.split(' ')[1]}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-text-primary">{full}</p>
                          {hasData ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="badge bg-pass/10 text-pass text-[10px]">{entry!.clock_in}</span>
                              <span className="text-text-muted text-[10px]">→</span>
                              <span className="badge bg-fail/10 text-fail text-[10px]">{entry!.clock_out || 'In progress'}</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-text-muted mt-0.5">No clock-in recorded</p>
                          )}
                        </div>

                        <div className="text-right shrink-0 mr-1">
                          {hasData ? (
                            <>
                              <p className="text-[16px] font-black text-text-primary leading-none">{hours.toFixed(2)}h</p>
                              {ot > 0 && <p className="text-[10px] font-bold text-warn">+{ot.toFixed(2)} OT</p>}
                            </>
                          ) : (
                            <p className="text-[12px] text-text-muted">—</p>
                          )}
                        </div>

                        {exp ? <ChevronUp className="w-4 h-4 text-slate-300 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {exp && (
                          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                            exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}
                            className="overflow-hidden">
                            <div className="px-4 pb-3 pt-2 border-t border-line">
                              {hasData ? (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[12px]">
                                    <span className="text-text-muted">Clock in</span>
                                    <span className="font-semibold text-text-primary">{entry!.clock_in}</span>
                                  </div>
                                  <div className="flex justify-between text-[12px]">
                                    <span className="text-text-muted">Clock out</span>
                                    <span className="font-semibold text-text-primary">{entry!.clock_out || '—'}</span>
                                  </div>
                                  <div className="flex justify-between text-[12px] pt-1.5 border-t border-line">
                                    <span className="text-text-muted font-medium">Shift total</span>
                                    <span className="font-black text-navy">{hours.toFixed(2)} hours</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[12px] text-text-muted italic">No shift data for this day</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="bg-sky/5 border border-sky/15 rounded-xl p-3.5 flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-sky shrink-0 mt-0.5" />
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Timesheet PDF is auto-generated every Friday at 11:00 PM and sent to management for payroll.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
