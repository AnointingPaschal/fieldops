'use client';
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { INVENTORY } from '@/data/mockData';

const CATS = ['All','Signage','Traffic Control','Barricades','Lighting','PPE'];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('All');
  const filtered = INVENTORY.filter(i =>
    (cat==='All'||i.cat===cat) && i.name.toLowerCase().includes(search.toLowerCase())
  );
  const total = INVENTORY.reduce((s,i)=>s+i.total,0);
  const out   = INVENTORY.reduce((s,i)=>s+i.out,0);
  const low   = INVENTORY.filter(i=>i.avail/i.total<0.3).length;
  const getS  = (i: typeof INVENTORY[0]) => {
    const p = i.avail/i.total;
    if(p===0)  return {l:'Out',c:'#DC2626',bg:'#FEF2F2'};
    if(p<0.3)  return {l:'Low',c:'#DC2626',bg:'#FEF2F2'};
    if(p<0.5)  return {l:'Med',c:'#D97706',bg:'#FFFBEB'};
    return          {l:'OK', c:'#16A34A',bg:'#F0FDF4'};
  };

  return (
    <AppShell role="supervisor" userName="Justin Okeke">
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">Inventory</h1>
            <p className="text-sm text-text-muted">Real-time stock levels</p>
          </div>
          <button className="btn-navy"><Plus className="w-4 h-4"/>Add Item</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{l:'Total Items',v:total,c:'text-sky'},{l:'Out/Rented',v:out,c:'text-warn'},{l:'Low Stock',v:low,c:'text-fail'}].map((s,i)=>(
            <div key={i} className="card text-center">
              <p className={`text-3xl font-black ${s.c}`}>{s.v}</p>
              <p className="text-xs text-text-muted font-semibold mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Search + cats */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
            <input type="text" placeholder="Search inventory…" value={search}
              onChange={e=>setSearch(e.target.value)} className="input pl-11"/>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATS.map(c=>(
              <button key={c} onClick={()=>setCat(c)} className={cat===c?'chip-on':'chip-off'}>{c}</button>
            ))}
          </div>
        </div>

        {/* Table (desktop) / Cards (mobile) */}
        <div className="card !p-0 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="tbl">
              <thead><tr>
                {['Item','Category','Available','Total','Out','Status','Stock'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(item=>{
                  const s=getS(item); const pct=item.avail/item.total;
                  return (
                    <tr key={item.id}>
                      <td><p className="font-semibold text-text-primary">{item.name}</p></td>
                      <td><span className="badge bg-slate-100 text-text-secondary">{item.cat}</span></td>
                      <td><span className="font-bold" style={{color:s.c}}>{item.avail}</span></td>
                      <td className="text-text-secondary">{item.total}</td>
                      <td className="text-text-muted">{item.out}</td>
                      <td><span className="badge" style={{background:s.bg,color:s.c}}>{s.l}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-24 progress-track">
                            <div className="progress-fill" style={{width:`${pct*100}%`,background:s.c}}/>
                          </div>
                          <span className="text-xs text-text-muted">{Math.round(pct*100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile list */}
          <div className="md:hidden">
            {filtered.map(item=>{
              const s=getS(item); const pct=item.avail/item.total;
              return (
                <div key={item.id} className="row">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text-primary text-sm">{item.name}</p>
                      <span className="badge" style={{background:s.bg,color:s.c}}>{s.l}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{item.cat}</p>
                    <div className="progress-track mt-1.5 w-32">
                      <div className="progress-fill" style={{width:`${pct*100}%`,background:s.c}}/>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{color:s.c}}>{item.avail}</p>
                    <p className="text-xs text-text-muted">of {item.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
