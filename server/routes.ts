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
import Database from "@replit/database";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize @replit/database
  const db = new Database();

  // POST /swipe endpoint
  app.post("/swipe", async (req, res) => {
    try {
      const { room, userId, mealId, liked } = req.body;
      
      // Validate required fields
      if (!room || !userId || !mealId || typeof liked !== 'boolean') {
        return res.status(400).json({ 
          error: 'Missing required fields: room, userId, mealId, liked' 
        });
      }
      
      // Store swipe using the specified key pattern
      const swipeKey = `swipes/${room}/${userId}/${mealId}`;
      await db.set(swipeKey, { liked, timestamp: Date.now() });
      
      // Check for matches if this is a positive swipe
      if (liked) {
        await checkAndCreateMatchInRoom(db, room, mealId, userId);
      }
      
      res.json({ success: true, message: 'Swipe recorded' });
    } catch (error) {
      console.error('Error recording swipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /matches/:room/:userId endpoint
  app.get("/matches/:room/:userId", async (req, res) => {
    try {
      const { room, userId } = req.params;
      
      // Get all matches for this room
      const matchesKey = `matches/${room}`;
      const matchesResult = await db.get(matchesKey);
      const matches = Array.isArray(matchesResult) ? matchesResult : [];
      
      // Filter matches that include this user
      const userMatches = matches.filter((match: any) => 
        match.users && match.users.includes(userId)
      );
      
      // Extract meal IDs
      const mealIds = userMatches.map((match: any) => match.mealId);
      
      res.json({ mealIds });
    } catch (error) {
      console.error('Error getting matches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
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

// Helper function to check for matches in @replit/database
async function checkAndCreateMatchInRoom(db: any, room: string, mealId: string, currentUserId: string) {
  try {
    // Check for specific swipes for this meal by trying both user patterns
    const likedUsers: string[] = [];
    
    // Check common user patterns for matches
    const possibleUserIds = ['user1', 'user2', 'user3', 'user4'];
    
    for (const userId of possibleUserIds) {
      const swipeKey = `swipes/${room}/${userId}/${mealId}`;
      try {
        const swipeData = await db.get(swipeKey);
        if (swipeData && swipeData.liked) {
          likedUsers.push(userId);
        }
      } catch (err) {
        // Key doesn't exist, continue
      }
    }
    
    // If 2 or more users liked this meal, create a match
    if (likedUsers.length >= 2) {
      const matchesKey = `matches/${room}`;
      const existingMatchesResult = await db.get(matchesKey);
      const existingMatches = Array.isArray(existingMatchesResult) ? existingMatchesResult : [];
      
      // Check if match already exists
      const matchExists = existingMatches.some((match: any) => 
        match.mealId === mealId && 
        match.users.sort().join(',') === likedUsers.sort().join(',')
      );
      
      if (!matchExists) {
        const newMatch = {
          mealId,
          users: likedUsers,
          timestamp: Date.now()
        };
        
        existingMatches.push(newMatch);
        await db.set(matchesKey, existingMatches);
        
        console.log(`Match created in room ${room} for meal ${mealId}:`, likedUsers);
      }
    }
  } catch (error) {
    console.error('Error checking for matches:', error);
  }
}
