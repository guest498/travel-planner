import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AIHandler } from "./ai-handler";
import { z } from "zod";
import { insertFavoriteSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import fetch from 'node-fetch';

const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || 'demo';

function ensureAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

async function searchImages(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://source.unsplash.com/featured/?${encodeURIComponent(query)}`
    );

    if (response.ok) {
      return [response.url];
    }
    return [];
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const ai = new AIHandler();

  app.post('/api/chat', ensureAuthenticated, async (req, res) => {
    try {
      const { message } = z.object({
        message: z.string()
      }).parse(req.body);

      await storage.createUserHistory({
        userId: req.user!.id,
        searchQuery: message,
        location: null,
        category: null
      });

      const locationMatch = message.match(/(?:in|at|near|around) ([\w\s,]+)(?:\s|$)/i);
      const location = locationMatch ? locationMatch[1].trim() : null;

      if (location) {
        await storage.createUserHistory({
          userId: req.user!.id,
          searchQuery: message,
          location: location,
          category: null
        });
      }

      const nearbyKeywords = ['nearby', 'close', 'around', 'near', 'local', 'proximity'];
      const placeTypes = {
        education: ['school', 'university', 'college', 'institute', 'education'],
        healthcare: ['hospital', 'clinic', 'medical', 'healthcare', 'doctor'],
        tourism: ['tourist', 'attraction', 'sightseeing', 'monument', 'landmark', 'museum'],
        dining: ['restaurant', 'cafe', 'food', 'eating', 'dining'],
        shopping: ['shop', 'mall', 'store', 'market', 'shopping']
      };

      let detectedType = '';
      for (const [type, keywords] of Object.entries(placeTypes)) {
        if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
          detectedType = type;
          break;
        }
      }

      let aiPrompt = `You are a travel assistant. `;
      if (location) {
        aiPrompt += `Focus specifically on ${location}. `;
      }
      if (detectedType) {
        aiPrompt += `Please provide detailed information about ${detectedType} places`;
        aiPrompt += location ? ` in ${location}. ` : `. `;
        aiPrompt += `Include specific suggestions and brief descriptions.`;
      } else {
        aiPrompt += `Please provide helpful travel information for this query: ${message}. `;
        aiPrompt += `Include specific details about destinations, attractions, and practical travel tips.`;
      }

      const response = await ai.chat(aiPrompt);

      let images: string[] = [];
      if (location || detectedType) {
        const searchQuery = location ? 
          (detectedType ? `${detectedType} in ${location}` : `${location} attractions`) :
          `${detectedType} places`;
        images = await searchImages(searchQuery);
      }

      if (detectedType) {
        const enrichedResponse = {
          ...response,
          category: detectedType,
          location: location,
          images: images.length > 0 ? images : null
        };
        res.json(enrichedResponse);
      } else {
        res.json({
          ...response,
          images: images.length > 0 ? images : null
        });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/favorites', ensureAuthenticated, async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user!.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/favorites', ensureAuthenticated, async (req, res) => {
    try {
      const favorite = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const created = await storage.createFavorite(favorite);
      res.json(created);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/favorites/:id', ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const favorite = await storage.getFavorite(id);
      if (!favorite || favorite.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      await storage.deleteFavorite(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/weather/:location', async (req, res) => {
    try {
      const location = req.params.location;
      const weatherData = {
        temperature: Math.round(Math.random() * 30),
        condition: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 30)
      };
      res.json(weatherData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/cultural-info/:location', async (req, res) => {
    try {
      const location = req.params.location;
      const culturalData = {
        languages: ['English', 'Local Language'],
        festivals: [
          'New Year Celebration',
          'Summer Festival',
          'Harvest Festival'
        ],
        customs: 'Rich in tradition and customs, visitors should respect local practices.',
        etiquette: [
          'Remove shoes before entering homes',
          'Bow when greeting elders',
          'Use right hand for eating'
        ]
      };
      res.json(culturalData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/transportation/:location', async (req, res) => {
    try {
      const location = req.params.location;
      const transportationData = {
        flights: [
          {
            airline: 'Global Airways',
            departure: '10:00 AM',
            arrival: '2:00 PM',
            price: 299,
            duration: '4h'
          },
          {
            airline: 'Sky Express',
            departure: '2:00 PM',
            arrival: '6:00 PM',
            price: 349,
            duration: '4h'
          }
        ],
        trains: [
          {
            operator: 'Express Rail',
            departure: '9:00 AM',
            arrival: '4:00 PM',
            price: 89,
            duration: '7h'
          },
          {
            operator: 'Local Train',
            departure: '11:00 AM',
            arrival: '6:00 PM',
            price: 59,
            duration: '7h'
          }
        ]
      };
      res.json(transportationData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-image', async (req, res) => {
    try {
      const { location } = z.object({
        location: z.string()
      }).parse(req.body);

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `A beautiful, high-quality travel photograph of ${location}. Show iconic landmarks and scenery. Photorealistic style.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      res.json({ imageUrl: response.data[0].url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}