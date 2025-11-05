# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

King Bus is a **production-ready** mobile-first bus reservation web application built with Next.js 16, React 19, and TypeScript. The application is designed for Korean users (text is in Korean) and provides bus rental/charter services with complete features for authentication, reservations, payments, and booking management.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Authentication**: Supabase Auth (Google, Kakao OAuth) ✅
- **Payment**: PortOne (구 아임포트) ✅
- **HTTP Client**: Axios ✅
- **Maps**: 카카오맵 API ✅

## Architecture

### UI Component System

The project uses **shadcn/ui** components with Radix UI primitives and Tailwind CSS v4. Component configuration is in `components.json` with the "new-york" style preset.

- **Base components**: Located in `components/ui/` (button, card, input, label, etc.)
- **Feature components**: Located in `components/`
  - `login-screen.tsx`: OAuth login UI (Supabase integrated) ✅
    - Custom responsive design (375px-600px)
    - Circular login buttons (56x56px)
    - SVG illustration integration (login_kingbus_label.svg, login_kingking.svg)
    - Background color: rgba(74, 105, 228, 1)
  - `main-screen.tsx`: Authenticated home screen with navigation ✅
    - Recent reservations display (top 3)
    - Return date support for round-trip bookings
  - `reservation-form-complete.tsx`: Full bus booking form with quote API ✅
    - Passenger count input (1-500)
    - Vehicle count selection (1-20)
    - Vehicle type selection (general/solati)
    - Kakao Map integration for locations
    - Round-trip support
  - `kakao-map-modal.tsx`: Kakao Map integration with place search ✅
    - Place/address search with autocomplete
    - Interactive map with click-to-select
    - Marker placement and geocoding
    - Current location detection
  - `my-reservations-complete.tsx`: Redesigned reservation list and detail view ✅
    - Clean card-based list design
    - Status display with chevron icon (left side)
    - Round-trip/one-way badge (right side)
    - Location names with smaller text (text-sm)
    - Departure and arrival dates with directional arrows
    - Full-screen detail modal with organized sections
    - PortOne payment integration
    - Conditional payment/refund information display
    - Customer information from API (customer.name, customer.email, customer.phone)
  - `payment-screen.tsx`: New payment screen component ✅
    - Prominent payment amount display
    - Expandable sections (예약 상세, 예약자 정보, 판매자 정보, etc.)
    - Agreement checkboxes with validation
    - Integrated into reservation detail flow
  - `payment-page.tsx`: PortOne payment integration ✅
