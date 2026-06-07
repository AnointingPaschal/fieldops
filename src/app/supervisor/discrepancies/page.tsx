'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Package, Building2, ChevronRight,
  ChevronDown, ChevronUp, RefreshCw, FileText,
  Phone, Mail, CheckCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchDiscrepancyTasks, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';
import { triggerNav } from '@/lib/navigation';

interface ContractorGroup {
  contractor: { name:string; address?:string|null; contact_name?:string|null; phone?:string|null };
  tasks:      { task_id:string; type:string; completed_at:string|null; items:any[] }[];
  totalDamaged: number;
  totalMissing: number;
}

export default function DiscrepanciesPage() {
  const router = useRouter();
  const [data,     setData]     = useState<any[]>([]);
  const [user,     setUser]     = useState<Profile|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const [rows, u] = await Promise.all([fetchDiscrepancyTasks(), fetchCurrentUser()]);
    setData(rows); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grouped: ContractorGroup[] = [];
  data.forEach(row => {
    const cn = row.task?.contractor?.name || 'Unknown Contractor';
    let g = grouped.find(g => g.contractor.name === cn);
    if (!g) {
      g = { contractor: row.task?.contractor || { name: cn }, tasks: [], totalDamaged: 0, totalMissing: 0 };
      grouped.push(g);
    }
    g.totalDamaged += row.quantity_damaged || 0;
    g.totalMissing += row.quantity_missing || 0;
    let t = g.tasks.find(t => t.task_id === row.task_id);
    if (!t) { t = { task_id:row.task_id, type:row.task?.type, completed_at:row.task?.completed_at, items:[] }; g.tasks.push(t); }
    t.items.push(row);
  });

  const toggle = (name: string) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Item Discrepancies</h1>
            <p className="text-[11px] text-text-muted">Damaged &amp; missing items — claim from contractors</p>
          </div>
          <button onClick={load} className="btn-icon">
            <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin text-sky':'text-text-muted'}`}/>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {l:'Contractors', v:grouped.length,                                         c:'text-sky',  I:Building2   },
            {l:'Not Found',   v:grouped.reduce((s,g)=>s+g.totalMissing,0),              c:'text-fail', I:AlertTriangle},
            {l:'Damaged',     v:grouped.reduce((s,g)=>s+g.totalDamaged,0),              c:'text-warn', I:Package     },
          ].map(({l,v,c,I},i)=>(
            <motion.div key={i} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="card text-center py-3">
              <I className={`w-4 h-4 ${c} mx-auto mb-1`}/>
              <p className={`text-xl font-black ${c}`}>{loading?'—':v}</p>
              <p className="text-[10px] text-text-muted font-medium">{l}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i=><div key={i} className="skel h-20 rounded-xl"/>)}</div>
        ) : grouped.length===0 ? (
          <div className="card">
            <div className="empty py-12">
              <div className="empty-icon"><CheckCircle className="w-6 h-6 text-pass"/></div>
              <p className="text-[13px] font-semibold text-text-primary">All clear!</p>
              <p className="text-[11px] text-text-muted">No damaged or missing items.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((g, gi) => {
              const isOpen = !!expanded[g.contractor.name];
              return (
                <motion.div key={gi} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                  transition={{delay:gi*0.07}} className="card overflow-hidden !p-0">

                  {/* ── Contractor header (always visible) ── */}
                  <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
                    onClick={()=>toggle(g.contractor.name)}>
                    <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
                      {g.contractor.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-text-primary">{g.contractor.name}</p>
                      {g.contractor.address&&<p className="text-[11px] text-text-muted truncate">{g.contractor.address}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {g.totalMissing>0&&<span className="badge bg-fail/10 text-fail text-[10px]"><AlertTriangle className="w-3 h-3"/>{g.totalMissing} not found</span>}
                        {g.totalDamaged>0&&<span className="badge bg-warn/10 text-warn text-[10px]"><Package className="w-3 h-3"/>{g.totalDamaged} damaged</span>}
                        <span className="text-[10px] text-text-muted">{g.tasks.length} task{g.tasks.length!==1?'s':''}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-slate-400">
                      {isOpen?<ChevronUp className="w-5 h-5"/>:<ChevronDown className="w-5 h-5"/>}
                    </div>
                  </button>

                  {/* ── Expanded breakdown ── */}
                  <AnimatePresence>
                    {isOpen&&(
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                        exit={{height:0,opacity:0}} transition={{duration:0.22}} className="overflow-hidden">
                        <div className="border-t border-line">

                          {g.tasks.map(t=>(
                            <div key={t.task_id} className="border-b border-line last:border-0">
                              {/* Task subheader */}
                              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={()=>{triggerNav();router.push(`/supervisor/tasks/${t.task_id}`);}}>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wide">{t.type}</span>
                                  {t.completed_at&&<span className="text-[10px] text-text-muted">· {new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={e=>{e.stopPropagation();triggerNav();router.push(`/worker/tasks/${t.task_id}/report`);}}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-sky hover:underline">
                                    <FileText className="w-3.5 h-3.5"/> PDF
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-slate-300"/>
                                </div>
                              </div>

                              {/* Items breakdown */}
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px]" style={{borderCollapse:'collapse'}}>
                                  <thead>
                                    <tr className="bg-slate-50/60">
                                      {['Item','Assigned','Recovered','Damaged','Not Found','Notes'].map(h=>(
                                        <th key={h} className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wide border-b border-line">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {t.items.map((r:any,ri:number)=>(
                                      <tr key={ri} className={`border-b border-line last:border-0 ${ri%2===0?'':'bg-slate-50/40'}`}>
                                        <td className="px-4 py-2.5 text-[12px] font-semibold text-text-primary">{r.item?.name}</td>
                                        <td className="px-4 py-2.5 text-[12px] text-center text-text-secondary">{r.quantity_assigned}</td>
                                        <td className="px-4 py-2.5 text-[12px] font-bold text-pass text-center">{r.quantity_recovered}</td>
                                        <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{color:r.quantity_damaged>0?'#D97706':'#94A3B8'}}>{r.quantity_damaged}</td>
                                        <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{color:r.quantity_missing>0?'#DC2626':'#94A3B8'}}>{r.quantity_missing}</td>
                                        <td className="px-4 py-2.5 text-[11px] text-text-muted">{r.notes||'—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}

                          {/* Claim footer */}
                          <div className="px-4 py-3 bg-slate-50 border-t border-line flex items-center justify-between flex-wrap gap-2">
                            <p className="text-[12px] font-semibold text-text-secondary">
                              <span className="font-black text-fail">{g.totalMissing + g.totalDamaged}</span>
                              {' '}item{g.totalMissing + g.totalDamaged !== 1 ? 's' : ''} to claim
                            </p>
                            <div className="flex items-center gap-2">
                              {g.contractor.phone && (
                                <a href={'tel:' + g.contractor.phone}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky/10 border border-sky/25 text-sky text-[12px] font-bold hover:bg-sky/20 transition-colors">
                                  <Phone className="w-3.5 h-3.5" /> Call
                                </a>
                              )}
                              {(g.contractor as any).email && (
                                <a href={'mailto:' + (g.contractor as any).email + '?subject=Discrepancy%20Report%20-%20' + encodeURIComponent(g.contractor.name)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy/10 border border-navy/25 text-navy text-[12px] font-bold hover:bg-navy/20 transition-colors">
                                  <Mail className="w-3.5 h-3.5" /> Email
                                </a>
                              )}
                              {!g.contractor.phone && !(g.contractor as any).email && (
                                <p className="text-[11px] text-text-muted italic">No contact info on file</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
