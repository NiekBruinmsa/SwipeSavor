import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
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

  // POST /api/swipes/:room endpoint
  app.post("/api/swipes/:room", async (req, res) => {
    const { room } = req.params;
    try {
      const { userId, mealId, liked } = req.body;
      
      // Validate required fields
      if (!room || !userId || !mealId || typeof liked !== 'boolean') {
        return res.status(400).json({ 
          error: 'Missing required fields: room, userId, mealId, liked' 
        });
      }
      
      // Store swipe using the specified key pattern
      const swipeKey = `swipes/${room}/${userId}/${mealId}`;
      const swipeData = { liked, timestamp: Date.now() };
      await db.set(swipeKey, swipeData);
      console.log(`Stored swipe: ${swipeKey} = ${JSON.stringify(swipeData)}`);
      
      // Check for matches if this is a positive swipe
      if (liked) {
        const matchResult = await checkAndCreateMatchInRoom(db, room, mealId, userId);
        if (matchResult.isMatch) {
          console.log('🎉 Match found, notifying users:', matchResult.users);
          
          // Send real-time match notification to all users via WebSocket
          for (const matchedUserId of matchResult.users) {
            const userWs = (httpServer as any).connections?.get(matchedUserId);
            if (userWs && userWs.readyState === 1) {
              userWs.send(JSON.stringify({
                type: 'match_found',
                mealId,
                users: matchResult.users,
                room
              }));
              console.log(`✅ Sent match notification to ${matchedUserId}`);
            } else {
              console.log(`❌ WebSocket not found for user ${matchedUserId}`);
            }
          }
        }
      }
      
      res.json({ success: true, message: 'Swipe recorded' });
    } catch (error) {
      console.error('Error recording swipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/matches/:room/:userId endpoint
  app.get("/api/matches/:room/:userId", async (req, res) => {
    try {
      const { room, userId } = req.params;
      
      // Get all matches for this room
      const matchesKey = `matches/${room}`;
      const matchesResult = await db.get(matchesKey);
      console.log(`Getting matches for ${matchesKey}: ${JSON.stringify(matchesResult)}`);
      
      // Handle @replit/database response format
      let matches = [];
      if (matchesResult?.ok && matchesResult?.value) {
        matches = Array.isArray(matchesResult.value) ? matchesResult.value : [];
      } else if (Array.isArray(matchesResult)) {
        matches = matchesResult;
      }
      
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

  // User login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          displayName: user.displayName, 
          avatar: user.avatar 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, displayName } = req.body;
      
      if (!username || !password || !displayName) {
        return res.status(400).json({ message: "Username, password, and display name required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser({
        username,
        password,
        displayName,
        avatar: displayName.charAt(0).toUpperCase()
      });
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          displayName: user.displayName, 
          avatar: user.avatar 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  });

  // Join session with another user
  app.post("/api/join-session", async (req, res) => {
    try {
      const { userId, partnerUsername, category } = req.body;
      
      if (!userId || !partnerUsername || !category) {
        return res.status(400).json({ message: "userId, partnerUsername, and category required" });
      }
      
      const partner = await storage.getUserByUsername(partnerUsername);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      // Check if session already exists
      let session = await storage.getActiveSession(userId, partner.id, category);
      
      if (!session) {
        // Create new session
        session = await storage.createSwipeSession({
          userId1: userId,
          userId2: partner.id,
          category,
          filters: []
        });
      }
      
      res.json({ session, partner: { id: partner.id, displayName: partner.displayName, avatar: partner.avatar } });
    } catch (error) {
      res.status(500).json({ message: "Error joining session", error });
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
      
      res.json({ user1, user2 });
    } catch (error) {
      res.status(500).json({ message: "Error creating demo users", error });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by user ID
  const connections = new Map();
  
  wss.on('connection', (ws: any, request) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join':
            // User joins and identifies themselves
            connections.set(data.userId, ws);
            ws.userId = data.userId;
            ws.sessionId = data.sessionId;
            
            // Notify partner that user is online
            if (data.sessionId) {
              const session = await storage.getSwipeSession(data.sessionId);
              if (session) {
                const partnerId = session.userId1 === data.userId ? session.userId2 : session.userId1;
                const partnerWs = connections.get(partnerId);
                if (partnerWs && partnerWs.readyState === 1) {
                  partnerWs.send(JSON.stringify({
                    type: 'partner_online',
                    userId: data.userId
                  }));
                }
              }
            }
            break;
            
          case 'swipe':
            // Handle real-time swipe updates
            if (ws.sessionId) {
              const session = await storage.getSwipeSession(ws.sessionId);
              if (session) {
                const partnerId = session.userId1 === ws.userId ? session.userId2 : session.userId1;
                const partnerWs = connections.get(partnerId);
                if (partnerWs && partnerWs.readyState === 1) {
                  partnerWs.send(JSON.stringify({
                    type: 'partner_swipe',
                    foodItemId: data.foodItemId,
                    liked: data.liked
                  }));
                }
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (ws.userId) {
        connections.delete(ws.userId);
        
        // Notify partner that user went offline
        if (ws.sessionId) {
          storage.getSwipeSession(ws.sessionId).then(session => {
            if (session) {
              const partnerId = session.userId1 === ws.userId ? session.userId2 : session.userId1;
              const partnerWs = connections.get(partnerId);
              if (partnerWs && partnerWs.readyState === 1) {
                partnerWs.send(JSON.stringify({
                  type: 'partner_offline',
                  userId: ws.userId
                }));
              }
            }
          });
        }
      }
    });
  });
  
  // Add WebSocket reference to server for match notifications
  (httpServer as any).wss = wss;
  (httpServer as any).connections = connections;
  
  return httpServer;
}

// Helper function to check for matches in @replit/database
async function checkAndCreateMatchInRoom(db: any, room: string, mealId: string, currentUserId: string) {
  try {
    // Get all swipes for this meal in this room
    const likedUsers: string[] = [];
    
    // Get all swipes for this specific meal by checking both possible users
    const possibleUserIds = ['user1', 'user2', 'user3', 'user4'];
    
    for (const userId of possibleUserIds) {
      const swipeKey = `swipes/${room}/${userId}/${mealId}`;
      try {
        const swipeResult = await db.get(swipeKey);
        console.log(`Checking ${swipeKey}: ${JSON.stringify(swipeResult)}`);
        
        // Handle @replit/database response format
        if (swipeResult?.ok && swipeResult?.value) {
          const swipeData = swipeResult.value;
          console.log(`Swipe data for ${userId}: liked=${swipeData.liked}, type=${typeof swipeData.liked}`);
          if (swipeData.liked === true) {
            likedUsers.push(userId);
            console.log(`✅ Found like from ${userId} for meal ${mealId}`);
          } else {
            console.log(`❌ No like from ${userId} (liked=${swipeData.liked})`);
          }
        } else {
          console.log(`No valid swipe found for ${swipeKey}`);
        }
      } catch (err) {
        console.log(`Error getting swipe for ${swipeKey}: ${err}`);
      }
    }
    
    console.log(`Checking matches for ${mealId} in ${room}: ${likedUsers.length} likes from [${likedUsers.join(', ')}]`);
    
    // If 2 or more users liked this meal, create a match
    if (likedUsers.length >= 2) {
      const matchesKey = `matches/${room}`;
      const existingMatchesResult = await db.get(matchesKey);
      const existingMatches = Array.isArray(existingMatchesResult) ? existingMatchesResult : [];
      
      // Check if match already exists
      const matchExists = existingMatches.some((match: any) => 
        match.mealId === mealId
      );
      
      if (!matchExists) {
        const newMatch = {
          mealId,
          users: likedUsers,
          timestamp: Date.now()
        };
        
        existingMatches.push(newMatch);
        await db.set(matchesKey, existingMatches);
        
        console.log(`🎉 MATCH CREATED in room ${room} for meal ${mealId}:`, likedUsers);
        
        return { isMatch: true, users: likedUsers };
      }
    }
    
    return { isMatch: false, users: [] };
  } catch (error) {
    console.error('Error checking for matches:', error);
    return { isMatch: false, users: [] };
  }
}
