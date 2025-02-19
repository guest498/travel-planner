import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
  location: string | null;
}

export default function MapView({ center, onCenterChange, location }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    mapRef.current.on('moveend', () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      onCenterChange({ 
        lat: center.lat, 
        lng: center.lng 
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Use OpenRouteService Geocoding API
    fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.OPENROUTE_API_KEY}&text=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].geometry.coordinates;
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 12);
            L.marker([lat, lng]).addTo(mapRef.current);
          }
          onCenterChange({ lat, lng });
        }
      })
      .catch(console.error);
  }, [location]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg" 
      style={{ minHeight: '400px' }}
    />
  );
}