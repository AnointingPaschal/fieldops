'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface MapMarker {
  id:      string;
  lat:     number;
  lng:     number;
  label:   string;
  sub?:    string;
  color?:  'blue' | 'green' | 'red' | 'orange' | 'navy';
  pulse?:  boolean;
  isCar?:  boolean;   // show car icon + rotation
}

export interface RoutePoint {
  lat:         number;
  lng:         number;
  recorded_at: string;
}

interface LeafletMapProps {
  markers:        MapMarker[];
  routes?:        Record<string, RoutePoint[]>; // workerId → points
  completionPin?: { lat: number; lng: number; label?: string };
  liveWorkerIds?: string[];  // subscribe to realtime updates for these workers
  center?:        [number, number];
  zoom?:          number;
  height?:        number;
  className?:     string;
}

const COLOR_HEX: Record<string, string> = {
  blue:   '#1D4ED8',
  green:  '#16A34A',
  red:    '#DC2626',
  orange: '#D97706',
  navy:   '#0B1D35',
};

const ROUTE_COLORS = ['#1D4ED8','#16A34A','#7C3AED','#D97706','#DC2626'];

function bearing(from: [number,number], to: [number,number]): number {
  const dLng = (to[1] - from[1]) * Math.PI / 180;
  const lat1  = from[0] * Math.PI / 180;
  const lat2  = to[0]  * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function carSvg(color: string, rotation: number, pulse: boolean): string {
  return `
  <div style="position:relative;width:36px;height:36px;transform:rotate(${rotation}deg)">
    ${pulse ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${color}22;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''}
    <div style="position:absolute;inset:0;border-radius:50%;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${color}">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
        <circle cx="7.5" cy="14.5" r="1.5" fill="white"/>
        <circle cx="16.5" cy="14.5" r="1.5" fill="white"/>
      </svg>
    </div>
  </div>`;
}

function pinSvg(color: string, pulse: boolean): string {
  return `
  <div style="position:relative">
    ${pulse ? `<div style="position:absolute;inset:-4px;top:-4px;border-radius:50%;background:${color}30;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''}
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
      <path fill="${color}" filter="url(#s)"
        d="M15 0C6.716 0 0 6.716 0 15c0 9.941 13.5 23.25 14.1 23.85a1.3 1.3 0 001.8 0C16.5 38.25 30 25.04 30 15 30 6.716 23.284 0 15 0z"/>
      <circle cx="15" cy="15" r="7" fill="white" opacity="0.9"/>
    </svg>
  </div>`;
}

function completionSvg(): string {
  return `
  <div style="position:relative">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#16A34A" opacity="0.15"/>
      <circle cx="18" cy="18" r="12" fill="#16A34A"/>
      <path d="M13 18l3.5 3.5L23 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </div>`;
}

export default function LeafletMap({
  markers, routes = {}, completionPin,
  liveWorkerIds = [], center, zoom = 13, height = 380, className = '',
}: LeafletMapProps) {
  const divRef      = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<any>(null);
  const markerRefs  = useRef<Record<string, any>>({});
  const polyRefs    = useRef<Record<string, any>>({});
  const animFrames  = useRef<Record<string, number>>({});
  const prevPos     = useRef<Record<string, [number,number]>>({});

  // ── Animate marker smoothly to new position ──────────────
  function animateMarker(L: any, id: string, from: [number,number], to: [number,number], duration = 800) {
    const marker = markerRefs.current[id];
    if (!marker) return;
    const start = Date.now();
    if (animFrames.current[id]) cancelAnimationFrame(animFrames.current[id]);

    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const ease = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t;
      marker.setLatLng([
        from[0] + (to[0] - from[0]) * ease,
        from[1] + (to[1] - from[1]) * ease,
      ]);
      if (t < 1) animFrames.current[id] = requestAnimationFrame(tick);
    };
    animFrames.current[id] = requestAnimationFrame(tick);
  }

  // ── Update or create a marker ─────────────────────────────
  function upsertMarker(L: any, map: any, m: MapMarker, existingMarkers?: Record<string, any>) {
    const color    = COLOR_HEX[m.color || 'blue'];
    const isCar    = m.isCar ?? false;
    const prev     = prevPos.current[m.id];
    const rot      = prev ? bearing(prev, [m.lat, m.lng]) : 0;
    const htmlStr  = isCar ? carSvg(color, rot, !!m.pulse) : pinSvg(color, !!m.pulse);
    const size     = isCar ? [36, 36] : [30, 40];
    const anchor   = isCar ? [18, 18] : [15, 40];

    const icon = L.divIcon({
      html: htmlStr,
      iconSize:    size,
      iconAnchor:  anchor,
      popupAnchor: [0, isCar ? -20 : -42],
      className:   '',
    });

    const pool = existingMarkers || markerRefs.current;
    if (pool[m.id]) {
      const from = prev || [m.lat, m.lng] as [number, number];
      pool[m.id].setIcon(icon);
      if (prev && (Math.abs(prev[0]-m.lat) > 0.00001 || Math.abs(prev[1]-m.lng) > 0.00001)) {
        animateMarker(L, m.id, from, [m.lat, m.lng]);
      } else {
        pool[m.id].setLatLng([m.lat, m.lng]);
      }
    } else {
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:160px;padding:4px 0">
          <p style="font-weight:800;font-size:13px;margin:0 0 3px;color:#0F172A">${m.label}</p>
          ${m.sub ? `<p style="font-size:11px;color:#64748B;margin:0;line-height:1.4">${m.sub}</p>` : ''}
        </div>
      `, { maxWidth: 220 });
      pool[m.id] = marker;
    }
    prevPos.current[m.id] = [m.lat, m.lng];
  }

  // ── Draw route polylines ──────────────────────────────────
  function drawRoutes(L: any, map: any) {
    Object.keys(polyRefs.current).forEach(id => {
      if (Array.isArray(polyRefs.current[id])) {
        polyRefs.current[id].forEach((p: any) => p.remove());
      } else {
        polyRefs.current[id]?.remove();
      }
    });
    polyRefs.current = {};

    Object.entries(routes).forEach(([workerId, points], wi) => {
      if (points.length < 2) return;
      const color = ROUTE_COLORS[wi % ROUTE_COLORS.length];
      const latlngs = points.map(p => [p.lat, p.lng]);
      const total   = latlngs.length;

      // Draw route in segments: older = faded, recent = vivid
      const segs: any[] = [];
      const segSize = Math.max(1, Math.floor(total / 8));

      for (let i = 0; i < total - 1; i += segSize) {
        const end    = Math.min(i + segSize + 1, total);
        const seg    = latlngs.slice(i, end);
        const frac   = i / total;
        const opacity = 0.15 + frac * 0.85;
        const weight  = 2 + frac * 3;

        const poly = L.polyline(seg, {
          color,
          weight,
          opacity,
          lineCap:  'round',
          lineJoin: 'round',
          dashArray: frac < 0.4 ? '4 6' : undefined,
        }).addTo(map);
        segs.push(poly);
      }

      // Bright solid line for last 20% of route
      const tailStart = Math.floor(total * 0.8);
      const tail = L.polyline(latlngs.slice(tailStart), {
        color,
        weight:  4,
        opacity: 1,
      }).addTo(map);
      segs.push(tail);

      // Animated dot traveling the latest tail
      if (points.length > 0) {
        const last = points[points.length - 1];
        const pulse = L.circleMarker([last.lat, last.lng], {
          radius:      5,
          color:       'white',
          fillColor:   color,
          fillOpacity: 1,
          weight:      2,
        }).addTo(map);
        segs.push(pulse);
      }

      polyRefs.current[workerId] = segs;
    });
  }

  // ── Init map ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !divRef.current || mapRef.current) return;

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter: [number, number] =
        markers[0] ? [markers[0].lat, markers[0].lng] :
        center     ? center :
        [51.0447, -114.0719];

      const map = L.map(divRef.current!, {
        center: center || defaultCenter,
        zoom,
        zoomControl:      false,
        scrollWheelZoom:  true,
        doubleClickZoom:  true,
      });

      // Clean tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom position
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Scale
      L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

      mapRef.current = map;

      // Draw routes
      drawRoutes(L, map);

      // Add markers
      markers.forEach(m => upsertMarker(L, map, m));

      // Completion pin
      if (completionPin) {
        const cpIcon = L.divIcon({
          html:        completionSvg(),
          iconSize:    [36, 36],
          iconAnchor:  [18, 18],
          popupAnchor: [0, -20],
          className:   '',
        });
        L.marker([completionPin.lat, completionPin.lng], { icon: cpIcon })
          .addTo(map)
          .bindPopup(`<p style="font-weight:700;font-size:12px;color:#16A34A;margin:0">${completionPin.label || 'Task completed here'}</p>`);
      }

      // Fit bounds to all points
      const allPoints: [number,number][] = [
        ...markers.map(m => [m.lat, m.lng] as [number,number]),
        ...Object.values(routes).flat().map(p => [p.lat, p.lng] as [number,number]),
        ...(completionPin ? [[completionPin.lat, completionPin.lng] as [number,number]] : []),
      ];
      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 16 });
      } else if (allPoints.length === 1) {
        map.setView(allPoints[0], zoom);
      }
    });

    return () => {
      Object.values(animFrames.current).forEach(cancelAnimationFrame);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRefs.current = {};
    };
  }, []);

  // ── Update markers + routes when props change ─────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      drawRoutes(L, mapRef.current!);
      markers.forEach(m => upsertMarker(L, mapRef.current!, m));

      const allPoints: [number,number][] = [
        ...markers.map(m => [m.lat, m.lng] as [number,number]),
        ...Object.values(routes).flat().map(p => [p.lat, p.lng] as [number,number]),
      ];
      if (allPoints.length > 1) {
        mapRef.current!.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 16, animate: true });
      }
    });
  }, [markers, routes]);

  // ── Real-time Supabase subscription ──────────────────────
  useEffect(() => {
    if (!liveWorkerIds.length) return;

    const channel = supabase
      .channel('live-worker-locations')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
      }, payload => {
        const w = payload.new as any;
        if (!liveWorkerIds.includes(w.id) || !w.lat || !w.lng || !mapRef.current) return;
        import('leaflet').then(L => {
          const existing = markerRefs.current[w.id];
          const m: MapMarker = {
            id:    w.id,
            lat:   w.lat,
            lng:   w.lng,
            label: w.name,
            color: 'orange',
            pulse: true,
            isCar: true,
          };
          upsertMarker(L, mapRef.current!, m);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveWorkerIds]);

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          border: 1px solid #E2E8F0 !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 10px 14px !important; }
        .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          font-size: 16px !important;
          color: #0F172A !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #E2E8F0 !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
      `}</style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={divRef}
        style={{ height }}
        className={`w-full rounded-xl overflow-hidden border border-line ${className}`}
      />
    </>
  );
}
