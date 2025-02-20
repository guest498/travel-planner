import type { Conversation, InsertConversation, WeatherCache, InsertWeatherCache, Favorite, InsertFavorite } from "@shared/schema";

export interface IStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getWeatherCache(location: string): Promise<WeatherCache | undefined>;
  updateWeatherCache(cache: InsertWeatherCache): Promise<WeatherCache>;
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private weatherCache: Map<string, WeatherCache>;
  private favorites: Map<number, Favorite>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.weatherCache = new Map();
    this.favorites = new Map();
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

  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentId++;
    const newFavorite: Favorite = {
      ...favorite,
      id,
      createdAt: new Date()
    };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    this.favorites.delete(id);
  }
}

export const storage = new MemStorage();