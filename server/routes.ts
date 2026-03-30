import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { VinDecodeResult, PriceEstimate } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

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
        trim: result?.Trim || result?.Series || "",
        bodyType: result?.BodyClass || "",
        transmission: result?.TransmissionStyle || (result?.TransmissionSpeeds ? `${result.TransmissionSpeeds}-Speed` : ""),
        drivetrain: result?.DriveType || "",
        fuelType: result?.FuelTypePrimary || "",
        engineSize: result?.DisplacementL ? `${result.DisplacementL}L` : "",
        engineCylinders: result?.EngineCylinders || "",
        engineHP: result?.EngineHP || "",
        doors: result?.Doors || "",
        seats: result?.Seats || "",
        vehicleType: result?.VehicleType || "",
        manufacturer: result?.Manufacturer || "",
        plantCity: result?.PlantCity || "",
        plantState: result?.PlantState || "",
        plantCountry: result?.PlantCountry || "",
        // Safety features
        abs: result?.ABS || "",
        esc: result?.ESC || "",
        tractionControl: result?.TractionControl || "",
        airbagFront: result?.AirBagLocFront || "",
        airbagSide: result?.AirBagLocSide || "",
        airbagCurtain: result?.AirBagLocCurtain || "",
        forwardCollisionWarning: result?.ForwardCollisionWarning || "",
        laneDepartureWarning: result?.LaneDepartureWarning || "",
        laneKeepAssist: result?.LaneKeepSystem || "",
        adaptiveCruise: result?.AdaptiveCruiseControl || "",
        backupCamera: result?.RearVisibilitySystem || "",
        blindSpotMonitoring: result?.BlindSpotMon || "",
        // Other
        steeringLocation: result?.SteeringLocation || "",
        entertainmentSystem: result?.EntertainmentSystem || "",
        gvwr: result?.GVWR || "",
        errorCode: result?.ErrorCode || "",
        errorText: result?.ErrorText || "",
      };

      res.json(decoded);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to decode VIN: " + e.message });
    }
  });

  // ============ PRICE ESTIMATION ============
  const modelPricing: Record<string, Record<string, Record<number, number>>> = {
    "Toyota": {
      "Camry": { 2025: 28000, 2024: 25500, 2023: 23000, 2022: 21500, 2021: 20000, 2020: 18500, 2019: 17000, 2018: 15500, 2017: 14000, 2016: 12500 },
      "Corolla": { 2025: 24000, 2024: 22000, 2023: 20000, 2022: 19000, 2021: 18000, 2020: 16500, 2019: 15000, 2018: 13500 },
      "Highlander": { 2025: 42000, 2024: 39000, 2023: 36000, 2022: 34000, 2021: 32000, 2020: 30000, 2019: 28000 },
      "RAV4": { 2025: 32000, 2024: 30000, 2023: 28000, 2022: 27000, 2021: 25500, 2020: 24000, 2019: 22000 },
      "Sienna": { 2025: 42000, 2024: 40000, 2023: 38000, 2022: 36000, 2021: 34000, 2020: 28000, 2019: 26000 },
    },
    "Honda": {
      "Accord": { 2025: 29000, 2024: 27000, 2023: 25000, 2022: 23000, 2021: 21500, 2020: 20000, 2019: 18000, 2018: 16000, 2017: 14000, 2016: 12000, 2015: 11000, 2014: 10000, 2013: 9000, 2012: 8000, 2011: 7000 },
      "Civic": { 2025: 26000, 2024: 24000, 2023: 22000, 2022: 21000, 2021: 19500, 2020: 18000, 2019: 16000, 2018: 14500 },
      "Pilot": { 2025: 40000, 2024: 38000, 2023: 35000, 2022: 33000, 2021: 31000, 2020: 29000, 2019: 27000 },
      "CR-V": { 2025: 33000, 2024: 31000, 2023: 29000, 2022: 28000, 2021: 26000, 2020: 24000, 2019: 22000 },
    },
    "Ford": {
      "Transit": { 2025: 38000, 2024: 35000, 2023: 32000, 2022: 30000, 2021: 28000, 2020: 26000 },
      "Transit 350 Wagon": { 2025: 40000, 2024: 37000, 2023: 34000, 2022: 32000, 2021: 30000, 2020: 28000 },
      "Explorer": { 2025: 38000, 2024: 35000, 2023: 33000, 2022: 31000, 2021: 29000, 2020: 27000 },
      "F-150": { 2025: 42000, 2024: 40000, 2023: 38000, 2022: 36000, 2021: 33000, 2020: 30000 },
    },
    "Chevrolet": {
      "Express": { 2025: 35000, 2024: 32000, 2023: 30000, 2022: 28000, 2021: 26000, 2020: 24000, 2019: 22000 },
      "Express 3500 Passenger": { 2025: 36000, 2024: 33000, 2023: 31000, 2022: 29000, 2021: 27000, 2020: 25000, 2019: 23000 },
    },
  };

  const basePrices: Record<string, number> = {
    "Toyota": 32000, "Honda": 30000, "Ford": 35000, "Chevrolet": 33000,
    "BMW": 50000, "Mercedes-Benz": 55000, "Audi": 48000, "Lexus": 45000,
    "Tesla": 45000, "Hyundai": 28000, "Kia": 27000, "Nissan": 29000,
    "Volkswagen": 32000, "Subaru": 31000, "Mazda": 29000, "Jeep": 37000,
    "Ram": 40000, "GMC": 42000, "Dodge": 35000, "Acura": 40000,
    "Infiniti": 42000, "Volvo": 45000, "Porsche": 75000, "Land Rover": 60000,
  };

  app.post("/api/estimate-price", async (req, res) => {
    try {
      const { make, model, year, mileage, condition } = req.body;
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;

      let baseValue: number;
      let confidence: "high" | "medium" | "low";

      // 1. Try exact make+model+year lookup
      const modelData = modelPricing[make]?.[model];
      if (modelData && modelData[year]) {
        baseValue = modelData[year];
        confidence = "high";
      } else if (modelData) {
        // 2. Interpolate from closest available year
        const availableYears = Object.keys(modelData).map(Number).sort((a, b) => a - b);
        const closest = availableYears.reduce((prev, curr) =>
          Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
        );
        const yearDiff = year - closest;
        baseValue = modelData[closest] * Math.pow(0.92, -yearDiff);
        confidence = "medium";
      } else {
        // 3. Fallback to make-level average
        const baseMSRP = basePrices[make] || 33000;
        baseValue = baseMSRP;
        if (age >= 1) baseValue *= 0.85;
        if (age >= 2) baseValue *= Math.pow(0.90, Math.min(age - 1, 10));
        confidence = "low";
      }

      // Mileage adjustment: -$0.06/mile over expected, +$0.03/mile under
      const expectedMileage = age * 12000;
      const mileageDiff = (mileage || 0) - expectedMileage;
      if (mileageDiff > 0) {
        baseValue -= mileageDiff * 0.06;
      } else if (mileageDiff < 0) {
        baseValue += Math.abs(mileageDiff) * 0.03;
      }

      // Condition multiplier
      const conditionMultiplier: Record<string, number> = {
        "excellent": 1.1, "good": 1.0, "fair": 0.85, "poor": 0.7, "used": 0.95, "new": 1.3,
      };
      baseValue *= conditionMultiplier[condition || "used"] || 1.0;

      const estimatedPrice = Math.max(Math.round(baseValue / 100) * 100, 1500);
      const lowPrice = Math.round(estimatedPrice * 0.88 / 100) * 100;
      const highPrice = Math.round(estimatedPrice * 1.12 / 100) * 100;

      const estimate: PriceEstimate = { estimatedPrice, lowPrice, highPrice, confidence };
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

  // ============ ADMIN ============
  function isAdmin(username: string): boolean {
    return username === "admin@carshuk.com";
  }

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allListings = storage.getAllListings();
      const allUsers = storage.getAllUsers();
      const activeListings = allListings.filter((l) => l.status === "active");
      const featuredListings = allListings.filter((l) => l.featured);
      const totalViews = allListings.reduce((sum, l) => sum + (l.views || 0), 0);
      res.json({
        totalListings: allListings.length,
        activeListings: activeListings.length,
        totalUsers: allUsers.length,
        featuredListings: featuredListings.length,
        totalViews,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/admin/listings", async (req, res) => {
    try {
      const allListings = storage.getAllListings();
      const allUsers = storage.getAllUsers();
      const userMap = new Map(allUsers.map((u) => [u.id, u]));
      const enriched = allListings.map((l) => {
        const user = userMap.get(l.userId);
        return {
          ...l,
          sellerName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          sellerUsername: user?.username || "",
        };
      });
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.patch("/api/admin/listings/:id", async (req, res) => {
    try {
      const updated = storage.updateListing(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Listing not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/listings/:id", async (req, res) => {
    try {
      storage.deleteListing(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = storage.getAllUsers();
      const safeUsers = allUsers.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ VEHICLE HISTORY (NHTSA) ============
  app.get("/api/vehicle-history/:make/:model/:year", async (req, res) => {
    try {
      const { make, model, year } = req.params;

      // Fetch recalls, complaints, and safety ratings in parallel
      const [recallsRes, complaintsRes, ratingsRes] = await Promise.all([
        fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`).catch(() => null),
        fetch(`https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`).catch(() => null),
        fetch(`https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`).catch(() => null),
      ]);

      const recalls = recallsRes ? await recallsRes.json().catch(() => ({ results: [] })) : { results: [] };
      const complaints = complaintsRes ? await complaintsRes.json().catch(() => ({ results: [] })) : { results: [] };
      const ratings = ratingsRes ? await ratingsRes.json().catch(() => ({ Results: [] })) : { Results: [] };

      // Fetch detailed safety ratings (requires second API call with VehicleId)
      let safetyData: any = null;
      const firstVehicle = ratings.Results?.[0];
      if (firstVehicle?.VehicleId) {
        try {
          const detailRes = await fetch(`https://api.nhtsa.gov/SafetyRatings/VehicleId/${firstVehicle.VehicleId}`);
          const detailJson = await detailRes.json();
          if (detailJson.Results?.[0]) {
            const d = detailJson.Results[0];
            safetyData = {
              overallRating: d.OverallRating,
              frontCrashRating: d.FrontCrashDriversideRating,
              sideCrashRating: d.SideCrashDriversideRating,
              rolloverRating: d.RolloverRating,
              sideBarrierRating: d.SideCrashPassengersideRating,
              vehicleDescription: d.VehicleDescription,
            };
          }
        } catch {}
      }

      res.json({
        recalls: (recalls.results || []).map((r: any) => ({
          component: r.Component,
          summary: r.Summary,
          consequence: r.Consequence,
          remedy: r.Remedy,
          reportDate: r.ReportReceivedDate,
          nhtsaId: r.NHTSACampaignNumber,
        })),
        complaints: (complaints.results || []).map((c: any) => ({
          component: c.components,
          summary: c.summary,
          dateOfIncident: c.dateOfIncident,
          crash: c.crash,
          fire: c.fire,
          numberOfInjuries: c.numberOfInjuries,
        })),
        safetyRatings: safetyData,
      });
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch vehicle history: " + e.message });
    }
  });

  // ============ AI DESCRIPTION GENERATION ============
  app.post("/api/generate-description", async (req, res) => {
    try {
      const { make, model, year, trim, mileage, condition, bodyType, exteriorColor, interiorColor, drivetrain, fuelType } = req.body;
      const client = new Anthropic();
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Write a compelling 2-3 sentence car listing description for a ${year} ${make} ${model}${trim ? ' ' + trim : ''}. ${mileage ? `It has ${Number(mileage).toLocaleString()} miles.` : ''} ${condition ? `Condition: ${condition}.` : ''} ${bodyType ? `Body type: ${bodyType}.` : ''} ${exteriorColor ? `Exterior: ${exteriorColor}.` : ''} ${interiorColor ? `Interior: ${interiorColor}.` : ''} ${drivetrain ? `Drivetrain: ${drivetrain}.` : ''} ${fuelType ? `Fuel: ${fuelType}.` : ''} Keep it professional, highlight key selling points for this specific model. Don't use exclamation marks. Be factual and appealing.`
        }]
      });
      const generatedText = message.content[0].type === 'text' ? message.content[0].text : '';
      res.json({ description: generatedText });
    } catch (e: any) {
      res.status(500).json({ message: "Failed to generate description: " + e.message });
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

      // Create admin user
      storage.createUser({
        username: "admin@carshuk.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "CarShuk",
        phone: "7322313011",
        isDealer: false,
        dealerName: null,
      });

      // Create real CarShuk users
      const seller1 = storage.createUser({
        username: "yosef@carshuk.com",
        password: "demo123",
        firstName: "Yosef Chaim",
        lastName: "K.",
        phone: "7322313011",
        isDealer: false,
        dealerName: null,
      });

      const dealer1 = storage.createUser({
        username: "icar@carshuk.com",
        password: "demo123",
        firstName: "iCar",
        lastName: "Auto Sales",
        phone: "7329876500",
        isDealer: true,
        dealerName: "iCar Auto Sales",
      });

      const seller2 = storage.createUser({
        username: "izzi@carshuk.com",
        password: "demo123",
        firstName: "Izzi",
        lastName: "R.",
        phone: "7322313011",
        isDealer: false,
        dealerName: null,
      });

      const seller3 = storage.createUser({
        username: "yaakov@carshuk.com",
        password: "demo123",
        firstName: "Yaakov",
        lastName: "S.",
        phone: "7322313011",
        isDealer: false,
        dealerName: null,
      });

      const seller4 = storage.createUser({
        username: "baruch@carshuk.com",
        password: "demo123",
        firstName: "Baruch",
        lastName: "L.",
        phone: "7322313011",
        isDealer: false,
        dealerName: null,
      });

      // Real listings from carshuk.com
      const sampleListings = [
        // 1. Toyota Camry 2025 — seller1 (Yosef Chaim)
        {
          userId: seller1.id, vin: null, title: "Toyota Camry 2025",
          make: "Toyota", model: "Camry", year: 2025, trim: null, bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 8528,
          price: 23975, description: "INCREDIBLE VALUE FOR A BUYER WHO PRIORITIZES MECHANICAL INTEGRITY AND SIGNIFICANT SAVINGS OVER MINOR AESTHETIC IMPERFECTIONS. This Car has cosmetic hail marks and is an ideal choice for those prioritizing mechanical value over aesthetics, offering the performance of a NEARLY NEW CAR at a very significant discount. ONLY USED FOR A FEW MONTHS.",
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773720739945x750886423055990700/KIMG1212.JPG"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 2. Honda Accord 2020 — seller1 (Yosef Chaim)
        {
          userId: seller1.id, vin: null, title: "Honda Accord 2020",
          make: "Honda", model: "Accord", year: 2020, trim: null, bodyType: "Sedan",
          exteriorColor: "Black", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "1.5L Turbo", mileage: 90000,
          price: 17795, description: null,
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773721318087x311688116468417100/20260215_143730.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 3. Toyota Camry 2022 — seller1 (Yosef Chaim)
        {
          userId: seller1.id, vin: null, title: "Toyota Camry 2022",
          make: "Toyota", model: "Camry", year: 2022, trim: null, bodyType: "Sedan",
          exteriorColor: "Silver", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 61500,
          price: 20695, description: null,
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773722073657x889672835293110300/2022%20Camry.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 4. Toyota Camry 2017 — seller1 (Yosef Chaim)
        {
          userId: seller1.id, vin: null, title: "Toyota Camry 2017",
          make: "Toyota", model: "Camry", year: 2017, trim: null, bodyType: "Sedan",
          exteriorColor: "Gray", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 44000,
          price: 15750, description: "Good condition and well maintained. New brakes.",
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773770237770x284420349338927460/IMG_0965.jpeg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 5. Toyota Camry 2018 — seller2 (Izzi)
        {
          userId: seller2.id, vin: null, title: "Toyota Camry 2018",
          make: "Toyota", model: "Camry", year: 2018, trim: null, bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 81000,
          price: 16500, description: null,
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773844079638x110033985817206350/WhatsApp%20Image%202026-03-18%20at%2010.27.00%20AM%20%282%29.jpeg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 6. Toyota Camry 2023 — seller3 (Yaakov)
        {
          userId: seller3.id, vin: null, title: "Toyota Camry 2023",
          make: "Toyota", model: "Camry", year: 2023, trim: null, bodyType: "Sedan",
          exteriorColor: "Gray", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 37000,
          price: 21500, description: null,
          condition: "good", city: "Jackson", state: "NJ", zipCode: "08527",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773951603057x545477248915065000/Stock%20Photo%20%281%29.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 7. Toyota Camry 2020 SE — seller4 (Baruch)
        {
          userId: seller4.id, vin: null, title: "Toyota Camry 2020 SE",
          make: "Toyota", model: "Camry", year: 2020, trim: "SE", bodyType: "Sedan",
          exteriorColor: "Black", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 148725,
          price: 14000, description: "2020 Toyota Camry SE beautiful condition.",
          condition: "good", city: "Toms River", state: "NJ", zipCode: "08753",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1773952661513x556313945665827000/a7a4f263-d5fb-4671-8cb9-89d52a811771.jpeg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 8. Toyota Sienna 2021 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Sienna 2021",
          make: "Toyota", model: "Sienna", year: 2021, trim: null, bodyType: "Minivan",
          exteriorColor: "Gray", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Hybrid", engineSize: "2.5L Hybrid", mileage: 58871,
          price: 33500, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774026295057x150212528449822360/imgi_3_639094440151575462.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 9. Honda Accord 2011 — seller1 (Yosef Chaim)
        {
          userId: seller1.id, vin: null, title: "Honda Accord 2011",
          make: "Honda", model: "Accord", year: 2011, trim: null, bodyType: "Sedan",
          exteriorColor: "Silver", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.4L", mileage: 113000,
          price: 8500, description: null,
          condition: "fair", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774145958381x714213231721172900/20260321_215645.heic"]),
          numOwners: 2, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 10. Toyota Camry 2021 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Camry 2021",
          make: "Toyota", model: "Camry", year: 2021, trim: null, bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 73088,
          price: 20900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774147815489x915594766880500500/icar%202.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 11. Honda Pilot 2022 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Honda Pilot 2022",
          make: "Honda", model: "Pilot", year: 2022, trim: null, bodyType: "SUV",
          exteriorColor: "Black", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 42073,
          price: 31900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774152188444x576167221897788500/icar2.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 12. Toyota Highlander 2021 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Highlander 2021",
          make: "Toyota", model: "Highlander", year: 2021, trim: null, bodyType: "SUV",
          exteriorColor: "White", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 50726,
          price: 33900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774201000725x179850183316726300/icar1.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 13. Toyota RAV4 2022 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota RAV4 2022",
          make: "Toyota", model: "RAV4", year: 2022, trim: null, bodyType: "SUV",
          exteriorColor: "Gray", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "AWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 42737,
          price: 27500, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774201456381x343433612613285760/icar1.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 14. Toyota Camry 2016 — seller4 (Baruch)
        {
          userId: seller4.id, vin: null, title: "Toyota Camry 2016",
          make: "Toyota", model: "Camry", year: 2016, trim: null, bodyType: "Sedan",
          exteriorColor: "Silver", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 165000,
          price: 9400, description: null,
          condition: "fair", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774212681549x919581430100566300/PXL_20260322_203201624.jpg"]),
          numOwners: 2, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
        // 15. Toyota Camry 2024 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Camry 2024",
          make: "Toyota", model: "Camry", year: 2024, trim: null, bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 33897,
          price: 24900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774210570679x439286484629420700/638919715845242761.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 16. Toyota Camry 2024 #2 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Camry 2024",
          make: "Toyota", model: "Camry", year: 2024, trim: null, bodyType: "Sedan",
          exteriorColor: "Black", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 27811,
          price: 25300, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774210949003x471736642081512800/638772964291175123.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 17. Chevrolet Express 3500 Passenger 2019 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Chevrolet Express 3500 Passenger 2019",
          make: "Chevrolet", model: "Express 3500 Passenger", year: 2019, trim: null, bodyType: "Van",
          exteriorColor: "White", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "RWD", fuelType: "Gasoline", engineSize: "6.0L V8", mileage: 91656,
          price: 24900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774213172483x738213166665333100/638710176533609867.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 18. Ford Transit 350 Wagon 2020 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Ford Transit 350 Wagon 2020",
          make: "Ford", model: "Transit 350 Wagon", year: 2020, trim: null, bodyType: "Van",
          exteriorColor: "White", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "RWD", fuelType: "Gasoline", engineSize: "3.5L V6", mileage: 37551,
          price: 35900, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774214298250x553109873487206200/639086555682659817.webp"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 19. Toyota Camry 2024 #3 — dealer1 (iCar Auto Sales)
        {
          userId: dealer1.id, vin: null, title: "Toyota Camry 2024",
          make: "Toyota", model: "Camry", year: 2024, trim: null, bodyType: "Sedan",
          exteriorColor: "Silver", interiorColor: "Black", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 37205,
          price: 24700, description: null,
          condition: "good", city: "Howell", state: "NJ", zipCode: "07731",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774209799577x673293574697911400/638975109337998667.jpg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "dealer",
          contactPhone: "7329876500", contactWhatsapp: true, contactSms: true,
        },
        // 20. Toyota Camry 2018 #2 — seller4 (Baruch)
        {
          userId: seller4.id, vin: null, title: "Toyota Camry 2018",
          make: "Toyota", model: "Camry", year: 2018, trim: null, bodyType: "Sedan",
          exteriorColor: "White", interiorColor: "Gray", transmission: "Automatic",
          drivetrain: "FWD", fuelType: "Gasoline", engineSize: "2.5L", mileage: 99000,
          price: 15000, description: null,
          condition: "good", city: "Lakewood", state: "NJ", zipCode: "08701",
          images: JSON.stringify(["https://0c5420eec15a76102e78aa6b452187ab.cdn.bubble.io/f1774453282108x245444997364723240/WhatsApp%20Image%202026-03-25%20at%2010.58.43%20AM%20%281%29.jpeg"]),
          numOwners: 1, accidentHistory: false, titleStatus: "clean", sellerType: "private",
          contactPhone: "7322313011", contactWhatsapp: true, contactSms: true,
        },
      ];

      // Set some as featured (spread across different models)
      const featuredIndices = [0, 1, 5, 7, 10, 11, 12, 14];

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
