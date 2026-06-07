'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface MapProps {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  label?: string;
  height?: number;
}

export default function Map({ lat, lng, address, label = 'Location', height = 220 }: MapProps) {
  const [coords, setCoords]   = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [loading, setLoading] = useState(!coords && !!address);
  const [error,   setError]   = useState('');

  // Geocode address via Nominatim (free, no API key)
  useEffect(() => {
    if (coords || !address) return;
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          setError('Address not found on map');
        }
        setLoading(false);
      })
      .catch(() => { setError('Could not load map'); setLoading(false); });
  }, [address]);

  if (loading) return (
    <div className="w-full rounded-xl bg-slate-100 border border-line flex items-center justify-center gap-2 text-text-muted text-[12px]"
      style={{ height }}>
      <Loader2 className="w-4 h-4 animate-spin" /> Loading map…
    </div>
  );

  if (error || !coords) return (
    <div className="w-full rounded-xl bg-slate-50 border border-line flex flex-col items-center justify-center gap-2 text-text-muted text-[12px]"
      style={{ height }}>
      <MapPin className="w-6 h-6" />
      <p>{error || 'No location available'}</p>
      {address && <p className="text-[11px] max-w-xs text-center px-4">{address}</p>}
    </div>
  );

  const { lat: clat, lng: clng } = coords;
  const delta = 0.008;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${clng-delta},${clat-delta},${clng+delta},${clat+delta}&layer=mapnik&marker=${clat},${clng}`;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-line relative" style={{ height }}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        title={label}
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${clat}&mlon=${clng}#map=16/${clat}/${clng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white border border-line rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-sky hover:underline shadow-sm"
      >
        Open in Maps ↗
      </a>
    </div>
  );
}
