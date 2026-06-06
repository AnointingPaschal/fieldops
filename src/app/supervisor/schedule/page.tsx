'use client';
import { useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_WORKERS } from '@/data/mockData';
import { Download } from 'lucide-react';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DATES = ['1','2','3','4','5','6','7'];

export default function SchedulePage() {
  const [day, setDay] = useState(5);
  const [avail, setAvail] = useState<Record<string,Record<number,boolean>>>(
    Object.fromEntries(MOCK_WORKERS.map(w=>[w.id,{0:true,1:true,2:true,3:true,4:true,5:w.available,6:false}]))
  );
  const toggle=(wId:string,d:number)=>setAvail(p=>({...p,[wId]:{...p[wId],[d]:!p[wId][d]}}));
  const count=MOCK_WORKERS.filter(w=>avail[w.id]?.[day]).length;

  return (
    <div className="app-shell">
      <div className="page-content">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h1 className="text-2xl font-black text-text-primary">Schedule</h1>
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Download className="w-4 h-4 text-text-secondary"/>
          </button>
        </div>

        {/* Day picker */}
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          {DAYS.map((d,i)=>(
            <button key={i} onClick={()=>setDay(i)}
              className={`flex flex-col items-center px-3 py-3 rounded-2xl flex-shrink-0 border transition-all ${
                day===i ? 'text-white border-transparent shadow-glow' : 'bg-white text-text-secondary border-gray-200'
              }`}
              style={day===i?{background:'linear-gradient(135deg,#FF6B35,#FF9A00)'}:{}}>
              <span className="text-[10px] font-bold uppercase">{d}</span>
              <span className="text-xl font-black mt-0.5">{DATES[i]}</span>
            </button>
          ))}
        </div>

        {/* Count banner */}
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <span className="text-success font-black text-lg">{count}</span>
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">{count} workers available</p>
            <p className="text-xs text-green-600">{DAYS[day]}, Jun {DATES[day]}</p>
          </div>
        </div>

        {/* Workers */}
        <div className="section-card mx-4">
          {MOCK_WORKERS.map(w=>{
            const isAvail=avail[w.id]?.[day];
            return (
              <div key={w.id} className={`list-row ${!isAvail?'opacity-50':''}`}>
                <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center font-black text-sm flex-shrink-0 relative"
                  style={{background:w.color+'18',borderColor:w.color+'50',color:w.color}}>
                  {w.initials}
                  {w.available&&<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full"/>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary text-sm">{w.name}</p>
                  <p className="text-xs text-text-muted">{w.title}</p>
                  {/* Mini week grid */}
                  <div className="flex gap-1 mt-1.5">
                    {DAYS.map((_,di)=>(
                      <button key={di} onClick={()=>toggle(w.id,di)}
                        className={`w-6 h-6 rounded-md text-[9px] font-bold border transition-all ${
                          di===day?'ring-1 ring-primary ring-offset-1':''}
                          ${avail[w.id]?.[di]?'bg-green-100 border-green-300 text-green-700':'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                        {DAYS[di][0]}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={()=>toggle(w.id,day)}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${isAvail?'bg-success':'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isAvail?'left-6':'left-0.5'}`}/>
                </button>
              </div>
            );
          })}
        </div>
        <div className="h-4"/>
      </div>
      <BottomNav role="supervisor"/>
    </div>
  );
}
