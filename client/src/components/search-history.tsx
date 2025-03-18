import { Card } from "@/components/ui/card";

interface SearchHistoryProps {
  onLocationSelect: (location: string) => void;
  searchQueries: Array<{
    query: string;
    timestamp: Date;
  }>;
}

export default function SearchHistory({ onLocationSelect, searchQueries }: SearchHistoryProps) {
  if (!searchQueries?.length) {
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
        {searchQueries.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-muted rounded-lg"
          >
            <p className="font-medium">{item.query}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.timestamp.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}