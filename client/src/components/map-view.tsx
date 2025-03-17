import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  location: string | null;
}

interface LocationInfo {
  name: string;
  location: string;
}

interface CategoryConfig {
  color: string;
  icon: string;
  locations: LocationInfo[];
}

const getLocationData = (location: string): Record<string, CategoryConfig> => {
  // Define location-specific data
  const locationData: Record<string, Record<string, CategoryConfig>> = {
    'new york': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Columbia University',
            location: 'Morningside Heights, Manhattan, New York'
          },
          {
            name: 'New York University (NYU)',
            location: 'Greenwich Village, Manhattan, New York'
          },
          {
            name: 'The Juilliard School',
            location: 'Lincoln Center, Manhattan, New York'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'NewYork-Presbyterian Hospital',
            location: 'East 68th Street, Manhattan, New York'
          },
          {
            name: 'Mount Sinai Hospital',
            location: 'Upper East Side, Manhattan, New York'
          },
          {
            name: 'NYC Health + Hospitals/Bellevue',
            location: 'First Avenue, Kips Bay, Manhattan'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Empire State Building',
            location: '350 Fifth Avenue, Midtown Manhattan, New York'
          },
          {
            name: 'Metropolitan Museum of Art',
            location: '1000 Fifth Avenue, Museum Mile, Manhattan'
          },
          {
            name: 'Times Square',
            location: 'Broadway and 7th Avenue, Midtown Manhattan'
          }
        ]
      }
    },
    'india': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Indian Institute of Technology Delhi',
            location: 'Hauz Khas, New Delhi, India'
          },
          {
            name: 'University of Delhi',
            location: 'North Campus, Delhi, India'
          },
          {
            name: 'Indian Institute of Science',
            location: 'Bangalore, Karnataka, India'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'All India Institute of Medical Sciences',
            location: 'Ansari Nagar, New Delhi, India'
          },
          {
            name: 'Tata Memorial Hospital',
            location: 'Parel, Mumbai, India'
          },
          {
            name: 'Apollo Hospitals',
            location: 'Chennai, Tamil Nadu, India'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Taj Mahal',
            location: 'Agra, Uttar Pradesh, India'
          },
          {
            name: 'Amber Fort',
            location: 'Jaipur, Rajasthan, India'
          },
          {
            name: 'Gateway of India',
            location: 'Apollo Bunder, Mumbai, India'
          }
        ]
      }
    }
  };

  // Convert location to lowercase for case-insensitive matching
  const locationKey = location.toLowerCase();
  return locationData[locationKey] || {
    education: { color: '#4CAF50', icon: '🎓', locations: [] },
    healthcare: { color: '#F44336', icon: '🏥', locations: [] },
    tourism: { color: '#2196F3', icon: '🏛️', locations: [] }
  };
};

export default function MapView({ location }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create new map instance
    mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location]); // Reinitialize map when location changes

  // Update map when location changes
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

          // Clear existing markers
          mapRef.current?.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              layer.remove();
            }
          });

          // Update view and add marker
          mapRef.current?.setView([lat, lng], 6);
          L.marker([lat, lng])
            .addTo(mapRef.current!)
            .bindPopup(`<b>${location}</b>`)
            .openPopup();
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location on map. Please try again.",
          variant: "destructive"
        });
      }
    };

    geocodeLocation();
  }, [location]);

  if (!location) return null;

  const categories = getLocationData(location);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Map */}
      <div 
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg overflow-hidden shadow-md"
      />

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, config]) => (
          <Card key={category} className="p-4">
            <div className="flex items-center gap-2 mb-4" style={{ color: config.color }}>
              <span className="text-2xl">{config.icon}</span>
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
            </div>
            <div className="space-y-4">
              {config.locations.map((loc, index) => (
                <div key={index} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                  <p><strong>Place:</strong> {location}</p>
                  <p><strong>Name:</strong> {loc.name}</p>
                  <p><strong>Location:</strong> {loc.location}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}