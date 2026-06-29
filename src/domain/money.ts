/**
 * Money — stored as integer minor units + ISO currency code. Never floats.
 * All arithmetic happens on minor units; formatting is locale-aware.
 *
 * This module is intentionally framework-free so it can be lifted into a
 * NestJS `pricing` service unchanged.
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'BHD' | 'SAR';

export interface Money {
  /** Integer amount in the currency's smallest unit (cents, fils, …). */
  readonly amount: number;
  readonly currency: CurrencyCode;
}

/** Decimal exponent per currency. BHD uses 3 (1 dinar = 1000 fils). */
export const CURRENCY_EXPONENT: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  SAR: 2,
  BHD: 3,
};

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED',
  SAR: 'SAR',
  BHD: 'BHD',
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'AED',
  'BHD',
  'SAR',
];

export function money(amount: number, currency: CurrencyCode): Money {
  return { amount: Math.round(amount), currency };
}

export const zero = (currency: CurrencyCode): Money => money(0, currency);

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function sum(items: Money[], currency: CurrencyCode): Money {
  return items.reduce((acc, m) => add(acc, m), zero(currency));
}

/** Multiply by an integer quantity (e.g. nights, pax). */
export function multiply(a: Money, qty: number): Money {
  return money(a.amount * qty, a.currency);
}

/** Apply a rate (markup %, tax %, …) with bankers-safe half-up rounding. */
export function percentOf(a: Money, rate: number): Money {
  return money(Math.round(a.amount * rate), a.currency);
}

export function negate(a: Money): Money {
  return money(-a.amount, a.currency);
}

export function isZero(a: Money): boolean {
  return a.amount === 0;
}

export function toMajor(m: Money): number {
  return m.amount / 10 ** CURRENCY_EXPONENT[m.currency];
}

/**
 * Locale-aware formatting. Uses Intl when the runtime knows the currency,
 * with a graceful symbol fallback. `locale` should be 'en' or 'ar'.
 */
export function formatMoney(m: Money, locale: string = 'en'): string {
  const exp = CURRENCY_EXPONENT[m.currency];
  const major = toMajor(m);
  const bcp47 = locale === 'ar' ? 'ar' : 'en-US';
  try {
    return new Intl.NumberFormat(bcp47, {
      style: 'currency',
      currency: m.currency,
      minimumFractionDigits: exp,
      maximumFractionDigits: exp,
    }).format(major);
  } catch {
    const num = new Intl.NumberFormat(bcp47, {
      minimumFractionDigits: exp,
      maximumFractionDigits: exp,
    }).format(major);
    return `${CURRENCY_SYMBOL[m.currency]} ${num}`;
  }
}
