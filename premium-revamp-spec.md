# CarShuk Premium UI Revamp Specification

## Design Philosophy
Inspired by Bring a Trailer's editorial confidence, Cars & Bids' photo-first card design, and Genesis/Mercedes luxury restraint. The goal: make CarShuk feel like a curated automotive marketplace, not a classified ads board. Every pixel earns its place.

## Brand Identity — CARSHUK
- Keep the CARSHUK name but modernize the logo treatment
- Logo: "CAR" in regular weight, "SHUK" in bold — both in the display font
- Small car icon to the left (keep existing SVG but refine)
- The brand color is a deep, sophisticated teal — not the bright/saturated one currently used

## Color Palette (Complete Overhaul)

### Light Mode
| Role | HSL | Hex | Usage |
|---|---|---|---|
| Background | 0 0% 100% | #FFFFFF | Pure white — let content breathe |
| Surface | 220 14% 96% | #F3F4F6 | Card backgrounds, filter panels |
| Surface-alt | 220 13% 91% | #E5E7EB | Hover states, secondary surfaces |
| Border | 220 13% 91% | #E5E7EB | Subtle dividers |
| Border-strong | 220 9% 82% | #CCCED3 | Input borders, card borders |
| Text | 220 25% 10% | #141820 | Primary text — near-black with warmth |
| Text-muted | 220 8% 46% | #6B7280 | Secondary/meta text |
| Text-faint | 220 8% 65% | #9CA3AF | Placeholders, tertiary |
| Primary | 175 84% 22% | #094F4C | Deep teal — sophisticated, not bright |
| Primary-hover | 175 84% 18% | #073F3D | Darker on hover |
| Primary-light | 175 40% 94% | #E6F5F4 | Light teal for badges/tags |
| Accent | 36 100% 50% | #FFB800 | Gold — for "Featured" badges, premium signals |
| Accent-soft | 36 100% 95% | #FFF8E6 | Light gold background |
| Success | 152 60% 36% | #248A52 | Great Deal badges |
| Warning | 36 80% 50% | #E6A317 | Fair Deal badges |
| Danger | 0 72% 51% | #D93025 | Above Market badges |

### Dark Mode
| Role | HSL | Hex |
|---|---|---|
| Background | 220 20% 8% | #111318 |
| Surface | 220 18% 12% | #1A1D24 |
| Surface-alt | 220 16% 16% | #23272F |
| Border | 220 14% 20% | #2D3139 |
| Border-strong | 220 12% 28% | #3D4350 |
| Text | 220 14% 93% | #ECEEF1 |
| Text-muted | 220 8% 55% | #848B98 |
| Text-faint | 220 8% 38% | #5A6170 |
| Primary | 175 60% 45% | #2DA8A0 |
| Primary-hover | 175 60% 52% | #3DBFB6 |
| Primary-light | 175 40% 15% | #162E2D |

## Typography
- **Display font**: "Plus Jakarta Sans" from Google Fonts (700, 800 weights) — geometric, modern, premium
- **Body font**: "Inter" from Google Fonts (400, 500, 600) — crisp, professional, highly legible
- **Monospace numbers**: Use tabular-nums for all prices and stats
- **Max heading size**: text-xl for app pages. Hero headline can go to text-3xl max.
- **Letter spacing**: Slightly wider on uppercase labels (+0.05em), tighter on large headings (-0.02em)

## Navigation (Complete Redesign)
- **Style**: Clean, borderless top bar on white background
- **Left**: CARSHUK logo (modernized wordmark)
- **Center-left**: Nav links — "Browse Cars" | "Sell My Car" in medium-weight text, no uppercase
- **Right**: Dark mode toggle (subtle icon), user avatar/name or "Sign In" ghost button
- **Active state**: Subtle bottom border accent line (2px primary color)
- **Sticky on scroll**: Add a very subtle bottom shadow (0 1px 3px rgba(0,0,0,0.06))
- **NO teal background in nav** — keep it white/transparent

## Hero Section (Homepage)
- **NO gradient hero block** — remove the teal gradient entirely
- **Style**: Clean editorial hero on white background
- **Layout**: Large display heading left-aligned, with a curated featured listing card to the right
- **Headline**: "The smarter way to buy and sell cars." in Plus Jakarta Sans 800, dark text on white
- **Sub-headline**: "Verified sellers. Transparent pricing. No runaround." in muted text
- **Search bar**: Full-width below the headline — rounded, substantial (48px height), with Make dropdown + ZIP input + Search button
- **Search button**: Deep teal filled, white text, clean
- **Featured listing**: Large card on the right showing a featured vehicle with overlaid price badge

