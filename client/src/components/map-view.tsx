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

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);
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
    const nameParts = place.display_name.split(',');
    const mainName = nameParts[0];
    const area = nameParts.slice(1, 3).join(', ').trim();

    let description = '';
    if (place.type.toLowerCase().includes('education') ||
      place.type.toLowerCase().includes('school') ||
      place.type.toLowerCase().includes('university')) {
      description = `Educational institution in ${area}`;
    } else {
      description = `${place.type} in ${area}`;
    }

    const details: PlaceInfo = {
      name: mainName,
      type: place.type,
      address: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      details: {
        opening_hours: place.tags?.opening_hours,
        phone: place.tags?.phone,
        website: place.tags?.website,
        description: description
      }
    };
    return details;
  };

  const fetchNearbyPlaces = async (lat: number, lon: number, category: string) => {
    try {
      const bbox = {
        north: lat + 0.1,
        south: lat - 0.1,
        east: lon + 0.1,
        west: lon - 0.1
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
      <div class="p-4 max-w-xs">
        <h3 class="text-lg font-bold mb-1">${place.name}</h3>
        <p class="text-sm font-medium text-primary mb-2">${place.type}</p>
        <div class="space-y-2 text-sm">
          <p class="text-muted-foreground">${place.details?.description || ''}</p>
          ${place.details?.opening_hours ? `<p><strong>Hours:</strong> ${place.details.opening_hours}</p>` : ''}
          ${place.details?.phone ? `<p><strong>Phone:</strong> ${place.details.phone}</p>` : ''}
          ${place.details?.website ? `<p><strong>Website:</strong> <a href="${place.details.website}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${place.details.website}</a></p>` : ''}
          <p class="text-xs text-muted-foreground mt-2">${place.address}</p>
        </div>
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
        const mainMarker = L.marker([center.lat, center.lng], {
          icon: L.divIcon({
            className: 'main-location-marker',
            html: `<div class="bg-primary text-white px-2 py-1 rounded-lg shadow-lg">${location}</div>`,
            iconSize: [100, 40],
            iconAnchor: [50, 40]
          })
        }).bindPopup(`<strong>${location}</strong>`);
        mainMarker.addTo(markersRef.current);
      }

      let placesFound = 0;
      for (const place of places) {
        if (place.lat && place.lon) {
          placesFound++;
          const placeInfo = await fetchPlaceDetails(place);
          const marker = L.marker([placeInfo.lat, placeInfo.lon], {
            icon: L.divIcon({
              className: 'place-marker',
              html: `<div class="bg-white px-2 py-1 rounded shadow text-sm">${placeInfo.name}</div>`,
              iconSize: [100, 30],
              iconAnchor: [50, 30]
            })
          }).bindPopup(createMarkerPopup(placeInfo));
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
            const marker = L.marker([placeInfo.lat, placeInfo.lon], {
              icon: L.divIcon({
                className: 'place-marker',
                html: `<div class="bg-white px-2 py-1 rounded shadow text-sm">${placeInfo.name}</div>`,
                iconSize: [100, 30],
                iconAnchor: [50, 30]
              })
            }).bindPopup(createMarkerPopup(placeInfo));
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

    const geocodeLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Update map center and add location marker
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);

            // Add a main location marker
            const locationIcon = L.divIcon({
              className: 'main-location-marker',
              html: `<div class="bg-primary text-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium">${location}</div>`,
              iconSize: [120, 30],
              iconAnchor: [60, 30]
            });

            L.marker([lat, lng], { icon: locationIcon })
              .addTo(markersRef.current!);

            onCenterChange({ lat, lng });

            // If a category is selected, fetch and display nearby places
            if (searchCategory) {
              const places = await fetchNearbyPlaces(lat, lng, searchCategory);

              for (const place of places) {
                if (place.lat && place.lon) {
                  const placeInfo = await fetchPlaceDetails(place);
                  const placeIcon = L.divIcon({
                    className: 'place-marker',
                    html: `<div class="bg-white px-2 py-1 rounded shadow-lg text-sm">${placeInfo.name}</div>`,
                    iconSize: [100, 24],
                    iconAnchor: [50, 24]
                  });

                  L.marker([placeInfo.lat, placeInfo.lon], { icon: placeIcon })
                    .bindPopup(createMarkerPopup(placeInfo))
                    .addTo(markersRef.current!);
                }
              }
            }
          }
        } else {
          toast({
            title: "Location not found",
            description: "Could not find the specified location on the map.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location data. Please try again.",
          variant: "destructive"
        });
      }
    };

    geocodeLocation();
  }, [location, searchCategory]);

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