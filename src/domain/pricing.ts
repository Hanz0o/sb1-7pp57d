/**
 * Pricing engine (§4.1):
 *   net rate → markup → fees → taxes → currency conversion → promo → loyalty
 * Fully itemized and auditable. All math on integer minor units.
 *
 * Pure and framework-free: this is the logic that would live in the `pricing`
 * bounded context. The UI only consumes the returned PriceBreakdown.
 */
import {
  CurrencyCode,
  Money,
  money,
  add,
  sum,
  percentOf,
  negate,
  zero,
  multiply,
} from './money';
import { mockFxProvider } from './fx';
import { Coupon } from './coupons';
import {
  PriceBreakdown,
  PriceLine,
  Hotel,
  RoomType,
  RatePlan,
  FlightOffer,
  FareFamily,
  HotelSelection,
  FlightSelection,
} from './types';

/* ------------------------------- Rule config ------------------------------- */
// In production these come from the MarkupRule / FeeRule / TaxRule tables,
// scoped by vertical/market. Here they are sensible constants.
const MARKUP_RATE: Record<'hotels' | 'flights', number> = {
  hotels: 0.12,
  flights: 0.07,
};
const TAX_RATE: Record<'hotels' | 'flights', number> = {
  hotels: 0.085, // occupancy / sales tax
  flights: 0.05, // aviation taxes & surcharges (simplified)
};
const SERVICE_FEE_USD = 999; // $9.99 per item booking fee
const MEMBER_DISCOUNT_RATE = 0.05; // "members save" on charges
const POINTS_PER_USD = 2; // One Key-style earn: 2 pts per $1 spent

export interface PricingContext {
  currency: CurrencyCode;
  isMember: boolean;
  coupon?: Coupon;
}

interface RawCharges {
  vertical: 'hotels' | 'flights';
  /** Net supplier cost in USD minor units. */
  netUsd: number;
  /** Optional ancillaries (seats, bags) in USD minor units. */
  ancillaryUsd?: number;
}

/**
 * Core pipeline shared by all verticals. Produces a breakdown in the display
 * currency whose line items sum exactly to `total` (ledger-balanced).
 */
function buildBreakdown(raw: RawCharges, ctx: PricingContext): PriceBreakdown {
  const { currency } = ctx;
  const fx = mockFxProvider;
  const conv = (usdMinor: number): Money =>
    fx.convert(money(usdMinor, 'USD'), currency);

  // 1. net → markup → fees → taxes, computed in USD then converted.
  const netUsd = raw.netUsd;
  const markupUsd = Math.round(netUsd * MARKUP_RATE[raw.vertical]);
  const ancillaryUsd = raw.ancillaryUsd ?? 0;
  const feeUsd = SERVICE_FEE_USD;
  const taxableUsd = netUsd + markupUsd + ancillaryUsd;
  const taxUsd = Math.round(taxableUsd * TAX_RATE[raw.vertical]);

  const baseCharge = conv(netUsd + markupUsd); // shown as one "room/fare" charge
  const ancillary = conv(ancillaryUsd);
  const fee = conv(feeUsd);
  const tax = conv(taxUsd);

  const lines: PriceLine[] = [
    {
      key: 'base',
      labelKey: raw.vertical === 'hotels' ? 'price.roomCharge' : 'price.airfare',
      amount: baseCharge,
      kind: 'charge',
    },
  ];
  if (ancillary.amount > 0) {
    lines.push({ key: 'ancillary', labelKey: 'price.extras', amount: ancillary, kind: 'charge' });
  }
  lines.push({ key: 'fee', labelKey: 'price.serviceFee', amount: fee, kind: 'fee' });
  lines.push({ key: 'tax', labelKey: 'price.taxes', amount: tax, kind: 'tax' });

  // 2. Subtotal of charges (everything positive so far).
  const subtotal = sum(lines.map((l) => l.amount), currency);

  // 3. Promo / coupon (applied to charges, in display currency).
  if (ctx.coupon) {
    const c = ctx.coupon;
    const meetsMin = !c.minSpendUsd || netUsd + markupUsd >= c.minSpendUsd;
    if (meetsMin) {
      let discount: Money;
      if (c.kind === 'percent') {
        discount = percentOf(subtotal, c.value);
      } else {
        discount = conv(c.value);
      }
      // never discount below zero
      if (discount.amount > subtotal.amount) discount = subtotal;
      lines.push({
        key: 'coupon',
        labelKey: 'price.coupon',
        amount: negate(discount),
        kind: 'discount',
      });
    }
  }

  // 4. Loyalty member discount on the base charge.
  if (ctx.isMember) {
    const memberDisc = percentOf(baseCharge, MEMBER_DISCOUNT_RATE);
    lines.push({
      key: 'member',
      labelKey: 'price.memberDiscount',
      amount: negate(memberDisc),
      kind: 'discount',
    });
  }

  const total = sum(lines.map((l) => l.amount), currency);
  const taxesAndFees = add(fee, tax);
  const pointsEarned = Math.max(0, Math.round((total.amount / 100) * POINTS_PER_USD));

  return { currency, lines, total, taxesAndFees, pointsEarned };
}

