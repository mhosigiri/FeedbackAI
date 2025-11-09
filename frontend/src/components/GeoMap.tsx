import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
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
  
  if (!apiKey) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-8 border border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-500 dark:text-gray-400"
        >
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Google Maps key missing.</span>
        </motion.div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-8 border border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-500 dark:text-gray-400"
        >
          <div className="w-5 h-5 border-2 border-[#E20074] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Loading map…</span>
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl shadow-xl border-4 border-white dark:border-gray-800"
      style={{
        background: 'linear-gradient(135deg, rgba(226, 0, 116, 0.1) 0%, rgba(255, 0, 102, 0.05) 100%)'
      }}
    >
      <div className="w-full h-80 rounded-3xl overflow-hidden">
        <GoogleMap 
          mapContainerStyle={{ width: '100%', height: '100%' }} 
          center={center} 
          zoom={4}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ saturation: -20 }]
              }
            ]
          }}
        >
          {markers.map(m => <MarkerF key={m.key} position={{ lat: m.lat, lng: m.lng }} />)}
        </GoogleMap>
      </div>
      
      {/* Marker count badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="absolute top-4 right-4 px-4 py-2 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E20074]" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">{markers.length}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">locations</span>
        </div>
      </motion.div>
    </motion.div>
  );
}


