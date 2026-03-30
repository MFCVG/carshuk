import { Link } from "wouter";
import { useMemo } from "react";
import { Heart, MapPin, Car, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { getDealRating, getMonthlyPayment, formatPrice, formatMiles, estimateMarketValue } from "@/lib/deal-utils";
import type { Listing } from "@shared/schema";

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

  return (
    <div
      data-testid={`card-listing-${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:border-l-2"
      style={{ '--hover-accent': deal.color } as React.CSSProperties}
    >
      {/* Image area — ~55% of card */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/10 via-muted to-muted/80 flex items-center justify-center overflow-hidden">
        <Car className="h-12 w-12 text-muted-foreground/20" />

        {/* Deal badge — bottom left */}
        <span
          className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: deal.color }}
          data-testid={`badge-deal-${listing.id}`}
        >
          {deal.label === "Great Deal" && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
          )}
          {deal.label}
        </span>

        {/* Seller badge — top right */}
        <span className="absolute top-2 right-10 rounded-md bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
          {listing.sellerType === "dealer" ? "Dealer" : "Private"}
        </span>

        {/* Heart icon — top right */}
        <button
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          data-testid={`button-save-${listing.id}`}
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/listings/${listing.id}`}>
          <h3
            className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer"
            data-testid={`text-title-${listing.id}`}
          >
            {listing.year} {listing.make} {listing.model}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {listing.trim && `${listing.trim} · `}{formatMiles(listing.mileage)}
        </p>

        {listing.city && listing.state && (
          <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.city}, {listing.state}
          </p>
        )}

        <div className="mt-auto pt-3">
          <p className="text-xl font-bold text-foreground tabular-nums" data-testid={`text-price-${listing.id}`}>
            {formatPrice(listing.price)}
          </p>
          <span className="inline-flex items-center mt-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
            ${monthly.toLocaleString()}/mo est.
          </span>
        </div>

        <Link href={`/listings/${listing.id}`}>
          <Button
            variant="default"
            className="mt-3 w-full text-xs h-9"
            data-testid={`button-availability-${listing.id}`}
          >
            Check Availability
          </Button>
        </Link>

        {/* WhatsApp / SMS indicators */}
        {(listing.contactWhatsapp || listing.contactSms) && (
          <div className="flex items-center gap-2 mt-2">
            {listing.contactWhatsapp && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <SiWhatsapp className="h-3 w-3 text-green-500" />
                WhatsApp
              </span>
            )}
            {listing.contactSms && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MessageCircle className="h-3 w-3 text-blue-500" />
                SMS
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
