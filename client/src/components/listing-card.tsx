import { Link } from "wouter";
import { useMemo } from "react";
import { Heart, Car, MessageCircle, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { getDealRating, getMonthlyPayment, formatPrice, formatMiles, estimateMarketValue } from "@/lib/deal-utils";
import type { Listing } from "@shared/schema";

// Deal indicator dot colors — per spec
const dealDotColors: Record<string, string> = {
  "Great Deal": "hsl(152 72% 38%)",
  "Good Deal": "hsl(152 60% 44%)",
  "Fair Deal": "hsl(38 90% 50%)",
  "Above Market": "hsl(15 80% 50%)",
  "High Price": "hsl(15 80% 50%)",
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const estimatedValue = useMemo(
    () => estimateMarketValue(listing.make, listing.year, listing.mileage, listing.condition),
    [listing.make, listing.year, listing.mileage, listing.condition]
  );
  const deal = useMemo(
    () => getDealRating(listing.price, estimatedValue),
    [listing.price, estimatedValue]
  );
  const monthly = useMemo(() => getMonthlyPayment(listing.price), [listing.price]);

  const dotColor = dealDotColors[deal.label] ?? "#6B7280";

  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        data-testid={`card-listing-${listing.id}`}
        className="listing-card group"
      >
        {/* Image area — 16:10 aspect ratio */}
        <div className="relative aspect-[16/10] bg-muted flex items-center justify-center overflow-hidden">
          <Car className="h-10 w-10 text-muted-foreground/20" />

          {/* Favorite heart — top-right */}
          <button
            className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground/60 hover:text-foreground shadow-sm transition-all duration-200 hover:bg-white"
            data-testid={`button-save-${listing.id}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="h-3.5 w-3.5" />
          </button>

          {/* Badge — bottom-left */}
          {listing.featured && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-amber-400 text-amber-950 tracking-wide">
              FEATURED
            </span>
          )}
        </div>

        {/* Card content — CG-style vertical layout */}
        <div className="flex flex-col p-4 gap-1.5">
          {/* Year Make Model — bold, ~16px */}
          <h3
            className="text-base font-bold text-foreground leading-snug"
            data-testid={`text-title-${listing.id}`}
          >
            {listing.year} {listing.make} {listing.model}
          </h3>

          {/* Trim · Drivetrain · Mileage — muted, ~13px */}
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {[
              listing.trim,
              listing.drivetrain,
              formatMiles(listing.mileage),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {/* Location with pin icon */}
          {listing.city && listing.state && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.city}, {listing.state}
            </p>
          )}

          {/* Deal badge + price row */}
          <div className="flex items-center justify-between mt-1">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: dotColor }}
              data-testid={`badge-deal-${listing.id}`}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              {deal.label}
            </span>
            <p
              className="text-lg font-bold text-foreground tabular-nums leading-none"
              data-testid={`text-price-${listing.id}`}
            >
              {formatPrice(listing.price)}
            </p>
          </div>

          {/* Monthly estimate + contact icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {listing.contactWhatsapp && (
                <SiWhatsapp className="h-3.5 w-3.5 text-muted-foreground/50" title="WhatsApp available" />
              )}
              {listing.contactSms && (
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground/50" title="SMS available" />
              )}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              Est. ${monthly.toLocaleString()}/mo
            </span>
          </div>

          {/* Check Availability button */}
          <Button
            variant="outline"
            className="w-full mt-1 h-9 text-sm font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            data-testid={`button-check-avail-${listing.id}`}
          >
            Check Availability
          </Button>
        </div>
      </div>
    </Link>
  );
}
