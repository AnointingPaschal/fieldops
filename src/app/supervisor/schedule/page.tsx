'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_WORKERS } from '@/data/mockData';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DATES = ['Jun 1','Jun 2','Jun 3','Jun 4','Jun 5','Jun 6','Jun 7'];

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(5);
  const [avail, setAvail] = useState<Record<string, Record<number, boolean>>>(
    Object.fromEntries(MOCK_WORKERS.map(w => [w.id, {0:true,1:true,2:true,3:true,4:true,5:w.available,6:false}]))
  );

  const toggle = (wId: string, day: number) =>
    setAvail(p => ({ ...p, [wId]: { ...p[wId], [day]: !p[wId][day] } }));

  const availCount = MOCK_WORKERS.filter(w => avail[w.id]?.[selectedDay]).length;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-black text-text-primary">Scheduling</h1>
            <p className="text-xs text-text-muted">Manage worker availability</p>
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Export</button>
        </header>

        <div className="p-8 space-y-6">
          {/* Day picker */}
          <div className="grid grid-cols-7 gap-3">
            {DAYS.map((day, i) => (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`rounded-2xl p-4 text-center border-2 transition-all ${
                  selectedDay === i
                    ? 'bg-gradient-primary border-transparent shadow-glow text-white'
                    : 'bg-white border-border text-text-secondary hover:border-primary/30 shadow-sm'
                }`}>
                <p className="text-xs font-bold uppercase tracking-wide">{day}</p>
                <p className="text-2xl font-black mt-1">{DATES[i].split(' ')[1]}</p>
                <p className="text-xs mt-1 opacity-60">{DATES[i].split(' ')[0]}</p>
              </button>
            ))}
          </div>

          {/* Count banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-success font-black text-lg">{availCount}</span>
            </div>
            <div>
              <p className="font-bold text-green-800">{availCount} of {MOCK_WORKERS.length} workers available</p>
              <p className="text-xs text-green-600">{DAYS[selectedDay]}, {DATES[selectedDay]}</p>
            </div>
          </div>

          {/* Worker grid */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
            <div className="grid border-b border-border bg-slate-50" style={{ gridTemplateColumns: '280px 1fr auto' }}>
              <div className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Worker</div>
              <div className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Week Availability</div>
              <div className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider w-32 text-center">{DAYS[selectedDay]}</div>
            </div>

            {MOCK_WORKERS.map(w => {
              const isAvail = avail[w.id]?.[selectedDay];
              return (
                <div key={w.id} className={`grid border-b border-border last:border-0 hover:bg-slate-50/60 transition-colors ${!isAvail ? 'opacity-60' : ''}`}
                  style={{ gridTemplateColumns: '280px 1fr auto' }}>
                  <div className="px-6 py-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm relative"
                      style={{ background: w.color + '15', borderColor: w.color + '40', color: w.color }}>
                      {w.initials}
                      {w.available && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">{w.name}</p>
                      <p className="text-xs text-text-muted">{w.title}</p>
                    </div>
                  </div>

                  <div className="px-6 py-5 flex items-center gap-2">
                    {DAYS.map((d, di) => (
                      <button key={di} onClick={() => toggle(w.id, di)} title={d}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border-2 ${
                          di === selectedDay ? 'ring-2 ring-primary ring-offset-1' : ''
                        } ${avail[w.id]?.[di]
                          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}>
                        {d[0]}
                      </button>
                    ))}
                  </div>

                  <div className="px-6 py-5 w-32 flex items-center justify-center">
                    <button onClick={() => toggle(w.id, selectedDay)}
                      className={`relative w-12 h-6 rounded-full transition-all ${isAvail ? 'bg-success' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isAvail ? 'left-6' : 'left-0.5'}`} />
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
