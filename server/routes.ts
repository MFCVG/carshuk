import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { VinDecodeResult, PriceEstimate } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============ AUTH ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, firstName, lastName, phone, isDealer, dealerName } = req.body;
      const existing = storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = storage.createUser({
        username,
        password,
        firstName,
        lastName,
        phone: phone || null,
        isDealer: isDealer || false,
        dealerName: dealerName || null,
      });
      const { password: _, ...safe } = user;
      res.json(safe);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...safe } = user;
      res.json(safe);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ VIN DECODER ============
  app.get("/api/vin/:vin", async (req, res) => {
    try {
      const { vin } = req.params;
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ message: "VIN must be 17 characters" });
      }
      // Use NHTSA VIN decoder API
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
      );
      const data = await response.json();
      const result = data.Results?.[0];

      if (!result || result.ErrorCode !== "0") {
        // Still try to parse what we got
      }

      const decoded: VinDecodeResult = {
        make: result?.Make || "",
        model: result?.Model || "",
        year: parseInt(result?.ModelYear) || 0,
        trim: result?.Trim || "",
        bodyType: result?.BodyClass || "",
        transmission: result?.TransmissionStyle || "",
        drivetrain: result?.DriveType || "",
        fuelType: result?.FuelTypePrimary || "",
        engineSize: result?.DisplacementL ? `${result.DisplacementL}L` : "",
        exteriorColor: "",
      };

      res.json(decoded);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to decode VIN: " + e.message });
    }
  });

  // ============ PRICE ESTIMATION ============
  app.post("/api/estimate-price", async (req, res) => {
    try {
      const { make, model, year, mileage, condition } = req.body;

      // Smart estimation based on depreciation curves
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;

      // Base MSRP estimates by segment (simplified)
      const basePrices: Record<string, number> = {
        "Toyota": 32000, "Honda": 30000, "Ford": 35000, "Chevrolet": 33000,
        "BMW": 50000, "Mercedes-Benz": 55000, "Audi": 48000, "Lexus": 45000,
        "Tesla": 45000, "Hyundai": 28000, "Kia": 27000, "Nissan": 29000,
        "Volkswagen": 32000, "Subaru": 31000, "Mazda": 29000, "Jeep": 37000,
        "Ram": 40000, "GMC": 42000, "Dodge": 35000, "Acura": 40000,
        "Infiniti": 42000, "Volvo": 45000, "Porsche": 75000, "Land Rover": 60000,
      };

      const baseMSRP = basePrices[make] || 33000;

      // Depreciation: ~15% first year, ~10% per year after
      let depreciatedValue = baseMSRP;
      if (age >= 1) depreciatedValue *= 0.85;
      if (age >= 2) depreciatedValue *= Math.pow(0.90, Math.min(age - 1, 10));

      // Mileage adjustment: -$0.08 per mile over 12k/year average
      const expectedMileage = age * 12000;
      const mileageDiff = (mileage || 0) - expectedMileage;
      if (mileageDiff > 0) {
        depreciatedValue -= mileageDiff * 0.08;
      } else if (mileageDiff < 0) {
        depreciatedValue += Math.abs(mileageDiff) * 0.04;
      }

      // Condition adjustment
      const conditionMultiplier: Record<string, number> = {
        "excellent": 1.1, "good": 1.0, "fair": 0.85, "poor": 0.7, "used": 0.95, "new": 1.3,
      };
      depreciatedValue *= conditionMultiplier[condition || "used"] || 1.0;

      const estimatedPrice = Math.max(Math.round(depreciatedValue / 100) * 100, 1500);
      const lowPrice = Math.round(estimatedPrice * 0.88 / 100) * 100;
      const highPrice = Math.round(estimatedPrice * 1.12 / 100) * 100;

      const estimate: PriceEstimate = {
        estimatedPrice,
        lowPrice,
        highPrice,
        confidence: age <= 5 ? "high" : age <= 10 ? "medium" : "low",
      };

      res.json(estimate);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ LISTINGS ============
  app.get("/api/listings", async (req, res) => {
    try {
      const listings = storage.getListings(req.query as Record<string, any>);
      res.json(listings);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/listings/featured", async (req, res) => {
    try {
      const featured = storage.getFeaturedListings();
      res.json(featured);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = storage.getListing(Number(req.params.id));
      if (!listing) return res.status(404).json({ message: "Listing not found" });
      storage.incrementViews(listing.id);
      res.json(listing);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const listing = storage.createListing(req.body);
      res.json(listing);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.patch("/api/listings/:id", async (req, res) => {
    try {
      const updated = storage.updateListing(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Listing not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      storage.deleteListing(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ FAVORITES ============
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favs = storage.getUserFavorites(Number(req.params.userId));
      res.json(favs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const fav = storage.addFavorite(req.body);
      res.json(fav);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      storage.removeFavorite(Number(req.params.userId), Number(req.params.listingId));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ SAVED SEARCHES ============
  app.get("/api/saved-searches/:userId", async (req, res) => {
    try {
      const searches = storage.getSavedSearches(Number(req.params.userId));
      res.json(searches);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/saved-searches", async (req, res) => {
    try {
      const search = storage.createSavedSearch(req.body);
      res.json(search);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/saved-searches/:id", async (req, res) => {
    try {
      storage.deleteSavedSearch(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ SEED DATA ============
  app.post("/api/seed", async (req, res) => {
    try {
      // Check if data already exists
      const existing = storage.getListings();
      if (existing.length > 0) {
        return res.json({ message: "Data already seeded", count: existing.length });
      }

      // Create demo users
      const seller1 = storage.createUser({
        username: "moshe@carshuk.com",
        password: "demo123",
        firstName: "Moshe",
        lastName: "K.",
        phone: "718-555-0101",
        isDealer: false,
        dealerName: null,
      });

      const dealer1 = storage.createUser({
        username: "premiumautos@carshuk.com",
        password: "demo123",
        firstName: "David",
        lastName: "R.",
        phone: "718-555-0202",
        isDealer: true,
        dealerName: "Premium Auto Group",
      });

      const seller2 = storage.createUser({
        username: "sarah@carshuk.com",
        password: "demo123",
        firstName: "Sarah",
        lastName: "G.",
        phone: "845-555-0303",
        isDealer: false,
        dealerName: null,
      });

      const dealer2 = storage.createUser({
        username: "elitecarsnj@carshuk.com",
        password: "demo123",
        firstName: "Avi",
        lastName: "M.",
        phone: "732-555-0404",
        isDealer: true,
        dealerName: "Elite Cars NJ",
      });

      // Sample listings
      const sampleListings = [
        {
          userId: dealer1.id, vin: "1HGBH41JXMN109186", title: "2023 Toyota Camry SE",
          make: "Toyota", model: "Camry", year: 2023, trim: "SE", bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 18500,
          price: 26900, description: "One owner, dealer maintained. Clean title. Includes Toyota Safety Sense package with adaptive cruise control, lane departure alert, and pre-collision system. Bluetooth, backup camera, 8-inch touchscreen.",
          condition: "excellent", city: "Brooklyn", state: "NY", zipCode: "11230",
          images: JSON.stringify(["/api/placeholder/car1.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller1.id, vin: "5YFBURHE1KP862341", title: "2021 Honda Accord Sport",
          make: "Honda", model: "Accord", year: 2021, trim: "Sport", bodyType: "Sedan",
          exteriorColor: "Silver", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "1.5L Turbo", mileage: 34200,
          price: 24500, description: "Well maintained, always garaged. Sport trim with 19-inch alloy wheels, sport-tuned suspension, leather-wrapped steering wheel, dual-zone climate control, Apple CarPlay and Android Auto.",
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["/api/placeholder/car2.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
        {
          userId: dealer1.id, vin: "WBA5B1C50KD123456", title: "2024 BMW X3 xDrive30i",
          make: "BMW", model: "X3", year: 2024, trim: "xDrive30i", bodyType: "SUV",
          exteriorColor: "Black", interiorColor: "Cognac", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.0L Turbo", mileage: 8200,
          price: 44900, description: "Premium package, panoramic sunroof, heated seats, navigation, Harman Kardon sound system. Factory warranty remaining. Like new condition with low miles.",
          condition: "excellent", city: "Brooklyn", state: "NY", zipCode: "11219",
          images: JSON.stringify(["/api/placeholder/car3.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller2.id, vin: "1N4BL4BV4KC178234", title: "2020 Toyota Sienna LE",
          make: "Toyota", model: "Sienna", year: 2020, trim: "LE", bodyType: "Minivan",
          exteriorColor: "Gray", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 52000,
          price: 28500, description: "Perfect family vehicle. 8 passenger seating, power sliding doors, tri-zone climate control, rear entertainment system, safety sense features. Regular maintenance at Toyota dealer.",
          condition: "good", city: "Monsey", state: "NY", zipCode: "10952",
          images: JSON.stringify(["/api/placeholder/car4.jpg"]),
          numOwners: 2, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
        {
          userId: dealer2.id, vin: "JTDKN3DU5A5012345", title: "2025 Tesla Model Y Long Range",
          make: "Tesla", model: "Model Y", year: 2025, trim: "Long Range", bodyType: "SUV",
          exteriorColor: "White", interiorColor: "White", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Electric", engineSize: "Dual Motor", mileage: 3100,
          price: 47500, description: "Nearly new with full autopilot capability. 330-mile range, 15-inch touchscreen, glass roof, premium audio system. Still under manufacturer warranty. No accidents.",
          condition: "excellent", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["/api/placeholder/car5.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller1.id, vin: "1C4RJFAG9KC765432", title: "2019 Jeep Grand Cherokee Limited",
          make: "Jeep", model: "Grand Cherokee", year: 2019, trim: "Limited", bodyType: "SUV",
          exteriorColor: "Blue", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "4WD", fuelType: "Gasoline", engineSize: "3.6L V6", mileage: 61000,
          price: 27900, description: "Limited trim with leather seats, heated front and second row seats, heated steering wheel, navigation, 8.4-inch Uconnect system, advanced safety group. Great for family use.",
          condition: "good", city: "Passaic", state: "NJ", zipCode: "07055",
          images: JSON.stringify(["/api/placeholder/car6.jpg"]),
          numOwners: 2, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
        {
          userId: dealer1.id, vin: "5UXCR6C08K9K98765", title: "2022 Mercedes-Benz GLE 350",
          make: "Mercedes-Benz", model: "GLE", year: 2022, trim: "350 4MATIC", bodyType: "SUV",
          exteriorColor: "Black", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.0L Turbo", mileage: 29800,
          price: 52900, description: "Certified pre-owned with extended warranty. Premium package, Burmester sound system, 12.3-inch dual screens, wireless charging, ambient lighting, 360-degree camera.",
          condition: "excellent", city: "Brooklyn", state: "NY", zipCode: "11204",
          images: JSON.stringify(["/api/placeholder/car7.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller2.id, vin: "4T1BF1FK5HU345678", title: "2020 Hyundai Tucson SEL",
          make: "Hyundai", model: "Tucson", year: 2020, trim: "SEL", bodyType: "SUV",
          exteriorColor: "Red", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.4L", mileage: 45600,
          price: 21900, description: "SEL package with leather seats, panoramic sunroof, blind spot monitoring, lane keep assist, 8-inch touchscreen with Apple CarPlay. Excellent gas mileage for an AWD SUV.",
          condition: "good", city: "Five Towns", state: "NY", zipCode: "11516",
          images: JSON.stringify(["/api/placeholder/car8.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
        {
          userId: dealer2.id, vin: "1FMCU0GD8LUA23456", title: "2021 Ford Explorer XLT",
          make: "Ford", model: "Explorer", year: 2021, trim: "XLT", bodyType: "SUV",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.3L Turbo", mileage: 38900,
          price: 32500, description: "Third row seating, SYNC 3 with 8-inch touchscreen, Ford Co-Pilot360, blind spot monitoring, lane keeping system. Great towing capacity. Perfect for large families.",
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["/api/placeholder/car9.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller1.id, vin: "KNDJP3A53K7654321", title: "2018 Lexus RX 350",
          make: "Lexus", model: "RX", year: 2018, trim: "350", bodyType: "SUV",
          exteriorColor: "Silver", interiorColor: "Parchment", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 55300,
          price: 31900, description: "Luxury package with Mark Levinson premium audio, navigation, head-up display, panoramic roof, heated and ventilated seats. Lexus reliability with luxury comfort.",
          condition: "good", city: "Monsey", state: "NY", zipCode: "10952",
          images: JSON.stringify(["/api/placeholder/car10.jpg"]),
          numOwners: 2, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
        {
          userId: dealer1.id, vin: "WA1LAAF70KD234567", title: "2023 Audi Q5 Premium Plus",
          make: "Audi", model: "Q5", year: 2023, trim: "Premium Plus", bodyType: "SUV",
          exteriorColor: "Gray", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.0L Turbo", mileage: 15600,
          price: 43500, description: "S Line sport package, virtual cockpit plus, Bang & Olufsen 3D sound, heated/ventilated seats, adaptive cruise, top view camera. Like-new condition.",
          condition: "excellent", city: "Brooklyn", state: "NY", zipCode: "11230",
          images: JSON.stringify(["/api/placeholder/car11.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
        },
        {
          userId: seller2.id, vin: "5TDYZ3DC0LS654321", title: "2022 Toyota Highlander XLE",
          make: "Toyota", model: "Highlander", year: 2022, trim: "XLE", bodyType: "SUV",
          exteriorColor: "Blue", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 27400,
          price: 38900, description: "8-passenger seating, SofTex leather seats, sunroof, 12.3-inch touchscreen, JBL audio, Toyota Safety Sense 2.5, wireless charging. One of the best family SUVs.",
          condition: "excellent", city: "Passaic", state: "NJ", zipCode: "07055",
          images: JSON.stringify(["/api/placeholder/car12.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
        },
      ];

      // Set some as featured
      const featuredIndices = [0, 2, 4, 6, 10, 11];

      for (let i = 0; i < sampleListings.length; i++) {
        const listing = sampleListings[i];
        const created = storage.createListing(listing as any);
        if (featuredIndices.includes(i)) {
          storage.updateListing(created.id, { featured: true } as any);
        }
      }

      res.json({ message: "Database seeded", count: sampleListings.length });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
