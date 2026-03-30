import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import ListingCard from "@/components/listing-card";
import { Search, SlidersHorizontal, Bookmark, X, Car } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import type { Listing } from "@shared/schema";

const makes = ["Toyota", "Honda", "BMW", "Mercedes-Benz", "Tesla", "Ford", "Chevrolet", "Jeep", "Hyundai", "Kia", "Nissan", "Lexus", "Audi", "Subaru", "Mazda", "Volkswagen", "Volvo", "Porsche"];
const bodyTypes = [
  { label: "Sedan", icon: "🚗" },
  { label: "SUV", icon: "🚙" },
  { label: "Truck", icon: "🛻" },
  { label: "Minivan", icon: "🚐" },
  { label: "Coupe", icon: "🏎️" },
  { label: "Convertible", icon: "🏎️" },
  { label: "Wagon", icon: "🚗" },
];
const drivetrains = ["FWD", "AWD", "4WD", "RWD"];
const transmissions = ["Automatic", "Manual"];
const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid"];
const exteriorColors = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Gray", hex: "#808080" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
  { name: "Brown", hex: "#92400e" },
  { name: "Gold", hex: "#ca8a04" },
  { name: "Orange", hex: "#ea580c" },
];

interface Filters {
  search: string;
  minPrice: string;
  maxPrice: string;
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  exteriorColor: string;
  sellerType: string;
  titleStatus: string;
  noAccidents: boolean;
  sort: string;
}

const defaultFilters: Filters = {
  search: "", minPrice: "", maxPrice: "", make: "", model: "",
  minYear: "", maxYear: "", maxMileage: "", bodyType: "", transmission: "",
  drivetrain: "", fuelType: "", exteriorColor: "", sellerType: "", titleStatus: "",
  noAccidents: false, sort: "newest",
};

function buildQueryParams(f: Filters): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.search) p.search = f.search;
  if (f.minPrice) p.minPrice = f.minPrice;
  if (f.maxPrice) p.maxPrice = f.maxPrice;
  if (f.make) p.make = f.make;
  if (f.minYear) p.minYear = f.minYear;
  if (f.maxYear) p.maxYear = f.maxYear;
  if (f.maxMileage) p.maxMileage = f.maxMileage;
  if (f.bodyType) p.bodyType = f.bodyType;
  if (f.transmission) p.transmission = f.transmission;
  if (f.drivetrain) p.drivetrain = f.drivetrain;
  if (f.fuelType) p.fuelType = f.fuelType;
  if (f.exteriorColor) p.exteriorColor = f.exteriorColor;
  if (f.sellerType) p.sellerType = f.sellerType;
  return p;
}

// Get active filter labels for chips
function getActiveFilters(f: Filters): Array<{ key: keyof Filters; label: string }> {
  const active: Array<{ key: keyof Filters; label: string }> = [];
  if (f.make) active.push({ key: "make", label: f.make });
  if (f.bodyType) active.push({ key: "bodyType", label: f.bodyType });
  if (f.transmission) active.push({ key: "transmission", label: f.transmission });
  if (f.drivetrain) active.push({ key: "drivetrain", label: f.drivetrain });
  if (f.fuelType) active.push({ key: "fuelType", label: f.fuelType });
  if (f.exteriorColor) active.push({ key: "exteriorColor", label: f.exteriorColor });
  if (f.sellerType) active.push({ key: "sellerType", label: f.sellerType === "dealer" ? "Dealer" : "Private" });
  if (f.minPrice || f.maxPrice) {
    const low = f.minPrice ? `$${Number(f.minPrice).toLocaleString()}` : "Any";
    const high = f.maxPrice ? `$${Number(f.maxPrice).toLocaleString()}` : "Any";
    active.push({ key: "minPrice", label: `Price: ${low} – ${high}` });
  }
  if (f.minYear || f.maxYear) {
    active.push({ key: "minYear", label: `Year: ${f.minYear || "Any"} – ${f.maxYear || "Any"}` });
  }
  if (f.maxMileage) active.push({ key: "maxMileage", label: `Under ${Number(f.maxMileage).toLocaleString()} mi` });
  if (f.titleStatus) active.push({ key: "titleStatus", label: `${f.titleStatus} title` });
  if (f.noAccidents) active.push({ key: "noAccidents", label: "No Accidents" });
  return active;
}

