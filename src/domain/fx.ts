/**
 * FX — mock FxRate provider. Rates are quoted as "units of currency per 1 USD"
 * (USD is the base settlement currency per CONFIG.default_currency).
 *
 * Behind a clean interface so a live provider (e.g. an FxRate service) can be
 * dropped in without touching the pricing engine.
 */
import { CurrencyCode, Money, money, CURRENCY_EXPONENT } from './money';

export interface FxRate {
  currency: CurrencyCode;
  perUsd: number;
  asOf: string;
}

const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.6725, // pegged
  SAR: 3.75, // pegged
  BHD: 0.376, // pegged
};

export const FX_AS_OF = '2026-06-28T00:00:00Z';

export interface FxProvider {
  rate(currency: CurrencyCode): FxRate;
  /** Convert a Money value into the target currency, returning integer minor units. */
  convert(from: Money, to: CurrencyCode): Money;
}

export const mockFxProvider: FxProvider = {
  rate(currency) {
    return { currency, perUsd: RATES[currency], asOf: FX_AS_OF };
  },
  convert(from, to) {
    if (from.currency === to) return from;
    // Normalise to USD major, then to target, respecting each currency exponent.
    const fromExp = CURRENCY_EXPONENT[from.currency];
    const toExp = CURRENCY_EXPONENT[to];
    const usdMajor = from.amount / 10 ** fromExp / RATES[from.currency];
    const targetMajor = usdMajor * RATES[to];
    return money(Math.round(targetMajor * 10 ** toExp), to);
  },
};
