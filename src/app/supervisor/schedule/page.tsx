'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { WORKERS } from '@/data/mockData';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DATES= ['Jun 1','Jun 2','Jun 3','Jun 4','Jun 5','Jun 6','Jun 7'];

export default function SchedulePage() {
  const [day, setDay] = useState(4);
  const [avail, setAvail] = useState<Record<string,Record<number,boolean>>>(
    Object.fromEntries(WORKERS.map(w=>[w.id,{0:true,1:true,2:true,3:true,4:true,5:w.avail,6:false}]))
  );
  const toggle=(id:string,d:number)=>setAvail(p=>({...p,[id]:{...p[id],[d]:!p[id][d]}}));
  const count=WORKERS.filter(w=>avail[w.id]?.[day]).length;

  return (
    <AppShell role="supervisor" userName="Justin Okeke">
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">Scheduling</h1>
            <p className="text-sm text-text-muted">Manage worker availability</p>
          </div>
          <button className="btn-ghost"><Download className="w-4 h-4"/>Export</button>
        </div>

        {/* Day picker */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DAYS.map((d,i)=>(
            <button key={i} onClick={()=>setDay(i)}
              className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 shrink-0 transition-all ${
                day===i?'bg-navy border-navy text-white':'bg-white border-line text-text-secondary hover:border-slate-300'
              }`}>
              <span className="text-[10px] font-bold uppercase">{d}</span>
              <span className="text-xl font-black mt-0.5">{DATES[i].split(' ')[1]}</span>
              <span className="text-[9px] mt-0.5 opacity-60">{DATES[i].split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-pass-soft border border-pass-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-pass-border flex items-center justify-center font-black text-pass text-lg">{count}</div>
          <div>
            <p className="font-bold text-pass text-sm">{count} of {WORKERS.length} workers available</p>
            <p className="text-xs text-green-600">{DAYS[day]}, {DATES[day]}</p>
          </div>
        </div>

        {/* Worker table — desktop */}
        <div className="card !p-0 overflow-hidden hidden md:block">
          <div className="grid border-b border-line bg-slate-50" style={{gridTemplateColumns:'260px 1fr 120px'}}>
            {['Worker','Week Grid',DAYS[day]].map(h=>(
              <div key={h} className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">{h}</div>
            ))}
          </div>
          {WORKERS.map(w=>{
            const on=avail[w.id]?.[day];
            return (
              <div key={w.id} className={`grid border-b border-line last:border-0 hover:bg-slate-50/60 ${!on?'opacity-50':''}`}
                style={{gridTemplateColumns:'260px 1fr 120px'}}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-black relative shrink-0">
                    {w.name.split(' ').map(n=>n[0]).join('')}
                    {w.avail&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pass border-2 border-white rounded-full"/>}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">{w.name}</p>
                    <p className="text-xs text-text-muted">{w.title}</p>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center gap-2">
                  {DAYS.map((d,di)=>(
                    <button key={di} onClick={()=>toggle(w.id,di)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border-2 transition-all ${
                        di===day?'ring-2 ring-sky ring-offset-1':''}
                        ${avail[w.id]?.[di]?'bg-pass-soft border-pass-border text-pass hover:bg-green-100':'bg-slate-50 border-line text-text-muted hover:border-slate-300'
                      }`}>{d[0]}</button>
                  ))}
                </div>
                <div className="px-5 py-4 flex items-center justify-center">
                  <button onClick={()=>toggle(w.id,day)}
                    className={`relative w-12 h-6 rounded-full transition-all ${on?'bg-pass':'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on?'left-6':'left-0.5'}`}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Worker cards — mobile */}
        <div className="md:hidden space-y-3">
          {WORKERS.map(w=>{
            const on=avail[w.id]?.[day];
            return (
              <div key={w.id} className={`card flex items-center gap-4 ${!on?'opacity-50':''}`}>
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-xs font-black relative shrink-0">
                  {w.name.split(' ').map(n=>n[0]).join('')}
                  {w.avail&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pass border-2 border-white rounded-full"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary">{w.name}</p>
                  <p className="text-xs text-text-muted">{w.title}</p>
                  <div className="flex gap-1 mt-2">
                    {DAYS.map((_,di)=>(
                      <button key={di} onClick={()=>toggle(w.id,di)}
                        className={`w-7 h-7 rounded-md text-[9px] font-bold border ${di===day?'ring-1 ring-sky ring-offset-1':''}
                          ${avail[w.id]?.[di]?'bg-pass-soft border-pass-border text-pass':'bg-slate-50 border-line text-text-muted'}`}>
                        {DAYS[di][0]}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={()=>toggle(w.id,day)}
                  className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${on?'bg-pass':'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on?'left-6':'left-0.5'}`}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
