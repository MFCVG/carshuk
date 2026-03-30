# CarShuk Frontend Build Specification

## Project
Path: /home/user/workspace/carshuk
Stack: React + Tailwind + shadcn/ui + wouter (hash routing) + TanStack Query

## Color Scheme
Teal primary (`--primary: 178 90% 28%` in light, `178 65% 42%` in dark). The index.css is already configured.

## Font
Load General Sans from Fontshare in client/index.html:
```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600,700&display=swap" rel="stylesheet">
```

## Pages to Build (all in client/src/pages/)

### 1. HomePage (`home.tsx`)
- Hero section with teal gradient background and search bar (make dropdown + zip code input + search button)
- "New Listings" carousel section showing 4 latest cards
- "Why CarShuk?" value props section (No buyer fees, No middleman, New listings daily) — DO NOT use icons in colored circles
- Browse by location: Brooklyn, Lakewood, Monsey, Passaic, Five Towns
- How it works section
- CTA to browse or sell

### 2. BrowseListings (`browse.tsx`)
- Left sidebar filters: price range (2 inputs), make dropdown, model dropdown, year range, max mileage, body type, transmission, drivetrain, fuel type, exterior color, seller type (Private/Dealer), condition
- Top bar: search input, sort dropdown (newest, price low-high, price high-low, mileage low-high), result count
- 3-column responsive grid of listing cards
- "Save this search" button that saves current filters
- Each card shows: image placeholder (colored div with car icon), title, mileage, body type, location, price in teal, "Posted X days ago", seller type badge (Private/Dealer)

### 3. ListingDetail (`listing-detail.tsx`)
- Full page (not modal), reached via /listings/:id
- Image gallery area (placeholder with car icon)
- Title, price, location
- VIN display with CarFax-style vehicle history summary (owners, accidents, title status)
- Vehicle details grid: year, make, model, trim, body type, color, transmission, drivetrain, fuel, engine
- Price estimation section showing market value range with a visual bar
- Seller info section with contact button
- Description
- Favorite button (heart icon)

### 4. CreateListing (`create-listing.tsx`)
- Step 1: VIN entry. Large input for 17-char VIN. "Decode VIN" button that calls /api/vin/:vin. Shows loading state then populates form fields automatically
- Step 2: Vehicle details form. Pre-filled from VIN decode, user can edit. Fields: make, model, year, trim, body type, exterior color, interior color, transmission, drivetrain, fuel type, engine size
- Step 3: Listing details. Price, mileage, condition, description, location (city, state, zip), vehicle history (owners, accidents, title status), seller type
- "Get Price Estimate" button that calls /api/estimate-price and shows range
- Step 4: Review & submit
- Uses a stepper/progress indicator at the top

### 5. Auth (`auth.tsx`)
- Two tabs: Sign In / Sign Up
- Sign In: email + password
- Sign Up: first name, last name, email, password, phone (optional), dealer toggle with dealer name field
- After auth, store user in React state (NOT localStorage)

### 6. Dashboard (`dashboard.tsx`)
- User's own listings with status (active/sold)
- Saved searches list with delete option
- Favorites list
- Simple tab layout

## Shared Components (client/src/components/)

### Header (`header.tsx`)
- CarShuk SVG logo (teal car icon + "CARSHUK" text)
- Nav: Browse Cars, Sell My Car, link to dashboard if logged in
- Sign In button or user avatar dropdown
- Dark mode toggle
- Mobile hamburger menu

### ListingCard (`listing-card.tsx`)
- Reusable card for both homepage and browse page
- Image area (teal/gray placeholder with Car icon from lucide-react), title, mileage, body type, city/state, price, days ago, seller badge

### Footer (`footer.tsx`)
- Links: Browse, Sell, FAQ sections (just placeholder links)
- Email: hello@carshuk.com
- "© 2026 Carshuk LLC"

## App.tsx Routes
```tsx
<Route path="/" component={HomePage} />
<Route path="/browse" component={BrowseListings} />
<Route path="/listings/:id" component={ListingDetail} />
<Route path="/sell" component={CreateListing} />
<Route path="/auth" component={Auth} />
<Route path="/dashboard" component={Dashboard} />
<Route component={NotFound} />
```

## Key Implementation Notes
- Use `useHashLocation` from wouter on `<Router>`, NOT on `<Switch>`
- Use `apiRequest` from `@/lib/queryClient` for ALL fetch calls
- Use `@tanstack/react-query` for data fetching
- Do NOT use localStorage or sessionStorage (sandbox blocks them)
- Use React context for auth state (current user)
- Call POST /api/seed on app mount to ensure demo data exists
- Dark mode: use useState seeded from `window.matchMedia`, toggle class "dark" on documentElement
- All interactive elements need `data-testid` attributes
- Max heading size: text-xl (this is a web app)
- Body text: text-sm/text-base
- Shadcn components for all UI (Button, Card, Badge, Input, Select, Dialog, Tabs, etc.)
