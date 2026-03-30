import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  isDealer: integer("is_dealer", { mode: "boolean" }).default(false),
  dealerName: text("dealer_name"),
  createdAt: text("created_at").notNull().default(""),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  vin: text("vin"),
  title: text("title").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  bodyType: text("body_type"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  fuelType: text("fuel_type"),
  engineSize: text("engine_size"),
  mileage: integer("mileage").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  condition: text("condition").default("used"),
  // Location
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  // Images stored as JSON array of URLs
  images: text("images").default("[]"),
  // Vehicle history
  numOwners: integer("num_owners"),
  accidentHistory: integer("accident_history", { mode: "boolean" }).default(false),
  titleStatus: text("title_status").default("clean"),
  // Seller type
  sellerType: text("seller_type").default("private"),
  // Status
  status: text("status").default("active"),
  featured: integer("featured", { mode: "boolean" }).default(false),
  views: integer("views").default(0),
  createdAt: text("created_at").notNull().default(""),
});

export const savedSearches = sqliteTable("saved_searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  filters: text("filters").notNull(), // JSON string of search criteria
  createdAt: text("created_at").notNull().default(""),
});

export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true, views: true, status: true, featured: true });
export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// VIN decode response type
export interface VinDecodeResult {
  make: string;
  model: string;
  year: number;
  trim: string;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  engineSize: string;
  exteriorColor: string;
}

// Price estimation type
export interface PriceEstimate {
  estimatedPrice: number;
  lowPrice: number;
  highPrice: number;
  confidence: string;
}
