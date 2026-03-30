# CarShuk Premium UI + WhatsApp/SMS Upgrade Spec

## Part 1: Premium Feel Upgrades

### Design Philosophy
Think Polestar / Lexus level — restraint, generous spacing, editorial quality. The current site is functional but feels template-ish. We need to make it feel like a premium automotive brand.

### Specific Changes Required

#### 1. Index.css Enhancements
- Add smooth transitions globally: `* { transition: color 0.15s, background-color 0.15s, border-color 0.15s, box-shadow 0.15s; }`
- Improve card hover states: subtle lift with shadow transition
- Add a `.premium-card` class with hover lift: `transform: translateY(-2px); box-shadow: var(--shadow-lg);`
- Smooth scroll: `html { scroll-behavior: smooth; }`

#### 2. Header (`client/src/components/header.tsx`)
- Add subtle `backdrop-blur-md` and `bg-background/80` for a glass-morphism effect on the header
- Add a bottom border `border-b border-border/50`
- Make it `sticky top-0 z-50`
- Slightly increase nav link spacing and add subtle hover underline animation

#### 3. Homepage (`client/src/pages/home.tsx`)
- Hero: Add a subtle gradient overlay that's more nuanced (multi-stop gradient with slight transparency variation)
- Hero: Add a subtle animated shimmer/pulse on the "Search Cars" button  
- Stats bar: Add subtle dividers between stats, slightly larger numbers with `tabular-nums`
- "New Listings" section: Add subtle fade-in animation when scrolling into view
- "Browse by Location" cards: Add hover lift effect with shadow transition
- "How it Works" section: Add numbered circle animations
- Add a CTA banner section before the footer: "Ready to sell your car? List it in minutes." with a teal button

#### 4. Listing Cards (`client/src/components/listing-card.tsx`)
- Add `transition-all duration-300` with hover `shadow-lg` and slight `scale-[1.01]`
- Deal badge: add subtle pulsing dot indicator for "Great Deal"
- Price: make bolder and slightly larger
- Monthly estimate: style as a subtle pill/chip rather than plain text
- Add a thin left border accent in the card's deal color on hover

#### 5. Browse Page (`client/src/pages/browse.tsx`)
- Filter sidebar: add `backdrop-blur` background, slight shadow
- Active filters: show as removable chip/pills at the top of results
- Results count: show "Showing X vehicles" with sort options styled as pill tabs
- Empty state: add illustration/icon and better messaging

#### 6. Listing Detail Page (`client/src/pages/listing-detail.tsx`)
- Vehicle title: larger, bolder with the year in a lighter weight
- Price section: add a subtle gradient background card
- Spec icon grid: add subtle hover effect on each spec box
- Tabs: style with an underline indicator that slides/animates between tabs
- Contact section: more prominent card with gradient border

#### 7. Auth Page (`client/src/pages/auth.tsx`)
- Add a subtle teal gradient accent on the left side or top
- Card with slightly elevated shadow
- Input focus states: teal glow ring

#### 8. Dashboard (`client/src/pages/dashboard.tsx`)
- Stats cards: add subtle gradient backgrounds (teal tint)
- Listing rows: add hover highlight with smooth transition

#### 9. Footer (`client/src/components/footer.tsx`)
- Slightly darker background
- Add subtle top border gradient
- Social media icon placeholders (WhatsApp community link)

## Part 2: WhatsApp & SMS Contact Integration

### Database Schema Changes (`shared/schema.ts`)
Add to the `users` table:
```ts
contactWhatsapp: integer("contact_whatsapp", { mode: "boolean" }).default(false),
contactSms: integer("contact_sms", { mode: "boolean" }).default(true),
```

Add to the `listings` table:
```ts
contactPhone: text("contact_phone"),
contactWhatsapp: integer("contact_whatsapp", { mode: "boolean" }).default(false),
contactSms: integer("contact_sms", { mode: "boolean" }).default(true),
```

### Registration/Profile
In the create listing flow Step 3, add a "Contact Preferences" section:
- Phone number field (pre-filled from user profile if available)
- Toggle: "Available on WhatsApp" (checkbox/switch) — default false
- Toggle: "Available via SMS/Text" (checkbox/switch) — default true
- Help text: "Buyers will see WhatsApp and/or text message buttons based on your preference"

### Listing Card Display (`client/src/components/listing-card.tsx`)
Below the "Check Availability" button or next to the seller location:
- If WhatsApp enabled: show green WhatsApp icon (use `react-icons/si` — `SiWhatsapp`)
- If SMS enabled: show a message/phone icon
- Both are small, inline, subtle — just visual indicators

### Listing Detail Page (`client/src/pages/listing-detail.tsx`)
Replace or augment the "Contact Seller" button:
- If WhatsApp available: Show a green "WhatsApp" button that opens `https://wa.me/{phone}?text=Hi%2C%20I'm%20interested%20in%20your%20{year}%20{make}%20{model}%20listed%20on%20CarShuk`
- If SMS available: Show a "Text Message" button that opens `sms:{phone}?body=Hi, I'm interested in your {year} {make} {model} listed on CarShuk`
- If both: show both buttons side by side
- Always show the general "Contact Seller" button (which could be phone/call)
- Format the phone number: strip to digits, prepend country code for WhatsApp link (assume US +1)

### Seller Info Card
Show small WhatsApp/SMS icons next to the phone number in the seller info card

### Seed Data Updates (`server/routes.ts`)
Update seed users and listings to include contact preferences:
- Dealer accounts: both WhatsApp and SMS enabled
- Private sellers: mix of WhatsApp only, SMS only, both

### API Changes
- Update listing creation route to accept new fields
- Update listing response to include contact fields
- No actual WhatsApp API verification needed — let sellers self-declare

## Implementation Notes
- Do NOT use localStorage/sessionStorage
- Use hash routing (wouter useHashLocation) 
- Use `apiRequest` from `@/lib/queryClient` for all API calls
- Use `react-icons/si` for WhatsApp icon (`SiWhatsapp`)
- Must install: `npm install react-icons` if not already present
- After schema changes, delete `data.db` and reseed
- All existing features must continue to work
