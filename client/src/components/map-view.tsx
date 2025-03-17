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
  color: string;
  icon: string;
  locations: Array<{
    name: string;
    description: string;
  }>;
}

// Predefined locations for each category based on the location
const getLocationData = (location: string): Record<string, CategoryConfig> => ({
  education: {
    color: '#4CAF50',
    icon: '🎓',
    locations: [
      {
        name: 'Columbia University',
        description: 'Prestigious research university in Manhattan\'s Morningside Heights'
      },
      {
        name: 'New York University (NYU)',
        description: 'Private university centered in Greenwich Village'
      },
      {
        name: 'The Juilliard School',
        description: 'World-renowned performing arts conservatory at Lincoln Center'
      }
    ]
  },
  healthcare: {
    color: '#F44336',
    icon: '🏥',
    locations: [
      {
        name: 'NewYork-Presbyterian Hospital',
        description: 'Leading academic medical center in Manhattan'
      },
      {
        name: 'Mount Sinai Hospital',
        description: 'Historic teaching hospital on the Upper East Side'
      },
      {
        name: 'NYC Health + Hospitals/Bellevue',
        description: 'Oldest public hospital in America, located in Kips Bay'
      }
    ]
  },
  tourism: {
    color: '#2196F3',
    icon: '🏛️',
    locations: [
      {
        name: 'Empire State Building',
        description: 'Iconic 102-story Art Deco skyscraper in Midtown Manhattan'
      },
      {
        name: 'Metropolitan Museum of Art',
        description: 'World-class art museum on Museum Mile, Central Park'
      },
      {
        name: 'Times Square',
        description: 'Major commercial intersection and entertainment center in Midtown'
      }
    ]
  }
});

export default function MapView({ center, onCenterChange, location }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

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
            const categories = getLocationData(location);
            div.innerHTML = `
              <div class="bg-white p-4 rounded-lg shadow-lg min-w-[250px]">
                <h4 class="font-bold mb-3">What would you like to see?</h4>
                ${Object.entries(categories).map(([category, config]) => `
                  <button
                    onclick="window.showCategoryInfo('${category}')"
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
          (window as any).showCategoryInfo = (category: string) => {
            const categories = getLocationData(location);
            const config = categories[category];
            const popup = L.popup()
              .setLatLng([lat, lng])
              .setContent(`
                <div class="p-4 max-w-xs">
                  <h4 class="font-bold text-lg mb-2" style="color: ${config.color}">
                    ${config.icon} ${category.charAt(0).toUpperCase() + category.slice(1)} Locations
                  </h4>
                  <div class="space-y-4">
                    ${config.locations.map(loc => `
                      <div>
                        <h5 class="font-medium text-sm">${loc.name}</h5>
                        <p class="text-xs text-muted-foreground">${loc.description}</p>
                      </div>
                    `).join('')}
                  </div>
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