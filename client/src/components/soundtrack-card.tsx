import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { Music, PlayCircle } from "lucide-react";
import type { SoundtrackData } from '@/lib/types';

interface SoundtrackCardProps {
  location: string;
}

export default function SoundtrackCard({ location }: SoundtrackCardProps) {
  const { data, isLoading } = useQuery<SoundtrackData>({
    queryKey: ['/api/soundtrack', location],
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  if (!data) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Travel Soundtrack for {location}</h3>
        <Music className="h-6 w-6 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Recommended Genres</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {data.genres.map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Cultural Context</p>
          <p className="mt-1">{data.culturalContext}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Recommended Tracks</p>
          <div className="space-y-2">
            {data.recommendations.map((track, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                <PlayCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
