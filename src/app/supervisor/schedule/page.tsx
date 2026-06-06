'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_WORKERS } from '@/data/mockData';
import { Download } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = ['Jun 1', 'Jun 2', 'Jun 3', 'Jun 4', 'Jun 5', 'Jun 6', 'Jun 7'];

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(5);
  const [avail, setAvail] = useState<Record<string, Record<number, boolean>>>(
    Object.fromEntries(MOCK_WORKERS.map(w => [w.id, { 0: true, 1: true, 2: true, 3: true, 4: true, 5: w.available, 6: false }]))
  );

  const toggle = (wId: string, day: number) =>
    setAvail(p => ({ ...p, [wId]: { ...p[wId], [day]: !p[wId][day] } }));

  const availCount = MOCK_WORKERS.filter(w => avail[w.id]?.[selectedDay]).length;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Scheduling</h1>
            <p className="text-xs text-text-muted">Manage worker availability for the week</p>
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export Schedule
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Day picker */}
          <div className="grid grid-cols-7 gap-3">
            {DAYS.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`rounded-2xl p-4 text-center transition-all ${
                  selectedDay === i
                    ? 'bg-gradient-primary shadow-glow text-white'
                    : 'bg-card border border-border text-text-secondary hover:border-primary/30'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide">{day}</p>
                <p className="text-2xl font-black mt-1">{DATES[i].split(' ')[1]}</p>
                <p className="text-xs mt-1 opacity-70">{DATES[i].split(' ')[0]}</p>
              </button>
            ))}
          </div>

          {/* Available count */}
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <span className="text-success font-black text-lg">{availCount}</span>
            </div>
            <div>
              <p className="font-bold text-success">{availCount} of {MOCK_WORKERS.length} workers available</p>
              <p className="text-xs text-text-muted">{DAYS[selectedDay]}, {DATES[selectedDay]}</p>
            </div>
          </div>

          {/* Worker grid */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: '280px 1fr auto' }}>
              <div className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Worker</div>
              <div className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Week Availability</div>
              <div className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider w-32 text-center">{DAYS[selectedDay]}</div>
            </div>

            {MOCK_WORKERS.map(w => {
              const isAvailToday = avail[w.id]?.[selectedDay];
              return (
                <div key={w.id}
                  className={`grid border-b border-border last:border-0 hover:bg-elevated/30 transition-colors ${isAvailToday ? '' : 'opacity-60'}`}
                  style={{ gridTemplateColumns: '280px 1fr auto' }}>
                  {/* Worker info */}
                  <div className="px-6 py-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm relative"
                      style={{ background: w.color + '25', borderColor: w.color + '60', color: w.color }}>
                      {w.initials}
                      {w.available && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-card rounded-full" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{w.name}</p>
                      <p className="text-xs text-text-muted">{w.title}</p>
                    </div>
                  </div>

                  {/* Day grid */}
                  <div className="px-6 py-5 flex items-center gap-2">
                    {DAYS.map((d, di) => (
                      <button key={di}
                        onClick={() => toggle(w.id, di)}
                        title={`${d} — click to toggle`}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                          di === selectedDay ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
                        } ${avail[w.id]?.[di]
                          ? 'bg-success/20 border-success/40 text-success hover:bg-success/30'
                          : 'bg-elevated border-border text-text-muted hover:border-primary/30'
                        }`}>
                        {d[0]}
                      </button>
                    ))}
                  </div>

                  {/* Today toggle */}
                  <div className="px-6 py-5 w-32 flex items-center justify-center">
                    <button
                      onClick={() => toggle(w.id, selectedDay)}
                      className={`relative w-12 h-6 rounded-full transition-all ${isAvailToday ? 'bg-success' : 'bg-elevated border border-border'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isAvailToday ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
