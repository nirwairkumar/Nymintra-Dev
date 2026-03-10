# Nymintra — Complete Product Architecture Blueprint

> **Version**: 1.0 · **Date**: March 2026
> **Purpose**: Comprehensive MVP blueprint for Nymintra — an online platform for ordering custom-printed invitation cards for Indian events.

---

## Table of Contents

1. [Product Architecture Overview](#1-product-architecture-overview)
2. [User-Side Platform Structure](#2-user-side-platform-structure)
3. [UI/UX Design](#3-uiux-design)
4. [Card Customization System](#4-card-customization-system)
5. [AI Preview System](#5-ai-preview-system)
6. [Order Workflow](#6-order-workflow)
7. [Admin Panel](#7-admin-panel)
8. [Design Library Management](#8-design-library-management)
9. [Database Structure](#9-database-structure)
10. [Tech Stack](#10-tech-stack)
11. [Future Scalability](#11-future-scalability)

---

## 1. Product Architecture Overview

### 1.1 Vision

Nymintra is a **mobile-first**, culturally aware platform that lets Indian families — especially in Tier-2/Tier-3 towns — design, preview, and order printed invitation cards with minimal digital literacy required.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│   Next.js Frontend (SSR + CSR)  ·  PWA  ·  Mobile-First    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                     API GATEWAY / BFF                       │
│          Node.js (Express / Fastify)  ·  Auth  ·  Rate Lmt │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│  Auth  │ │ Orders │ │  Card  │ │ Paymt  │ │  Preview   │
│Service │ │Service │ │Catalog │ │Service │ │  Engine    │
└────────┘ └────────┘ └────────┘ └────────┘ └────────────┘
    │          │          │          │          │
    └──────────┴──────────┼──────────┴──────────┘
                          ▼
              ┌──────────────────────┐
              │   PostgreSQL (DB)    │
              │   Redis (Cache)      │
              │   S3 / R2 (Storage)  │
              └──────────────────────┘
```

### 1.3 Key Principles

| Principle | Description |
|---|---|
| **Simplicity First** | Every screen max 1–2 actions. Guided wizard flows. |
| **Cultural Relevance** | Hindi/English bilingual. Indian event categories. Traditional designs. |
| **Single-Printer MVP** | Admin = Printer. No marketplace complexity. Clean upgrade path. |
| **Preview Before Print** | Users must see a realistic preview before ordering. |
| **Mobile-First** | 80%+ traffic expected from mobile. Design accordingly. |

---

## 2. User-Side Platform Structure

### 2.1 Sitemap

```
/                           → Home Page
/cards                      → All Categories
/cards/:category            → Category Page (e.g. /cards/wedding)
/cards/:category/:designId  → Card Design Detail + Customize
/preview/:orderId           → AI Preview Page
/cart                       → Cart
/checkout                   → Checkout
/orders                     → Order History
/orders/:orderId            → Order Tracking
/account                    → User Account / Profile
/support                    → Customer Support
/faq                        → FAQ
/about                      → About Nymintra
/privacy                    → Privacy Policy
/terms                      → Terms & Conditions
```

### 2.2 Page-by-Page Breakdown

#### Home Page (`/`)

| Section | Content |
|---|---|
| **Hero Banner** | Full-width visual: "Design Your Dream Invitation" with CTA → Browse Cards. Animated card mockup. |
| **Event Categories** | Grid of 8 category cards with icons (Wedding, Engagement, Birthday, etc.). Each card links to `/cards/:category`. |
| **How It Works** | 4-step visual: Browse → Customize → Preview → Order |
| **Trending Designs** | Horizontal carousel of top 8 designs with quick-view. |
| **Testimonials** | 3 rotating customer reviews with photos. |
| **CTA Strip** | "Start Designing Now" button. |
| **Footer** | Links to About, FAQ, Support, Terms, Privacy. Social media links. |

#### Category Page (`/cards/:category`)

| Section | Content |
|---|---|
| **Category Header** | Category name, description, design count |
| **Filters Sidebar** | Style (Traditional, Modern, Minimalist), Color palette, Language, Price range, Orientation (Portrait/Landscape) |
| **Design Grid** | 3 columns (desktop), 2 columns (mobile). Card thumbnail, name, starting price. Hover shows quick preview. |
| **Sort Options** | Popular, Newest, Price (Low → High, High → Low) |
| **Pagination** | Infinite scroll on mobile, paginated on desktop |

#### Card Design Detail + Customize (`/cards/:category/:designId`)

| Section | Content |
|---|---|
| **Design Preview** | Large preview image, multiple angle views |
| **Design Info** | Name, style tags, supported languages, paper options |
| **"Customize This Card" CTA** | Opens the customization wizard |
| **Customization Wizard** | Step-by-step guided form (see Section 4) |
| **Price Calculator** | Real-time price based on quantity + paper type |

#### AI Preview Page (`/preview/:orderId`)

| Section | Content |
|---|---|
| **Live Preview Canvas** | Rendered card with user's text overlaid on the design template |
| **Edit Panel** | Quick-edit fields (name, date, venue) with live update |
| **Actions** | "Approve & Add to Cart", "Edit Again", "Download Proof (PDF)" |

#### Cart (`/cart`)

| Section | Content |
|---|---|
| **Cart Items** | Card thumbnail, customization summary, quantity, paper type, price |
| **Quantity Editor** | +/- buttons, minimum order badge |
| **Price Breakdown** | Subtotal, shipping, taxes, total |
| **CTA** | "Proceed to Checkout" |

#### Checkout (`/checkout`)

| Section | Content |
|---|---|
| **Delivery Address** | Auto-fill from profile, add new address, PIN code validation |
| **Order Summary** | Collapsed cart items with total |
| **Payment Options** | Razorpay integration: UPI, Card, Net Banking, Wallet |
| **Place Order CTA** | Confirm and pay |

#### Order Tracking (`/orders/:orderId`)

| Section | Content |
|---|---|
| **Order Status Timeline** | Visual stepper: Confirmed → Printing → Packed → Shipped → Delivered |
| **Order Details** | Items, quantities, total, delivery address |
| **Shipping Info** | Courier name, tracking number (when available) |
| **Support** | "Need Help?" link |

#### Customer Support (`/support`)

| Section | Content |
|---|---|
| **Contact Form** | Name, email, order ID (optional), message |
| **WhatsApp Button** | Direct WhatsApp link to admin |
| **FAQ Link** | Quick link to FAQ |

#### FAQ (`/faq`)

Accordion-style Q&A covering: ordering, customization, payment, delivery, returns, paper types.

#### About Nymintra (`/about`)

Brand story, mission (connecting families with beautiful invitations), team intro, contact info.

---

## 3. UI/UX Design

### 3.1 Design System

| Token | Value |
|---|---|
| **Primary Color** | `#B8336A` (Royal Magenta — reflects Indian wedding energy) |
| **Secondary Color** | `#F4D35E` (Gold — premium festive feel) |
| **Accent Color** | `#1B4332` (Deep Green — auspicious) |
| **Background** | `#FFF8F0` (Warm Cream — soft paper feel) |
| **Text Primary** | `#2D2D2D` |
| **Text Secondary** | `#6B6B6B` |
| **Font — Headings** | `Playfair Display` (elegant, traditional) |
| **Font — Body** | `Inter` (clean, highly readable) |
| **Font — Hindi** | `Noto Sans Devanagari` |
| **Border Radius** | `12px` (soft, friendly) |
| **Spacing Unit** | `8px` base |

### 3.2 Navigation Structure

**Mobile (Hamburger → Bottom Nav)**:
```
┌──────────────────────────────────┐
│  🏠 Home  │  📋 Cards  │  🛒 Cart  │  👤 Account  │
└──────────────────────────────────┘
```

**Desktop (Top Nav)**:
```
┌──────────────────────────────────────────────────────────┐
│  Logo   |  Home  |  Cards ▾  |  How It Works  |  About  |  🛒  |  👤  │
└──────────────────────────────────────────────────────────┘
```

Cards dropdown shows all event categories.

### 3.3 Mobile-First Design Principles

| Principle | Implementation |
|---|---|
| **Large Touch Targets** | Min 48×48px buttons, generous padding |
| **Bottom Sheet Modals** | Filters as pull-up sheet, not sidebar |
| **Thumb-Zone CTA** | Primary buttons in bottom 1/3 of screen |
| **Minimal Typing** | Dropdowns, date pickers, pre-filled suggestions |
| **Progressive Disclosure** | Show only what's needed. Expand on tap. |
| **Offline Indicator** | "You're offline" banner. Cache recent views via PWA. |

### 3.4 Card Browsing UX

```
┌──────────────────────────────────┐
│  [Filter Button]   [Sort ▾]     │
├──────────────────────────────────┤
│  ┌────────┐  ┌────────┐         │
│  │ Card 1 │  │ Card 2 │         │
│  │  img   │  │  img   │         │
│  │ ₹199+  │  │ ₹249+  │         │
│  └────────┘  └────────┘         │
│  ┌────────┐  ┌────────┐         │
│  │ Card 3 │  │ Card 4 │         │
│  │  img   │  │  img   │         │
│  │ ₹179+  │  │ ₹299+  │         │
│  └────────┘  └────────┘         │
└──────────────────────────────────┘
```

- **Tap** a card → full preview + customize
- **Long press** → quick preview popover
- **Swipe** through gallery images

### 3.5 Family Selection UX

Since families often decide together:

- **Share Design** button on every card → generates a sharable link (WhatsApp, SMS)
- **Wishlist / Shortlist** feature → family members can vote/react on shared link  
- **Side-by-Side Compare** → select 2–3 designs, view them together

### 3.6 Error Prevention UX

| Scenario | Prevention |
|---|---|
| Empty fields in customization | Inline validation; disabled "Next" until filled |
| Wrong date format | Date picker widget, no manual typing |
| Misspelled names | Confirmation screen: "Are these details correct?" |
| Accidental navigation | "You have unsaved changes" dialog |
| Payment failure | Retry button + order saved as draft |

---

## 4. Card Customization System

### 4.1 Wizard Flow (Step-by-Step)

The wizard guides users through **5 simple steps**:

```
Step 1: Event Details
  └→ Event type (pre-selected from category)
  └→ Event title (e.g., "Wedding of Rahul & Priya")

Step 2: Names & People
  └→ Bride/Groom names (or celebrant)
  └→ Family names (e.g., "Son of Shri Ram Kumar")
  └→ Number of name blocks (depends on template)

Step 3: Date, Time & Venue
  └→ Date picker (auto-formats to Indian style: 15 March 2026)
  └→ Time picker (with Muhurat label option)
  └→ Venue name
  └→ Venue address
  └→ Google Maps link (optional)

Step 4: Additional Details
  └→ Custom message / shloka / couplet
  └→ RSVP phone number
  └→ Language toggle (Hindi / English / Both)
  └→ Font style selection (3–5 curated options)
  └→ Color accent variation (3–5 palette options)

Step 5: Review & Preview
  └→ Full preview render
  └→ "Edit" links next to each section
  └→ "Looks Good → Add to Cart"
```

### 4.2 Editable Fields Definition

| Field | Type | Validation | Required |
|---|---|---|---|
| Event Title | Text (max 80 chars) | Non-empty | Yes |
| Names | Text (max 50 chars each) | Non-empty | Yes |
| Family Names | Text (max 100 chars) | — | No |
| Date | Date picker | Future date | Yes |
| Time | Time picker | — | No |
| Venue Name | Text (max 100 chars) | — | Yes |
| Venue Address | Textarea (max 200 chars) | — | No |
| Custom Message | Textarea (max 300 chars) | — | No |
| RSVP Number | Phone input | 10-digit Indian | No |
| Language | Select (Hindi / English / Both) | — | Yes |
| Font Style | Visual selector (3–5 options) | — | Yes |
| Color Accent | Color palette selector | — | Yes |

### 4.3 Low Digital Literacy Design

| Technique | Implementation |
|---|---|
| **Pre-filled Examples** | Every field shows a realistic example as placeholder: "e.g., Rahul weds Priya" |
| **Voice Input** | Microphone icon on text fields — uses Web Speech API for Hindi/English |
| **Visual Font Picker** | Show font names AS the font (not just names) |
| **Step Progress Bar** | "Step 2 of 5" with checkmarks on completed steps |
| **Helper Tooltips** | ℹ️ icon with simple Hindi/English explanation |
| **No Jargon** | "Choose how your card looks" instead of "Select layout template" |
| **WhatsApp Help** | Floating "Need Help?" button → WhatsApp to admin |

---

## 5. AI Preview System

### 5.1 Architecture

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────┐
│  User fills  │ ───► │  Preview Engine   │ ───► │  Live Preview  │
│  wizard form │      │  (Server-side)    │      │  (Canvas/Image)│
└──────────────┘      └──────────────────┘      └────────────────┘
                              │
                      ┌───────┴────────┐
                      │  PDF Generator │
                      │  (Print-Ready) │
                      └────────────────┘
```

### 5.2 How It Works

#### Template Structure
Each design template is stored as:
```
/templates/:designId/
  ├── base.png          ← High-res background (300 DPI for print)
  ├── preview.png       ← Low-res for web preview
  ├── zones.json        ← Defines editable text zones
  ├── fonts/            ← Bundled fonts for this template
  └── metadata.json     ← Colors, styles, language support
```

#### zones.json Example
```json
{
  "zones": [
    {
      "id": "event_title",
      "x": 350, "y": 120,
      "width": 500, "height": 60,
      "fontSize": 42,
      "fontFamily": "Playfair Display",
      "color": "#B8336A",
      "align": "center",
      "maxChars": 80
    },
    {
      "id": "names",
      "x": 300, "y": 220,
      "width": 600, "height": 80,
      "fontSize": 36,
      "fontFamily": "Noto Sans Devanagari",
      "color": "#2D2D2D",
      "align": "center",
      "maxChars": 100
    },
    {
      "id": "date_venue",
      "x": 250, "y": 500,
      "width": 700, "height": 120,
      "fontSize": 20,
      "fontFamily": "Inter",
      "color": "#6B6B6B",
      "align": "center",
      "maxChars": 300
    }
  ]
}
```

#### Live Preview Flow

1. **User types** → Frontend sends debounced (300ms) field data to Preview API.
2. **Preview API** composites text onto `preview.png` using Sharp (Node.js) or Pillow (Python).
3. **Returns** a rendered JPEG/WebP (compressed for fast loading).
4. **Frontend** displays the rendered image in the preview canvas.
5. **Fallback**: Client-side HTML5 Canvas rendering for instant feedback while server preview loads.

#### PDF Proof Generation

1. User clicks "Download Proof".
2. Server composites text onto `base.png` (300 DPI).
3. Generates PDF using **PDFKit** or **Puppeteer** with embedded fonts.
4. PDF includes bleed marks and trim lines for print accuracy.
5. Watermarked "PROOF — NOT FOR PRINT" overlay.
6. Returned as downloadable file.

#### Print-Ready File

1. On order confirmation, server generates **final print file**.
2. High-resolution (300 DPI), CMYK color profile.
3. Includes bleed area (3mm each side).
4. Saved to admin-accessible storage (S3/R2).
5. Admin downloads from Admin Panel.

### 5.3 Performance

| Technique | Details |
|---|---|
| **Debounced Input** | 300ms delay before sending to server |
| **Client-Side Fallback** | Canvas-based preview for instant visual feedback |
| **Image Caching** | Cache rendered previews by hash of input data |
| **Progressive Loading** | Show blurred base → swap with rendered preview |
| **CDN Delivery** | All template assets served from CDN (Cloudflare R2 + CDN) |

---

## 6. Order Workflow

### 6.1 Complete Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                 │
│                                                                     │
│  Browse ─► Select ─► Customize ─► Preview ─► Cart ─► Checkout      │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ Payment Success
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ORDER PROCESSING                                │
│                                                                     │
│  Confirmed ─► Print File Gen ─► Admin Review ─► Approved            │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FULFILLMENT                                     │
│                                                                     │
│  Printing ─► Quality Check ─► Packing ─► Shipped ─► Delivered      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Status Definitions

| Status | Description | Triggered By |
|---|---|---|
| `PENDING_PAYMENT` | Order created, awaiting payment | User places order |
| `CONFIRMED` | Payment received | Payment gateway callback |
| `PRINT_FILE_READY` | Print-ready file generated | System (auto) |
| `ADMIN_REVIEW` | Admin reviews print file | System (auto) |
| `APPROVED` | Admin approves for printing | Admin action |
| `PRINTING` | Cards are being printed | Admin action |
| `QUALITY_CHECK` | Printed cards inspected | Admin action |
| `PACKING` | Cards being packed for shipping | Admin action |
| `SHIPPED` | Handed to courier | Admin action + tracking number |
| `DELIVERED` | Customer received the order | Courier confirmation / admin |
| `CANCELLED` | Order cancelled | User or admin |
| `REFUNDED` | Refund processed | Admin action |

### 6.3 Quantity & Paper Options

**Minimum Order**: 25 cards

| Paper Type | Description | Price Multiplier |
|---|---|---|
| Standard Matte | 250 GSM, smooth matte finish | 1.0x |
| Premium Matte | 350 GSM, thick matte | 1.3x |
| Glossy | 300 GSM, high-gloss coating | 1.2x |
| Textured | 300 GSM, linen texture | 1.5x |
| Metallic | 300 GSM, metallic shimmer | 1.8x |

**Pricing Formula**:
```
Total = (Base Price per Card × Quantity × Paper Multiplier) + Shipping
```

### 6.4 Payment Flow

```
User clicks "Pay Now"
  └→ Frontend creates order via API (status: PENDING_PAYMENT)
  └→ API creates Razorpay order
  └→ Razorpay checkout opens (UPI / Card / Wallet / Net Banking)
  └→ On success: Razorpay webhook → API verifies signature → status: CONFIRMED
  └→ On failure: User sees "Retry Payment" → order remains as draft
```

### 6.5 Notifications

| Event | Channel |
|---|---|
| Order Confirmed | Email + SMS + WhatsApp |
| Print File Ready for Review | Admin dashboard alert |
| Order Shipped | Email + SMS + WhatsApp (with tracking) |
| Order Delivered | Email + SMS |
| Refund Processed | Email + SMS |

---

## 7. Admin Panel

### 7.1 Overview

The admin panel is the **command center** for the printer (the user's father). It must be extremely functional yet simple — designed for a business owner, not a developer.

**Access**: `/admin` (protected, single admin login initially)

### 7.2 Admin Dashboard (`/admin`)

| Widget | Content |
|---|---|
| **Today's Orders** | Count of new orders today |
| **Pending Actions** | Orders needing review/approval |
| **Revenue Today** | Total revenue received today |
| **Revenue This Month** | Monthly revenue chart |
| **Active Orders** | Orders in printing/shipping pipeline |
| **Recent Activity** | Timeline of last 20 events |

### 7.3 Modules

#### 7.3.1 Order Management (`/admin/orders`)

| Feature | Description |
|---|---|
| **Order List** | Filterable table: by status, date, customer |
| **Order Detail** | Full order info, customization data, preview image |
| **Status Update** | Buttons to advance status (Review → Approve → Printing → Shipped) |
| **Print File Download** | One-click download of print-ready PDF |
| **Customer Info** | Name, email, phone, address |
| **Order Notes** | Internal notes field for admin |
| **Bulk Actions** | Select multiple → mark as Printing / Shipped |

#### 7.3.2 Design Management (`/admin/designs`)

| Feature | Description |
|---|---|
| **Design List** | All uploaded designs with thumbnail, name, category, status |
| **Upload New Design** | Upload template files (base image + zones JSON) |
| **Edit Design** | Modify zones, fonts, colors, metadata |
| **Enable/Disable** | Toggle design visibility on the storefront |
| **Duplicate** | Clone a design to create a variation |
| **Preview** | See how the design looks with sample data |

#### 7.3.3 Template Upload (`/admin/designs/upload`)

Wizard for uploading a new card design:

```
Step 1: Upload base image (PNG, 300 DPI, with bleed)
Step 2: Define editable zones (visual zone editor OR JSON upload)
Step 3: Select supported fonts
Step 4: Set default colors and styles
Step 5: Add metadata (name, category, tags, languages)
Step 6: Preview with sample data
Step 7: Publish or save as draft
```

#### 7.3.4 Paper & Pricing (`/admin/settings/paper`)

| Feature | Description |
|---|---|
| **Paper Types** | Add/edit/remove paper options (name, GSM, description, multiplier) |
| **Base Pricing** | Set base price per card per design or category |
| **Quantity Slabs** | Discounts for bulk orders (e.g., 100+ cards = 10% off) |
| **Shipping Rates** | Flat rate or PIN-code-based shipping charges |
| **Tax Settings** | GST percentage |

#### 7.3.5 Order Approval (`/admin/orders/:id/review`)

| Feature | Description |
|---|---|
| **Print Preview** | Side-by-side: customer's preview vs. print-ready file |
| **Approve** | Mark as ready for printing |
| **Reject + Note** | Reject with reason (e.g., image quality issue) |
| **Request Change** | Send message to customer requesting corrections |

#### 7.3.6 Shipping Management (`/admin/shipping`)

| Feature | Description |
|---|---|
| **Add Tracking** | Enter courier name + tracking number for each order |
| **Shipping Labels** | Generate/print shipping labels |
| **Delivery Confirmation** | Mark as delivered |
| **Shipping Partners** | Configure courier options |

#### 7.3.7 Customer Communication (`/admin/messages`)

| Feature | Description |
|---|---|
| **Message Center** | View/reply to customer support messages |
| **WhatsApp Integration** | Quick WhatsApp links to customers |
| **Notification Log** | History of sent emails/SMS |

#### 7.3.8 Refund Management (`/admin/refunds`)

| Feature | Description |
|---|---|
| **Refund Requests** | List of customer refund requests |
| **Process Refund** | Initiate refund via Razorpay |
| **Refund History** | Records of all processed refunds |

#### 7.3.9 Analytics (`/admin/analytics`)

| Metric | Visualization |
|---|---|
| **Revenue** | Daily / Weekly / Monthly line chart |
| **Orders** | Order count trends |
| **Top Designs** | Most ordered designs |
| **Category Performance** | Orders by event category |
| **Customer Demographics** | City/state distribution |
| **Conversion Funnel** | Browse → Customize → Cart → Checkout → Payment |
| **Average Order Value** | Trend over time |

---

## 8. Design Library Management

### 8.1 Template Architecture

Each card design is a **composite template** consisting of:

```
Template Package
├── base_print.png      (300 DPI, CMYK, with 3mm bleed)
├── base_preview.png    (72 DPI, RGB, for web)
├── thumbnail.jpg       (400x560px, for grid browsing)
├── zones.json          (editable zone definitions)
├── fonts/              (embedded font files .ttf/.otf)
├── metadata.json       (name, category, tags, languages, colors)
└── variations/         (color/style variations of same design)
    ├── variation_1.png
    └── variation_2.png
```

### 8.2 Editable Zone Definition

Each zone in `zones.json` defines:

```json
{
  "id": "unique_zone_id",
  "label": "Event Title",
  "type": "text",
  "position": { "x": 350, "y": 120 },
  "dimensions": { "width": 500, "height": 60 },
  "style": {
    "fontSize": 42,
    "fontFamily": "Playfair Display",
    "fontWeight": "bold",
    "color": "#B8336A",
    "textAlign": "center",
    "lineHeight": 1.3
  },
  "constraints": {
    "maxChars": 80,
    "required": true,
    "placeholder": "e.g., Wedding Ceremony"
  },
  "languages": ["en", "hi"]
}
```

### 8.3 Admin Upload Workflow

1. **Upload assets**: Admin uploads the base image and font files.
2. **Define zones**: Uses a **visual zone editor** (drag-and-drop rectangles on the base image) OR uploads a pre-made `zones.json`.
3. **Configure fonts**: Select from system fonts or upload custom fonts.
4. **Set metadata**: Name, category (Wedding, Birthday, etc.), tags (Modern, Traditional, Floral), supported languages.
5. **Preview**: System generates a preview with sample data ("Rahul weds Priya", "15 March 2026", etc.).
6. **Publish**: Design goes live on the storefront.

### 8.4 Design Tagging

| Tag Category | Examples |
|---|---|
| **Event Type** | Wedding, Engagement, Birthday, Anniversary, Puja, Mundan |
| **Style** | Traditional, Modern, Minimalist, Floral, Royal, Rustic |
| **Color Theme** | Red & Gold, Pastel, Blue & Silver, Green & White |
| **Language** | Hindi, English, Bilingual |
| **Orientation** | Portrait, Landscape, Square |
| **Occasion** | Hindu Wedding, Muslim Nikah, Christian Wedding, Sikh Anand Karaj |

---

## 9. Database Structure

### 9.1 Entity Relationship Overview

```
Users ──< Orders ──< OrderItems >── CardDesigns
  │                      │
  │                      ├── Customizations
  │                      ├── Payments
  │                      └── ShippingInfo
  │
  ├── Addresses
  └── Wishlists ──< WishlistItems >── CardDesigns

CardDesigns ──< TemplateZones
CardDesigns ──< DesignTags

AdminUsers (separate auth)
```

### 9.2 Table Definitions

#### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(15) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),
  auth_provider   VARCHAR(20) DEFAULT 'phone',  -- phone, google
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `addresses`
```sql
CREATE TABLE addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(50),  -- Home, Office, Other
  full_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(15) NOT NULL,
  address_line1   VARCHAR(255) NOT NULL,
  address_line2   VARCHAR(255),
  city            VARCHAR(100) NOT NULL,
  state           VARCHAR(100) NOT NULL,
  pincode         VARCHAR(6) NOT NULL,
  is_default      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `card_designs`
```sql
CREATE TABLE card_designs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) UNIQUE NOT NULL,
  category        VARCHAR(50) NOT NULL,  -- wedding, birthday, etc.
  style           VARCHAR(50),           -- traditional, modern, minimalist
  description     TEXT,
  base_price      DECIMAL(10,2) NOT NULL,
  thumbnail_url   TEXT NOT NULL,
  preview_url     TEXT NOT NULL,
  print_url       TEXT NOT NULL,          -- 300 DPI base file
  zones_json      JSONB NOT NULL,         -- editable zones definition
  supported_langs VARCHAR(10)[] DEFAULT ARRAY['en'],
  orientation     VARCHAR(20) DEFAULT 'portrait',
  is_active       BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `design_tags`
```sql
CREATE TABLE design_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id       UUID REFERENCES card_designs(id) ON DELETE CASCADE,
  tag             VARCHAR(50) NOT NULL,
  UNIQUE(design_id, tag)
);
```

#### `template_fonts`
```sql
CREATE TABLE template_fonts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id       UUID REFERENCES card_designs(id) ON DELETE CASCADE,
  font_name       VARCHAR(100) NOT NULL,
  font_file_url   TEXT NOT NULL,
  is_default      BOOLEAN DEFAULT false
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    VARCHAR(20) UNIQUE NOT NULL,  -- e.g., NYM-20260315-001
  user_id         UUID REFERENCES users(id),
  status          VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
  subtotal        DECIMAL(10,2) NOT NULL,
  shipping_cost   DECIMAL(10,2) DEFAULT 0,
  tax_amount      DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(10,2) NOT NULL,
  address_id      UUID REFERENCES addresses(id),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  design_id       UUID REFERENCES card_designs(id),
  quantity        INTEGER NOT NULL CHECK (quantity >= 25),
  paper_type      VARCHAR(50) NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  customization   JSONB NOT NULL,           -- all user-entered data
  preview_url     TEXT,                      -- rendered preview image
  print_file_url  TEXT,                      -- print-ready PDF
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `payments`
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id   VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature  VARCHAR(255),
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'INR',
  status          VARCHAR(20) NOT NULL,  -- created, captured, failed, refunded
  method          VARCHAR(30),            -- upi, card, netbanking, wallet
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `shipping`
```sql
CREATE TABLE shipping (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  courier_name    VARCHAR(100),
  tracking_number VARCHAR(100),
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'pending',  -- pending, shipped, in_transit, delivered
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `admin_users`
```sql
CREATE TABLE admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) DEFAULT 'admin',  -- admin, super_admin (future)
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_status_log`
```sql
CREATE TABLE order_status_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_status     VARCHAR(30),
  to_status       VARCHAR(30) NOT NULL,
  changed_by      VARCHAR(50),  -- 'system', 'admin', user_id
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `support_tickets`
```sql
CREATE TABLE support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  order_id        UUID REFERENCES orders(id),
  subject         VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'open',  -- open, in_progress, resolved, closed
  admin_reply     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `wishlists`
```sql
CREATE TABLE wishlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  design_id       UUID REFERENCES card_designs(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, design_id)
);
```

### 9.3 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_card_designs_category ON card_designs(category);
CREATE INDEX idx_card_designs_active ON card_designs(is_active);
CREATE INDEX idx_design_tags_tag ON design_tags(tag);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_shipping_order_id ON shipping(order_id);
```

---

## 10. Tech Stack

### 10.1 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | **Next.js 14+ (App Router)** | SSR for SEO, React for interactivity, built-in image optimization |
| **Styling** | **Tailwind CSS + Shadcn/ui** | Rapid development, consistent design system |
| **State Management** | **Zustand** | Lightweight, perfect for cart/customization state |
| **Mobile** | **PWA** (initially), **React Native** (later) | PWA gives app-like experience without app store |
| **Backend** | **Node.js (Fastify)** | High performance, TypeScript support, great for API |
| **Database** | **PostgreSQL (Supabase)** | Relational data, JSONB for customizations, built-in auth |
| **Cache** | **Redis (Upstash)** | Session cache, rate limiting, preview caching |
| **File Storage** | **Cloudflare R2** | S3-compatible, no egress fees, global CDN |
| **CDN** | **Cloudflare** | Fast asset delivery, DDoS protection |
| **Preview Engine** | **Sharp (Node.js)** | Fast image compositing for text-on-template rendering |
| **PDF Generation** | **PDFKit** or **Puppeteer** | Print-ready PDF with embedded fonts |
| **Payment** | **Razorpay** | Best Indian payment gateway, UPI support |
| **SMS** | **MSG91** or **Twilio** | OTP + transactional SMS |
| **Email** | **Resend** or **AWS SES** | Transactional emails |
| **WhatsApp** | **WhatsApp Business API** (or Interakt) | Order notifications |
| **Auth** | **Supabase Auth** | Phone OTP + Google Sign-in |
| **Hosting** | **Vercel** (frontend) + **Railway / Render** (backend) | Easy deployment, auto-scaling |
| **Monitoring** | **Sentry** (errors) + **PostHog** (analytics) | Error tracking + user behavior |

### 10.2 Architecture Diagram

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Fastify   │        ┌──────────────┐
                    │   API       │◄──────►│   Razorpay   │
                    └──┬───┬───┬──┘        └──────────────┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
     ┌────────────┐  ┌──────────┐  ┌──────────────┐
     │ PostgreSQL │  │  Redis   │  │ Cloudflare   │
     │ (Supabase) │  │(Upstash) │  │     R2       │
     └────────────┘  └──────────┘  └──────────────┘
                                          │
                                   ┌──────▼──────┐
                                   │ Cloudflare  │
                                   │    CDN      │
                                   └─────────────┘
```

### 10.3 Development Tools

| Tool | Purpose |
|---|---|
| **TypeScript** | Type safety across frontend + backend |
| **Prisma** | Database ORM with type-safe queries |
| **Zod** | Schema validation for API inputs |
| **ESLint + Prettier** | Code quality |
| **GitHub Actions** | CI/CD pipeline |
| **Docker** | Local development parity |

---

## 11. Future Scalability

### 11.1 Designed-In Extension Points

The MVP architecture is built with these **future capabilities in mind**:

#### Phase 2: Multi-Printer Support
```
Current:  Admin = Single Printer
Future:   Admin Platform → Multiple Printer Vendors

Changes needed:
- Add `printers` table
- Add `printer_id` to orders (auto-assign by location/capacity)
- Printer onboarding flow
- Printer dashboard (subset of admin panel)
- Commission/revenue split logic
```

#### Phase 3: Vendor Marketplace
```
- Vendor registration + KYC
- Vendor-uploaded designs
- Vendor approval workflow
- Revenue sharing (platform fee %)
- Vendor analytics dashboard
- Rating & review system for vendors
```

#### Phase 4: Gift Products
```
- Expand product catalog beyond cards
- Gift wrapping, custom boxes, thank-you cards
- Product bundles (card + envelope + gift tag)
- New product types in DB (abstract `products` table)
```

#### Phase 5: Event Planning
```
- Event planning checklist
- Vendor directory (photographers, caterers, decorators)
- Vendor booking system
- Event timeline planner
- Budget calculator
```

#### Phase 6: AI Event Planner
```
- AI-powered event suggestions based on budget/preferences
- Auto-generate guest lists
- AI-designed custom cards (generative AI)
- Chatbot for event planning guidance
- Smart recommendation engine
```

#### Phase 7: AR Card Preview
```
- AR.js or 8th Wall integration
- Point phone camera at table → see card standing on it
- 3D card mockup viewer
- Share AR preview link
```

### 11.2 Database Scalability Path

| Phase | Strategy |
|---|---|
| **MVP (0–10K orders)** | Single PostgreSQL instance (Supabase free/pro) |
| **Growth (10K–100K)** | Read replicas, connection pooling (PgBouncer) |
| **Scale (100K+)** | Dedicated DB, horizontal read scaling, Redis caching layer |
| **Enterprise** | Microservices, event-driven architecture (Kafka/RabbitMQ) |

### 11.3 Infrastructure Scalability

```
MVP                          Growth                       Scale
─────                        ──────                       ─────
Vercel (free)          →     Vercel Pro                →  Vercel Enterprise
Railway (backend)      →     Railway Pro               →  AWS ECS / K8s
Supabase (free)        →     Supabase Pro              →  AWS RDS
Upstash Redis (free)   →     Upstash Pro               →  AWS ElastiCache
Cloudflare R2 (free)   →     R2 (paid tier)            →  R2 (enterprise)
```

---

## Appendix A: User Journey Map

```
┌──────────────────────────────────────────────────────────────────┐
│                     DISCOVERY                                    │
│  Google Search / WhatsApp share / Social Media Ad                │
│                          │                                       │
│                          ▼                                       │
│                    LANDING PAGE                                  │
│  See hero → Browse categories → View trending designs            │
│                          │                                       │
│                          ▼                                       │
│                    EXPLORATION                                   │
│  Browse category → Filter (style, color, language)               │
│  → View design details → Share with family                       │
│                          │                                       │
│                          ▼                                       │
│                   CUSTOMIZATION                                  │
│  Step 1: Event → Step 2: Names → Step 3: Date/Venue             │
│  → Step 4: Message/Language → Step 5: Review                     │
│                          │                                       │
│                          ▼                                       │
│                     PREVIEW                                      │
│  See live preview → Download proof → Approve                     │
│                          │                                       │
│                          ▼                                       │
│                     PURCHASE                                     │
│  Cart → Select quantity & paper → Checkout → Pay (Razorpay)     │
│                          │                                       │
│                          ▼                                       │
│                     TRACKING                                     │
│  Order confirmed → Printing → Shipped → Delivered                │
│  (Notifications via SMS + WhatsApp + Email)                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| **Auth** | | |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| POST | `/api/auth/google` | Google OAuth login |
| **Designs** | | |
| GET | `/api/designs` | List designs (with filters) |
| GET | `/api/designs/:id` | Get design detail |
| GET | `/api/designs/categories` | List categories with counts |
| **Customization** | | |
| POST | `/api/preview/generate` | Generate preview image |
| POST | `/api/preview/pdf` | Generate PDF proof |
| **Cart** | | |
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PATCH | `/api/cart/items/:id` | Update cart item |
| DELETE | `/api/cart/items/:id` | Remove cart item |
| **Orders** | | |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List user's orders |
| GET | `/api/orders/:id` | Get order detail |
| **Payments** | | |
| POST | `/api/payments/create` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| **User** | | |
| GET | `/api/users/me` | Get profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/me/addresses` | List addresses |
| POST | `/api/users/me/addresses` | Add address |
| **Support** | | |
| POST | `/api/support/tickets` | Create support ticket |
| GET | `/api/support/tickets` | List user's tickets |
| **Admin** | | |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/orders/:id/print-file` | Download print file |
| POST | `/api/admin/designs` | Upload new design |
| PATCH | `/api/admin/designs/:id` | Update design |
| GET | `/api/admin/analytics` | Get analytics data |
| PATCH | `/api/admin/settings/paper` | Update paper/pricing |

---

> **This blueprint is designed so that developers can begin building the MVP immediately.** Start with the core flow: Design Browsing → Customization → Preview → Order → Admin Fulfillment. Layer on features iteratively.
