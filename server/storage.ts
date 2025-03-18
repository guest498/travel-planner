import type { Conversation, InsertConversation, WeatherCache, InsertWeatherCache, Favorite, InsertFavorite, User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface SearchHistoryEntry {
  query: string;
  location: string | null;
  category: string | null;
  timestamp: Date;
}

export interface IStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getWeatherCache(location: string): Promise<WeatherCache | undefined>;
  updateWeatherCache(cache: InsertWeatherCache): Promise<WeatherCache>;
  getFavorites(): Promise<Favorite[]>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  getFavorite(id: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addSearchHistory(userId: number, query: string, location: string | null, category: string | null): Promise<void>;
  getRecentSearches(userId: number): Promise<SearchHistoryEntry[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private weatherCache: Map<string, WeatherCache>;
  private favorites: Map<number, Favorite>;
  private users: Map<number, User>;
  private usersByUsername: Map<string, User>;
  private searchHistory: Map<number, SearchHistoryEntry[]>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.conversations = new Map();
    this.weatherCache = new Map();
    this.favorites = new Map();
    this.users = new Map();
    this.usersByUsername = new Map();
    this.searchHistory = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const newConversation: Conversation = {
      id,
      createdAt: new Date(),
      messages: conversation.messages,
      location: conversation.location ?? null,
      userId: conversation.userId
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
      id,
      updatedAt: new Date(),
      location: cache.location,
      data: cache.data
    };
    this.weatherCache.set(cache.location, newCache);
    return newCache;
  }

  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favorites.get(id);
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentId++;
    const newFavorite: Favorite = {
      id,
      createdAt: new Date(),
      location: favorite.location,
      userId: favorite.userId,
      notes: favorite.notes || null
    };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    this.favorites.delete(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const existingUser = await this.getUserByUsername(user.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const id = this.currentId++;
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    this.usersByUsername.set(user.username, newUser);
    return newUser;
  }

  async addSearchHistory(userId: number, query: string, location: string | null, category: string | null): Promise<void> {
    const userHistory = this.searchHistory.get(userId) || [];
    const newEntry: SearchHistoryEntry = {
      query,
      location,
      category,
      timestamp: new Date()
    };

    // Keep only the last 10 searches
    userHistory.unshift(newEntry);
    if (userHistory.length > 10) {
      userHistory.pop();
    }

    this.searchHistory.set(userId, userHistory);
  }

  async getRecentSearches(userId: number): Promise<SearchHistoryEntry[]> {
    return this.searchHistory.get(userId) || [];
  }
}

export const storage = new MemStorage();