import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Languages, CalendarDays } from "lucide-react";

interface CulturalInfoProps {
  location: string;
}

export default function CulturalInfo({ location }: CulturalInfoProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/cultural-info', location],
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!data) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Cultural Information
      </h3>

      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Languages
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {data.languages.join(', ')}
            </p>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Festivals & Events
            </h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              {data.festivals.map((festival: string, i: number) => (
                <li key={i}>{festival}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Local Customs</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {data.customs}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Etiquette Tips</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              {data.etiquette.map((tip: string, i: number) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
