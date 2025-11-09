import React, { useMemo } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import type { AnalyzeResponse, SentimentResult } from '../types';

export default function GeoMap({ data, sentiments }: { data?: AnalyzeResponse | null; sentiments?: SentimentResult[] }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string | undefined;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  });
  const markers = useMemo(() => {
    const list: { lat: number; lng: number; key: string }[] = [];
    const src = sentiments ?? data?.sentiments ?? [];
    (src).forEach((s, idx) => {
      const loc = (s.post as any).location;
      if (loc?.latitude && loc?.longitude) {
        list.push({ lat: Number(loc.latitude), lng: Number(loc.longitude), key: s.post.id || String(idx) });
      }
    });
    return list;
  }, [data, sentiments]);
  const center = markers[0] || { lat: 32.7767, lng: -96.7970 };
  if (!apiKey) return <p className="text-sm text-gray-500">Google Maps key missing.</p>;
  if (!isLoaded) return <p className="text-sm text-gray-500">Loading map…</p>;
  return (
    <div className="w-full h-72 rounded overflow-hidden border border-gray-200 dark:border-gray-800">
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={4}>
        {markers.map(m => <MarkerF key={m.key} position={{ lat: m.lat, lng: m.lng }} />)}
      </GoogleMap>
    </div>
  );
}


