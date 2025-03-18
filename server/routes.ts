import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AIHandler } from "./ai-handler";
import { z } from "zod";
import { insertFavoriteSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import fetch from 'node-fetch';
import { hashPassword, comparePasswords } from './auth'; // Assuming these functions exist


function ensureAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text;

  try {
    const aiPrompt = `Translate the following travel information to ${targetLang}:\n\n${text}`;
    const ai = new AIHandler();
    const response = await ai.chat(aiPrompt);
    return response.message.content;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text if translation fails
  }
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
      const { message, language } = z.object({
        message: z.string(),
        language: z.string().default('en')
      }).parse(req.body);

      // Extract location from various message formats
      let location = '';

      // Check for "I want to visit X" pattern
      const visitMatch = message.match(/(?:i want to visit|show me|tell me about)\s+([a-zA-Z\s]+)/i);
      if (visitMatch) {
        location = visitMatch[1].trim();
      }
      // Check for "in X" pattern
      else {
        const locationMatch = message.match(/(?:in|at|about)\s+([a-zA-Z\s]+)/i);
        if (locationMatch) {
          location = locationMatch[1].trim();
        }
      }

      // Track user history
      await storage.createUserHistory({
        userId: req.user!.id,
        searchQuery: message,
        location: location || null,
        category: null
      });

      // Craft the AI prompt
      let aiPrompt = `You are a travel assistant. `;

      if (location) {
        aiPrompt += `Provide detailed information ONLY about ${location}. 
                     Include key attractions, cultural highlights, and practical travel tips.
                     DO NOT mention any other cities or locations.`;
      } else {
        aiPrompt += `Please help with this travel query: ${message}`;
      }

      const response = await ai.chat(aiPrompt);

      // Generate translations if needed
      const translations: Record<string, string> = {
        en: response.message.content
      };

      if (language !== 'en') {
        translations[language] = await translateText(response.message.content, language);
      }

      res.json({
        message: response.message,
        location: location || null,
        translations
      });

    } catch (error: any) {
      console.error('Chat error:', error);
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
        windSpeed: Math.round(Math.random() * 30),
        icon: '☀️' // Default icon
      };

      // Set weather icon based on condition
      switch (weatherData.condition) {
        case 'Clear':
          weatherData.icon = '☀️';
          break;
        case 'Cloudy':
          weatherData.icon = '☁️';
          break;
        case 'Rain':
          weatherData.icon = '🌧️';
          break;
        case 'Snow':
          weatherData.icon = '🌨️';
          break;
      }

      // Generate travel recommendations based on weather
      const recommendations = [];

      if (weatherData.condition === 'Clear') {
        recommendations.push({
          activity: 'Outdoor Sightseeing',
          reason: 'Perfect weather for exploring landmarks and taking photos',
          bestTime: 'Throughout the day'
        });
      } else if (weatherData.condition === 'Cloudy') {
        recommendations.push({
          activity: 'Museum Tours',
          reason: 'Great day for indoor cultural activities',
          bestTime: 'Late morning to afternoon'
        });
      } else if (weatherData.condition === 'Rain') {
        recommendations.push({
          activity: 'Local Cuisine Experience',
          reason: 'Ideal time to explore indoor markets and restaurants',
          bestTime: 'Lunch and dinner hours'
        });
      } else if (weatherData.condition === 'Snow') {
        recommendations.push({
          activity: 'Winter Sports',
          reason: 'Perfect conditions for snow activities',
          bestTime: 'Early morning for best snow conditions'
        });
      }

      // Add a general recommendation based on temperature
      if (weatherData.temperature > 25) {
        recommendations.push({
          activity: 'Water Activities',
          reason: 'High temperature perfect for cooling off',
          bestTime: 'Mid-morning or late afternoon'
        });
      } else if (weatherData.temperature < 10) {
        recommendations.push({
          activity: 'Indoor Attractions',
          reason: 'Stay warm while enjoying local culture',
          bestTime: 'Anytime during operating hours'
        });
      }

      res.json({ weather: weatherData, recommendations });
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

  app.get('/api/user/history', ensureAuthenticated, async (req, res) => {
    try {
      const history = await storage.getUserHistory(req.user!.id);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/register', async (req, res, next) => {
    try {
      if (req.body.email !== 'tcsguest.7650@gmail.com') {
        return res.status(400).json({
          error: 'Only tcsguest.7650@gmail.com is allowed to register'
        });
      }

      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    } catch (error: any) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}