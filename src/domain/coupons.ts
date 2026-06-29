/** Promotions / coupons — a tiny stand-in for the admin promo manager (§4.6). */
export interface Coupon {
  code: string;
  descriptionKey: string;
  kind: 'percent' | 'fixed_usd';
  /** percent: 0.10 = 10% off charges. fixed_usd: minor units off, in USD. */
  value: number;
  minSpendUsd?: number;
}

const COUPONS: Coupon[] = [
  { code: 'VOYA10', descriptionKey: 'coupon.voya10', kind: 'percent', value: 0.1 },
  { code: 'SUMMER25', descriptionKey: 'coupon.summer25', kind: 'fixed_usd', value: 2500, minSpendUsd: 20000 },
  { code: 'GCC15', descriptionKey: 'coupon.gcc15', kind: 'percent', value: 0.15, minSpendUsd: 30000 },
];

export function findCoupon(code: string): Coupon | undefined {
  const norm = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === norm);
}

export const SAMPLE_COUPONS = COUPONS;