- **Styling**: Tailwind CSS v4 with custom King Bus brand colors in `app/globals.css`
  - Primary blue: `oklch(0.55 0.18 264)` (rgba(74, 105, 228, 1))
  - Login background: rgba(74, 105, 228, 1)
  - Secondary yellow: Kakao brand color (#FEE500)
  - Mobile utilities: `.safe-area-inset` and `.touch-manipulation` classes

### Application Structure

This is a Next.js App Router application with a robust authentication and API integration:

**Main entry point** (`app/page.tsx`):
- Manages authentication state using **Supabase Auth** ✅
- Real-time auth state change detection
- Conditionally renders `LoginScreen` or `MainScreen` based on auth state
- User data format: `{ name: string; email: string }`

**Navigation flow**:
1. `LoginScreen` → Google/Kakao OAuth via Supabase ✅
2. OAuth callback → `/auth/callback` route ✅
3. `MainScreen` → Tab-based navigation between home/reservation/myReservations views
4. `ReservationFormComplete` → Full bus booking form with API integration ✅
5. `MyReservationsComplete` → User's booking history with status filtering ✅
6. `PaymentPage` → PortOne payment processing ✅

### State Management

- **No global state library**: Uses React `useState` and prop drilling
- **Authentication**: Supabase Auth with session management ✅
- **Form state**: Local state in form components
- **API state**: Async state management with loading/error handling

### Backend Integration

**API Base URL**: Configurable via `NEXT_PUBLIC_API_BASE_URL` environment variable

**Backend**: Django REST API (`../reservation-system`)
- Full API documentation: `../reservation-system/FRONTEND_API_DOCUMENTATION.md`

**Key API Functions** (`lib/api.ts`):
- `getQuote()`: Real-time quote calculation with vehicle_count support ✅
- `createReservation()`: Create new reservation with all form data ✅
- `getReservations()`: List user reservations with status filtering ✅
- `getReservation()`: Get reservation details with quote info ✅
- `cancelReservation()`: Cancel reservation (status-restricted) ✅
- `initiatePayment()`: Start PortOne payment process ✅
- `verifyPayment()`: Verify payment completion with backend ✅

**Important Implementation Details**:
- All numeric values use `Number()` conversion before `.toLocaleString()` for proper formatting
- Vehicle count is user-selectable (1-20) in reservation form
- Payment cancellation button hidden for completed/confirmed reservations
- Return date properly displayed in list and detail views
- Customer data accessed via `reservation.customer.name`, `reservation.customer.email`, `reservation.customer.phone`
- Payment information conditionally displayed only when `latest_payment` exists
- Optional chaining (`?.`) used throughout for safe property access

### Authentication Flow

**Supabase Integration** (`lib/supabase.ts`):
1. User clicks Google/Kakao login
2. `signInWithGoogle()` or `signInWithKakao()` initiates OAuth
3. Redirect to provider authentication
4. OAuth callback to `/auth/callback`
5. Session established and user redirected to home
6. All API requests include Supabase access token in Authorization header

### Payment Flow

**PortOne Integration** (`lib/portone.ts`):
1. User views reservation in "payment_waiting" status
2. Click "예약금 결제" button
3. `initiatePayment()` fetches payment config from backend
4. PortOne SDK opens payment modal
5. User completes payment (card/bank transfer/virtual account)
6. `verifyPayment()` validates payment with backend
7. Reservation status updated to "payment_completed"

### Path Aliases

```typescript
"@/*" → "./*"  // Root directory
// Common aliases from components.json:
@/components → components/
@/lib → lib/
@/hooks → hooks/
@/ui → components/ui/
@/types → types/
```

### Type Safety

**Comprehensive TypeScript types** (`types/index.ts`):
- All API request/response types defined
- Reservation, Quote, Payment models
- Status enums with Korean display names
- Full type coverage for API functions

### Styling Conventions

- Mobile-first design with touch-optimized interactions
- Use `touch-manipulation` class for buttons/interactive elements
- Use `safe-area-inset` class for fixed headers/footers to handle device notches
- Korean language UI with branding emphasis on blue color scheme

## Environment Variables

Required environment variables (see `.env.local.example`):

```bash
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# PortOne Payment
NEXT_PUBLIC_PORTONE_USER_CODE=imp12345678

# Kakao Maps (planned)
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-api-key
```

## Key Files

### Core Application
- `app/page.tsx`: Authentication routing with Supabase ✅
- `app/layout.tsx`: Root layout with Korean locale and analytics
- `app/auth/callback/route.ts`: OAuth callback handler ✅

### Components
- `components/login-screen.tsx`: OAuth login UI ✅
- `components/main-screen.tsx`: Authenticated home screen ✅
- `components/reservation-form-complete.tsx`: Full booking form ✅
- `components/my-reservations-complete.tsx`: Redesigned reservation list and detail view ✅
- `components/payment-screen.tsx`: New payment screen with expandable sections ✅
- `components/payment-page.tsx`: Payment processing ✅

### Libraries
- `lib/supabase.ts`: Supabase auth functions ✅
- `lib/api.ts`: Backend API integration ✅
- `lib/portone.ts`: PortOne payment SDK ✅
- `lib/utils.ts`: Utility functions

### Types
- `types/index.ts`: All TypeScript type definitions ✅

### Configuration
- `.env.local.example`: Environment variable template ✅ 
- `components.json`: shadcn/ui configuration
- `app/globals.css`: Tailwind v4 config and King Bus brand colors

## Component Development

When creating new components:

1. Use shadcn/ui primitives from `@/components/ui` for consistency
2. Apply Korean text and King Bus branding (primary blue color)
3. Include mobile-friendly touch targets (minimum 44x44px)
4. Use the `cn()` utility from `@/lib/utils` for conditional class merging
5. Follow the existing pattern of `"use client"` directives for interactive components
6. Import types from `@/types` for type safety
7. Use API functions from `@/lib/api` for backend communication
8. Handle loading and error states properly

## Development Status

### ✅ Completed Features

- **Authentication**
  - Google/Kakao OAuth login via Supabase
  - Real-time authentication state management
  - Mobile-optimized login screen (375px-600px responsive)
  - Custom login design with SVG illustration

- **Kakao Map Integration**
  - Place/address search with autocomplete
  - Interactive map with marker placement
  - Geocoding and reverse geocoding
  - Current location detection
  - Modal-based location selection

- **Reservation System**
  - Reservation creation with quote calculation
  - Passenger count input (1-500)
  - Vehicle count selection (1-20)
  - Vehicle type selection (general/solati)
  - Round-trip support with return date
  - **Redesigned reservation list view**:
    - Clean card-based design without status filters
    - Status name with chevron icon on left
    - Round-trip/one-way badge on right
    - Smaller location text (text-sm)
    - Date/time formatting with directional arrows
  - **Redesigned reservation detail view**:
    - Full-screen modal with back button
    - Reservation number and status badge
    - Organized sections: 운행 정보, 버스 정보, 고객 정보, 요청사항, 결제/환불 정보
    - Customer data from API nested structure
    - Conditional payment info display
  - Reservation cancellation (status-based restrictions)

- **Payment Integration**
  - PortOne payment gateway fully integrated
  - **New payment screen component**:
    - Prominent payment amount card with blue background
    - Expandable sections for reservation details, customer info, seller info
    - Privacy and refund policy sections
    - Agreement checkboxes with "전체 동의" option
    - Disabled submit button until all agreements checked
  - Payment initiation from reservation detail (payment_waiting status)
  - Payment verification with backend
  - Payment status tracking
  - Deposit (10%) and remaining amount display
  - Conditional button display based on payment status

- **UI/UX Enhancements**
  - Number formatting with thousand separators (toLocaleString)
  - Explicit Number() conversion for all numeric values
  - Full TypeScript type coverage
  - Mobile-optimized responsive design (375px-600px)
  - Error handling and loading states
  - Touch-optimized interactions

### 🚧 Planned Features

- Payment history page
- Push notifications
- Admin panel integration
- Real-time reservation status updates

## Troubleshooting

### Supabase Auth Issues
- Verify `.env.local` has correct Supabase URL and Anon Key
- Check Supabase dashboard for enabled OAuth providers
- Ensure callback URL is configured: `{your-domain}/auth/callback`

### API Connection Issues
- Verify backend server is running on configured API_BASE_URL
- Check CORS settings in Django backend
- Verify Supabase token is being sent in Authorization header

### Payment Issues
- Verify PortOne user code in environment variables
- Check PortOne dashboard for test/production mode
- Ensure payment verification endpoint is accessible

## Related Documentation

- Backend API: `../reservation-system/FRONTEND_API_DOCUMENTATION.md`
- Project README: `./README.md`
- Supabase Docs: https://supabase.com/docs
- PortOne Docs: https://portone.io/korea/ko/docs