/* --------------------------------- Hotels ---------------------------------- */

export function findRate(
  hotel: Hotel,
  roomTypeId: string,
  ratePlanId: string,
): { room: RoomType; plan: RatePlan } | null {
  const room = hotel.rooms.find((r) => r.id === roomTypeId);
  const plan = room?.ratePlans.find((p) => p.id === ratePlanId);
  if (!room || !plan) return null;
  return { room, plan };
}

export function priceHotel(
  hotel: Hotel,
  sel: HotelSelection,
  ctx: PricingContext,
): PriceBreakdown {
  const found = findRate(hotel, sel.roomTypeId, sel.ratePlanId);
  if (!found) throw new Error('Rate not found');
  const netUsd = found.plan.netNightlyUsd * sel.nights * sel.rooms;
  return buildBreakdown({ vertical: 'hotels', netUsd }, ctx);
}

/* --------------------------------- Flights --------------------------------- */

const SEAT_FEE_USD = 1800; // $18 per paid seat
const BAG_FEE_USD = 3500; // $35 per extra checked bag

export function findFare(offer: FlightOffer, fareFamilyId: string): FareFamily | null {
  return offer.fareFamilies.find((f) => f.id === fareFamilyId) ?? null;
}

export function priceFlight(
  offer: FlightOffer,
  sel: FlightSelection,
  ctx: PricingContext,
): PriceBreakdown {
  const fare = findFare(offer, sel.fareFamilyId);
  if (!fare) throw new Error('Fare not found');
  const netUsd = fare.netFareUsd * sel.adults;
  const ancillaryUsd = sel.seats * SEAT_FEE_USD + sel.extraBags * BAG_FEE_USD;
  return buildBreakdown({ vertical: 'flights', netUsd, ancillaryUsd }, ctx);
}

/** Re-price an existing cart selection (used by the checkout price-change guard). */
export function repriceSelection(
  selection: HotelSelection | FlightSelection,
  lookup: { hotel?: Hotel; offer?: FlightOffer },
  ctx: PricingContext,
): PriceBreakdown {
  if (selection.vertical === 'hotels' && lookup.hotel) {
    return priceHotel(lookup.hotel, selection, ctx);
  }
  if (selection.vertical === 'flights' && lookup.offer) {
    return priceFlight(lookup.offer, selection, ctx);
  }
  throw new Error('Cannot reprice: missing inventory reference');
}

export { SEAT_FEE_USD, BAG_FEE_USD };

/* ------------------------------- Double-entry ------------------------------ */
/**
 * Build a balanced double-entry ledger for a captured payment. Debits == credits.
 */
export function buildLedger(pricing: PriceBreakdown, nowIso: string) {
  const cur = pricing.currency;
  const taxes = pricing.taxesAndFees;
  const supplierPayable = sum(
    pricing.lines.filter((l) => l.key === 'base' || l.key === 'ancillary').map((l) => l.amount),
    cur,
  );
  const discounts = sum(
    pricing.lines.filter((l) => l.kind === 'discount').map((l) => l.amount),
    cur,
  );
  // revenue = total - supplierPayable - taxes (+ discounts already negative)
  const revenue = money(
    pricing.total.amount - supplierPayable.amount - taxes.amount,
    cur,
  );
  return [
    { id: 'le_cust', ts: nowIso, account: 'customer' as const, amount: pricing.total, memo: 'Card payment captured' },
    { id: 'le_supp', ts: nowIso, account: 'supplier_payable' as const, amount: negate(supplierPayable), memo: 'Owed to supplier' },
    { id: 'le_tax', ts: nowIso, account: 'tax_payable' as const, amount: negate(taxes), memo: 'Taxes & fees collected' },
    { id: 'le_rev', ts: nowIso, account: 'revenue' as const, amount: negate(revenue), memo: 'Platform margin' },
    ...(discounts.amount !== 0
      ? [{ id: 'le_disc', ts: nowIso, account: 'revenue' as const, amount: negate(discounts), memo: 'Promotions applied' }]
      : []),
  ];
}

export { multiply, zero };
