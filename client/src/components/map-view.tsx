import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
  location: string | null;
}

interface CategoryConfig {
  query: string;
  color: string;
  icon: string;
}

const CATEGORIES: Record<string, CategoryConfig> = {
  education: {
    query: '[amenity=university],[amenity=school],[amenity=college]',
    color: '#4CAF50',
    icon: '🎓'
  },
  healthcare: {
    query: '[amenity=hospital],[amenity=clinic],[amenity=doctors]',
    color: '#F44336',
    icon: '🏥'
  },
  tourism: {
    query: '[tourism=attraction],[historic=*],[amenity=place_of_worship]',
    color: '#2196F3',
    icon: '🏛️'
  }
};

export default function MapView({ center, onCenterChange, location }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);

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

  // Fetch POIs for a specific category
  const fetchPOIs = async (lat: number, lng: number, category: string, config: CategoryConfig) => {
    const bbox = {
      north: lat + 0.02,
      south: lat - 0.02,
      east: lng + 0.02,
      west: lng - 0.02
    };

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(config.query)}&` +
      `viewbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&` +
      `bounded=1&limit=5`
    );

    return await response.json();
  };

  // Effect to handle location changes
  useEffect(() => {
    if (!location || !mapRef.current) return;

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
          }).addTo(mapRef.current);

          // Create category control menu
          const categoryControl = L.control({ position: 'topright' });
          categoryControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'category-menu');
            div.innerHTML = `
              <div class="bg-white p-4 rounded-lg shadow-lg min-w-[200px]">
                <h4 class="font-bold mb-3">What would you like to see?</h4>
                ${Object.entries(CATEGORIES).map(([category, config]) => `
                  <button
                    onclick="window.showCategoryInfo('${category}', ${lat}, ${lng})"
                    class="flex items-center gap-2 w-full p-2 mb-2 rounded transition-colors hover:bg-gray-100"
                    style="color: ${config.color}"
                  >
                    ${config.icon} ${category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                `).join('')}
              </div>
            `;
            return div;
          };
          categoryControl.addTo(mapRef.current);

          // Add window function to handle category selection
          (window as any).showCategoryInfo = async (category: string, lat: number, lng: number) => {
            const config = CATEGORIES[category];
            const pois = await fetchPOIs(lat, lng, category, config);

            if (pois.length === 0) {
              toast({
                title: "No locations found",
                description: `No ${category} locations found nearby.`,
                variant: "destructive"
              });
              return;
            }

            const popup = L.popup()
              .setLatLng([lat, lng])
              .setContent(`
                <div class="p-4 max-w-xs">
                  <h4 class="font-bold text-lg mb-2" style="color: ${config.color}">
                    ${config.icon} Nearby ${category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <ul class="space-y-2">
                    ${pois.map((poi: any) => `
                      <li class="text-sm">
                        <strong>${poi.display_name.split(',')[0]}</strong>
                        <p class="text-xs text-muted-foreground mt-1">${poi.display_name}</p>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `)
              .openOn(mapRef.current!);
          };

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