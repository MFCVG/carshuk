import { Link } from "wouter";
import { useMemo } from "react";
import { Heart, Car, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { getDealRating, getMonthlyPayment, formatPrice, formatMiles, estimateMarketValue } from "@/lib/deal-utils";
import type { Listing } from "@shared/schema";

// Deal indicator dot colors — subtle, small
const dealDotColors: Record<string, string> = {
  "Great Deal": "#248A52",
  "Good Deal": "#248A52",
  "Fair Deal": "#E6A317",
  "Above Market": "#D93025",
  "High Price": "#D93025",
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

          {/* Favorite heart — top-right, white circle with backdrop blur */}
          <button
            className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground/60 hover:text-foreground shadow-sm transition-all duration-200 hover:bg-white"
            data-testid={`button-save-${listing.id}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="h-3.5 w-3.5" />
          </button>

          {/* Featured badge — gold, top-left, only for featured listings */}
          {listing.featured && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-amber-400 text-amber-950 tracking-wide">
              FEATURED
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="flex flex-col p-4 gap-1">
          {/* Price + monthly */}
          <div className="flex items-baseline gap-2">
            <p
              className="text-lg font-bold text-foreground tabular-nums leading-none"
              data-testid={`text-price-${listing.id}`}
            >
              {formatPrice(listing.price)}
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              Est. ${monthly.toLocaleString()}/mo
            </span>
          </div>

          {/* Year Make Model */}
          <h3
            className="text-sm font-semibold text-foreground leading-snug mt-0.5"
            data-testid={`text-title-${listing.id}`}
          >
            {listing.year} {listing.make} {listing.model}
          </h3>

          {/* Meta line — Trim · Mileage · Location */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {[
              listing.trim,
              formatMiles(listing.mileage),
              listing.city && listing.state ? `${listing.city}, ${listing.state}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {/* Bottom row — deal indicator + seller type + contact icons */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-3">
              {/* Deal indicator — small colored dot + text */}
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                style={{ color: dotColor }}
                data-testid={`badge-deal-${listing.id}`}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                {deal.label}
              </span>

              {/* Seller type — tiny text, not a pill */}
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                {listing.sellerType === "dealer" ? "Dealer" : "Private"}
              </span>
            </div>

            {/* WhatsApp/SMS icons — small, muted */}
            {(listing.contactWhatsapp || listing.contactSms) && (
              <div className="flex items-center gap-1.5">
                {listing.contactWhatsapp && (
                  <span className="inline-flex items-center" title="WhatsApp available">
                    <SiWhatsapp className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </span>
                )}
                {listing.contactSms && (
                  <span className="inline-flex items-center" title="SMS available">
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
