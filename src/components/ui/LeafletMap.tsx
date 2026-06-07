'use client';
import { useEffect, useRef } from 'react';

export interface MapMarker {
  lat:     number;
  lng:     number;
  label:   string;
  sub?:    string;
  color?:  string;  // 'blue' | 'green' | 'red' | 'orange'
  pulse?:  boolean;
}

interface LeafletMapProps {
  markers:   MapMarker[];
  center?:   [number, number];
  zoom?:     number;
  height?:   number;
  className?: string;
}

export default function LeafletMap({
  markers, center, zoom = 12, height = 340, className = '',
}: LeafletMapProps) {
  const mapRef      = useRef<any>(null);
  const instanceRef = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (instanceRef.current) return; // already initialised

    // Dynamically import Leaflet (avoids SSR issues)
    import('leaflet').then(L => {
      // Fix default marker images
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter: [number, number] = markers[0]
        ? [markers[0].lat, markers[0].lng]
        : [51.0447, -114.0719]; // Calgary default

      const map = L.map(mapRef.current!, {
        center: center || defaultCenter,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      instanceRef.current = map;
      addMarkers(L, map);
    });

    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  // Update markers when props change
  useEffect(() => {
    if (!instanceRef.current) return;
    import('leaflet').then(L => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      addMarkers(L, instanceRef.current!);

      // Re-fit bounds
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        instanceRef.current!.fitBounds(bounds, { padding: [40, 40] });
      } else if (markers.length === 1) {
        instanceRef.current!.setView([markers[0].lat, markers[0].lng], zoom);
      }
    });
  }, [markers]);

  function addMarkers(L: any, map: any) {
    markers.forEach(m => {
      const colorMap: Record<string, string> = {
        blue:   '#1D4ED8',
        green:  '#16A34A',
        red:    '#DC2626',
        orange: '#D97706',
        navy:   '#0B1D35',
      };
      const hex = colorMap[m.color || 'blue'] || colorMap.blue;

      // Custom SVG icon
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
          <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter>
          <path fill="${hex}" filter="url(#shadow)"
            d="M16 0C7.163 0 0 7.163 0 16c0 10.627 14.4 24.8 15.04 25.44a1.382 1.382 0 001.92 0C17.6 40.8 32 26.627 32 16 32 7.163 24.837 0 16 0z"/>
          <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
          ${m.pulse ? `<circle cx="16" cy="16" r="12" fill="${hex}" opacity="0.2"/>` : ''}
        </svg>`;

      const icon = L.divIcon({
        html: svg,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -44],
        className: '',
      });

      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <p style="font-weight:700;font-size:13px;margin:0 0 2px">${m.label}</p>
            ${m.sub ? `<p style="font-size:11px;color:#64748B;margin:0">${m.sub}</p>` : ''}
          </div>
        `);

      markersRef.current.push(marker);
    });
  }

  return (
    <>
      {/* Inject Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} style={{ height }} className={`w-full rounded-xl overflow-hidden border border-line ${className}`} />
    </>
  );
}
