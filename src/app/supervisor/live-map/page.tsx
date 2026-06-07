'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, RefreshCw, Users, Clock, Zap,
  MapPin, Wifi, WifiOff, Package, Wrench, RefreshCcw, Trash2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchWorkersWithLocations, fetchCurrentUser } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

// Dynamically import the map (no SSR – Leaflet uses window)
const LeafletMap = dynamic(() => import('@/components/ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-slate-100 border border-line flex items-center justify-center gap-2 text-text-muted text-[12px]"
      style={{ height: 440 }}>
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading map…
    </div>
  ),
});

const taskTypeIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCcw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

function timeAgo(iso: string | null) {
  if (!iso) return 'Unknown';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)  return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function LiveMapPage() {
  const [workers,  setWorkers]  = useState<any[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [realtime, setRealtime] = useState(true);

  const load = useCallback(async () => {
    const [w, u] = await Promise.all([fetchWorkersWithLocations(), fetchCurrentUser()]);
    setWorkers(w); setUser(u);
    setLastSync(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  // ── Auto-refresh every 30s ──
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // ── Supabase real-time subscription on profiles ──
  useEffect(() => {
    const channel = supabase
      .channel('live-locations')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
      }, payload => {
        setWorkers(prev => prev.map(w =>
          w.id === payload.new.id ? { ...w, ...payload.new } : w
        ));
        setLastSync(new Date());
      })
      .subscribe(status => {
        setRealtime(status === 'SUBSCRIBED');
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Build map markers from workers with GPS
  const mapMarkers = workers.map(w => ({
    lat:   w.lat,
    lng:   w.lng,
    label: w.name,
    sub:   w.activeTask
      ? `${w.activeTask.type} — ${w.activeTask.contractor?.name}`
      : w.available ? 'Available · No active task' : 'Off duty',
    color: w.activeTask ? 'orange' : w.available ? 'green' : 'navy',
    pulse: !!w.activeTask,
  }));

  const activeCount    = workers.filter(w => w.activeTask).length;
  const availableCount = workers.filter(w => w.available && !w.activeTask).length;

  const selectedWorker = selected ? workers.find(w => w.id === selected) : null;

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Live Map</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`flex items-center gap-1 text-[10px] font-bold ${realtime ? 'text-pass' : 'text-fail'}`}>
                {realtime ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {realtime ? 'Live' : 'Offline'}
              </div>
              {lastSync && (
                <span className="text-[10px] text-text-muted">· synced {timeAgo(lastSync.toISOString())}</span>
              )}
            </div>
          </div>
          <button onClick={() => { setLoading(true); load(); }} className="btn-ghost text-[12px]">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label:'On Map',    value: workers.length,  icon: Navigation, color:'text-sky'  },
            { label:'On Task',   value: activeCount,     icon: Zap,        color:'text-warn' },
            { label:'Available', value: availableCount,  icon: Users,      color:'text-pass' },
          ].map((s, i) => (
            <div key={i} className="card text-center py-3">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className={`text-xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-[10px] text-text-muted font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        {loading ? (
          <div className="card flex items-center justify-center gap-2 text-text-muted text-[12px]"
            style={{ height: 440 }}>
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading worker locations…
          </div>
        ) : mapMarkers.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-[13px]">No worker locations available</p>
              <p className="text-[11px] text-text-muted mt-1">
                Workers appear here once they clock in with GPS enabled.
              </p>
            </div>
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <LeafletMap markers={mapMarkers} height={440} zoom={11} />
          </div>
        )}

        {/* Worker cards */}
        <div>
          <p className="sec-title mb-3">Field Workers ({workers.length} with GPS)</p>
          {workers.length === 0 && !loading && (
            <div className="card text-center py-8">
              <p className="text-[13px] text-text-muted">No workers have shared their location yet.</p>
              <p className="text-[11px] text-text-muted mt-1">Workers must clock in with GPS enabled.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workers.map(w => {
              const TaskIcon = w.activeTask ? (taskTypeIcon[w.activeTask.type] || Package) : null;
              const isSelected = selected === w.id;
              return (
                <motion.div key={w.id} layout
                  onClick={() => setSelected(isSelected ? null : w.id)}
                  className={`card cursor-pointer transition-all hover:shadow-card-md ${
                    isSelected ? 'border-sky/40 bg-sky/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with pulse if active */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black">
                        {w.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                      </div>
                      {w.activeTask && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-warn border-2 border-white rounded-full animate-pulse" />
                      )}
                      {w.available && !w.activeTask && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pass border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-text-primary">{w.name}</p>
                      <p className="text-[11px] text-text-muted">{w.job_title}</p>

                      {w.activeTask ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {TaskIcon && <TaskIcon className="w-3 h-3 text-warn shrink-0" />}
                          <span className="text-[11px] text-warn font-semibold truncate">
                            {w.activeTask.type} · {w.activeTask.contractor?.name}
                          </span>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full ${
                          w.available ? 'bg-pass/10 text-pass' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${w.available ? 'bg-pass' : 'bg-slate-400'}`} />
                          {w.available ? 'Available' : 'Off duty'}
                        </span>
                      )}
                    </div>

                    {/* Last update */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-text-muted justify-end">
                        <Clock className="w-3 h-3" />
                        {timeAgo(w.location_updated_at)}
                      </div>
                      {w.lat && w.lng && (
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                          {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded: mini map */}
                  <AnimatePresence>
                    {isSelected && w.lat && w.lng && (
                      <motion.div
                        initial={{ height:0, opacity:0 }}
                        animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-line"
                      >
                        <LeafletMap
                          markers={[{
                            lat: w.lat, lng: w.lng, label: w.name,
                            sub: w.activeTask
                              ? `${w.activeTask.type} — ${w.activeTask.contractor?.name}`
                              : 'No active task',
                            color: w.activeTask ? 'orange' : 'green',
                            pulse: !!w.activeTask,
                          }]}
                          zoom={15}
                          height={200}
                        />
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted">
                          <MapPin className="w-3 h-3" />
                          Location updated {timeAgo(w.location_updated_at)}
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
