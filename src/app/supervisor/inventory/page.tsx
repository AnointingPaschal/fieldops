'use client';
import { useState } from 'react';
import { Search, Barcode, Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_INVENTORY } from '@/data/mockData';

const CATEGORIES = ['All', 'Signage', 'Traffic Control', 'Barricades', 'Lighting', 'PPE'];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = MOCK_INVENTORY.filter(i =>
    (cat === 'All' || i.category === cat) && i.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = MOCK_INVENTORY.reduce((s, i) => s + i.total, 0);
  const outItems   = MOCK_INVENTORY.reduce((s, i) => s + i.out, 0);
  const lowStock   = MOCK_INVENTORY.filter(i => i.available / i.total < 0.3).length;

  const getStatus = (item: typeof MOCK_INVENTORY[0]) => {
    const pct = item.available / item.total;
    if (pct === 0)  return { label: 'Out', color: '#DC2626', bg: '#FEF2F2' };
    if (pct < 0.3)  return { label: 'Low', color: '#DC2626', bg: '#FEF2F2' };
    if (pct < 0.5)  return { label: 'Med', color: '#F59E0B', bg: '#FFFBEB' };
    return               { label: 'OK',  color: '#16A34A', bg: '#F0FDF4' };
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-black text-text-primary">Inventory</h1>
            <p className="text-xs text-text-muted">Real-time stock levels</p>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Item</button>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Items',  value: totalItems, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
              { label: 'Out / Rented', value: outItems,   color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
              { label: 'Low Stock',    value: lowStock,   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: s.bg, borderColor: s.border }}>
                <p className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search inventory..." value={search}
                onChange={e => setSearch(e.target.value)} className="input pl-11" />
            </div>
            <button className="btn-ghost flex items-center gap-2 text-sm"><Barcode className="w-4 h-4" /> Scan Barcode</button>
            <div className="flex gap-2 ml-auto">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                    cat === c ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-muted border-border hover:border-slate-300'
                  }`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  {['Item Name','Category','Barcode','Available','Total','Out','Status','Stock Level'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const status = getStatus(item);
                  const pct = item.available / item.total;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">{item.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 text-text-secondary px-2.5 py-1 rounded-full font-medium">{item.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-text-muted">#{item.barcode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold" style={{ color: status.color }}>{item.available}</span>
                      </td>
                      <td className="px-5 py-4 text-text-secondary font-medium">{item.total}</td>
                      <td className="px-5 py-4 text-text-muted">{item.out}</td>
                      <td className="px-5 py-4">
                        <span className="badge text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                            <div className="h-full rounded-full" style={{ width: `${pct*100}%`, background: status.color }} />
                          </div>
                          <span className="text-xs text-text-muted font-medium">{Math.round(pct*100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
