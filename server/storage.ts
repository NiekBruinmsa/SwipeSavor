import { 
  users, 
  foodItems, 
  swipeSessions, 
  userSwipes, 
  matches,
  type User, 
  type InsertUser,
  type FoodItem,
  type InsertFoodItem,
  type SwipeSession,
  type InsertSwipeSession,
  type UserSwipe,
  type InsertUserSwipe,
  type Match
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPartner(userId: number, partnerId: number): Promise<void>;

  // Food item methods
  getFoodItems(category: string, filters?: string[]): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;

  // Swipe session methods
  createSwipeSession(session: InsertSwipeSession): Promise<SwipeSession>;
  getSwipeSession(id: number): Promise<SwipeSession | undefined>;
  getActiveSession(userId1: number, userId2: number, category: string): Promise<SwipeSession | undefined>;
  completeSession(sessionId: number): Promise<void>;

  // User swipe methods
  createUserSwipe(swipe: InsertUserSwipe): Promise<UserSwipe>;
  getUserSwipes(sessionId: number, userId: number): Promise<UserSwipe[]>;
  getSessionSwipes(sessionId: number): Promise<UserSwipe[]>;

  // Match methods
  createMatch(sessionId: number, foodItemId: number, userId1: number, userId2: number): Promise<Match>;
  getSessionMatches(sessionId: number): Promise<Match[]>;
  checkForMatch(sessionId: number, foodItemId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample food items if database is empty
    this.initializeFoodItems();
  }

  private async initializeFoodItems() {
    try {
      // Check if food items already exist
      const existingItems = await db.select().from(foodItems).limit(1);
      if (existingItems.length > 0) {
        return; // Items already initialized
      }

      const sampleItems: InsertFoodItem[] = [
        {
          name: "Creamy Tuscan Pasta",
          description: "Creamy pasta with sun-dried tomatoes, spinach, and Italian herbs",
          category: "cooking",
          image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: "25 min",
          deliveryTime: null,
          distance: null,
          rating: "4.8",
          tags: ["Italian", "Vegetarian"],
          ingredients: ["2 cups pasta", "1 cup spinach", "1/2 cup sun-dried tomatoes", "1 cup heavy cream", "1/2 cup parmesan cheese", "3 cloves garlic", "2 tbsp olive oil"],
          instructions: ["Cook pasta according to package directions", "Sauté garlic in olive oil", "Add sun-dried tomatoes and spinach", "Pour in cream and simmer", "Add cooked pasta and cheese", "Toss until creamy and serve"],
          calories: "520",
          servings: "4",
          price: null,
        },
        {
          name: "Truffle Burger Deluxe",
          description: "Gourmet burger with truffle mayo and sweet potato fries",
          category: "cooking",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: "20 min",
          deliveryTime: null,
          distance: null,
          rating: "4.6",
          tags: ["American", "Comfort Food"],
          ingredients: ["1 lb ground beef", "4 brioche buns", "4 slices cheese", "2 sweet potatoes", "2 tbsp truffle mayo", "Lettuce, tomato"],
          instructions: ["Cut sweet potatoes into fries and bake", "Form beef into patties", "Grill burgers to desired doneness", "Toast buns and add truffle mayo", "Assemble burgers with toppings", "Serve with sweet potato fries"],
          calories: "680",
          servings: "4",
          price: null,
        },
        {
          name: "Mediterranean Power Bowl",
          description: "Fresh salad with quinoa, chickpeas, and tahini dressing",
          category: "cooking",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: "15 min",
          deliveryTime: null,
          distance: null,
          rating: "4.7",
          tags: ["Healthy", "Vegetarian"],
          ingredients: ["2 cups cooked quinoa", "1 can chickpeas", "2 cups mixed greens", "1 cup cherry tomatoes", "1/2 cucumber", "1/4 cup feta cheese", "3 tbsp tahini", "2 tbsp lemon juice"],
          instructions: ["Cook quinoa and let cool", "Drain and rinse chickpeas", "Chop vegetables", "Whisk tahini with lemon juice", "Arrange ingredients in bowls", "Drizzle with dressing and serve"],
          calories: "420",
          servings: "2",
          price: null,
        },
        {
          name: "Dragon Roll Sushi",
          description: "Fresh sushi rolls with eel, avocado, and spicy mayo",
          category: "delivery",
          image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: null,
          deliveryTime: "30-45 min",
          distance: null,
          rating: "4.9",
          tags: ["Japanese", "Fresh"],
          ingredients: null,
          instructions: null,
          calories: "380",
          servings: "2",
          price: "$24.99",
        },
        {
          name: "Spicy Thai Basil Chicken",
          description: "Authentic pad kra pao with jasmine rice",
          category: "delivery",
          image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: null,
          deliveryTime: "25-35 min",
          distance: null,
          rating: "4.7",
          tags: ["Thai", "Spicy"],
          ingredients: null,
          instructions: null,
          calories: "450",
          servings: "1",
          price: "$16.99",
        },
        {
          name: "Bistro Le Petit",
          description: "Cozy French bistro with authentic cuisine",
          category: "dineout",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: null,
          deliveryTime: null,
          distance: "0.8 miles",
          rating: "4.5",
          tags: ["French", "Fine Dining"],
          ingredients: null,
          instructions: null,
          calories: null,
          servings: null,
          price: "$$$",
        },
        {
          name: "The Local Gastropub",
          description: "Craft beer and elevated pub food",
          category: "dineout",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          cookTime: null,
          deliveryTime: null,
          distance: "1.2 miles",
          rating: "4.3",
          tags: ["American", "Casual"],
          ingredients: null,
          instructions: null,
          calories: null,
          servings: null,
          price: "$$",
        }
      ];

      await db.insert(foodItems).values(sampleItems);
    } catch (error) {
      console.error('Error initializing food items:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPartner(userId: number, partnerId: number): Promise<void> {
    await db
      .update(users)
      .set({ partnerId })
      .where(eq(users.id, userId));
  }

  async getFoodItems(category: string, filters?: string[]): Promise<FoodItem[]> {
    let query = db.select().from(foodItems).where(eq(foodItems.category, category));
    
    const items = await query;
    
    if (!filters || filters.length === 0) {
      return items;
    }
    
    // Filter by tags on the application side since we need array operations
    return items.filter(item => 
      filters.some(filter => 
        item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      )
    );
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item || undefined;
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const [item] = await db
      .insert(foodItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async createSwipeSession(insertSession: InsertSwipeSession): Promise<SwipeSession> {
    const [session] = await db
      .insert(swipeSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSwipeSession(id: number): Promise<SwipeSession | undefined> {
    const [session] = await db.select().from(swipeSessions).where(eq(swipeSessions.id, id));
    return session || undefined;
  }

  async getActiveSession(userId1: number, userId2: number, category: string): Promise<SwipeSession | undefined> {
    const [session] = await db
      .select()
      .from(swipeSessions)
      .where(
        and(
          eq(swipeSessions.category, category),
          eq(swipeSessions.completed, false),
          and(
            eq(swipeSessions.userId1, userId1),
            eq(swipeSessions.userId2, userId2)
          )
        )
      );
    
    if (session) return session;
    
    // Check reverse order
    const [reverseSession] = await db
      .select()
      .from(swipeSessions)
      .where(
        and(
          eq(swipeSessions.category, category),
          eq(swipeSessions.completed, false),
          and(
            eq(swipeSessions.userId1, userId2),
            eq(swipeSessions.userId2, userId1)
          )
        )
      );
    
    return reverseSession || undefined;
  }

  async completeSession(sessionId: number): Promise<void> {
    await db
      .update(swipeSessions)
      .set({ completed: true })
      .where(eq(swipeSessions.id, sessionId));
  }

  async createUserSwipe(insertSwipe: InsertUserSwipe): Promise<UserSwipe> {
    const [swipe] = await db
      .insert(userSwipes)
      .values(insertSwipe)
      .returning();
    return swipe;
  }

  async getUserSwipes(sessionId: number, userId: number): Promise<UserSwipe[]> {
    return await db
      .select()
      .from(userSwipes)
      .where(
        and(
          eq(userSwipes.sessionId, sessionId),
          eq(userSwipes.userId, userId)
        )
      );
  }

  async getSessionSwipes(sessionId: number): Promise<UserSwipe[]> {
    return await db
      .select()
      .from(userSwipes)
      .where(eq(userSwipes.sessionId, sessionId));
  }

  async createMatch(sessionId: number, foodItemId: number, userId1: number, userId2: number): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({
        sessionId,
        foodItemId,
        userId1,
        userId2
      })
      .returning();
    return match;
  }

  async getSessionMatches(sessionId: number): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.sessionId, sessionId));
  }

  async checkForMatch(sessionId: number, foodItemId: number): Promise<boolean> {
    const sessionSwipes = await this.getSessionSwipes(sessionId);
    const swipesForItem = sessionSwipes.filter(swipe => 
      swipe.foodItemId === foodItemId && swipe.liked
    );
    
    // Check if both users in the session liked this item
    const userIds = new Set(swipesForItem.map(swipe => swipe.userId));
    return userIds.size >= 2;
  }
}

export const storage = new DatabaseStorage();
