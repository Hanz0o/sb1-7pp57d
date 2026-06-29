import { repriceSelection } from '../../domain/pricing';
import { getHotel } from '../../domain/catalog/hotels';
import { getOffer } from '../../domain/catalog/flights';
import { findCoupon } from '../../domain/coupons';
import { CartItem, PriceBreakdown } from '../../domain/types';
import { CurrencyCode } from '../../domain/money';

/** Re-price a cart item against live inventory in the active currency/member/coupon. */
export function repriceCartItem(
  item: CartItem,
  ctx: { currency: CurrencyCode; isMember: boolean; coupon?: ReturnType<typeof findCoupon> },
): PriceBreakdown {
  const lookup =
    item.selection.vertical === 'hotels'
      ? { hotel: getHotel(item.selection.hotelId) }
      : { offer: getOffer(item.selection.offerId) };
  try {
    return repriceSelection(item.selection, lookup, {
      currency: ctx.currency,
      isMember: ctx.isMember,
      coupon: ctx.coupon ?? undefined,
    });
  } catch {
    return item.pricedAt; // inventory reference gone (e.g. flight cache cleared) — fall back
  }
}
