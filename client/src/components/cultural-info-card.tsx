import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Users, PartyPopper, ScrollText } from "lucide-react";
import type { CulturalData } from '@/lib/types';

interface CulturalInfoCardProps {
  location: string;
}

export default function CulturalInfoCard({ location }: CulturalInfoCardProps) {
  const { data, isLoading } = useQuery<CulturalData>({
    queryKey: ['/api/cultural-info', location],
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!data) return null;

  return (
    <Card className="p-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cultural Insights: {location}</h3>
        <Globe className="h-6 w-6 text-primary animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="animate-in fade-in duration-700 delay-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Languages</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.languages.map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm
                         hover:bg-primary/20 transition-colors"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-700 delay-300">
          <div className="flex items-center gap-2 mb-2">
            <PartyPopper className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Local Festivals</p>
          </div>
          <ul className="space-y-2">
            {data.festivals.map((festival, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-accent/5
                         hover:bg-accent/10 transition-colors"
              >
                {festival}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-in fade-in duration-700 delay-400">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Local Customs & Etiquette</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{data.customs}</p>
            <ul className="space-y-1 mt-2">
              {data.etiquette.map((rule, index) => (
                <li
                  key={index}
                  className="text-sm flex items-center gap-2 before:content-['•'] before:text-primary"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
