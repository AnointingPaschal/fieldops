'use client';
import { useState } from 'react';
import { Search, Barcode, Plus, TrendingDown } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_INVENTORY } from '@/data/mockData';

const CATEGORIES = ['All', 'Signage', 'Traffic Control', 'Barricades', 'Lighting', 'PPE'];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = MOCK_INVENTORY.filter(i =>
    (cat === 'All' || i.category === cat) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = MOCK_INVENTORY.reduce((s, i) => s + i.total, 0);
  const outItems = MOCK_INVENTORY.reduce((s, i) => s + i.out, 0);
  const lowStock = MOCK_INVENTORY.filter(i => i.available / i.total < 0.3).length;

  const getStatus = (item: typeof MOCK_INVENTORY[0]) => {
    const pct = item.available / item.total;
    if (pct === 0) return { label: 'Out', color: '#FF3B5C', bg: 'rgba(255,59,92,0.12)' };
    if (pct < 0.3) return { label: 'Low', color: '#FF3B5C', bg: 'rgba(255,59,92,0.12)' };
    if (pct < 0.5) return { label: 'Med', color: '#FFB800', bg: 'rgba(255,184,0,0.12)' };
    return { label: 'OK', color: '#22D46E', bg: 'rgba(34,212,110,0.12)' };
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role="supervisor" userName="Justin Okeke" userInitials="JO" />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-lg border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Inventory</h1>
            <p className="text-xs text-text-muted">Real-time stock levels</p>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Items', value: totalItems, color: '#3B9EFF' },
              { label: 'Out / Rented', value: outItems, color: '#FFB800' },
              { label: 'Low Stock', value: lowStock, color: '#FF3B5C', icon: TrendingDown },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm text-text-secondary font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-11"
              />
            </div>
            <button className="btn-ghost flex items-center gap-2 text-sm">
              <Barcode className="w-4 h-4" /> Scan Barcode
            </button>
            <div className="flex gap-2 ml-auto">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                    cat === c ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-elevated text-text-muted border border-border hover:text-white'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Item Name', 'Category', 'Barcode', 'Available', 'Total', 'Out', 'Status', 'Stock Level'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const status = getStatus(item);
                  const pct = item.available / item.total;
                  return (
                    <tr key={item.id} className="hover:bg-elevated/50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white group-hover:text-primary transition-colors">{item.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-elevated text-text-secondary px-2.5 py-1 rounded-full font-medium">
                          {item.category}
                        </span>
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
                        <span className="badge" style={{ background: status.bg, color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden min-w-[80px]">
                            <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: status.color }} />
                          </div>
                          <span className="text-xs text-text-muted font-medium">{Math.round(pct * 100)}%</span>
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
