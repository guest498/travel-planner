import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
  location: string | null;
  searchCategory: string | null;
}

interface PlaceInfo {
  name: string;
  type: string;
  address: string;
  lat: number;
  lon: number;
  details?: {
    opening_hours?: string;
    phone?: string;
    website?: string;
    description?: string;
  };
}

export default function MapView({ center, onCenterChange, location, searchCategory }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const { toast } = useToast();
  const [mapReady, setMapReady] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 12);
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    mapRef.current.on('moveend', () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      onCenterChange({ 
        lat: center.lat, 
        lng: center.lng 
      });
    });

    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getCategoryQuery = (category: string): string => {
    const categoryMappings: Record<string, string> = {
      'education': '[amenity=university],[amenity=school],[amenity=college],[amenity=library]',
      'healthcare': '[amenity=hospital],[amenity=clinic],[amenity=doctors],[amenity=pharmacy]',
      'tourism': '[tourism=*],[historic=*],[amenity=place_of_worship]',
      'dining': '[amenity=restaurant],[amenity=cafe],[amenity=fast_food],[amenity=bar]',
      'shopping': '[shop=*]',
      'entertainment': '[leisure=*],[amenity=cinema],[amenity=theatre]'
    };
    return categoryMappings[category.toLowerCase()] || category;
  };

  const fetchPlaceDetails = async (place: any): Promise<PlaceInfo> => {
    const details: PlaceInfo = {
      name: place.display_name.split(',')[0],
      type: place.type,
      address: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      details: {
        opening_hours: place.tags?.opening_hours,
        phone: place.tags?.phone,
        website: place.tags?.website,
        description: `${place.type} in ${place.display_name.split(',').slice(1, 3).join(', ')}`
      }
    };
    return details;
  };

  const fetchNearbyPlaces = async (lat: number, lon: number, category: string) => {
    try {
      const bbox = {
        north: lat + 0.2,
        south: lat - 0.2,
        east: lon + 0.2,
        west: lon - 0.2
      };

      const query = getCategoryQuery(category);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `viewbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&` +
        `bounded=1&limit=20&addressdetails=1&extratags=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const places = await response.json();
      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }
  };

  const createMarkerPopup = (place: PlaceInfo) => {
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold">${place.name}</h3>
        <p class="text-sm text-muted-foreground">${place.type}</p>
        <p class="text-sm">${place.address}</p>
        ${place.details?.opening_hours ? `<p class="text-sm">Hours: ${place.details.opening_hours}</p>` : ''}
        ${place.details?.phone ? `<p class="text-sm">Phone: ${place.details.phone}</p>` : ''}
        ${place.details?.website ? `<p class="text-sm">Website: <a href="${place.details.website}" target="_blank" rel="noopener noreferrer">${place.details.website}</a></p>` : ''}
        ${place.details?.description ? `<p class="text-sm">${place.details.description}</p>` : ''}
      </div>
    `;
    return popupContent;
  };

  const showPlacesOnMap = async (category: string) => {
    if (!mapRef.current || !markersRef.current) return;

    try {
      const center = mapRef.current.getCenter();
      const places = await fetchNearbyPlaces(center.lat, center.lng, category);

      // Clear existing markers
      markersRef.current.clearLayers();

      // Add the main location marker first
      if (location) {
        const mainMarker = L.marker([center.lat, center.lng])
          .bindPopup(`<strong>${location}</strong>`)
          .addTo(markersRef.current);
      }

      let placesFound = 0;
      for (const place of places) {
        if (place.lat && place.lon) {
          placesFound++;
          const placeInfo = await fetchPlaceDetails(place);
          const marker = L.marker([placeInfo.lat, placeInfo.lon])
            .bindPopup(createMarkerPopup(placeInfo));
          markersRef.current?.addLayer(marker);
        }
      }

      if (placesFound > 0) {
        toast({
          title: `${placesFound} ${category} locations found`,
          description: `Found ${placesFound} places nearby. Click on markers for details.`,
        });
      } else {
        toast({
          title: "Expanding search",
          description: `Searching in a wider area for ${category} locations...`,
        });
        // Try again with a wider search area
        const widePlaces = await fetchNearbyPlaces(center.lat, center.lng, category);
        for (const place of widePlaces) {
          if (place.lat && place.lon) {
            const placeInfo = await fetchPlaceDetails(place);
            const marker = L.marker([placeInfo.lat, placeInfo.lon])
              .bindPopup(createMarkerPopup(placeInfo));
            markersRef.current?.addLayer(marker);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch nearby places. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Effect to handle location changes
  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Clean up previous markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Use OpenStreetMap Nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 12);
            const marker = L.marker([lat, lng])
              .bindPopup(`<strong>${location}</strong>`)
              .addTo(markersRef.current!);
          }
          onCenterChange({ lat, lng });
        } else {
          toast({
            title: "Location not found",
            description: "Could not find the specified location on the map.",
            variant: "destructive"
          });
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location data. Please try again.",
          variant: "destructive"
        });
      });
  }, [location]);

  // Effect to handle category changes
  useEffect(() => {
    if (mapReady && searchCategory && location) {
      showPlacesOnMap(searchCategory);
    }
  }, [searchCategory, mapReady, location]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg" 
      style={{ minHeight: '400px' }}
    />
  );
}