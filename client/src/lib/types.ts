export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface CulturalData {
  languages: string[];
  festivals: string[];
  customs: string;
  etiquette: string[];
}

export interface TransportationData {
  flights: Array<{
    airline: string;
    departure: string;
    arrival: string;
    price: number;
    duration: string;
  }>;
  trains: Array<{
    operator: string;
    departure: string;
    arrival: string;
    price: number;
    duration: string;
  }>;
}

export interface ImageGenerationResponse {
  imageUrl: string;
}
