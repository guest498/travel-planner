import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Handle map movement
    mapRef.current.on('moveend', () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Effect to handle location changes
  useEffect(() => {
    if (!location || !mapRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    const geocodeLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Update map view
          mapRef.current?.setView([lat, lng], 13);

          // Add main location marker
          const mainMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'location-marker',
              html: `<div class="bg-primary text-white px-4 py-2 rounded-lg shadow-lg text-base font-semibold whitespace-nowrap">
                      ${location}
                    </div>`,
              iconSize: [200, 40],
              iconAnchor: [100, 40]
            })
          }).addTo(markersRef.current!);

          // Fetch nearby points of interest
          const bbox = {
            north: lat + 0.02,
            south: lat - 0.02,
            east: lng + 0.02,
            west: lng - 0.02
          };

          const poiResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `viewbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&` +
            `bounded=1&limit=10&amenity=restaurant|school|hospital|park|university`
          );

          const pois = await poiResponse.json();

          // Add POI markers
          pois.slice(0, 5).forEach((poi: any) => {
            const poiLat = parseFloat(poi.lat);
            const poiLng = parseFloat(poi.lon);
            const name = poi.display_name.split(',')[0];
            const type = (poi.type || 'location').replace('_', ' ');

            // Create marker for each POI
            const poiMarker = L.marker([poiLat, poiLng], {
              icon: L.divIcon({
                className: 'poi-marker',
                html: `<div class="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium">
                        ${name}
                      </div>`,
                iconSize: [150, 30],
                iconAnchor: [75, 30]
              })
            });

            // Create popup content for POI
            const popupContent = `
              <div class="p-3">
                <h4 class="font-bold text-base mb-1">${name}</h4>
                <p class="text-sm text-muted-foreground">${type}</p>
                <p class="text-sm mt-2">${poi.display_name}</p>
              </div>
            `;

            poiMarker.bindPopup(popupContent);
            poiMarker.addTo(markersRef.current!);
          });

          // Create summary popup for main marker
          const mainPopupContent = `
            <div class="p-4 max-w-xs">
              <h3 class="text-lg font-bold mb-2">${location}</h3>
              <div class="space-y-2">
                <p class="font-medium text-primary">Nearby Points of Interest:</p>
                <ul class="list-disc pl-4 space-y-1">
                  ${pois.slice(0, 5).map((poi: any) => `
                    <li class="text-sm">
                      ${poi.display_name.split(',')[0]}
                      <span class="text-xs text-muted-foreground">
                        (${(poi.type || 'location').replace('_', ' ')})
                      </span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `;

          mainMarker.bindPopup(mainPopupContent).openPopup();
          onCenterChange({ lat, lng });

        } else {
          toast({
            title: "Location not found",
            description: "Could not find the specified location on the map.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location data. Please try again.",
          variant: "destructive"
        });
      }
    };

    geocodeLocation();
  }, [location]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-lg overflow-hidden shadow-md"
    />
  );
}