# Voya — Full-Spectrum OTA Platform (Phase 1–2 consumer web)

A production-quality **Online Travel Agency** consumer marketplace, built to the
OTA Master Build Prompt. A traveller can search **flights and hotels**, see
**transparent itemized pricing** in their currency and locale (including full
**Arabic RTL**), add to a cart, check out as guest or member, pay through a
**mock 3-D Secure** flow, receive a **voucher / e-ticket**, view it in **My
Trips**, and **cancel within policy for a correct refund** — every order backed
by a **balanced double-entry ledger**.

> **Sandbox** — no real inventory, payments, or bookings. Every external
> dependency (supply, payments, FX, geo) sits behind a clean interface with a
> mock implementation, so the platform runs end-to-end before real credentials
> exist (spec §8).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint
```

## CONFIG used (spec §0)

| Key | Value |
| --- | --- |
| `brand_name` | **Voya** (`voya.com`) — theme keyed off the brand in `tailwind.config.js` |
| `default_currency` | `USD` (base settlement) |
| `supported_currencies` | USD, EUR, GBP, AED, BHD, SAR — note **BHD uses 3 minor digits** |
| `supported_locales` | `en`, `ar` → **full RTL** when Arabic |
| `verticals_mvp` | **flights, hotels** (shipped) |
| `primary_markets` | GCC, Global |

## Architecture decision

**Modular monolith as a frontend SPA with in-browser mock supply adapters** —
because this environment is a single Vite app where backend microservices,
Kafka, Kubernetes and Terraform cannot run. Clean domain boundaries are enforced
(`domain/`, `state/`, `i18n/`, `features/`) so the pure logic — pricing,
money, FX, cancellation policy, ledger — could be lifted into NestJS bounded
contexts (`pricing`, `cart-order`, `booking-orchestrator`) unchanged. See
`docs/adr/` for the records.

## What's implemented (acceptance criteria, spec §15)

- ✅ **Universal search** with geo/alias-aware autocomplete (`domain/catalog/places.ts`), Stay/Fly tabs.
- ✅ **Hotels**: property/room/rate-plan catalog, board basis, cancellation policies, members-only rates, map + reviews.
- ✅ **Flights**: deterministic GDS-style offer generation, fare families (Basic/Standard/Flex), baggage, seats & extra-bag ancillaries.
- ✅ **Pricing engine** (`domain/pricing.ts`): `net → markup → fees → taxes → FX → promo → loyalty`, fully itemized, **integer minor units, never floats**.
- ✅ **Multi-currency** live re-pricing; transparent "includes taxes & fees".
- ✅ **Cart & promo codes** (`VOYA10`, `SUMMER25`, `GCC15`) with live re-price.
- ✅ **Checkout** with the **price-change guard** (supplier re-validation before charge, spec §7.1) + guest/member checkout.
- ✅ **Payments**: mock **3-D Secure** modal, PCI-style tokenized card messaging.
- ✅ **Confirmation**: booking reference, voucher/e-ticket, downloadable voucher (.txt) and **calendar (.ics)**, loyalty points earned.
- ✅ **My Trips**: upcoming/cancelled, voucher modal, **cancellation → policy engine → refund** (spec §7.3), per-booking **double-entry ledger** with a balanced check.
- ✅ **Loyalty**: One Key-style points earn, member rates.
- ✅ **i18n / l10n**: en + ar, **full RTL**, locale-aware currency/number/date formatting via `Intl`.
- ✅ Design system tokens, skeleton loading, optimistic UI, responsive, accessible.

## Project structure

```
src/
  domain/              # framework-free business logic (lift-and-shift ready)
    money.ts           # Money (minor units), currency exponents, Intl formatting
    fx.ts              # mock FxRate provider (USD base), behind FxProvider interface
    pricing.ts         # itemized pricing pipeline + double-entry ledger builder
    booking.ts         # references, vouchers, .ics, cancellation/refund quoting
    coupons.ts         # promo/coupon definitions
    types.ts           # core domain types (hotels, flights, cart, orders, bookings)
    catalog/           # mock supply adapters + seed inventory
      hotels.ts  flights.ts  places.ts
  i18n/translations.ts # en/ar dictionary + interpolation
  state/AppStore.tsx   # currency, locale/RTL, mock auth, cart, trips, router, toasts
  components/          # ui/ (Modal, Skeleton, Stars, PriceBreakdownView), layout/, Toasts
  features/            # home, search, results, detail, cart, checkout, confirm, trips
```

## Critical flows (spec §7)

- **Search → Quote → Book → Pay → Confirm**: adapters return offers with latency
  → selection re-prices live → checkout re-validates (price-change guard) →
  3DS capture → booking + ledger + voucher + points → My Trips.
- **Cancellation / refund**: `quoteRefund()` applies the rate plan's policy
  (free window vs. penalty vs. non-refundable) and emits the refund + ledger.

## Money & ledger integrity

All amounts are integer minor units tagged with a currency; arithmetic lives in
`money.ts`. Each captured payment produces a **double-entry ledger**
(customer / supplier-payable / tax-payable / revenue) that sums to zero — surfaced
per booking in My Trips with a live **Balanced** badge.

## Verified

A headless-Chromium end-to-end pass exercises: home → hotel search → detail →
**currency switch (AED)** → add to cart → **apply coupon** → checkout →
**3DS approve** → confirmation → My Trips → **ledger balanced** → **cancel +
refund** → **switch to Arabic RTL** (asserts `<html dir="rtl">`). `typecheck`
and `lint` are clean; `build` succeeds.

## What's next / known gaps

This is the consumer-web slice of phases 1–2 plus pricing/loyalty/cancellation
from phases 4 & 8. Not in this environment (require backend infra): NestJS
services + API gateway, Postgres/Redis/OpenSearch, Kafka + outbox, the
**packages saga** with compensation (§7.2), supplier extranet & admin console,
real PSP/GDS/bedbank integrations, mobile (React Native), and IaC/CI/CD. The
domain layer is structured to make those extractions mechanical.
