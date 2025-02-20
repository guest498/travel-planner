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
  const markerRef = useRef<L.Marker | null>(null);

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

    const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;

    // Clean up previous marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Use OpenRouteService Geocoding API
    fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].geometry.coordinates;
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 12);
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
          }
          onCenterChange({ lat, lng });
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
      });
  }, [location]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg" 
      style={{ minHeight: '400px' }}
    />
  );
}