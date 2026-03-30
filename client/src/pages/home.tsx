import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "@/components/listing-card";
import {
  Search, ShieldCheck, Users, Zap, ArrowRight, MapPin, ChevronRight,
  BarChart3, Star, Car,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";

const makes = ["Toyota", "Honda", "BMW", "Mercedes-Benz", "Tesla", "Ford", "Chevrolet", "Jeep", "Hyundai", "Lexus", "Audi", "Kia", "Nissan", "Subaru", "Mazda"];

const locations = [
  { name: "Brooklyn", state: "NY", count: 4 },
  { name: "Lakewood", state: "NJ", count: 3 },
  { name: "Monsey", state: "NY", count: 2 },
  { name: "Passaic", state: "NJ", count: 2 },
  { name: "Five Towns", state: "NY", count: 1 },
];

const steps = [
  { step: "1", title: "Search inventory", desc: "Browse hundreds of listings from private sellers and trusted dealers in your area." },
  { step: "2", title: "Get vehicle details", desc: "Decode any VIN for full specs, check vehicle history, and see market price estimates." },
  { step: "3", title: "Contact the seller", desc: "Reach out directly — no middleman fees, no hidden markups. Just you and the seller." },
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchMake, setSearchMake] = useState("");
  const [searchZip, setSearchZip] = useState("");

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings/featured"],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchMake) params.set("make", searchMake);
    if (searchZip) params.set("zip", searchZip);
    navigate(`/browse${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-teal-700 dark:from-primary/90 dark:via-primary/75 dark:to-teal-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-xl font-bold leading-tight sm:text-xl" data-testid="text-hero-title">
              Find your next car, without the runaround.
            </h1>
            <p className="mt-3 text-sm text-white/80 leading-relaxed max-w-lg">
              Browse thousands of cars from trusted sellers and dealers in your community
            </p>
          </div>

          {/* Search widget — white elevated card */}
          <div className="mt-8 rounded-xl bg-white dark:bg-card p-4 shadow-lg max-w-2xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <Select value={searchMake} onValueChange={setSearchMake}>
                <SelectTrigger
                  className="border-border h-11 flex-1 text-foreground"
                  data-testid="select-hero-make"
                >
                  <SelectValue placeholder="Any Make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="ZIP Code"
                value={searchZip}
                onChange={(e) => setSearchZip(e.target.value)}
                className="border-border h-11 flex-1 sm:max-w-[160px] text-foreground"
                data-testid="input-hero-zip"
              />
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-11 font-semibold gap-2 animate-pulse hover:animate-none"
                data-testid="button-hero-search"
              >
                <Search className="h-4 w-4" />
                Search Cars
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat counters */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-center divide-x divide-border text-center">
            <div className="flex items-center gap-2 px-8 sm:px-12">
              <Car className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums" data-testid="stat-listings">500+</p>
                <p className="text-xs text-muted-foreground">Active Listings</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-8 sm:px-12">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums" data-testid="stat-dealers">200+</p>
                <p className="text-xs text-muted-foreground">Verified Dealers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-8 sm:px-12">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums" data-testid="stat-rating">4.9</p>
                <p className="text-xs text-muted-foreground">Community Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Listings */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground" data-testid="text-new-listings">New Listings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Recently added vehicles from our community</p>
          </div>
          <Link href="/browse">
            <span className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1" data-testid="link-view-all">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listings?.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Why CarShuk — asymmetric 2-column */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            {/* Left — visual */}
            <div className="lg:col-span-2">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-primary/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">Transparent Pricing</p>
                  <p className="text-xs text-muted-foreground mt-1">Every listing includes a deal rating</p>
                </div>
              </div>
            </div>
            {/* Right — stacked value props */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-lg font-bold text-foreground" data-testid="text-why-carshuk">Why CarShuk?</h2>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">No buyer fees</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      Browse and buy without hidden costs. We never charge buyers a penny.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">No middleman</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      Deal directly with sellers. Transparent pricing, real conversations, faster transactions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">New listings daily</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      Fresh inventory added every day from private sellers and local dealers you can trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Location */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-lg font-bold text-foreground mb-2" data-testid="text-browse-location">Browse by Location</h2>
        <p className="text-sm text-muted-foreground mb-6">Find vehicles near your community</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {locations.map((loc) => (
            <Link key={loc.name} href={`/browse?city=${encodeURIComponent(loc.name)}`}>
              <div
                data-testid={`card-location-${loc.name.toLowerCase().replace(/\s/g, "-")}`}
                className="group rounded-lg border border-border p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.state} · {loc.count} listings</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works — horizontal flow */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-lg font-bold text-foreground mb-8" data-testid="text-how-it-works">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md ring-4 ring-primary/10">
                    {s.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block w-px flex-1 bg-border mt-2" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ready to sell your car?</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              List it in minutes. Enter your VIN, set your price, and connect with buyers in your area.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/sell">
              <Button data-testid="button-cta-sell" className="gap-2 shadow-md">
                Sell My Car <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" data-testid="button-cta-browse">
                Browse Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
