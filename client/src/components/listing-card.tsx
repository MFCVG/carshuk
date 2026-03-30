import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Car, MapPin, Gauge, Calendar } from "lucide-react";
import type { Listing } from "@shared/schema";

function daysAgo(dateStr: string): string {
  if (!dateStr) return "Recently";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

function formatMileage(miles: number): string {
  return new Intl.NumberFormat("en-US").format(miles) + " mi";
}

// Generate a deterministic color from the listing id for the placeholder
const placeholderColors = [
  "from-primary/20 to-primary/5",
  "from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10",
  "from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700",
  "from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10",
  "from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10",
];

export default function ListingCard({ listing }: { listing: Listing }) {
  const colorClass = placeholderColors[listing.id % placeholderColors.length];

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card
        data-testid={`card-listing-${listing.id}`}
        className="group overflow-hidden border border-border bg-card transition-shadow hover:shadow-md cursor-pointer"
      >
        {/* Image placeholder */}
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
          <Car className="h-10 w-10 text-muted-foreground/40" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Badge
              variant={listing.sellerType === "dealer" ? "default" : "secondary"}
              className="text-[11px] px-1.5 py-0"
              data-testid={`badge-seller-${listing.id}`}
            >
              {listing.sellerType === "dealer" ? "Dealer" : "Private"}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <p className="text-base font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors" data-testid={`text-title-${listing.id}`}>
            {listing.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {formatMileage(listing.mileage)}
            </span>
            {listing.bodyType && (
              <span className="inline-flex items-center gap-1">
                <Car className="h-3 w-3" />
                {listing.bodyType}
              </span>
            )}
            {listing.city && listing.state && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.city}, {listing.state}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-lg font-bold text-primary" data-testid={`text-price-${listing.id}`}>
              {formatPrice(listing.price)}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysAgo(listing.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
