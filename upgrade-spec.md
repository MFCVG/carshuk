# CarShuk V2 — Complete UI & VIN Upgrade Spec

## VIN Decoder Fix (server/routes.ts)

The NHTSA API returns 100+ fields for modern VINs. Extract ALL useful data:

```typescript
const decoded = {
  make: result?.Make || "",
  model: result?.Model || "",
  year: parseInt(result?.ModelYear) || 0,
  trim: result?.Trim || result?.Series || "",
  bodyType: result?.BodyClass || "",
  transmission: result?.TransmissionStyle || (result?.TransmissionSpeeds ? `${result.TransmissionSpeeds}-Speed` : ""),
  drivetrain: result?.DriveType || "",
  fuelType: result?.FuelTypePrimary || "",
  engineSize: result?.DisplacementL ? `${result.DisplacementL}L` : "",
  engineCylinders: result?.EngineCylinders || "",
  engineHP: result?.EngineHP || "",
  doors: result?.Doors || "",
  seats: result?.Seats || "",
  vehicleType: result?.VehicleType || "",
  manufacturer: result?.Manufacturer || "",
  plantCity: result?.PlantCity || "",
  plantState: result?.PlantState || "",
  plantCountry: result?.PlantCountry || "",
  // Safety features
  abs: result?.ABS || "",
  esc: result?.ESC || "",
  tractionControl: result?.TractionControl || "",
  airbagFront: result?.AirBagLocFront || "",
  airbagSide: result?.AirBagLocSide || "",
  airbagCurtain: result?.AirBagLocCurtain || "",
  forwardCollisionWarning: result?.ForwardCollisionWarning || "",
  laneDepartureWarning: result?.LaneDepartureWarning || "",
  laneKeepAssist: result?.LaneKeepSystem || "",
  adaptiveCruise: result?.AdaptiveCruiseControl || "",
  backupCamera: result?.RearVisibilitySystem || "",
  blindSpotMonitoring: result?.BlindSpotMon || "",
  // Other
  steeringLocation: result?.SteeringLocation || "",
  entertainmentSystem: result?.EntertainmentSystem || "",
  gvwr: result?.GVWR || "",
  errorCode: result?.ErrorCode || "",
  errorText: result?.ErrorText || "",
};
```

Also update the VinDecodeResult type in shared/schema.ts to include all these new fields.

When showing VIN decode results in the create-listing flow, display them in a rich card with categorized sections (Basics, Powertrain, Safety Features) rather than a single line.

## UI Redesign — Inspired by CarGurus + AutoTrader

### Design Principles (from research)
1. **Deal Rating badges** on every listing card — color-coded (Great Deal green, Good Deal teal, Fair amber)
2. **Monthly payment estimate** shown on every card alongside the price
3. **Active filter chips** above results with × dismiss buttons
4. **Richer listing cards** — larger image area (~60% of card), key specs inline, deal badge, monthly payment
5. **Sticky header on detail page** with price + deal badge that follows scroll
6. **Inline financing calculator** on detail page
7. **Vehicle history prominently displayed** — not buried
8. **Trust signals** throughout — clean title badge, accident-free, owner count
9. **Price comparison bar** showing where the price falls vs market range (like KBB Fair Market Range)

### Homepage Redesign

**Hero**: Full-width gradient hero with:
- Headline: "Find your next car, without the runaround."
- Subtitle: "Browse thousands of cars from trusted sellers and dealers in your community"
- Search widget: white elevated card with Make dropdown + Model dropdown (cascading) + ZIP code input + Search button
- Below hero: stat counters ("500+ Active Listings" · "200+ Verified Dealers" · "4.9★ Community Rating")

**New Listings Section**: 
- 4-column grid of cards with the new richer card design
- Each card has deal rating badge, monthly payment, specs

**Why CarShuk Section**: 
- 2-column asymmetric layout (not 3 equal columns)
- Left: large illustration area or feature highlight
- Right: stacked value props with icons

**Browse by Location**: clickable cards with location name + listing count

**How It Works**: horizontal 3-step flow with numbered circles and connecting lines

### Browse Page Redesign

**Top Bar**:
- Result count large and bold ("12 vehicles found")
- Search input
- Sort dropdown (Best Match, Price Low→High, Price High→Low, Mileage Low→High, Newest Listed)
- "Save Search" outlined button

**Active Filter Chips**: 
- Row of dismissible pills showing active filters
- "Clear All" link

