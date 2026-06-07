'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Package, Building2, ChevronRight,
  RefreshCw, FileText, DollarSign, CheckCircle,
  ChevronDown, ChevronUp, Phone, MapPin,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchDiscrepancyTasks, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';
import { triggerNav } from '@/lib/navigation';

export default function DiscrepanciesPage() {
  const router = useRouter();
  const [data,     setData]     = useState<any[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null); // contractor name
  const [openTask, setOpenTask] = useState<string | null>(null); // task_id

  const load = async () => {
    setLoading(true);
    const [rows, u] = await Promise.all([fetchDiscrepancyTasks(), fetchCurrentUser()]);
    setData(rows); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Group by contractor
  type CGroup = {
    contractor: any;
    tasks: { task_id:string; type:string; completed_at:string|null; items:any[] }[];
    totalDamaged: number; totalMissing: number;
  };
  const grouped: CGroup[] = [];
  data.forEach(row => {
    const cn = row.task?.contractor?.name || 'Unknown Contractor';
    let g = grouped.find(g => g.contractor.name === cn);
    if (!g) { g = { contractor: row.task?.contractor||{name:cn}, tasks:[], totalDamaged:0, totalMissing:0 }; grouped.push(g); }
    g.totalDamaged += row.quantity_damaged||0;
    g.totalMissing += row.quantity_missing||0;
    let t = g.tasks.find(t => t.task_id===row.task_id);
    if (!t) { t={task_id:row.task_id,type:row.task?.type,completed_at:row.task?.completed_at,items:[]}; g.tasks.push(t); }
    t.items.push(row);
  });

  return (
    <AppShell role="supervisor" userName={user?.name||'Supervisor'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Item Discrepancies</h1>
            <p className="text-[11px] text-text-muted">Damaged or missing items — claim from contractors</p>
          </div>
          <button onClick={load} className="btn-icon">
            <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin text-sky':'text-text-muted'}`}/>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {l:'Contractors',v:grouped.length,c:'text-sky',I:Building2},
            {l:'Not Found',v:grouped.reduce((s,g)=>s+g.totalMissing,0),c:'text-fail',I:AlertTriangle},
            {l:'Damaged',v:grouped.reduce((s,g)=>s+g.totalDamaged,0),c:'text-warn',I:Package},
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
          <div className="card"><div className="empty py-12">
            <div className="empty-icon"><CheckCircle className="w-6 h-6 text-pass"/></div>
            <p className="text-[13px] font-semibold text-text-primary">All clear!</p>
            <p className="text-[11px] text-text-muted">No damaged or missing items to report.</p>
          </div></div>
        ) : (
          <div className="space-y-3">
            {grouped.map((g, gi) => {
              const isExp = expanded === g.contractor.name;
              return (
                <motion.div key={gi} layout className="card !p-0 overflow-hidden">
                  {/* Contractor header — tap to expand */}
                  <button className="w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                    onClick={()=>setExpanded(isExp?null:g.contractor.name)}>
                    <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
                      {g.contractor.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-text-primary">{g.contractor.name}</p>
                      {g.contractor.address && <p className="text-[11px] text-text-muted truncate flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0"/>{g.contractor.address}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {g.totalMissing>0 && <span className="badge bg-fail/10 text-fail text-[10px]"><AlertTriangle className="w-3 h-3"/>{g.totalMissing} not found</span>}
                        {g.totalDamaged>0 && <span className="badge bg-warn/10 text-warn text-[10px]"><Package className="w-3 h-3"/>{g.totalDamaged} damaged</span>}
                        <span className="text-[10px] text-text-muted">{g.tasks.length} task{g.tasks.length!==1?'s':''}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-warn font-bold">
                        <DollarSign className="w-3.5 h-3.5"/>
                        {g.totalDamaged+g.totalMissing} to claim
                      </div>
                      {isExp ? <ChevronUp className="w-4 h-4 text-sky"/> : <ChevronDown className="w-4 h-4 text-slate-300"/>}
                    </div>
                  </button>

                  {/* Expanded task list */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                        exit={{height:0,opacity:0}} transition={{duration:0.22,ease:'easeOut'}}
                        className="overflow-hidden border-t border-line">
                        <div className="space-y-0">
                          {g.tasks.map(t => {
                            const taskOpen = openTask===t.task_id;
                            const tDmg = t.items.reduce((s:number,r:any)=>s+(r.quantity_damaged||0),0);
                            const tMis = t.items.reduce((s:number,r:any)=>s+(r.quantity_missing||0),0);
                            return (
                              <div key={t.task_id} className="border-b border-line last:border-0">
                                {/* Task row */}
                                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left"
                                  onClick={()=>setOpenTask(taskOpen?null:t.task_id)}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-[12px] text-text-primary">{t.type}</span>
                                      {tMis>0 && <span className="badge bg-fail/10 text-fail text-[10px]">{tMis} not found</span>}
                                      {tDmg>0 && <span className="badge bg-warn/10 text-warn text-[10px]">{tDmg} damaged</span>}
                                    </div>
                                    {t.completed_at && <p className="text-[10px] text-text-muted mt-0.5">{new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}</p>}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={e=>{e.stopPropagation();triggerNav();router.push(`/worker/tasks/${t.task_id}/report`);}}
                                      className="flex items-center gap-1 text-[11px] font-semibold text-sky hover:underline">
                                      <FileText className="w-3 h-3"/> PDF
                                    </button>
                                    <button onClick={e=>{e.stopPropagation();triggerNav();router.push(`/supervisor/tasks/${t.task_id}`);}}
                                      className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-sky">
                                      <ChevronRight className="w-3.5 h-3.5"/>
                                    </button>
                                    {taskOpen?<ChevronUp className="w-3.5 h-3.5 text-slate-300"/>:<ChevronDown className="w-3.5 h-3.5 text-slate-300"/>}
                                  </div>
                                </button>

                                {/* Item breakdown */}
                                <AnimatePresence>
                                  {taskOpen && (
                                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                                      exit={{height:0,opacity:0}} transition={{duration:0.18}}
                                      className="overflow-hidden bg-slate-50/60">
                                      <table className="w-full" style={{borderCollapse:'collapse'}}>
                                        <thead>
                                          <tr className="border-b border-line">
                                            {['Item','Assigned','Recovered','Damaged','Not Found'].map(h=>(
                                              <th key={h} className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wide">{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {t.items.map((r:any,ri:number)=>(
                                            <tr key={ri} className={`border-b border-line last:border-0 ${ri%2===0?'':'bg-white/60'}`}>
                                              <td className="px-4 py-2.5">
                                                <p className="text-[12px] font-semibold text-text-primary">{r.item?.name}</p>
                                                {r.notes&&<p className="text-[10px] text-text-muted mt-0.5 italic">{r.notes}</p>}
                                              </td>
                                              <td className="px-4 py-2.5 text-[12px] text-text-secondary text-center">{r.quantity_assigned}</td>
                                              <td className="px-4 py-2.5 text-[12px] font-bold text-pass text-center">{r.quantity_recovered}</td>
                                              <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{color:r.quantity_damaged>0?'#D97706':'#94A3B8'}}>{r.quantity_damaged}</td>
                                              <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{color:r.quantity_missing>0?'#DC2626':'#94A3B8'}}>{r.quantity_missing}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>

                        {/* Claim footer */}
                        <div className="px-4 py-3 bg-warn/5 border-t border-warn/20 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[12px] text-warn font-semibold">
                            <DollarSign className="w-4 h-4"/>
                            {g.totalDamaged+g.totalMissing} item(s) to claim from {g.contractor.name}
                          </div>
                          {g.contractor.phone && (
                            <a href={`tel:${g.contractor.phone}`} className="flex items-center gap-1 text-[11px] text-sky font-semibold hover:underline">
                              <Phone className="w-3 h-3"/> Call
                            </a>
                          )}
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
