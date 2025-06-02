import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSwipeSessionSchema, 
  insertUserSwipeSchema,
  type User,
  type SwipeSession 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });

  app.post("/api/users/:id/partner", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { partnerId } = req.body;
      await storage.updateUserPartner(userId, partnerId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error updating partner", error });
    }
  });

  // Food items routes
  app.get("/api/food-items", async (req, res) => {
    try {
      const category = req.query.category as string;
      const filters = req.query.filters ? (req.query.filters as string).split(',') : [];
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }

      const items = await storage.getFoodItems(category, filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food items", error });
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getFoodItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food item", error });
    }
  });

  // Swipe session routes
  app.post("/api/swipe-sessions", async (req, res) => {
    try {
      const sessionData = insertSwipeSessionSchema.parse(req.body);
      
      // Check if there's already an active session for these users and category
      const existingSession = await storage.getActiveSession(
        sessionData.userId1, 
        sessionData.userId2, 
        sessionData.category
      );
      
      if (existingSession) {
        return res.json(existingSession);
      }

      const session = await storage.createSwipeSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error });
    }
  });

  app.get("/api/swipe-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSwipeSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Error fetching session", error });
    }
  });

  app.post("/api/swipe-sessions/:id/complete", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      await storage.completeSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error completing session", error });
    }
  });

  // User swipes routes
  app.post("/api/swipes", async (req, res) => {
    try {
      const swipeData = insertUserSwipeSchema.parse(req.body);
      const swipe = await storage.createUserSwipe(swipeData);
      
      // Check for match if this was a like
      if (swipeData.liked) {
        const isMatch = await storage.checkForMatch(swipeData.sessionId, swipeData.foodItemId);
        if (isMatch) {
          // Create match record
          const session = await storage.getSwipeSession(swipeData.sessionId);
          if (session) {
            await storage.createMatch(
              swipeData.sessionId, 
              swipeData.foodItemId, 
              session.userId1, 
              session.userId2
            );
          }
          res.json({ swipe, match: true });
          return;
        }
      }
      
      res.json({ swipe, match: false });
    } catch (error) {
      res.status(400).json({ message: "Invalid swipe data", error });
    }
  });

  app.get("/api/swipe-sessions/:id/swipes", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let swipes;
      if (userId) {
        swipes = await storage.getUserSwipes(sessionId, userId);
      } else {
        swipes = await storage.getSessionSwipes(sessionId);
      }
      
      res.json(swipes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching swipes", error });
    }
  });

  // Matches routes
  app.get("/api/swipe-sessions/:id/matches", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const matches = await storage.getSessionMatches(sessionId);
      
      // Enrich matches with food item details
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const foodItem = await storage.getFoodItem(match.foodItemId);
          return { ...match, foodItem };
        })
      );
      
      res.json(enrichedMatches);
    } catch (error) {
      res.status(500).json({ message: "Error fetching matches", error });
    }
  });

  // Demo users endpoint for quick setup
  app.post("/api/demo-users", async (req, res) => {
    try {
      const user1 = await storage.createUser({
        username: "alex",
        password: "demo",
        displayName: "Alex",
        avatar: "A"
      });
      
      const user2 = await storage.createUser({
        username: "sam",
        password: "demo", 
        displayName: "Sam",
        avatar: "S"
      });
      
      // Set them as partners
      await storage.updateUserPartner(user1.id, user2.id);
      await storage.updateUserPartner(user2.id, user1.id);
      
      res.json({ user1, user2 });
    } catch (error) {
      res.status(500).json({ message: "Error creating demo users", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
