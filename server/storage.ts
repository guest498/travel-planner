import type { Conversation, InsertConversation, WeatherCache, InsertWeatherCache } from "@shared/schema";

export interface IStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getWeatherCache(location: string): Promise<WeatherCache | undefined>;
  updateWeatherCache(cache: InsertWeatherCache): Promise<WeatherCache>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private weatherCache: Map<string, WeatherCache>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.weatherCache = new Map();
    this.currentId = 1;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async getWeatherCache(location: string): Promise<WeatherCache | undefined> {
    return this.weatherCache.get(location);
  }

  async updateWeatherCache(cache: InsertWeatherCache): Promise<WeatherCache> {
    const id = this.currentId++;
    const newCache: WeatherCache = {
      ...cache,
      id,
      updatedAt: new Date()
    };
    this.weatherCache.set(cache.location, newCache);
    return newCache;
  }
}

export const storage = new MemStorage();
