# CarShuk UI Update — CarGurus-Inspired (Not Copied)

## Design Philosophy
Take the best UX patterns from CarGurus — their card structure, deal badges, filter layout, search-forward experience — but give CarShuk its own identity through a distinct color palette, refined typography, and cleaner aesthetic. CarGurus is functional but cluttered with ads and dealer watermarks. CarShuk should feel cleaner, more community-oriented, and premium while borrowing the proven layout patterns.

---

## Color Palette (CarShuk Identity — NOT CarGurus colors)

### Light Mode
```
--background: 210 20% 98%;        /* Very light cool gray, NOT pure white */
--foreground: 220 25% 10%;        /* Near-black for text */
--card: 0 0% 100%;                /* Pure white cards */
--card-foreground: 220 25% 10%;
--border: 220 13% 91%;
--input: 220 9% 82%;

/* Primary — Deep navy (inspired by CG's dark blue but warmer) */
--primary: 215 70% 22%;           /* #112D52 deep navy */
--primary-foreground: 0 0% 100%;

/* Accent — Warm coral/orange (CarShuk's own accent, not CG red) */
--accent: 16 85% 55%;             /* Warm coral-orange */
--accent-foreground: 0 0% 100%;

--secondary: 220 14% 96%;
--secondary-foreground: 220 25% 10%;
--muted: 220 14% 96%;
--muted-foreground: 220 8% 46%;

--ring: 215 70% 22%;
```

### Dark Mode
```
--background: 220 20% 7%;
--foreground: 220 14% 93%;
--card: 220 18% 11%;
--border: 220 14% 20%;
--primary: 215 60% 50%;           /* Lighter navy for dark mode */
--primary-foreground: 0 0% 100%;
--accent: 16 80% 60%;
--accent-foreground: 0 0% 100%;
--muted: 220 16% 16%;
--muted-foreground: 220 8% 55%;
```

### Deal Rating Colors (Similar concept to CG but unique shades)
- Great Deal: `hsl(152 72% 38%)` — forest green
- Good Deal: `hsl(152 60% 44%)` — medium green
- Fair Deal: `hsl(38 90% 50%)` — amber/gold
- Above Market: `hsl(15 80% 50%)` — warm orange-red

---

## Typography
- **Display/Headlines:** Plus Jakarta Sans 700/800 (keep current)
- **Body:** Inter 400/500/600 (keep current)
- No changes needed — current typography is good

---

## Navigation Bar
**Pattern from CG:** Clean white bar, logo left, nav items center-left, user actions right
**CarShuk adaptation:**
- White/bg-background sticky bar with subtle bottom border
- Logo: CARSHUK (keep current CAR normal + SHUK bold)
- Nav links: "Browse" (with dropdown icon), "Sell", with text in muted-foreground, hover to foreground
- Right side: Dark mode toggle, heart/saved icon, user avatar or "Sign In" button
- Height: ~56px (compact, like CG)
- Add "Saved" link with heart icon (like CG favorites)

---

## Homepage

### Hero Section
**CG pattern:** Light colored background, bold headline with colored emphasis, segmented search bar, car images
**CarShuk adaptation:**
- Light cool-gray background (`bg-muted/50`) — NOT pure white, not bright blue
- Large bold headline: "Find your next car" with "next car" in the coral accent color
- Subtitle: "Search thousands of listings from private sellers and trusted dealers"
- Segmented search bar (CG-style): Condition | Make | Model | ZIP | [Search Button]
  - White card with rounded corners, subtle shadow
  - Fields separated by light vertical dividers
  - Search button: solid deep navy, white text, "Search"
- Below search: filter chips/pills — "SUV", "Under $20k", "Low Mileage", "Electric", "AWD"

### Stats Bar
- Keep current stats but restyle as a clean horizontal bar
- Numbers in bold foreground, labels in muted-foreground