## Listing Cards (Complete Redesign)
- **NO colored deal badges overlapping the image** (remove the red/green/blue banner badges)
- **Image area**: 16:10 aspect ratio, rounded-lg top corners only, edge-to-edge within card
- **Card container**: White background, 1px border (border color), rounded-lg, subtle shadow on hover only (not resting)
- **Hover effect**: Translate up 2px + soft shadow — elegant, not bouncy
- **Price display**: Large, bold, left-aligned below image — no dollar sign color, just dark bold text
- **Monthly est**: Small muted text next to price "Est. $XXX/mo"
- **Title**: Year + Make + Model in semibold, one line
- **Meta line**: Trim · Mileage · Location — muted, small, single line with interpuncts
- **Deal indicator**: Small colored dot + text (e.g., "● Great Deal" or "● Fair Deal") — subtle, not a banner
- **Seller badge**: Tiny "Dealer" or "Private" text label, not a pill
- **WhatsApp/SMS icons**: Small, bottom of card, muted — present but not dominant
- **Favorite heart**: Top-right corner of image, white circle with subtle backdrop blur
- **NO "Check Availability" button on cards** — the card itself is the click target

## Browse Page
- **Layout**: Left sidebar filters (240px) + right content area
- **Filters panel**: Clean white panel with section headers, no colored backgrounds
- **Filter sections**: Collapsible with smooth animation, subtle borders between sections
- **Body style chips**: Clean outlined pills, no emoji icons — just text
- **Active filter**: Filled primary color pill with white text
- **Results header**: "X vehicles found" with sort dropdown
- **Card grid**: 3-column grid with consistent gaps
- **NO red/green deal badges cluttering the cards**

## Listing Detail Page
- **Breadcrumb**: Small, muted — "Browse > 2021 Ford Explorer"
- **Image gallery**: Large hero image (16:9), full-width, with thumbnail strip below
- **Title section**: Year Make Model in large display font, trim below in muted text
- **Price panel (right sidebar)**: Clean white card with:
  - Large price number
  - Monthly estimate in muted text
  - Deal indicator (subtle dot + text, not a colored badge)
  - Divider
  - Contact buttons: WhatsApp (outlined with green accent), Text Message (outlined), Call (outlined)
  - Save button (heart icon, ghost style)
- **Seller info**: Below contact buttons — avatar, name/dealer name, location, member since
- **Specs section**: Clean 2-column grid of key-value pairs, no icon badges — just text
- **Tabs**: Overview | Features | Vehicle History | Price Analysis — clean underline tab style

## Auth Page
- **Split layout**: Left side = branding/illustration area (deep teal background with white text and subtle pattern), Right side = clean white form
- **Form**: Clean inputs with labels above, subtle borders, focus ring in primary color
- **Sign In / Sign Up tabs**: Clean pill toggle at top of form
- **CTA button**: Full-width, deep teal, rounded

## Create Listing Page
- **Step indicator**: Clean horizontal stepper with numbered circles, connecting lines
- **Active step**: Primary color circle, bold text
- **Completed step**: Checkmark in circle, muted text
- **Form sections**: Clear section headers with subtle dividers
- **Contact preferences**: Clean toggle switches with labels

## Footer
- **Background**: Very light gray (Surface color), not white, not dark
- **Layout**: 4-column grid — Marketplace, Resources, Support, Contact
- **Bottom bar**: Copyright + Privacy Policy + Terms of Service
- **Clean, minimal** — no decoration

## CSS Effects & Polish
- **Transitions**: All interactive elements get `transition: all 0.2s ease` — colors, shadows, transforms
- **Focus rings**: 2px offset primary color ring on all focusable elements
- **Card hover**: `transform: translateY(-2px)` + `box-shadow: 0 8px 25px rgba(0,0,0,0.08)`
- **Button hover**: Darken background by 10%, no transform
- **Image loading**: Skeleton pulse animation while loading
- **Scroll**: Smooth scroll behavior globally
- **Selection color**: Primary teal highlight

## Key Design Principles
1. **White space is premium** — let elements breathe, don't fill every pixel
2. **Photography is the hero** — UI stays out of the way of car images
3. **Restraint in color** — near-monochromatic with one accent color (teal) and one highlight (gold)
4. **Ghost buttons > filled buttons** — signals confidence, not desperation
5. **Typography hierarchy** — size and weight do the work, not color
6. **Consistent framing** — all car images same ratio, all cards same height
7. **No clutter** — remove anything that doesn't help the buyer decide
