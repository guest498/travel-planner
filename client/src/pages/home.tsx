import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ChatInterface from '@/components/chat-interface';
import MapView from '@/components/map-view';
import WeatherCard from '@/components/weather-card';
import CulturalInfo from '@/components/cultural-info';
import Transportation from '@/components/transportation';
import LocationImage from '@/components/location-image';
import Favorites from '@/components/favorites';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const addFavoriteMutation = useMutation({
    mutationFn: async (location: string) => {
      const response = await apiRequest('POST', '/api/favorites', { location });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location saved",
        description: "Added to your favorites!",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Chat, Weather, and Favorites */}
          <div className="lg:col-span-1 space-y-4">
            <ChatInterface 
              onLocationSelect={(location, category) => {
                setSelectedLocation(location);
                setSearchCategory(category || null);
              }}
            />
            {selectedLocation && (
              <WeatherCard location={selectedLocation} />
            )}
            <Favorites onSelect={setSelectedLocation} />
          </div>

          {/* Center and right - Location Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              {selectedLocation && (
                <h2 className="text-2xl font-bold">
                  {selectedLocation}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => addFavoriteMutation.mutate(selectedLocation)}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </h2>
              )}
            </div>

            <Card className="p-4">
              <MapView location={selectedLocation} />
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