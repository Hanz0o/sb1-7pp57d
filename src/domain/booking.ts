/** Booking helpers: references, vouchers, and the checkout price-change guard. */
import { Money, percentOf, add, toMajor, CURRENCY_EXPONENT } from './money';
import { Booking, PriceBreakdown, PriceLine } from './types';

function rndCode(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function makeReference(): string {
  return `VYA-${rndCode(6)}`;
}

export function makeVoucher(vertical: string): string {
  return `${vertical === 'flights' ? 'ETKT' : 'VCHR'}-${rndCode(4)}-${rndCode(4)}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Simulates a supplier-side live re-check at checkout (§7.1 price-change guard).
 * Deterministic per cart item so a given booking is stable across re-renders:
 * roughly 1 in 4 items see a small "live availability" surcharge that the
 * traveller must acknowledge before the card is charged.
 */
export function availabilitySurcharge(itemId: string, currentTotal: Money): Money {
  const triggered = hashStr(itemId) % 4 === 0;
  return triggered ? percentOf(currentTotal, 0.04) : { amount: 0, currency: currentTotal.currency };
}

/** Fold a surcharge into a breakdown as a new line, keeping the total balanced. */
export function applySurcharge(pricing: PriceBreakdown, surcharge: Money): PriceBreakdown {
  if (surcharge.amount === 0) return pricing;
  const line: PriceLine = {
    key: 'availability',
    labelKey: 'price.availabilityAdj',
    amount: surcharge,
    kind: 'charge',
  };
  return {
    ...pricing,
    lines: [...pricing.lines, line],
    total: add(pricing.total, surcharge),
  };
}

/* ------------------------------- Cancellation ------------------------------ */

export interface RefundQuote {
  refund: Money;
  penalty: Money;
  refundable: boolean;
}

/**
 * Cancellation policy engine (§7.3): compute the refundable amount given the
 * policy and how far ahead of travel we are.
 */
export function quoteRefund(booking: Booking, nowMs: number): RefundQuote {
  const total = booking.pricing.total;
  const c = booking.cancellation;
  const cur = total.currency;
  if (!c.refundable) {
    return { refund: { amount: 0, currency: cur }, penalty: total, refundable: false };
  }
  const hoursBefore = (new Date(booking.travelDateIso).getTime() - nowMs) / 3600000;
  if (hoursBefore >= c.freeUntilHoursBefore) {
    return { refund: total, penalty: { amount: 0, currency: cur }, refundable: true };
  }
  const penalty = percentOf(total, c.lateCancelPenaltyRate);
  return { refund: { amount: total.amount - penalty.amount, currency: cur }, penalty, refundable: true };
}

/* --------------------------------- Vouchers -------------------------------- */

export function voucherText(b: Booking): string {
  const exp = CURRENCY_EXPONENT[b.pricing.currency];
  return [
    '====================================',
    '  VOYA - Travel voucher / e-ticket',
    '====================================',
    `Reference : ${b.reference}`,
    `Voucher   : ${b.voucherCode}`,
    `Guest     : ${b.guestName}`,
    `Item      : ${b.title}`,
    `Details   : ${b.subtitle}`,
    `Travel    : ${new Date(b.travelDateIso).toDateString()}`,
    `Status    : ${b.status.toUpperCase()}`,
    `Total paid: ${toMajor(b.pricing.total).toFixed(exp)} ${b.pricing.currency}`,
    '',
    'Present this voucher at check-in. Sandbox booking - not valid for travel.',
  ].join('\n');
}

export function icsText(b: Booking): string {
  const dt = new Date(b.travelDateIso);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = new Date(dt.getTime() + 2 * 3600000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Voya//EN',
    'BEGIN:VEVENT',
    `UID:${b.reference}@voya.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(dt)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Voya - ${b.title}`,
    `DESCRIPTION:Booking ${b.reference} / ${b.voucherCode}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
