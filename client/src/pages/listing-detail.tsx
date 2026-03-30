import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  getDealRating, getMonthlyPayment, formatPrice, formatMiles, estimateMarketValue,
} from "@/lib/deal-utils";
import {
  Car, Heart, MapPin, Gauge, Shield, AlertTriangle,
  CheckCircle2, Phone, ArrowLeft, Eye, Fuel, Cog,
  Palette, CircleDot, Camera, ChevronLeft, ChevronRight, MessageCircle,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Listing, PriceEstimate } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";

function SpecIcon({ label, value }: { icon?: JSX.Element; label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col py-3 px-4 border border-border rounded-lg bg-background">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 leading-tight">{value}</p>
    </div>
  );
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

function PriceBar({ estimate, price }: { estimate: PriceEstimate; price: number }) {
  const range = estimate.highPrice - estimate.lowPrice;
  const pos = range > 0 ? ((price - estimate.lowPrice) / range) * 100 : 50;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>{formatPrice(estimate.lowPrice)}</span>
        <span>{formatPrice(estimate.highPrice)}</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background shadow-md"
          style={{ left: `calc(${Math.min(Math.max(pos, 5), 95)}% - 7px)` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Estimated market value: <span className="font-semibold text-foreground">{formatPrice(estimate.estimatedPrice)}</span>
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
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

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

  const deal = useMemo(() => {
    if (!listing || !estimate) return null;
    return getDealRating(listing.price, estimate.estimatedPrice);
  }, [listing, estimate]);

  const monthly = useMemo(() => listing ? getMonthlyPayment(listing.price) : 0, [listing]);

  const images: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(listing?.images || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [listing?.images]);

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <Link href="/browse">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer" data-testid="link-back-browse">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image gallery */}
          <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentImageIdx]}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Car className="h-20 w-20 text-muted-foreground/30" />
            )}
            {/* Photo count badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs text-white">
              <Camera className="h-3.5 w-3.5" />
              {images.length} Photo{images.length !== 1 ? "s" : ""}
            </div>
            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                  onClick={() => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                  onClick={() => setCurrentImageIdx((prev) => (prev + 1) % images.length)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Title (mobile) */}
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-listing-title-mobile">
              {listing.title}
            </h1>
            <p className="text-lg font-bold text-primary mt-1 tabular-nums">{formatPrice(listing.price)}</p>
          </div>

          {/* Vehicle Overview — clean 2-column spec grid, no icon badges */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="spec-grid">
            <SpecIcon label="Mileage" value={formatMiles(listing.mileage)} />
            <SpecIcon label="Body" value={listing.bodyType} />
            <SpecIcon label="Drivetrain" value={listing.drivetrain} />
            <SpecIcon label="Transmission" value={listing.transmission} />
            <SpecIcon label="Fuel" value={listing.fuelType} />
            <SpecIcon label="Engine" value={listing.engineSize} />
            <SpecIcon label="Exterior" value={listing.exteriorColor} />
            <SpecIcon label="Interior" value={listing.interiorColor} />
          </div>

          {/* Tabbed content */}
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start" data-testid="detail-tabs">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">Vehicle History</TabsTrigger>
              <TabsTrigger value="price" data-testid="tab-price">Price Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Vehicle Specifications</h3>
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
                  <DetailRow label="VIN" value={listing.vin} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Features & Equipment</h3>
                {listing.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No feature details available.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Vehicle History</h3>
                {listing.vin && (
                  <div className="rounded-md bg-muted p-3 mb-4">
                    <p className="text-xs text-muted-foreground">VIN</p>
                    <p className="text-sm font-mono font-medium text-foreground tracking-wide" data-testid="text-vin">
                      {listing.vin}
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Owners</p>
                      <p className="text-xs text-muted-foreground">{listing.numOwners ?? "—"} previous owner(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      listing.accidentHistory ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
                    }`}>
                      {listing.accidentHistory ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Accidents</p>
                      <p className="text-xs text-muted-foreground">{listing.accidentHistory ? "Accidents reported" : "No accidents reported"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Title Status</p>
                      <p className="text-xs text-muted-foreground capitalize">{listing.titleStatus || "Clean"}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="price">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground" data-testid="text-price-analysis">Price Analysis</h3>
                {estimate ? (
                  <>
                    <PriceBar estimate={estimate} price={listing.price} />
                    {deal && (
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: deal.color }}
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: deal.color }}
                          />
                          {deal.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{deal.description}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Loading price analysis...</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Description */}
          {listing.description && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Seller's Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">
                {listing.description}
              </p>
            </Card>
          )}
        </div>

        {/* Right sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Price card */}
          <Card className="p-5 sticky top-24">
            <h1 className="hidden lg:block text-lg font-bold text-foreground leading-tight" data-testid="text-listing-title">
              <span className="font-normal text-muted-foreground">{listing.year}</span>{" "}
              {listing.make} {listing.model}
            </h1>
            {listing.city && listing.state && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {listing.city}, {listing.state}
              </p>
            )}

            <div className="mt-4">
              <p className="text-2xl font-bold text-primary tabular-nums" data-testid="text-detail-price">
                {formatPrice(listing.price)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                Est. ${monthly.toLocaleString()}/mo
              </p>
            </div>

            {/* Deal indicator — subtle dot + text, no colored banner */}
            {deal && (
              <div className="mt-3 flex items-center gap-2" data-testid="badge-deal-detail">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: deal.color }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: deal.color }}
                  />
                  {deal.label}
                </span>
                <span className="text-xs text-muted-foreground">{deal.description}</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                data-testid="badge-seller-type"
              >
                {listing.sellerType === "dealer" ? "Dealer" : "Private Seller"}
              </span>
              {listing.views !== undefined && listing.views > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {listing.views} views
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {/* Primary CTA — Check Availability */}
              <Button
                className="w-full gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                data-testid="button-check-availability"
              >
                Check Availability
              </Button>
              {listing.contactPhone && listing.contactWhatsapp && (
                <a
                  href={`https://wa.me/1${listing.contactPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model} listed on CarShuk`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950"
                    data-testid="button-whatsapp"
                  >
                    <SiWhatsapp className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              )}
              {listing.contactPhone && listing.contactSms && (
                <a
                  href={`sms:+1${listing.contactPhone.replace(/\D/g, "")}?body=${encodeURIComponent(`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model} listed on CarShuk`)}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full gap-2" data-testid="button-sms">
                    <MessageCircle className="h-4 w-4" />
                    Text Message
                  </Button>
                </a>
              )}
              {listing.contactPhone && (
                <a href={`tel:+1${listing.contactPhone.replace(/\D/g, "")}`} className="w-full">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-call-seller">
                    <Phone className="h-4 w-4" />
                    Call Seller
                  </Button>
                </a>
              )}
              {!listing.contactPhone && (
                <Button variant="outline" className="w-full gap-2" data-testid="button-contact-seller">
                  <Phone className="h-4 w-4" />
                  Contact Seller
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full gap-2 border border-border"
                onClick={() => favMut.mutate()}
                disabled={favMut.isPending}
                data-testid="button-favorite"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current text-primary" : ""}`} />
                {isFav ? "Saved" : "Save"}
              </Button>
            </div>
          </Card>

          {/* Seller info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Seller Info</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {listing.sellerType === "dealer" ? "D" : "P"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {listing.sellerType === "dealer" ? "Dealer" : "Private Seller"}
                </p>
                {listing.city && listing.state && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {listing.city}, {listing.state}
                  </p>
                )}
              </div>
            </div>
            {listing.contactPhone && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{listing.contactPhone}</span>
                {listing.contactWhatsapp && <SiWhatsapp className="h-3 w-3 text-green-500" />}
                {listing.contactSms && <MessageCircle className="h-3 w-3 text-blue-500" />}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
