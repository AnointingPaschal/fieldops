'use client';
import { useState } from 'react';
import { Search, Package, Plus, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_INVENTORY } from '@/data/mockData';

const CATS = ['All','Signage','Traffic Control','Barricades','Lighting','PPE'];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const filtered = MOCK_INVENTORY.filter(i =>
    (cat==='All'||i.category===cat) && i.name.toLowerCase().includes(search.toLowerCase())
  );
  const total = MOCK_INVENTORY.reduce((s,i)=>s+i.total,0);
  const out   = MOCK_INVENTORY.reduce((s,i)=>s+i.out,0);
  const low   = MOCK_INVENTORY.filter(i=>i.available/i.total<0.3).length;

  const getStatus = (item: typeof MOCK_INVENTORY[0]) => {
    const p = item.available/item.total;
    if(p===0)   return {l:'Out', c:'#DC2626', bg:'rgba(220,38,38,0.10)'};
    if(p<0.3)   return {l:'Low', c:'#DC2626', bg:'rgba(220,38,38,0.10)'};
    if(p<0.5)   return {l:'Med', c:'#F59E0B', bg:'rgba(245,158,11,0.10)'};
    return           {l:'OK',  c:'#16A34A', bg:'rgba(22,163,74,0.10)'};
  };

  return (
    <div className="app-shell">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h1 className="text-2xl font-black text-text-primary">Inventory</h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center shadow-card bg-white border border-gray-200">
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 px-4 mb-4">
          {[
            {l:'Total', v:total, c:'#2563EB', bg:'#EFF6FF'},
            {l:'Out',   v:out,   c:'#F59E0B', bg:'#FFFBEB'},
            {l:'Low',   v:low,   c:'#DC2626', bg:'#FEF2F2'},
          ].map((s,i)=>(
            <div key={i} className="flex-1 rounded-2xl p-3 text-center border" style={{background:s.bg,borderColor:s.c+'30'}}>
              <p className="text-xl font-black" style={{color:s.c}}>{s.v}</p>
              <p className="text-[11px] font-semibold text-text-muted mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 mb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Search inventory…" value={search}
              onChange={e=>setSearch(e.target.value)} className="input pl-11" />
          </div>
        </div>

        {/* Category scroll */}
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                cat===c ? 'bg-navy text-white border-navy' : 'bg-white text-text-muted border-gray-200'
              }`}>{c}</button>
          ))}
        </div>

        {/* List */}
        <div className="section-card mx-4">
          {filtered.map(item=>{
            const status=getStatus(item);
            const pct=item.available/item.total;
            return (
              <div key={item.id} className="list-row">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary text-sm">{item.name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.category}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${pct*100}%`,background:status.c}}/>
                    </div>
                    <span className="text-[10px] font-bold" style={{color:status.c}}>{Math.round(pct*100)}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="status-badge" style={{background:status.bg,color:status.c}}>{status.l}</span>
                  <p className="text-xs font-bold text-text-primary mt-1">{item.available}<span className="text-text-muted font-normal">/{item.total}</span></p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-4"/>
      </div>
      <BottomNav role="supervisor" />
    </div>
  );
}
