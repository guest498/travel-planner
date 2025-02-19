import { apiRequest } from './queryClient';

export async function sendChatMessage(message: string) {
  const response = await apiRequest('POST', '/api/chat', { message });
  return response.json();
}

export async function getWeatherInfo(location: string) {
  const response = await apiRequest('GET', `/api/weather/${encodeURIComponent(location)}`);
  return response.json();
}

export async function getCulturalInfo(location: string) {
  const response = await apiRequest('GET', `/api/cultural-info/${encodeURIComponent(location)}`);
  return response.json();
}

export async function getTransportation(location: string) {
  const response = await apiRequest('GET', `/api/transportation/${encodeURIComponent(location)}`);
  return response.json();
}
