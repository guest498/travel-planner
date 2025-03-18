import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UserHistory } from "@shared/schema";

interface SearchHistoryProps {
  onLocationSelect: (location: string) => void;
}

export default function SearchHistory({ onLocationSelect }: SearchHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['/api/user/history'],
    queryFn: () => apiRequest<UserHistory[]>('/api/user/history'),
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!history?.length) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">No search history yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
            onClick={() => item.location && onLocationSelect(item.location)}
          >
            <p className="font-medium">{item.searchQuery}</p>
            {item.location && (
              <p className="text-sm text-muted-foreground">Location: {item.location}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
