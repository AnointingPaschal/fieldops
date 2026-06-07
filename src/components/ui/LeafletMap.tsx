'use client';
import { useEffect, useRef, useState } from 'react';
import { Layers, Satellite } from 'lucide-react';

export interface MapMarker {
  id:     string;
  lat:    number;
  lng:    number;
  label:  string;
  sub?:   string;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'navy';
  pulse?: boolean;
  isCar?: boolean;
}

export interface RoutePoint {
  lat:         number;
  lng:         number;
  recorded_at: string;
}

interface LeafletMapProps {
  markers:        MapMarker[];
  routes?:        Record<string, RoutePoint[]>;
  completionPin?: { lat: number; lng: number; label?: string };

  center?:        [number, number];
  zoom?:          number;
  height?:        number;
  className?:     string;
  /** Delay init (ms) — use when map renders inside an expanding accordion */
  initDelay?:     number;
}

const HEX: Record<string, string> = {
  blue:   '#1D4ED8',
  green:  '#16A34A',
  red:    '#DC2626',
  orange: '#D97706',
  navy:   '#0B1D35',
};

const ROUTE_COLORS = ['#1D4ED8','#16A34A','#7C3AED','#D97706','#DC2626'];

type TileMode = 'street' | 'satellite' | 'hybrid';

