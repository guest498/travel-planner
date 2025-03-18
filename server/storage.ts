import type { Conversation, InsertConversation, WeatherCache, InsertWeatherCache, Favorite, InsertFavorite, User, InsertUser, UserHistory, InsertUserHistory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserHistory(userId: number): Promise<UserHistory[]>;
  createUserHistory(history: InsertUserHistory): Promise<UserHistory>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private weatherCache: Map<string, WeatherCache>;
  private favorites: Map<number, Favorite>;
  private users: Map<number, User>;
  private usersByEmail: Map<string, User>;
  private userHistory: Map<number, UserHistory>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.conversations = new Map();
    this.weatherCache = new Map();
    this.favorites = new Map();
    this.users = new Map();
    this.usersByEmail = new Map();
    this.userHistory = new Map();
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
      location: conversation.location,
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const id = this.currentId++;
    const newUser: User = {
      id,
      email: user.email,
      password: user.password,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    this.usersByEmail.set(user.email, newUser);
    return newUser;
  }

  async getUserHistory(userId: number): Promise<UserHistory[]> {
    return Array.from(this.userHistory.values())
      .filter(h => h.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createUserHistory(history: InsertUserHistory): Promise<UserHistory> {
    const id = this.currentId++;
    const newHistory: UserHistory = {
      id,
      userId: history.userId,
      searchQuery: history.searchQuery,
      location: history.location,
      category: history.category,
      timestamp: new Date()
    };
    this.userHistory.set(id, newHistory);
    return newHistory;
  }
}

export const storage = new MemStorage();