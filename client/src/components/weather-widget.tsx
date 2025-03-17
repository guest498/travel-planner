import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WeatherWidgetProps {
  location: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface TravelRecommendation {
  activity: string;
  reason: string;
  bestTime: string;
}

interface WeatherResponse {
  weather: WeatherData;
  recommendations: TravelRecommendation[];
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: () => apiRequest<WeatherResponse>(`/api/weather/${encodeURIComponent(location)}`),
    enabled: !!location
  });

  if (!location) return null;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const { weather, recommendations } = data;

  return (
    <Card className="p-6">
      {/* Weather Information */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-4">Current Weather in {location}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="text-4xl mr-2">{weather.icon}</span>
            <div>
              <p className="text-3xl font-bold">{weather.temperature}°C</p>
              <p className="text-lg text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      {/* Travel Recommendations */}
      <div>
        <h4 className="text-xl font-semibold mb-4">Travel Recommendations</h4>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <p className="font-medium">{rec.activity}</p>
              </div>
              <p className="text-sm text-muted-foreground">{rec.reason}</p>
              <p className="text-sm mt-2">
                <span className="font-medium">Best time:</span> {rec.bestTime}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}