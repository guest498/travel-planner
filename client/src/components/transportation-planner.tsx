import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Train, Plane } from 'lucide-react';
import type { TransportationData } from '@/lib/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface TransportationPlannerProps {
  location: string;
}

export default function TransportationPlanner({ location }: TransportationPlannerProps) {
  const { data, isLoading } = useQuery<TransportationData>({
    queryKey: ['/api/transportation', location],
    enabled: !!location
  });

  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    // Initialize map
    if (!map) {
      const mapInstance = L.map('map').setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);
      setMap(mapInstance);
    }

    // Add animated route when data is available
    if (map && data) {
      const route = [
        [51.505, -0.09],
        [51.51, -0.1]
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= route.length - 1) {
          clearInterval(interval);
          return;
        }

        L.polyline([route[i], route[i + 1]], {
          color: '#6366f1',
          weight: 4,
          opacity: 0.8
        }).addTo(map);

        i++;
      }, 1000);

      return () => {
        clearInterval(interval);
        map.remove();
      };
    }
  }, [map, data]);

  return (
    <Card className="p-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transportation Options: {location}</h3>
      </div>

      <div id="map" className="h-[400px] mb-4 rounded-lg overflow-hidden" />

      {data && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Available Flights</h4>
            </div>
            <div className="space-y-2">
              {data.flights.map((flight, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{flight.airline}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.departure} - {flight.arrival}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${flight.price}</p>
                      <p className="text-sm text-muted-foreground">{flight.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Train className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Train Routes</h4>
            </div>
            <div className="space-y-2">
              {data.trains.map((train, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{train.operator}</p>
                      <p className="text-sm text-muted-foreground">
                        {train.departure} - {train.arrival}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${train.price}</p>
                      <p className="text-sm text-muted-foreground">{train.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}