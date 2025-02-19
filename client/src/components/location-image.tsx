import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from '@/lib/queryClient';

interface LocationImageProps {
  location: string;
}

export default function LocationImage({ location }: LocationImageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/generate-image', location],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/generate-image', { location });
      return response.json();
    },
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-lg" />;
  }

  if (!data?.imageUrl) return null;

  return (
    <Card className="overflow-hidden">
      <img 
        src={data.imageUrl} 
        alt={`AI generated image of ${location}`}
        className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-300"
      />
    </Card>
  );
}
