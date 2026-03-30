import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "@/components/listing-card";
import { Search, ShieldCheck, Users, Zap, ArrowRight, MapPin, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";

const locations = [
  { name: "Brooklyn", state: "NY", zip: "11230" },
  { name: "Lakewood", state: "NJ", zip: "08701" },
  { name: "Monsey", state: "NY", zip: "10952" },
  { name: "Passaic", state: "NJ", zip: "07055" },
  { name: "Five Towns", state: "NY", zip: "11516" },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 dark:from-primary/90 dark:via-primary/80 dark:to-primary/70 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-xl font-bold leading-tight sm:text-xl" data-testid="text-hero-title">
              Find your next car, without the runaround.
            </h1>
            <p className="mt-3 text-sm text-white/80 leading-relaxed max-w-lg">
              CarShuk connects buyers and sellers directly. Browse local inventory from private sellers and dealers — no buyer fees, ever.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
            <Select value={searchMake} onValueChange={setSearchMake}>
              <SelectTrigger
                className="bg-white/95 text-foreground border-0 h-11 flex-1 sm:max-w-[200px]"
                data-testid="select-hero-make"
              >
                <SelectValue placeholder="Any Make" />
              </SelectTrigger>
              <SelectContent>
                {["Toyota", "Honda", "BMW", "Mercedes-Benz", "Tesla", "Ford", "Chevrolet", "Jeep", "Hyundai", "Lexus", "Audi"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="ZIP Code"
              value={searchZip}
              onChange={(e) => setSearchZip(e.target.value)}
              className="bg-white/95 text-foreground border-0 h-11 flex-1 sm:max-w-[160px]"
              data-testid="input-hero-zip"
            />
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-11 bg-white text-primary hover:bg-white/90 font-semibold gap-2"
              data-testid="button-hero-search"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
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

      {/* Value Props */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-lg font-bold text-foreground mb-8" data-testid="text-why-carshuk">Why CarShuk?</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-primary mb-2">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No buyer fees</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Browse and buy without hidden costs. We never charge buyers a penny.
              </p>
            </div>
            <div>
              <div className="text-primary mb-2">
                <Users className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No middleman</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Deal directly with sellers. Transparent pricing, real conversations, faster transactions.
              </p>
            </div>
            <div>
              <div className="text-primary mb-2">
                <Zap className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">New listings daily</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Fresh inventory added every day from private sellers and local dealers you can trust.
              </p>
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
                className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary/3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.state}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-lg font-bold text-foreground mb-8" data-testid="text-how-it-works">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
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
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ready to sell your car?</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              List your vehicle in minutes. Enter your VIN, set your price, and connect with buyers in your area.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/sell">
              <Button data-testid="button-cta-sell" className="gap-2">
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
