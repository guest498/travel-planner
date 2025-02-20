import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
  location: string | null;
  searchCategory: string | null;
}

export default function MapView({ center, onCenterChange, location, searchCategory }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const { toast } = useToast();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 12);
    markersRef.current = L.layerGroup().addTo(mapRef.current);

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

    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const fetchNearbyPlaces = async (lat: number, lon: number, category: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${category}&` +
        `viewbox=${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}&` +
        `bounded=1&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const places = await response.json();
      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }
  };

  const showPlacesOnMap = async (category: string) => {
    if (!mapRef.current || !markersRef.current) return;

    try {
      const center = mapRef.current.getCenter();
      const places = await fetchNearbyPlaces(center.lat, center.lng, category);

      // Clear existing markers
      markersRef.current.clearLayers();

      places.forEach((place: any) => {
        const marker = L.marker([parseFloat(place.lat), parseFloat(place.lon)])
          .bindPopup(`
            <strong>${place.display_name.split(',')[0]}</strong><br>
            ${place.type}: ${place.display_name}
          `);
        markersRef.current?.addLayer(marker);
      });

      // If places were found, notify the user
      if (places.length > 0) {
        toast({
          title: "Places found",
          description: `Found ${places.length} ${category} locations nearby.`,
        });
      } else {
        toast({
          title: "No places found",
          description: `No ${category} locations found in this area.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch nearby places. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Effect to handle location changes
  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Clean up previous markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Use OpenStreetMap Nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 12);
            const marker = L.marker([lat, lng])
              .bindPopup(`<strong>${location}</strong>`)
              .addTo(markersRef.current!);
          }
          onCenterChange({ lat, lng });
        } else {
          toast({
            title: "Location not found",
            description: "Could not find the specified location on the map.",
            variant: "destructive"
          });
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location data. Please try again.",
          variant: "destructive"
        });
      });
  }, [location]);

  // Effect to handle category changes
  useEffect(() => {
    if (mapReady && searchCategory && location) {
      showPlacesOnMap(searchCategory);
    }
  }, [searchCategory, mapReady, location]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg" 
      style={{ minHeight: '400px' }}
    />
  );
}