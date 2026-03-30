import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "@/components/listing-card";
import {
  Search, ShieldCheck, Users, Zap, ArrowRight, MapPin,
  BarChart3, Star, Car, ChevronRight, MessageCircle,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";
import heroBannerImg from "@assets/hero-banner.jpg";
import sellCtaBgImg from "@assets/sell-cta-bg.jpg";
import categorySuvImg from "@assets/category-suv.jpg";
import categorySedanImg from "@assets/category-sedan.jpg";
import categoryTruckImg from "@assets/category-truck.jpg";
import categoryElectricImg from "@assets/category-electric.jpg";
import categoryCoupeImg from "@assets/category-coupe.jpg";
import categoryMinivanImg from "@assets/category-minivan.jpg";

const makes = ["Toyota", "Honda", "BMW", "Mercedes-Benz", "Tesla", "Ford", "Chevrolet", "Jeep", "Hyundai", "Lexus", "Audi", "Kia", "Nissan", "Subaru", "Mazda"];

const locations = [
  { name: "Brooklyn", state: "NY", count: 4 },
  { name: "Lakewood", state: "NJ", count: 3 },
  { name: "Monsey", state: "NY", count: 2 },
  { name: "Passaic", state: "NJ", count: 2 },
  { name: "Five Towns", state: "NY", count: 1 },
];

const steps = [
  { step: "01", title: "Search inventory", desc: "Browse hundreds of listings from private sellers and trusted dealers in your area." },
  { step: "02", title: "Get vehicle details", desc: "Decode any VIN for full specs, check vehicle history, and see market price estimates." },
  { step: "03", title: "Contact the seller", desc: "Reach out directly — no middleman fees, no hidden markups. Just you and the seller." },
];

const categories = [
  { name: "SUVs", type: "SUV", image: categorySuvImg },
  { name: "Sedans", type: "Sedan", image: categorySedanImg },
  { name: "Trucks", type: "Truck", image: categoryTruckImg },
  { name: "Electric", type: "Electric", image: categoryElectricImg },
  { name: "Coupes", type: "Coupe", image: categoryCoupeImg },
  { name: "Minivans", type: "Minivan", image: categoryMinivanImg },
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

  const whatsappUrl = "https://api.whatsapp.com/send/?phone=17322313011&text=Hi%21+I+want+to+join+your+WhatsApp+status+to+see+new+CarShuk+listings!&type=phone_number&app_absent=0";

  return (
    <div className="min-h-screen bg-background">

      {/* ── WhatsApp Banner ── */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#25D366] hover:bg-[#20BD5A] transition-colors"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 flex items-center justify-center gap-2">
          <SiWhatsapp className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">Follow Us on WhatsApp</span>
          <ArrowRight className="h-3.5 w-3.5 text-white/80" />
        </div>
      </a>

      {/* ── Hero — cinematic full-bleed with background image ── */}
      <section className="relative min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src={heroBannerImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1
              className="text-3xl font-extrabold text-white leading-tight tracking-tight sm:text-5xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
              data-testid="text-hero-title"
            >
              Buy with confidence.
              <br />
              <span className="text-primary">Sell in minutes.</span>
            </h1>
            <p className="mt-4 text-base text-white/70 leading-relaxed max-w-lg sm:text-lg">
              Search thousands of listings from private sellers and trusted dealers
            </p>
          </div>

          {/* Segmented search bar — floating white card */}
          <div className="mt-8 max-w-2xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-0 rounded-full bg-white/95 backdrop-blur-sm overflow-hidden shadow-lg">
              <Select value={searchMake} onValueChange={setSearchMake}>
                <SelectTrigger
                  className="border-0 border-r border-border/40 rounded-none h-12 flex-1 text-sm focus:ring-0 bg-transparent text-foreground"
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
                className="border-0 border-r border-border/40 rounded-none h-12 w-full sm:max-w-[140px] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground"
                data-testid="input-hero-zip"
              />
              <Button
                onClick={handleSearch}
                className="h-12 px-6 rounded-none sm:rounded-r-full font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-hero-search"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick filter pills */}
          <div className="mt-5 flex flex-wrap gap-2 max-w-2xl">
            {["SUV", "Under $20k", "Low Mileage", "Electric", "AWD"].map((pill) => (
              <Link key={pill} href={`/browse?q=${encodeURIComponent(pill)}`}>
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-pointer">
                  {pill}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats — clean horizontal, impactful ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-start divide-x divide-border/60 gap-0">
            <div className="px-8 sm:px-10 py-2 text-center sm:text-left first:pl-0">
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl" data-testid="stat-listings">500+</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
            </div>
            <div className="px-8 sm:px-10 py-2 text-center sm:text-left">
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl" data-testid="stat-dealers">200+</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verified Dealers</p>
            </div>
            <div className="px-8 sm:px-10 py-2 text-center sm:text-left">
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl" data-testid="stat-rating">4.9</p>
              <p className="text-xs text-muted-foreground mt-0.5">Community Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Listings — 3-column CG-style ── */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-lg font-bold text-foreground tracking-tight"
              data-testid="text-new-listings"
            >
              Featured Listings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Recently added vehicles from our community</p>
          </div>
          <Link href="/browse">
            <span
              className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
              data-testid="link-view-all"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings?.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
        </div>
      </section>

      {/* ── Browse by Category — visual cards with images ── */}
      <section className="bg-secondary border-y border-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-lg font-bold text-foreground tracking-tight mb-6" data-testid="text-browse-category">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.type} href={`/browse?bodyType=${encodeURIComponent(cat.type)}`}>
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* ── Why CarShuk — icons with primary tint backgrounds ── */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Left — visual element */}
            <div className="lg:col-span-2">
              <div className="aspect-[4/3] rounded-xl border border-border/60 bg-background flex items-center justify-center">
                <div className="text-center px-6">
                  <BarChart3 className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">Transparent Pricing</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Every listing includes a real market price estimate
                  </p>
                </div>
              </div>
            </div>
            {/* Right — value props */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-8">
              <h2
                className="text-lg font-bold text-foreground tracking-tight"
                data-testid="text-why-carshuk"
              >
                Why CarShuk?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">No buyer fees</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Browse and buy without hidden costs. We never charge buyers a penny.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">No middleman</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Deal directly with sellers. Transparent pricing, real conversations, faster transactions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">New listings daily</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Fresh inventory added every day from private sellers and local dealers you can trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by Location — clean cards ── */}
      <section className="bg-secondary border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <h2
            className="text-lg font-bold text-foreground tracking-tight"
            data-testid="text-browse-location"
          >
            Browse by Location
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Find vehicles near your community</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {locations.map((loc) => (
            <Link key={loc.name} href={`/browse?city=${encodeURIComponent(loc.name)}`}>
              <div
                data-testid={`card-location-${loc.name.toLowerCase().replace(/\s/g, "-")}`}
                className="group rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{loc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{loc.state} · {loc.count} listings</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* ── How It Works — clean numbered steps ── */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <h2
            className="text-lg font-bold text-foreground tracking-tight mb-10"
            data-testid="text-how-it-works"
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary tabular-nums">{s.step}</span>
                </div>
                <div className="pt-0.5">
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — cinematic with sell-cta-bg.jpg ── */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={sellCtaBgImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">Ready to sell your car?</h2>
              <p className="mt-2 text-sm text-white/70 max-w-md leading-relaxed">
                List it in minutes. Enter your VIN, set your price, and connect with buyers in your area.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/sell">
                <Button data-testid="button-cta-sell" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6">
                  Sell My Car <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" data-testid="button-cta-browse" className="rounded-full border-white/40 text-white hover:bg-white/10 px-6">
                  Browse Cars
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
