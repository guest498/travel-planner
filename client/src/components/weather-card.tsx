import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Snowflake,
  ThermometerSun
} from "lucide-react";
import type { WeatherData } from '@/lib/types';

interface WeatherCardProps {
  location: string;
}

export default function WeatherCard({ location }: WeatherCardProps) {
  const { data, isLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather', location],
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  if (!data) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8" />;
      case 'rain':
        return <CloudRain className="h-8 w-8" />;
      case 'snow':
        return <Snowflake className="h-8 w-8" />;
      default:
        return <ThermometerSun className="h-8 w-8" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Weather in {location}</h3>
        {getWeatherIcon(data.condition)}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold">
          {data.temperature}°C
        </p>
        <p className="text-muted-foreground">
          {data.condition}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Humidity</p>
            <p className="font-medium">{data.humidity}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Wind</p>
            <p className="font-medium">{data.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </Card>
  );
}