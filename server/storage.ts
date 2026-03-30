import {
  type User, type InsertUser, users,
  type Listing, type InsertListing, listings,
  type SavedSearch, type InsertSavedSearch, savedSearches,
  type Favorite, type InsertFavorite, favorites,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc, like, gte, lte, sql, inArray } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_dealer INTEGER DEFAULT 0,
    dealer_name TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vin TEXT,
    title TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    body_type TEXT,
    exterior_color TEXT,
    interior_color TEXT,
    transmission TEXT,
    drivetrain TEXT,
    fuel_type TEXT,
    engine_size TEXT,
    mileage INTEGER NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    condition TEXT DEFAULT 'used',
    city TEXT,
    state TEXT,
    zip_code TEXT,
    images TEXT DEFAULT '[]',
    num_owners INTEGER,
    accident_history INTEGER DEFAULT 0,
    title_status TEXT DEFAULT 'clean',
    seller_type TEXT DEFAULT 'private',
    contact_phone TEXT,
    contact_whatsapp INTEGER DEFAULT 0,
    contact_sms INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    featured INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS saved_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    filters TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
  );
`);

export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;
  // Listings
  getListing(id: number): Listing | undefined;
  getListings(filters?: Record<string, any>): Listing[];
  getFeaturedListings(): Listing[];
  getUserListings(userId: number): Listing[];
  createListing(listing: InsertListing): Listing;
  updateListing(id: number, data: Partial<InsertListing>): Listing | undefined;
  deleteListing(id: number): void;
  incrementViews(id: number): void;
  // Saved searches
  getSavedSearches(userId: number): SavedSearch[];
  createSavedSearch(search: InsertSavedSearch): SavedSearch;
  deleteSavedSearch(id: number): void;
  // Favorites
  getUserFavorites(userId: number): Favorite[];
  addFavorite(fav: InsertFavorite): Favorite;
  removeFavorite(userId: number, listingId: number): void;
  isFavorite(userId: number, listingId: number): boolean;
}

export class DatabaseStorage implements IStorage {
  // Users
  getUser(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByUsername(username: string): User | undefined {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  createUser(insertUser: InsertUser): User {
    return db.insert(users).values({ ...insertUser, createdAt: new Date().toISOString() }).returning().get();
  }

  // Listings
  getListing(id: number): Listing | undefined {
    return db.select().from(listings).where(eq(listings.id, id)).get();
  }

  getListings(filters?: Record<string, any>): Listing[] {
    let query = db.select().from(listings).where(eq(listings.status, "active"));

    const conditions: any[] = [eq(listings.status, "active")];

    if (filters) {
      if (filters.make) conditions.push(eq(listings.make, filters.make));
      if (filters.model) conditions.push(eq(listings.model, filters.model));
      if (filters.bodyType) conditions.push(eq(listings.bodyType, filters.bodyType));
      if (filters.transmission) conditions.push(eq(listings.transmission, filters.transmission));
      if (filters.drivetrain) conditions.push(eq(listings.drivetrain, filters.drivetrain));
      if (filters.fuelType) conditions.push(eq(listings.fuelType, filters.fuelType));
      if (filters.sellerType) conditions.push(eq(listings.sellerType, filters.sellerType));
      if (filters.condition) conditions.push(eq(listings.condition, filters.condition));
      if (filters.minPrice) conditions.push(gte(listings.price, Number(filters.minPrice)));
      if (filters.maxPrice) conditions.push(lte(listings.price, Number(filters.maxPrice)));
      if (filters.minYear) conditions.push(gte(listings.year, Number(filters.minYear)));
      if (filters.maxYear) conditions.push(lte(listings.year, Number(filters.maxYear)));
      if (filters.maxMileage) conditions.push(lte(listings.mileage, Number(filters.maxMileage)));
      if (filters.exteriorColor) conditions.push(eq(listings.exteriorColor, filters.exteriorColor));
      if (filters.search) {
        conditions.push(
          sql`(${listings.title} LIKE ${'%' + filters.search + '%'} OR ${listings.make} LIKE ${'%' + filters.search + '%'} OR ${listings.model} LIKE ${'%' + filters.search + '%'})`
        );
      }
    }

    return db.select().from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt))
      .all();
  }

  getFeaturedListings(): Listing[] {
    return db.select().from(listings)
      .where(and(eq(listings.status, "active"), eq(listings.featured, true)))
      .orderBy(desc(listings.createdAt))
      .limit(6)
      .all();
  }

  getUserListings(userId: number): Listing[] {
    return db.select().from(listings)
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt))
      .all();
  }

  createListing(listing: InsertListing): Listing {
    return db.insert(listings).values({ ...listing, createdAt: new Date().toISOString() }).returning().get();
  }

  updateListing(id: number, data: Partial<InsertListing>): Listing | undefined {
    return db.update(listings).set(data).where(eq(listings.id, id)).returning().get();
  }

  deleteListing(id: number): void {
    db.delete(listings).where(eq(listings.id, id)).run();
  }

  incrementViews(id: number): void {
    db.update(listings).set({ views: sql`${listings.views} + 1` }).where(eq(listings.id, id)).run();
  }

  // Saved searches
  getSavedSearches(userId: number): SavedSearch[] {
    return db.select().from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt))
      .all();
  }

  createSavedSearch(search: InsertSavedSearch): SavedSearch {
    return db.insert(savedSearches).values({ ...search, createdAt: new Date().toISOString() }).returning().get();
  }

  deleteSavedSearch(id: number): void {
    db.delete(savedSearches).where(eq(savedSearches.id, id)).run();
  }

  // Favorites
  getUserFavorites(userId: number): Favorite[] {
    return db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .all();
  }

  addFavorite(fav: InsertFavorite): Favorite {
    return db.insert(favorites).values({ ...fav, createdAt: new Date().toISOString() }).returning().get();
  }

  removeFavorite(userId: number, listingId: number): void {
    db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)))
      .run();
  }

  isFavorite(userId: number, listingId: number): boolean {
    const result = db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)))
      .get();
    return !!result;
  }
}

export const storage = new DatabaseStorage();
