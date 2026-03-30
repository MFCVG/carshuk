import type { DealRatingInfo, DealRating } from "@shared/schema";

/**
 * Compute deal rating based on list price vs estimated market value.
 * - ≥15% below: Great Deal (green)
 * - 5–15% below: Good Deal (teal)
 * - within 5%: Fair Deal (amber)
 * - >5% above: Above Market (red)
 */
export function getDealRating(price: number, estimatedPrice: number): DealRatingInfo {
  const pctDiff = (estimatedPrice - price) / estimatedPrice;

  if (pctDiff >= 0.15) {
    return {
      label: "Great Deal",
      color: "#16a34a",
      bgColor: "bg-green-600",
      description: `$${Math.round(estimatedPrice - price).toLocaleString()} below market`,
    };
  }
  if (pctDiff >= 0.05) {
    return {
      label: "Good Deal",
      color: "#0d9488",
      bgColor: "bg-teal-600",
      description: `$${Math.round(estimatedPrice - price).toLocaleString()} below market`,
    };
  }
  if (pctDiff >= -0.05) {
    return {
      label: "Fair Deal",
      color: "#d97706",
      bgColor: "bg-amber-600",
      description: "At market value",
    };
  }
  return {
    label: "Above Market",
    color: "#dc2626",
    bgColor: "bg-red-600",
    description: `$${Math.round(price - estimatedPrice).toLocaleString()} above market`,
  };
}

/**
 * Estimate monthly payment (72-month loan, 6.5% APR, 10% down)
 */
export function getMonthlyPayment(price: number): number {
  const downPayment = price * 0.1;
  const principal = price - downPayment;
  const rate = 0.065 / 12;
  const months = 72;
  const payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  return Math.round(payment);
}

export function formatPrice(p: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

export function formatMiles(m: number): string {
  return new Intl.NumberFormat("en-US").format(m) + " mi";
}

/**
 * Simple estimated market value based on depreciation 
 * (matching server-side logic so we can compute on the frontend without extra API calls)
 */
export function estimateMarketValue(make: string, year: number, mileage: number, condition?: string | null): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  const basePrices: Record<string, number> = {
    "Toyota": 32000, "Honda": 30000, "Ford": 35000, "Chevrolet": 33000,
    "BMW": 50000, "Mercedes-Benz": 55000, "Audi": 48000, "Lexus": 45000,
    "Tesla": 45000, "Hyundai": 28000, "Kia": 27000, "Nissan": 29000,
    "Volkswagen": 32000, "Subaru": 31000, "Mazda": 29000, "Jeep": 37000,
    "Ram": 40000, "GMC": 42000, "Dodge": 35000, "Acura": 40000,
    "Infiniti": 42000, "Volvo": 45000, "Porsche": 75000, "Land Rover": 60000,
  };

  const baseMSRP = basePrices[make] || 33000;

  let depreciatedValue = baseMSRP;
  if (age >= 1) depreciatedValue *= 0.85;
  if (age >= 2) depreciatedValue *= Math.pow(0.90, Math.min(age - 1, 10));

  const expectedMileage = age * 12000;
  const mileageDiff = (mileage || 0) - expectedMileage;
  if (mileageDiff > 0) {
    depreciatedValue -= mileageDiff * 0.08;
  } else if (mileageDiff < 0) {
    depreciatedValue += Math.abs(mileageDiff) * 0.04;
  }

  const conditionMultiplier: Record<string, number> = {
    "excellent": 1.1, "good": 1.0, "fair": 0.85, "poor": 0.7, "used": 0.95, "new": 1.3,
  };
  depreciatedValue *= conditionMultiplier[condition || "used"] || 1.0;

  return Math.max(Math.round(depreciatedValue / 100) * 100, 1500);
}