**Filter Sidebar (collapsible accordion sections)**:
1. Price Range — dual input (min/max) 
2. Monthly Payment — slider
3. Make & Model — cascading dropdowns
4. Year Range — dual input
5. Mileage — max input
6. Body Style — icon chips (Sedan, SUV, Truck, Van, Coupe, Convertible, Wagon)
7. Drivetrain — checkboxes (FWD, AWD, 4WD, RWD)
8. Transmission — checkboxes (Automatic, Manual)
9. Fuel Type — checkboxes (Gasoline, Diesel, Electric, Hybrid)
10. Exterior Color — color swatches
11. Seller Type — radio (All, Private, Dealer)
12. Vehicle History — checkboxes (Clean Title, No Accidents, Single Owner)
13. Deal Rating — checkboxes (Great Deal, Good Deal, Fair Deal)

**Listing Card (new design)**:
- Image area takes ~55% of card height
- Deal badge overlaid on image bottom-left (green "Great Deal", teal "Good Deal", amber "Fair Deal")  
- Seller type badge overlaid on image top-right
- "Newly Listed" or "Price Drop" overlay badge when applicable
- Heart/save icon top-right of image
- Below image:
  - Year Make Model (bold, large)
  - Trim · Mileage (secondary text)
  - Location with pin icon
  - Price (large, bold, primary color) + monthly estimate below in muted text
  - "Check Availability" button (full-width, primary)

### Listing Detail Page Redesign

**Sticky Summary Bar** (appears on scroll past hero):
- Car thumbnail + Year Make Model + Mileage
- Price + Deal Rating badge
- "Contact Seller" CTA button

**Image Gallery Section**:
- Large hero image placeholder (with car icon and gradient background)
- Photo count badge "0 Photos"
- Navigation arrows

**Right Column — Price Card**:
- Large price
- ~~Estimated value~~ crossed out if price is below market
- Deal Rating badge with explanation ("$X below market value")
- Monthly payment estimate (expandable)
- "Contact Seller" primary CTA
- "Save" / heart button

**Vehicle Overview** (icon grid — 2 rows of 4):
- Mileage · Body Type · Drivetrain · Transmission
- Fuel Type · Engine · Exterior · Interior

**Tabbed Content Section**:
- Tab 1: **Overview** — full specs table with all details
- Tab 2: **Features** — categorized list (Safety, Technology, Interior, Exterior)  
- Tab 3: **Vehicle History** — VIN display, owners, accidents, title status, with CarFax-style visual
- Tab 4: **Price Analysis** — market value range bar, price history, confidence level

**Seller Card** (right sidebar, below price card):
- Seller/dealer name
- Badge: Private Seller or Dealer with name
- Phone number (click to reveal)
- Location with map link
- "View All Listings" link for dealers

**Description Section**: Full seller description

**Similar Vehicles**: 4-column scroll of similar listings

### Create Listing — VIN Decode Upgrade

**Step 1 — VIN Entry**:
- Same large input + "Decode VIN" button
- After decode: show a RICH results card with sections:
  - **Vehicle Identified**: Year Make Model in large text with vehicle type badge
  - **Powertrain**: Engine (displacement + cylinders + HP), Transmission, Drivetrain, Fuel Type
  - **Specifications**: Doors, Seats, Body Type, Steering
  - **Safety Features**: list of all detected safety features with ✓ checkmarks (ABS, ESC, Airbags, FCW, LDW, etc.)
  - **Manufacturing**: Plant city/state/country, Manufacturer
- Success message: "We found 25 data points for this vehicle"
- All decoded fields auto-populate subsequent steps

**Step 2 — Vehicle Details**: Pre-filled form, user can edit/add what VIN didn't provide (colors, condition)

**Step 3 — Listing Details**: Price (with "Get Estimate" button), mileage, description, location, photos

**Step 4 — Review**: Summary card of everything before submit

### Color/Design System Updates

Keep the teal primary but add:
- Deal rating colors: Great Deal (#16a34a green), Good Deal (#0d9488 teal), Fair Deal (#d97706 amber), Overpriced (#dc2626 red)
- Use more white card surfaces on a light gray (#f8fafc) background
- Stronger shadow on cards for depth
- Larger image areas on cards
- More breathing room / generous padding

### Font
Keep General Sans from Fontshare. Prices should be rendered in tabular-nums for alignment.
