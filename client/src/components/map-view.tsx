import { Card } from "@/components/ui/card";

interface MapViewProps {
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
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

const getLocationData = (location: string): Record<string, CategoryConfig> => ({
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
});

export default function MapView({ location }: MapViewProps) {
  if (!location) return null;

  const categories = getLocationData(location);

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, config]) => (
        <Card key={category} className="p-4">
          <div className="flex items-center gap-2 mb-4" style={{ color: config.color }}>
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
          </div>
          <div className="space-y-6">
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
  );
}