const TILES: Record<TileMode, { url: string; attr: string; maxZoom: number }> = {
  street: {
    url:     'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr:    '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url:     'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr:    '© <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
  hybrid: {
    url:     'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr:    '© <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
};

const LABEL_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

function bearing(a: [number,number], b: [number,number]): number {
  const dLng = (b[1]-a[1])*Math.PI/180;
  const φ1   = a[0]*Math.PI/180;
  const φ2   = b[0]*Math.PI/180;
  const y    = Math.sin(dLng)*Math.cos(φ2);
  const x    = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(dLng);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}

function carHtml(color: string, rot: number, pulse: boolean): string {
  return `<div style="position:relative;width:38px;height:38px;transform:rotate(${rot}deg)">
    ${pulse?`<div style="position:absolute;inset:-8px;border-radius:50%;background:${color}25;animation:ping 1.4s ease-in-out infinite"></div>`:''}
    <div style="position:absolute;inset:0;border-radius:50%;background:white;box-shadow:0 2px 10px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${color}">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
        <circle cx="7.5" cy="14.5" r="1.5" fill="white"/>
        <circle cx="16.5" cy="14.5" r="1.5" fill="white"/>
      </svg>
    </div>
  </div>`;
}

function pinHtml(color: string, pulse: boolean): string {
  return `<div style="position:relative">
    ${pulse?`<div style="position:absolute;inset:-6px;border-radius:50%;background:${color}30;animation:ping 1.4s ease-in-out infinite"></div>`:''}
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/></filter>
      <path fill="${color}" filter="url(#ds)" d="M14 0C6.268 0 0 6.268 0 14c0 9.8 12.6 21.77 13.16 22.33a1.16 1.16 0 001.68 0C15.4 35.77 28 23.8 28 14 28 6.268 21.73 0 14 0z"/>
      <circle cx="14" cy="14" r="6.5" fill="white" opacity="0.92"/>
    </svg>
  </div>`;
}

function checkHtml(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="#16A34A" opacity="0.18"/>
    <circle cx="17" cy="17" r="11" fill="#16A34A"/>
    <path d="M12 17l3.5 3.5L22 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

function popupHtml(label: string, sub?: string): string {
  return `<div style="font-family:Inter,system-ui,sans-serif;padding:4px 2px;min-width:150px">
    <p style="font-weight:800;font-size:13px;margin:0 0 3px;color:#0F172A">${label}</p>
    ${sub ? `<p style="font-size:11px;color:#64748B;margin:0;line-height:1.4">${sub}</p>` : ''}
  </div>`;
}

export default function LeafletMap({
  markers, routes = {}, completionPin,
  center, zoom = 13, height = 380, className = '', initDelay = 0,
}) {
  const divRef     = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<any>(null);
  const LRef       = useRef<any>(null);
  const markerObjs = useRef<Record<string, any>>({});
  const polyObjs   = useRef<Record<string, any[]>>({});
  const labelLayer = useRef<any>(null);
  const baseLayer  = useRef<any>(null);
  const frames     = useRef<Record<string, number>>({});
  const prevPos    = useRef<Record<string, [number,number]>>({});
  const [tileMode, setTileMode] = useState<TileMode>('street');
  const [ready,    setReady]    = useState(false);

  // ── smooth marker animation ───────────────────────────────
  function animMarker(id: string, from: [number,number], to: [number,number], ms = 700) {
    const m = markerObjs.current[id];
    if (!m) return;
    const t0 = Date.now();
    if (frames.current[id]) cancelAnimationFrame(frames.current[id]);
    const tick = () => {
      const p = Math.min((Date.now()-t0)/ms, 1);
      const e = p<.5 ? 2*p*p : -1+(4-2*p)*p;
      m.setLatLng([from[0]+(to[0]-from[0])*e, from[1]+(to[1]-from[1])*e]);
      if (p<1) frames.current[id] = requestAnimationFrame(tick);
    };
    frames.current[id] = requestAnimationFrame(tick);
  }

  // ── upsert marker ────────────────────────────────────────
  function upsertMarker(m: MapMarker) {
    const L    = LRef.current;
    const map  = mapRef.current;
    if (!L || !map) return;

    const hex  = HEX[m.color||'blue'];
    const prev = prevPos.current[m.id];
    const rot  = prev ? bearing(prev, [m.lat, m.lng]) : 0;
    const html = m.isCar ? carHtml(hex, rot, !!m.pulse) : pinHtml(hex, !!m.pulse);
    const sz   = m.isCar ? [38,38] : [28,38];
    const anc  = m.isCar ? [19,19] : [14,38];

    const icon = L.divIcon({ html, iconSize:sz, iconAnchor:anc, popupAnchor:[0,m.isCar?-22:-40], className:'' });

    if (markerObjs.current[m.id]) {
      markerObjs.current[m.id].setIcon(icon);
      if (prev && (Math.abs(prev[0]-m.lat)>1e-5 || Math.abs(prev[1]-m.lng)>1e-5)) {
        animMarker(m.id, prev, [m.lat,m.lng]);
      } else {
        markerObjs.current[m.id].setLatLng([m.lat,m.lng]);
      }
    } else {
      const mk = L.marker([m.lat,m.lng],{icon}).addTo(map);
      mk.bindPopup(popupHtml(m.label, m.sub), { maxWidth:220, className:'fop-popup' });
      markerObjs.current[m.id] = mk;
    }
    prevPos.current[m.id] = [m.lat,m.lng];
  }

  // ── draw route polylines ─────────────────────────────────
  function drawRoutes() {
    const L = LRef.current; const map = mapRef.current;
    if (!L || !map) return;
    Object.values(polyObjs.current).flat().forEach((p:any) => p.remove());
    polyObjs.current = {};
    const routeMap = routes as Record<string, RoutePoint[]>;

    Object.entries(routeMap).forEach(([wid, pts], wi) => {
      if (!Array.isArray(pts) || pts.length < 2) return;
      const col  = ROUTE_COLORS[wi % ROUTE_COLORS.length];
      const lls  = (pts as RoutePoint[]).map((p: RoutePoint) => [p.lat, p.lng]);
      const n    = lls.length;
      const segs: any[] = [];
      const step = Math.max(1, Math.floor(n/10));

      for (let i = 0; i < n-1; i += step) {
        const end = Math.min(i+step+1, n);
        const frac = i/n;
        segs.push(L.polyline(lls.slice(i,end), {
          color: col, weight: 2+frac*3.5, opacity: 0.12+frac*0.88,
          lineCap:'round', lineJoin:'round',
          dashArray: frac<0.35 ? '4 8' : undefined,
        }).addTo(map));
      }
      // vivid tail
      segs.push(L.polyline(lls.slice(Math.floor(n*0.75)), {
        color:col, weight:4.5, opacity:1, lineCap:'round',
      }).addTo(map));
      // live dot at last point
      const last = (pts as RoutePoint[])[n-1];
      segs.push(L.circleMarker([last.lat,last.lng],{
        radius:5.5, color:'white', fillColor:col, fillOpacity:1, weight:2,
      }).addTo(map));
      polyObjs.current[wid] = segs;
    });
  }

  // ── swap base tile layer ─────────────────────────────────
  function applyTiles(mode: TileMode) {
    const L = LRef.current; const map = mapRef.current;
    if (!L || !map) return;
    baseLayer.current?.remove();
    labelLayer.current?.remove();
    const t = TILES[mode];
    baseLayer.current = L.tileLayer(t.url, { attribution:t.attr, maxZoom:t.maxZoom }).addTo(map);
    if (mode === 'hybrid') {
      labelLayer.current = L.tileLayer(LABEL_TILE, { maxZoom:19, opacity:0.85 }).addTo(map);
    } else {
      labelLayer.current = null;
    }
  }

  // ── init ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !divRef.current) return;

    const init = () => {
      if (mapRef.current) return;
      import('leaflet').then(L => {
        LRef.current = L;
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        const def: [number,number] = markers[0] ? [markers[0].lat, markers[0].lng]
          : center ?? [51.0447, -114.0719];

        const map = L.map(divRef.current!, {
          center: center ?? def,
          zoom,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        L.control.zoom({ position:'bottomright' }).addTo(map);
        L.control.scale({ position:'bottomleft', metric:true, imperial:false }).addTo(map);
        mapRef.current = map;
        applyTiles('street');
        drawRoutes();
        markers.forEach(m => upsertMarker(m));

        if (completionPin) {
          const icon = L.divIcon({ html:checkHtml(), iconSize:[34,34], iconAnchor:[17,17], popupAnchor:[0,-20], className:'' });
          L.marker([completionPin.lat,completionPin.lng],{icon}).addTo(map)
            .bindPopup(popupHtml(completionPin.label||'Task completed here'));
        }

        fitAll(L, map);
        // Fix grey tiles when container was hidden during init
        setTimeout(() => { map.invalidateSize(); setReady(true); }, 120);
      });
    };

    if (initDelay > 0) {
      const t = setTimeout(init, initDelay);
      return () => clearTimeout(t);
    } else {
      init();
    }

    return () => {
      Object.values(frames.current).forEach(cancelAnimationFrame);
      mapRef.current?.remove();
      mapRef.current = null; LRef.current = null;
      markerRefs.current = {}; polyObjs.current = {};
    };
  }, []);

  function fitAll(L: any, map: any) {
    const pts: [number,number][] = [
      ...markers.map(m => [m.lat, m.lng] as [number,number]),
      ...(Object.values(routes) as RoutePoint[][]).flat().map((p: RoutePoint) => [p.lat, p.lng] as [number,number]),
      ...(completionPin ? [[completionPin.lat, completionPin.lng] as [number,number]] : []),
    ];
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding:[40,40], maxZoom:17, animate:true });
    else if (pts.length === 1) map.setView(pts[0], zoom);
  }

  // ── update markers + routes on prop change ───────────────
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    drawRoutes();
    markers.forEach(m => upsertMarker(m));
  }, [markers, routes]);

  // ── swap tile layer ───────────────────────────────────────
  useEffect(() => {
    applyTiles(tileMode);
  }, [tileMode]);

  // Realtime handled by parent — no internal subscription needed

  // ── invalidate on height change (accordion) ──────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [height]);

  return (
    <>
      <style>{`
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
        .fop-popup .leaflet-popup-content-wrapper {
          border-radius:14px!important;
          box-shadow:0 6px 24px rgba(0,0,0,0.14)!important;
          border:1px solid #E2E8F0!important;
          padding:0!important;
        }
        .fop-popup .leaflet-popup-content { margin:10px 14px!important; }
        .leaflet-popup-content-wrapper {
          border-radius:14px!important;
          box-shadow:0 6px 24px rgba(0,0,0,0.14)!important;
          border:1px solid #E2E8F0!important;
          padding:0!important;
        }
        .leaflet-popup-content { margin:10px 14px!important; }
        .leaflet-control-zoom {
          border:1px solid rgba(255,255,255,0.35)!important;
          border-radius:10px!important;overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,0.18)!important;
        }
        .leaflet-control-zoom a {
          background:rgba(255,255,255,0.92)!important;
          color:#0F172A!important;font-size:16px!important;
        }
        .leaflet-control-zoom a:hover { background:white!important; }
        .leaflet-control-attribution { font-size:9px!important; opacity:0.6; }
      `}</style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      <div className={`relative w-full rounded-xl overflow-hidden border border-line ${className}`}
        style={{ height }}>
        <div ref={divRef} className="w-full h-full" />

        {/* ── Tile switcher ── */}
        <div className="absolute top-3 left-3 z-[500] flex gap-1.5">
          {(['street','satellite','hybrid'] as TileMode[]).map(mode => (
            <button key={mode} onClick={() => setTileMode(mode)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all backdrop-blur-sm shadow-sm ${
                tileMode === mode
                  ? 'bg-navy text-white shadow-md'
                  : 'bg-white/85 text-text-secondary hover:bg-white border border-white/50'
              }`}>
              {mode === 'street'    ? <Layers    className="w-3 h-3" /> : null}
              {mode === 'satellite' ? <Satellite className="w-3 h-3" /> : null}
              {mode === 'hybrid'    ? <><Satellite className="w-3 h-3" /><Layers className="w-3 h-3" /></> : null}
              <span className="capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// silence TS about missing ref type
const markerRefs = { current: {} as Record<string, any> };
