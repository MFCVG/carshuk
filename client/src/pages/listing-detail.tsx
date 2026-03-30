import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Car, Heart, MapPin, Gauge, Calendar, Shield, AlertTriangle,
  CheckCircle2, Phone, ArrowLeft, Eye, User as UserIcon,
} from "lucide-react";
import type { Listing, PriceEstimate } from "@shared/schema";
import { useState, useEffect } from "react";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}
function formatMiles(m: number) {
  return new Intl.NumberFormat("en-US").format(m) + " mi";
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function PriceBar({ estimate }: { estimate: PriceEstimate }) {
  const range = estimate.highPrice - estimate.lowPrice;
  const pos = range > 0 ? ((estimate.estimatedPrice - estimate.lowPrice) / range) * 100 : 50;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>{formatPrice(estimate.lowPrice)}</span>
        <span>{formatPrice(estimate.highPrice)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background shadow"
          style={{ left: `calc(${Math.min(Math.max(pos, 5), 95)}% - 6px)` }}
        />
      </div>
      <p className="mt-2 text-sm text-foreground">
        Estimated value: <span className="font-semibold text-primary">{formatPrice(estimate.estimatedPrice)}</span>
        <Badge variant="outline" className="ml-2 text-[10px]">{estimate.confidence} confidence</Badge>
      </p>
    </div>
  );
}

export default function ListingDetail() {
  const [, params] = useRoute("/listings/:id");
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFav, setIsFav] = useState(false);

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ["/api/listings", id],
    enabled: !!id,
  });

  const { data: estimate } = useQuery<PriceEstimate>({
    queryKey: ["/api/estimate-price", listing?.make, listing?.year, listing?.mileage],
    enabled: !!listing,
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/estimate-price", {
        make: listing!.make,
        model: listing!.model,
        year: listing!.year,
        mileage: listing!.mileage,
        condition: listing!.condition,
      });
      return res.json();
    },
  });

  const { data: favorites } = useQuery<Array<{ listingId: number }>>({
    queryKey: ["/api/favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/favorites/${user!.id}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (favorites && id) {
      setIsFav(favorites.some((f) => f.listingId === Number(id)));
    }
  }, [favorites, id]);

  const favMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save favorites");
      if (isFav) {
        await apiRequest("DELETE", `/api/favorites/${user.id}/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { userId: user.id, listingId: Number(id) });
      }
    },
    onSuccess: () => {
      setIsFav(!isFav);
      if (user) queryClient.invalidateQueries({ queryKey: ["/api/favorites", user.id] });
      toast({ title: isFav ? "Removed from favorites" : "Added to favorites" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 text-center">
        <p className="text-sm text-muted-foreground">Listing not found.</p>
        <Link href="/browse">
          <Button variant="link" className="mt-2">Back to listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <Link href="/browse">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer" data-testid="link-back-browse">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Image + details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Image gallery placeholder */}
          <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>

          {/* Vehicle specs */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3" data-testid="text-vehicle-details">Vehicle Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <DetailRow label="Year" value={listing.year} />
              <DetailRow label="Make" value={listing.make} />
              <DetailRow label="Model" value={listing.model} />
              <DetailRow label="Trim" value={listing.trim} />
              <DetailRow label="Body Type" value={listing.bodyType} />
              <DetailRow label="Exterior Color" value={listing.exteriorColor} />
              <DetailRow label="Interior Color" value={listing.interiorColor} />
              <DetailRow label="Transmission" value={listing.transmission} />
              <DetailRow label="Drivetrain" value={listing.drivetrain} />
              <DetailRow label="Fuel Type" value={listing.fuelType} />
              <DetailRow label="Engine" value={listing.engineSize} />
              <DetailRow label="Mileage" value={formatMiles(listing.mileage)} />
              <DetailRow label="Condition" value={listing.condition} />
            </div>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">
                {listing.description}
              </p>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price + title card */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight" data-testid="text-listing-title">
                  {listing.title}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  {listing.city && listing.state && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.city}, {listing.state}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" />
                    {formatMiles(listing.mileage)}
                  </span>
                </div>
              </div>
              <Button
                variant={isFav ? "default" : "outline"}
                size="icon"
                onClick={() => favMut.mutate()}
                disabled={favMut.isPending}
                className="shrink-0 h-9 w-9"
                data-testid="button-favorite"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
              </Button>
            </div>

            <p className="mt-4 text-xl font-bold text-primary" data-testid="text-detail-price">
              {formatPrice(listing.price)}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Badge variant={listing.sellerType === "dealer" ? "default" : "secondary"} data-testid="badge-seller-type">
                {listing.sellerType === "dealer" ? "Dealer" : "Private Seller"}
              </Badge>
              {listing.views !== undefined && listing.views > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {listing.views} views
                </span>
              )}
            </div>
          </Card>

          {/* VIN + History */}
          {listing.vin && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Vehicle History</h3>
              <div className="rounded-md bg-muted p-3 mb-3">
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="text-sm font-mono font-medium text-foreground tracking-wide" data-testid="text-vin">
                  {listing.vin}
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Owners:</span>
                  <span className="font-medium text-foreground">{listing.numOwners ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {listing.accidentHistory ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="text-muted-foreground">Accidents:</span>
                  <span className="font-medium text-foreground">
                    {listing.accidentHistory ? "Reported" : "None reported"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium text-foreground capitalize">{listing.titleStatus || "Clean"}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Price Estimate */}
          {estimate && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground" data-testid="text-price-estimate-title">Market Price Estimate</h3>
              <PriceBar estimate={estimate} />
            </Card>
          )}

          {/* Contact */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Seller Info</h3>
            <Button className="w-full gap-2" data-testid="button-contact-seller">
              <Phone className="h-4 w-4" />
              Contact Seller
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
