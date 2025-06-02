import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  partnerId: integer("partner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'cooking', 'delivery', 'dineout'
  image: text("image").notNull(),
  cookTime: text("cook_time"),
  deliveryTime: text("delivery_time"),
  distance: text("distance"),
  rating: text("rating").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  ingredients: jsonb("ingredients").$type<string[]>(),
  instructions: jsonb("instructions").$type<string[]>(),
  calories: text("calories"),
  servings: text("servings"),
  price: text("price"),
});

export const swipeSessions = pgTable("swipe_sessions", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  category: text("category").notNull(),
  filters: jsonb("filters").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completed: boolean("completed").default(false),
});

export const userSwipes = pgTable("user_swipes", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  foodItemId: integer("food_item_id").notNull(),
  liked: boolean("liked").notNull(),
  swipedAt: timestamp("swiped_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  foodItemId: integer("food_item_id").notNull(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatar: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).pick({
  name: true,
  description: true,
  category: true,
  image: true,
  cookTime: true,
  deliveryTime: true,
  distance: true,
  rating: true,
  tags: true,
  ingredients: true,
  instructions: true,
  calories: true,
  servings: true,
  price: true,
});

export const insertSwipeSessionSchema = createInsertSchema(swipeSessions).pick({
  userId1: true,
  userId2: true,
  category: true,
  filters: true,
});

export const insertUserSwipeSchema = createInsertSchema(userSwipes).pick({
  sessionId: true,
  userId: true,
  foodItemId: true,
  liked: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type SwipeSession = typeof swipeSessions.$inferSelect;
export type InsertSwipeSession = z.infer<typeof insertSwipeSessionSchema>;
export type UserSwipe = typeof userSwipes.$inferSelect;
export type InsertUserSwipe = z.infer<typeof insertUserSwipeSchema>;
export type Match = typeof matches.$inferSelect;
