import { useState } from 'react';
import { Card } from "@/components/ui/card";
import ChatInterface from '@/components/chat-interface';
import MapView from '@/components/map-view';
import WeatherCard from '@/components/weather-card';
import CulturalInfo from '@/components/cultural-info';
import Transportation from '@/components/transportation';
import LocationImage from '@/components/location-image';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Chat and Weather */}
          <div className="lg:col-span-1 space-y-4">
            <ChatInterface 
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                // Update map center when location changes
              }}
            />
            {selectedLocation && (
              <WeatherCard location={selectedLocation} />
            )}
          </div>

          {/* Center and right - Map and Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 h-[500px]">
              <MapView 
                center={mapCenter} 
                onCenterChange={setMapCenter}
                location={selectedLocation}
              />
            </Card>

            {selectedLocation && (
              <>
                <LocationImage location={selectedLocation} />
                <CulturalInfo location={selectedLocation} />
                <Transportation location={selectedLocation} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}