function FilterSidebar({ filters, setFilters, onReset }: {
  filters: Filters;
  setFilters: (fn: (f: Filters) => Filters) => void;
  onReset: () => void;
}) {
  const set = (key: keyof Filters) => (val: string | boolean) => {
    setFilters((f) => ({ ...f, [key]: val === "__all__" ? "" : val }));
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-7" data-testid="button-reset-filters">
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "make", "year", "body", "drivetrain", "transmission", "fuel", "color", "seller", "history"]} className="space-y-0">
        {/* Price Range */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex gap-2">
              <Input placeholder="Min" type="number" value={filters.minPrice} onChange={(e) => set("minPrice")(e.target.value)} className="h-8 text-xs" data-testid="input-min-price" />
              <Input placeholder="Max" type="number" value={filters.maxPrice} onChange={(e) => set("maxPrice")(e.target.value)} className="h-8 text-xs" data-testid="input-max-price" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Make */}
        <AccordionItem value="make" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Make & Model
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <Select value={filters.make || "__all__"} onValueChange={(v) => set("make")(v)}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-filter-make">
                <SelectValue placeholder="Any Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Any Make</SelectItem>
                {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Model" value={filters.model} onChange={(e) => set("model")(e.target.value)} className="h-8 text-xs" data-testid="input-filter-model" />
          </AccordionContent>
        </AccordionItem>

        {/* Year */}
        <AccordionItem value="year" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Year Range
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex gap-2">
              <Input placeholder="Min" type="number" value={filters.minYear} onChange={(e) => set("minYear")(e.target.value)} className="h-8 text-xs" data-testid="input-min-year" />
              <Input placeholder="Max" type="number" value={filters.maxYear} onChange={(e) => set("maxYear")(e.target.value)} className="h-8 text-xs" data-testid="input-max-year" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Mileage */}
        <AccordionItem value="mileage" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Mileage
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <Input placeholder="Max mileage" type="number" value={filters.maxMileage} onChange={(e) => set("maxMileage")(e.target.value)} className="h-8 text-xs" data-testid="input-max-mileage" />
          </AccordionContent>
        </AccordionItem>

        {/* Body Style — icon chips */}
        <AccordionItem value="body" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Body Style
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex flex-wrap gap-1.5">
              {bodyTypes.map((bt) => (
                <button
                  key={bt.label}
                  data-testid={`chip-body-${bt.label.toLowerCase()}`}
                  onClick={() => set("bodyType")(filters.bodyType === bt.label ? "" : bt.label)}
                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    filters.bodyType === bt.label
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{bt.icon}</span>
                  {bt.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Drivetrain */}
        <AccordionItem value="drivetrain" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Drivetrain
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {drivetrains.map((d) => (
                <label key={d} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <Checkbox
                    checked={filters.drivetrain === d}
                    onCheckedChange={(checked) => set("drivetrain")(checked ? d : "")}
                    data-testid={`check-drivetrain-${d.toLowerCase()}`}
                  />
                  {d}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Transmission */}
        <AccordionItem value="transmission" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Transmission
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {transmissions.map((t) => (
                <label key={t} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <Checkbox
                    checked={filters.transmission === t}
                    onCheckedChange={(checked) => set("transmission")(checked ? t : "")}
                    data-testid={`check-trans-${t.toLowerCase()}`}
                  />
                  {t}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fuel */}
        <AccordionItem value="fuel" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Fuel Type
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {fuelTypes.map((f) => (
                <label key={f} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <Checkbox
                    checked={filters.fuelType === f}
                    onCheckedChange={(checked) => set("fuelType")(checked ? f : "")}
                    data-testid={`check-fuel-${f.toLowerCase()}`}
                  />
                  {f}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Exterior Color — swatches */}
        <AccordionItem value="color" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Exterior Color
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex flex-wrap gap-2">
              {exteriorColors.map((c) => (
                <button
                  key={c.name}
                  data-testid={`swatch-${c.name.toLowerCase()}`}
                  onClick={() => set("exteriorColor")(filters.exteriorColor === c.name ? "" : c.name)}
                  className={`group relative flex flex-col items-center gap-1`}
                  title={c.name}
                >
                  <div
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      filters.exteriorColor === c.name
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-border hover:border-primary/40"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[9px] text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seller Type */}
        <AccordionItem value="seller" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Seller Type
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {[{ v: "", l: "All" }, { v: "private", l: "Private Seller" }, { v: "dealer", l: "Dealer" }].map((opt) => (
                <label key={opt.v} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <Checkbox
                    checked={filters.sellerType === opt.v}
                    onCheckedChange={(checked) => set("sellerType")(checked ? opt.v : "")}
                    data-testid={`check-seller-${opt.l.toLowerCase().replace(/\s/g, "-")}`}
                  />
                  {opt.l}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Vehicle History */}
        <AccordionItem value="history" className="border-b-0">
          <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5 hover:no-underline">
            Vehicle History
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <Checkbox
                  checked={filters.titleStatus === "clean"}
                  onCheckedChange={(checked) => set("titleStatus")(checked ? "clean" : "")}
                  data-testid="check-clean-title"
                />
                Clean Title
              </label>
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <Checkbox
                  checked={filters.noAccidents}
                  onCheckedChange={(checked) => set("noAccidents")(!!checked)}
                  data-testid="check-no-accidents"
                />
                No Accidents
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function BrowseListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [mobileFilters, setMobileFilters] = useState(false);

  const queryParams = buildQueryParams(filters);
  const queryString = new URLSearchParams(queryParams).toString();

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings", queryString],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/listings${queryString ? "?" + queryString : ""}`);
      return res.json();
    },
  });

  // Client-side filtering for fields not in the API
  const filteredListings = useMemo(() => {
    if (!listings) return [];
    let result = [...listings];
    if (filters.noAccidents) {
      result = result.filter((l) => !l.accidentHistory);
    }
    if (filters.titleStatus) {
      result = result.filter((l) => l.titleStatus === filters.titleStatus);
    }
    return result;
  }, [listings, filters.noAccidents, filters.titleStatus]);

  const sortedListings = useMemo(() => {
    const copy = [...filteredListings];
    switch (filters.sort) {
      case "price-low": return copy.sort((a, b) => a.price - b.price);
      case "price-high": return copy.sort((a, b) => b.price - a.price);
      case "mileage-low": return copy.sort((a, b) => a.mileage - b.mileage);
      default: return copy;
    }
  }, [filteredListings, filters.sort]);

  const activeFilters = getActiveFilters(filters);

  const saveSearchMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save searches");
      const active = Object.entries(queryParams).filter(([_, v]) => v);
      const name = active.length
        ? active.map(([k, v]) => `${k}: ${v}`).join(", ")
        : "All listings";
      await apiRequest("POST", "/api/saved-searches", {
        userId: user.id,
        name,
        filters: JSON.stringify(queryParams),
      });
    },
    onSuccess: () => {
      toast({ title: "Search saved", description: "You can find this in your dashboard." });
      if (user) queryClient.invalidateQueries({ queryKey: ["/api/saved-searches", user.id] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetFilters = () => setFilters(defaultFilters);

  const clearFilter = (key: keyof Filters) => {
    setFilters((f) => {
      const updates: any = { [key]: "" };
      if (key === "minPrice") updates.maxPrice = "";
      if (key === "minYear") updates.maxYear = "";
      if (key === "noAccidents") updates.noAccidents = false;
      return { ...f, ...updates };
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-base font-bold text-foreground whitespace-nowrap" data-testid="text-result-count">
            {sortedListings.length} {sortedListings.length === 1 ? "vehicle" : "vehicles"} found
          </h1>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-9 h-9 text-sm"
              data-testid="input-search"
            />
          </div>
          <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-9 w-9" data-testid="button-mobile-filters">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto pt-8">
              <FilterSidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
            <SelectTrigger className="h-9 w-44 text-xs" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="mileage-low">Mileage: Low to High</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveSearchMut.mutate()}
            disabled={saveSearchMut.isPending}
            className="gap-1.5 hidden sm:inline-flex text-xs"
            data-testid="button-save-search"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save Search
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4" data-testid="filter-chips">
          {activeFilters.map((af) => (
            <span
              key={af.key}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
            >
              {af.label}
              <button
                onClick={() => clearFilter(af.key)}
                className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                data-testid={`chip-remove-${af.key}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline"
            data-testid="button-clear-all"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)] pb-8 pr-2">
            <FilterSidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedListings.length === 0 ? (
            <div className="text-center py-16">
              <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No listings match your filters.</p>
              <Button variant="link" onClick={resetFilters} className="mt-2 text-primary" data-testid="button-clear-filters">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
