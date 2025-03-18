import { useState } from 'react';
import { Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Favorite } from '@shared/schema';

interface FavoritesProps {
  onSelect: (location: string) => void;
}

export default function Favorites({ onSelect }: FavoritesProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Location removed",
        description: "Removed from your favorites.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading favorites...</div>;
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        Favorite Destinations
      </h3>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <button
                onClick={() => onSelect(favorite.location)}
                className="text-left flex-1"
              >
                <p className="font-medium capitalize">{favorite.location}</p>
                {favorite.notes && (
                  <p className="text-sm text-muted-foreground">{favorite.notes}</p>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {favorites.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No favorites yet. Click the heart icon when viewing a location to add it here!
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}