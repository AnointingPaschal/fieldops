'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, RefreshCw, Users, Zap, MapPin,
  Wifi, WifiOff, Clock, Package, Wrench, Trash2,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkersWithLocations, fetchWorkerRoute, fetchCurrentUser } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { RoutePoint } from '@/components/ui/LeafletMap';

const LeafletMap = dynamic(() => import('@/components/ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-slate-100 border border-line flex items-center justify-center gap-2 text-text-muted text-[12px]"
      style={{ height: 260 }}>
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading map…
    </div>
  ),
});

const typeIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

function timeAgo(iso: string | null) {
  if (!iso) return 'No location yet';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function LiveMapPage() {
  const [workers,  setWorkers]  = useState<any[]>([]);
  const [routes,   setRoutes]   = useState<Record<string, RoutePoint[]>>({});
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [live,     setLive]     = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadRoutes = useCallback(async (ws: any[]) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const since = today.toISOString();
    const pairs = await Promise.all(
      ws.map(w => fetchWorkerRoute(w.id, since).then(pts => [w.id, pts] as const))
    );
    const map: Record<string, RoutePoint[]> = {};
    pairs.forEach(([id, pts]) => { if (pts.length) map[id] = pts; });
    setRoutes(map);
  }, []);

  const load = useCallback(async () => {
    const [ws, u] = await Promise.all([fetchWorkersWithLocations(), fetchCurrentUser()]);
    setWorkers(ws); setUser(u); setLastSync(new Date()); setLoading(false);
    loadRoutes(ws);
  }, [loadRoutes]);

  useEffect(() => { load(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  // Real-time — one subscription, never re-created
  useEffect(() => {
    const ch = supabase
      .channel(`live-map-${Date.now()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, p => {
        const w = p.new as any;
        if (!w.lat || !w.lng) return;
        setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, ...w } : x));
        setLastSync(new Date());
        setRoutes(prev => ({
          ...prev,
          [w.id]: [
            ...(prev[w.id] || []),
            { lat: w.lat, lng: w.lng, recorded_at: w.location_updated_at || new Date().toISOString() },
          ],
        }));
      })
      .subscribe(s => setLive(s === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(ch); };
  }, []);

  const active = workers.filter(w => w.activeTask).length;
  const avail  = workers.filter(w => w.available && !w.activeTask).length;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Live Map</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-[10px] font-bold ${live ? 'text-pass' : 'text-text-muted'}`}>
                {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {live ? 'Live updates on' : 'Connecting…'}
              </span>
              {lastSync && (
                <span className="text-[10px] text-text-muted">· synced {timeAgo(lastSync.toISOString())}</span>
              )}
            </div>
          </div>
          <button onClick={load} className="btn-ghost text-[12px]">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'On Map',    value: workers.length, icon: Navigation, color: 'text-sky'  },
            { label: 'On Task',   value: active,         icon: Zap,        color: 'text-warn' },
            { label: 'Available', value: avail,          icon: Users,      color: 'text-pass' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }} className="card text-center py-3">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className={`text-xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-[10px] text-text-muted font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && workers.length === 0 && (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-[13px]">No worker locations yet</p>
              <p className="text-[11px] text-text-muted mt-1">
                Workers appear here once they clock in with GPS enabled.
              </p>
            </div>
          </div>
        )}

        {/* Worker cards */}
        {(loading || workers.length > 0) && (
          <div>
            <p className="sec-title mb-3">
              Field Workers — tap to show location
            </p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skel h-20 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {workers.map(w => {
                  const TaskIcon = w.activeTask ? (typeIcon[w.activeTask.type] || Package) : null;
                  const routePts = routes[w.id] || [];
                  const isExp    = expanded === w.id;

                  return (
                    <motion.div key={w.id} layout
                      className={`card overflow-hidden transition-all ${isExp ? 'border-sky/30 shadow-card' : ''}`}>

                      {/* Card header — tap to expand */}
                      <button className="w-full text-left" onClick={() => setExpanded(isExp ? null : w.id)}>
                        <div className="flex items-center gap-3">

                          {/* Avatar + status dot */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black">
                              {w.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            {w.activeTask
                              ? <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-warn border-2 border-white rounded-full animate-pulse" />
                              : w.available
                                ? <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pass border-2 border-white rounded-full" />
                                : null}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[13px] text-text-primary">{w.name}</p>
                            <p className="text-[11px] text-text-muted">{w.job_title}</p>
                            {w.activeTask ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                {TaskIcon && <TaskIcon className="w-3 h-3 text-warn shrink-0" />}
                                <span className="text-[11px] text-warn font-semibold truncate">
                                  {w.activeTask.type} · {w.activeTask.contractor?.name}
                                </span>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                                w.available ? 'bg-pass/10 text-pass' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${w.available ? 'bg-pass' : 'bg-slate-400'}`} />
                                {w.available ? 'Available' : 'Off duty'}
                              </span>
                            )}
                          </div>

                          {/* Right meta */}
                          <div className="text-right shrink-0 space-y-1">
                            <div className="flex items-center gap-1 text-[10px] text-text-muted justify-end">
                              <Clock className="w-3 h-3" />
                              {timeAgo(w.location_updated_at)}
                            </div>
                            {w.lat && w.lng && (
                              <p className="text-[10px] text-text-muted font-mono">
                                {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                              </p>
                            )}
                            <div className="flex justify-end mt-1">
                              {isExp
                                ? <ChevronUp className="w-4 h-4 text-sky" />
                                : <ChevronDown className="w-4 h-4 text-slate-300" />}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded: GPS map with route */}
                      <AnimatePresence>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-line space-y-2">
                              {w.lat && w.lng ? (
                                <>
                                  <LeafletMap
                                    markers={[{
                                      id:    w.id,
                                      lat:   w.lat,
                                      lng:   w.lng,
                                      label: w.name,
                                      sub:   w.activeTask
                                        ? `${w.activeTask.type} · ${w.activeTask.contractor?.name || ''}`
                                        : 'No active task',
                                      color: w.activeTask ? 'orange' : 'green',
                                      pulse: !!w.activeTask,
                                      isCar: !!w.activeTask,
                                    }]}
                                    routes={routePts.length > 1 ? { [w.id]: routePts } : {}}
                                    completionPin={undefined}
                                    center={undefined}
                                    zoom={15}
                                    height={260}
                                    initDelay={300}
                                  />
                                  <div className="flex items-center justify-between px-1 text-[11px] text-text-muted">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {w.lat.toFixed(5)}, {w.lng.toFixed(5)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Navigation className="w-3 h-3" />
                                      {routePts.length} GPS points today
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-muted">
                                  <Navigation className="w-8 h-8 text-slate-300" />
                                  <p className="text-[12px] font-medium">No GPS location yet</p>
                                  <p className="text-[11px]">Worker needs to clock in with location enabled.</p>
                                </div>
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
        )}
      </div>
    </AppShell>
  );
}
