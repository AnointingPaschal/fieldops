'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, RefreshCw, Users, Zap, MapPin,
  Wifi, WifiOff, Clock, Package, Wrench, Trash2,
  ChevronDown, ChevronUp, Route,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkersWithLocations, fetchWorkerRoute, fetchCurrentUser } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { MapMarker, RoutePoint } from '@/components/ui/LeafletMap';

const LeafletMap = dynamic(() => import('@/components/ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-slate-100 border border-line flex items-center justify-center gap-2 text-text-muted text-[12px]"
      style={{ height: 480 }}>
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading map…
    </div>
  ),
});

const taskTypeIcon: Record<string,any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

function timeAgo(iso: string | null) {
  if (!iso) return 'Unknown';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function LiveMapPage() {
  const [workers,  setWorkers]  = useState<any[]>([]);
  const [routes,   setRoutes]   = useState<Record<string, RoutePoint[]>>({});
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [live,     setLive]     = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);

  const loadRoutes = useCallback(async (workers: any[]) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const since = today.toISOString();
    const entries = await Promise.all(
      workers.map(w => fetchWorkerRoute(w.id, since).then(pts => [w.id, pts] as const))
    );
    const map: Record<string, RoutePoint[]> = {};
    entries.forEach(([id, pts]) => { if (pts.length) map[id] = pts; });
    setRoutes(map);
  }, []);

  const load = useCallback(async () => {
    const [w, u] = await Promise.all([fetchWorkersWithLocations(), fetchCurrentUser()]);
    setWorkers(w); setUser(u); setLastSync(new Date());
    setLoading(false);
    await loadRoutes(w);
  }, [loadRoutes]);

  useEffect(() => { load(); }, []);

  // Refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  // Supabase real-time — update marker + extend route
  useEffect(() => {
    const ch = supabase.channel('lm-profiles')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'profiles' }, p => {
        const w = p.new as any;
        if (!w.lat || !w.lng) return;
        setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, ...w } : x));
        setLastSync(new Date());
        // Append to route
        if (showRoutes) {
          const newPt: RoutePoint = { lat: w.lat, lng: w.lng, recorded_at: w.location_updated_at || new Date().toISOString() };
          setRoutes(prev => ({ ...prev, [w.id]: [...(prev[w.id] || []), newPt] }));
        }
      })
      .subscribe(s => setLive(s === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(ch); };
  }, [showRoutes]);

  // Build map markers — car icons for active workers
  const mapMarkers: MapMarker[] = workers.map(w => ({
    id:    w.id,
    lat:   w.lat,
    lng:   w.lng,
    label: w.name,
    sub:   w.activeTask
      ? `${w.activeTask.type} · ${w.activeTask.contractor?.name || ''}`
      : w.available ? 'Available · No task' : 'Off duty',
    color:  w.activeTask ? 'orange' : w.available ? 'green' : 'navy',
    pulse:  !!w.activeTask,
    isCar:  !!w.activeTask,   // car icon for workers on tasks
  }));

  const active  = workers.filter(w => w.activeTask).length;
  const avail   = workers.filter(w => w.available && !w.activeTask).length;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Live Map</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-[10px] font-bold ${live ? 'text-pass' : 'text-fail'}`}>
                {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {live ? 'Real-time' : 'Disconnected'}
              </span>
              {lastSync && <span className="text-[10px] text-text-muted">· {timeAgo(lastSync.toISOString())}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRoutes(r => !r)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                showRoutes ? 'bg-sky/10 border-sky/30 text-sky' : 'bg-white border-line text-text-muted'
              }`}>
              <Route className="w-3.5 h-3.5" />
              Routes
            </button>
            <button onClick={load} className="btn-ghost text-[12px]">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l:'On Map',    v:workers.length, I:Navigation, c:'text-sky'  },
            { l:'On Task',   v:active,         I:Zap,        c:'text-warn' },
            { l:'Available', v:avail,          I:Users,      c:'text-pass' },
          ].map(({ l, v, I, c }, i) => (
            <div key={i} className="card text-center py-3">
              <I className={`w-4 h-4 ${c} mx-auto mb-1`} />
              <p className={`text-xl font-black ${c}`}>{loading ? '—' : v}</p>
              <p className="text-[10px] text-text-muted font-medium">{l}</p>
            </div>
          ))}
        </div>

        {/* Map legend */}
        <div className="flex items-center gap-4 text-[11px] text-text-muted flex-wrap">
          {[
            { label:'On task (moving)',  color:'#D97706', car:true  },
            { label:'Available',        color:'#16A34A', car:false },
            { label:'Off duty',         color:'#0B1D35', car:false },
          ].map(({ label, color, car }) => (
            <div key={label} className="flex items-center gap-1.5">
              {car
                ? <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color + '20' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                : <div className="w-3 h-3 rounded-full" style={{ background: color }} />}
              <span>{label}</span>
            </div>
          ))}
          {showRoutes && <div className="flex items-center gap-1.5"><div className="w-6 h-1 rounded-full bg-sky" /><span>Route today</span></div>}
        </div>

        {/* MAP */}
        <div className="overflow-hidden rounded-xl border border-line shadow-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-text-muted text-[12px] bg-slate-50"
              style={{ height: 480 }}>
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading locations…
            </div>
          ) : mapMarkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 bg-slate-50 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-text-muted" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-[13px]">No worker locations yet</p>
                <p className="text-[11px] text-text-muted mt-1">Workers appear after clocking in with GPS.</p>
              </div>
            </div>
          ) : (
            <LeafletMap
              markers={mapMarkers}
              routes={showRoutes ? routes : {}}
              completionPin={undefined}
              center={undefined}
              height={480}
              zoom={12}
            />
          )}
        </div>

        {/* Worker cards */}
        <div>
          <p className="sec-title mb-3">
            Field Workers — {workers.length} with GPS
          </p>
          {workers.length === 0 && !loading && (
            <div className="card text-center py-8">
              <p className="text-[13px] text-text-muted">No workers have shared their location yet.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workers.map(w => {
              const TaskIcon = w.activeTask ? (taskTypeIcon[w.activeTask.type] || Package) : null;
              const routePts = routes[w.id] || [];
              const isExp    = expanded === w.id;
              return (
                <motion.div key={w.id} layout className="card overflow-hidden">
                  <button className="w-full text-left" onClick={() => setExpanded(isExp ? null : w.id)}>
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black">
                          {w.name.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
                        </div>
                        {w.activeTask && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-warn border-2 border-white rounded-full animate-pulse" />}
                        {!w.activeTask && w.available && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pass border-2 border-white rounded-full" />}
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

                      {/* Meta */}
                      <div className="text-right shrink-0 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-text-muted justify-end">
                          <Clock className="w-3 h-3" />
                          {timeAgo(w.location_updated_at)}
                        </div>
                        {routePts.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-sky justify-end">
                            <Route className="w-3 h-3" />
                            {routePts.length} pts
                          </div>
                        )}
                        {isExp ? <ChevronUp className="w-4 h-4 text-slate-300 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-300 ml-auto" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded: individual mini map with their route */}
                  <AnimatePresence>
                    {isExp && w.lat && w.lng && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}
                        className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-line space-y-2">
                          <LeafletMap
                            completionPin={undefined}
                            center={undefined}
                            markers={[{
                              id:    w.id,
                              lat:   w.lat,
                              lng:   w.lng,
                              label: w.name,
                              sub:   w.activeTask
                                ? `${w.activeTask.type} · ${w.activeTask.contractor?.name}`
                                : 'No active task',
                              color: w.activeTask ? 'orange' : 'green',
                              pulse: !!w.activeTask,
                              isCar: !!w.activeTask,
                            }]}
                            routes={routePts.length > 1 ? { [w.id]: routePts } : {}}
                            zoom={15}
                            height={220}
                          />
                          <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {w.lat.toFixed(5)}, {w.lng.toFixed(5)}
                            </span>
                            <span>{routePts.length} route points today</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
