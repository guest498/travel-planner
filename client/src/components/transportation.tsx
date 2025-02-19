import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Train } from "lucide-react";

interface TransportationProps {
  location: string;
}

export default function Transportation({ location }: TransportationProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/transportation', location],
    enabled: !!location
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!data) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Transportation Options</h3>

      <Tabs defaultValue="flights">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="trains" className="flex items-center gap-2">
            <Train className="h-4 w-4" />
            Trains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          <div className="space-y-4">
            {data.flights.map((flight: any, i: number) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{flight.airline}</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.departure} - {flight.arrival}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${flight.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.duration}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trains">
          <div className="space-y-4">
            {data.trains.map((train: any, i: number) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{train.operator}</p>
                    <p className="text-sm text-muted-foreground">
                      {train.departure} - {train.arrival}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${train.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {train.duration}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