### Featured Listings
- Section title: "Featured Listings" with "View all →" link
- **3-column vertical cards** (CG-style):
  - Full-width image on top (16:10 ratio)
  - FEATURED badge as a small gold pill on the image (bottom-left)
  - Heart/save icon on image (top-right)
  - Below image: Year Make Model in bold
  - Trim · Mileage in muted text
  - Location with pin icon
  - Deal badge (colored dot + text) and price on same row
  - Monthly estimate below price in small muted text
  - "Check Availability" full-width button (navy bg, white text) — OR outline button

### Browse by Category
- Horizontal scrollable pills: "SUV", "Sedan", "Truck", "Coupe", "Minivan", "Electric"
- Pill style: border + rounded-full, text-only, hover fills with primary

### How It Works / Value Props
- Keep current clean numbered steps
- OR convert to icon cards in a 3-column grid

---

## Browse Page

### Layout
- **Two-column:** Filter sidebar left (~280px), results grid right
- **3-column card grid** (CG-style)

### Top Bar (above results)
- Results count: "X vehicles found"
- AI/text search bar: "Search make, model..." (keep current)
- Sort dropdown: "Sort by: Best match"
- Save search button

### Filter Sidebar
**CG-inspired collapsible sections:**
- Location (with pin icon)
- Make & Model (dropdown)
- Price Range (min/max inputs OR slider)
- Year Range (min/max)
- Mileage (collapsible)
- Body Style (text pills: Sedan, SUV, Truck, etc.)
- Drivetrain (checkboxes: FWD, AWD, 4WD, RWD)
- Transmission (checkboxes: Automatic, Manual)
- "Reset" link at top

### Listing Cards (3-column vertical)
**CG card pattern adapted:**
1. Image area (16:10) with:
   - Heart icon top-right (outline, fills on hover/click)
   - Badge bottom-left: "New arrival" (blue pill) or "Price drop" (green pill) or "FEATURED" (gold pill)
2. Content area:
   - Year Make Model — bold, ~16px
   - Trim · Drivetrain · Mileage — muted, ~13px
   - Location: pin icon + City, State
   - Deal indicator: colored dot + "Great Deal" / "Fair Deal" etc.
   - Price: large bold right-aligned
   - Monthly estimate: small muted below price
   - WhatsApp/SMS icons (small, bottom-right)
3. Optional: "Check Availability" button at bottom (full-width, navy or outline)

### Active Filters
- Show as removable pill chips above results: "Toyota ×", "SUV ×", "Clear all"

---

## Listing Detail Page

### Layout
- Left: Large image gallery (keep current carousel)
- Right: Sticky sidebar with pricing + contact

### Right Sidebar
- Year Make Model (large bold)
- Trim · Mileage · Location
- Deal badge (colored, prominent)
- Price (very large, bold)
- Monthly estimate
- "Check Availability" button (full-width, navy)
- "Text Message" button (outline)
- "WhatsApp" button (outline, green icon)
- "Call Seller" button (outline)
- Seller Info card below

### Specs Grid
- Keep current 2×4 grid of spec boxes
- Clean borders, uppercase labels, bold values

### Tabs
- Keep: Overview, Features, Vehicle History, Price Analysis

---

## Auth Page
- Keep current split layout (teal left → change to navy left)
- Update left panel color to match new navy primary

---

## Footer
- Keep current clean layout
- Update any accent colors to match new palette

---

## Key Differences from CarGurus (to avoid being a copy)
1. **Color:** Deep navy + warm coral (not CG's blue + red)
2. **No ads/sponsored listings** — cleaner experience
3. **Community focus** — private sellers + dealers, not just dealers
4. **WhatsApp/SMS** integration (CG doesn't have this)
5. **Simpler search** — no AI search bar, just clean filters
6. **No dealer watermarks** — cleaner card images
7. **Premium feel** — more whitespace, refined typography
8. **Dark mode** — CG doesn't have dark mode
