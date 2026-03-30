import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import ListingCard from "@/components/listing-card";
import { Search, SlidersHorizontal, Bookmark, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import type { Listing } from "@shared/schema";

const makes = ["Toyota", "Honda", "BMW", "Mercedes-Benz", "Tesla", "Ford", "Chevrolet", "Jeep", "Hyundai", "Kia", "Nissan", "Lexus", "Audi", "Subaru", "Mazda", "Volkswagen", "Volvo", "Porsche"];
const bodyTypes = ["Sedan", "SUV", "Truck", "Minivan", "Coupe", "Convertible", "Hatchback", "Wagon"];
const transmissions = ["Automatic", "Manual"];
const drivetrains = ["FWD", "AWD", "4WD", "RWD"];
const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid"];
const colors = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Brown", "Gold", "Orange"];
const conditions = ["new", "excellent", "good", "fair", "poor"];

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
  condition: string;
  sort: string;
}

const defaultFilters: Filters = {
  search: "", minPrice: "", maxPrice: "", make: "", model: "",
  minYear: "", maxYear: "", maxMileage: "", bodyType: "", transmission: "",
  drivetrain: "", fuelType: "", exteriorColor: "", sellerType: "", condition: "", sort: "newest",
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
  if (f.condition) p.condition = f.condition;
  return p;
}

function FilterSelect({ label, value, onValueChange, placeholder, options, testId }: {
  label: string; value: string; onValueChange: (v: string) => void;
  placeholder: string; options: string[]; testId: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 text-sm" data-testid={testId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterSidebar({ filters, setFilters, onReset }: {
  filters: Filters;
  setFilters: (fn: (f: Filters) => Filters) => void;
  onReset: () => void;
}) {
  const set = (key: keyof Filters) => (val: string) => {
    setFilters((f) => ({ ...f, [key]: val === "__all__" ? "" : val }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-7" data-testid="button-reset-filters">
          Reset
        </Button>
      </div>

      {/* Price range */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Price Range</Label>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" value={filters.minPrice} onChange={(e) => set("minPrice")(e.target.value)} className="h-9 text-sm" data-testid="input-min-price" />
          <Input placeholder="Max" type="number" value={filters.maxPrice} onChange={(e) => set("maxPrice")(e.target.value)} className="h-9 text-sm" data-testid="input-max-price" />
        </div>
      </div>

      <FilterSelect label="Make" value={filters.make} onValueChange={set("make")} placeholder="Any Make" options={makes} testId="select-filter-make" />
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Model</Label>
        <Input placeholder="Any Model" value={filters.model} onChange={(e) => set("model")(e.target.value)} className="h-9 text-sm" data-testid="input-filter-model" />
      </div>

      {/* Year range */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Year Range</Label>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" value={filters.minYear} onChange={(e) => set("minYear")(e.target.value)} className="h-9 text-sm" data-testid="input-min-year" />
          <Input placeholder="Max" type="number" value={filters.maxYear} onChange={(e) => set("maxYear")(e.target.value)} className="h-9 text-sm" data-testid="input-max-year" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Max Mileage</Label>
        <Input placeholder="e.g. 50000" type="number" value={filters.maxMileage} onChange={(e) => set("maxMileage")(e.target.value)} className="h-9 text-sm" data-testid="input-max-mileage" />
      </div>

      <FilterSelect label="Body Type" value={filters.bodyType} onValueChange={set("bodyType")} placeholder="Any" options={bodyTypes} testId="select-filter-body" />
      <FilterSelect label="Transmission" value={filters.transmission} onValueChange={set("transmission")} placeholder="Any" options={transmissions} testId="select-filter-transmission" />
      <FilterSelect label="Drivetrain" value={filters.drivetrain} onValueChange={set("drivetrain")} placeholder="Any" options={drivetrains} testId="select-filter-drivetrain" />
      <FilterSelect label="Fuel Type" value={filters.fuelType} onValueChange={set("fuelType")} placeholder="Any" options={fuelTypes} testId="select-filter-fuel" />
      <FilterSelect label="Exterior Color" value={filters.exteriorColor} onValueChange={set("exteriorColor")} placeholder="Any" options={colors} testId="select-filter-color" />
      <FilterSelect label="Seller Type" value={filters.sellerType} onValueChange={set("sellerType")} placeholder="Any" options={["private", "dealer"]} testId="select-filter-seller" />
      <FilterSelect label="Condition" value={filters.condition} onValueChange={set("condition")} placeholder="Any" options={conditions} testId="select-filter-condition" />
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

  const sortedListings = useMemo(() => {
    if (!listings) return [];
    const copy = [...listings];
    switch (filters.sort) {
      case "price-low": return copy.sort((a, b) => a.price - b.price);
      case "price-high": return copy.sort((a, b) => b.price - a.price);
      case "mileage-low": return copy.sort((a, b) => a.mileage - b.mileage);
      default: return copy;
    }
  }, [listings, filters.sort]);

  const saveSearchMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save searches");
      const activeFilters = Object.entries(queryParams).filter(([_, v]) => v);
      const name = activeFilters.length
        ? activeFilters.map(([k, v]) => `${k}: ${v}`).join(", ")
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, keyword…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-9 h-10"
              data-testid="input-search"
            />
          </div>
          <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-10 w-10" data-testid="button-mobile-filters">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto pt-8">
              <FilterSidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground" data-testid="text-result-count">
            {sortedListings.length} {sortedListings.length === 1 ? "result" : "results"}
          </span>
          <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
            <SelectTrigger className="h-9 w-44 text-sm" data-testid="select-sort">
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
            className="gap-1.5 hidden sm:inline-flex"
            data-testid="button-save-search"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save Search
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
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
