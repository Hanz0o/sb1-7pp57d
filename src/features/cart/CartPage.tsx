import { useMemo, useState } from 'react';
import { Trash2, Tag, ShoppingBag, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { sum } from '../../domain/money';
import { findCoupon, SAMPLE_COUPONS } from '../../domain/coupons';
import { repriceCartItem } from './reprice';

export function CartPage() {
  const { t, fmt, currency, isMember, coupon, setCoupon, cart, removeFromCart, navigate, toast } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);

  const items = useMemo(
    () => cart.map((item) => ({ item, pricing: repriceCartItem(item, { currency, isMember, coupon: coupon ?? undefined }) })),
    [cart, currency, isMember, coupon],
  );

  const orderTotal = useMemo(
    () => sum(items.map((i) => i.pricing.total), currency),
    [items, currency],
  );
  const totalPoints = items.reduce((acc, i) => acc + i.pricing.pointsEarned, 0);

  const applyCoupon = () => {
    const c = findCoupon(code);
    if (c) {
      setCoupon(c);
      setErr(false);
      toast(t('toast.couponApplied'), 'success');
    } else {
      setErr(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-page grid place-items-center py-24 text-center">
        <ShoppingBag size={48} className="mb-4 text-ink-300" />
        <h1 className="text-2xl font-extrabold text-ink-900">{t('cart.empty')}</h1>
        <button onClick={() => navigate('searchHotels')} className="btn-primary mt-5">{t('cart.startSearching')}</button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900">{t('cart.title')}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ item, pricing }) => (
            <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
              <img src={item.image} alt="" className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-44" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="chip mb-1">{item.vertical === 'hotels' ? t('nav.hotels') : t('nav.flights')}</span>
                    <h3 className="text-lg font-bold text-ink-900">{item.title}</h3>
                    <p className="text-sm text-ink-500">{item.subtitle}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-500" aria-label={t('common.remove')}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <span className="text-xs text-ink-400">{t('cart.itemTotal')}</span>
                  <span className="text-lg font-extrabold text-ink-900">{fmt(pricing.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Coupon */}
            <div className="card p-5">
              <label className="label flex items-center gap-1.5"><Tag size={13} /> {t('cart.coupon')}</label>
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-700"><Check size={15} /> {coupon.code}</span>
                  <button onClick={() => { setCoupon(null); setCode(''); }} className="text-xs font-semibold text-ink-500 hover:text-ink-800">{t('common.remove')}</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input value={code} onChange={(e) => { setCode(e.target.value); setErr(false); }} placeholder="VOYA10" className="input uppercase" />
                    <button onClick={applyCoupon} className="btn-secondary shrink-0">{t('cart.applyCoupon')}</button>
                  </div>
                  {err && <p className="mt-1.5 text-xs font-medium text-red-500">{t('cart.couponInvalid')}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SAMPLE_COUPONS.map((c) => (
                      <button key={c.code} onClick={() => { setCoupon(c); toast(t('toast.couponApplied')); }} className="chip hover:border-brand-300 hover:text-brand-700">{c.code}</button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Order summary */}
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-ink-900">{t('checkout.orderSummary')}</h3>
              <div className="space-y-2.5 text-sm">
                {items.map(({ item, pricing }) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink-600">{item.title}</span>
                    <span className="shrink-0 font-medium tabular-nums text-ink-800">{fmt(pricing.total)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="font-bold text-ink-900">{t('cart.orderTotal')}</span>
                <span className="text-xl font-extrabold text-ink-900">{fmt(orderTotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-400">{t('common.taxesIncluded')}</p>
              {totalPoints > 0 && (
                <p className="mt-1 text-xs font-semibold text-brand-700">+ {totalPoints.toLocaleString()} {t('price.points')}</p>
              )}
              <button onClick={() => navigate('checkout')} className="btn-primary mt-4 w-full text-base">
                {t('cart.checkout')} <ArrowRight size={18} className="rtl-flip" />
              </button>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> {t('cart.priceGuard')}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
