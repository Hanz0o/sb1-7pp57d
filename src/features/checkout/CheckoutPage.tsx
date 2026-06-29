import { useEffect, useMemo, useState } from 'react';
import { Lock, CreditCard, ShieldCheck, AlertTriangle, Loader2, Check, Award } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { Modal } from '../../components/ui/Modal';
import { repriceCartItem } from '../cart/reprice';
import { buildLedger } from '../../domain/pricing';
import { sum } from '../../domain/money';
import { availabilitySurcharge, applySurcharge, makeReference, makeVoucher } from '../../domain/booking';
import { getHotel } from '../../domain/catalog/hotels';
import { Booking, CartItem, HotelSelection, PriceBreakdown } from '../../domain/types';

type Phase = 'revalidating' | 'ready' | 'processing';

export function CheckoutPage() {
  const { t, fmt, currency, isMember, coupon, user, cart, clearCart, addBooking, navigate, toast } = useApp();
  const [phase, setPhase] = useState<Phase>('revalidating');
  const [show3DS, setShow3DS] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const [first, setFirst] = useState(user?.name ?? '');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [exp, setExp] = useState('12 / 28');
  const [cvc, setCvc] = useState('123');

  // Live re-price each item, then apply the price-change guard (supplier re-check).
  const items = useMemo(() => {
    return cart.map((item) => {
      const live = repriceCartItem(item, { currency, isMember, coupon: coupon ?? undefined });
      const surcharge = availabilitySurcharge(item.id, live.total);
      return { item, pricing: applySurcharge(live, surcharge), changed: surcharge.amount > 0 };
    });
  }, [cart, currency, isMember, coupon]);

  const orderTotal = useMemo(() => sum(items.map((i) => i.pricing.total), currency), [items, currency]);
  const priceChanged = items.some((i) => i.changed);

  // Simulate the supplier re-validation round-trip.
  useEffect(() => {
    setPhase('revalidating');
    const id = setTimeout(() => setPhase('ready'), 1100);
    return () => clearTimeout(id);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="container-page py-24 text-center text-ink-500">
        {t('cart.empty')}{' '}
        <button onClick={() => navigate('searchHotels')} className="font-semibold text-brand-600">{t('cart.startSearching')}</button>
      </div>
    );
  }

  const canPay = phase === 'ready' && (!priceChanged || acknowledged) && first && last && email.includes('@');

  const confirmPayment = () => {
    // 3DS approved → capture → issue bookings + balanced ledger + voucher.
    setShow3DS(false);
    setPhase('processing');
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      const created: Booking[] = items.map(({ item, pricing }) => buildBooking(item, pricing, nowIso, `${first} ${last}`, email));
      created.forEach(addBooking);
      clearCart();
      toast(t('toast.booked'), 'success');
      navigate('confirm', { id: created[0].id });
      // stash created bookings is unnecessary — they live in the store now
    }, 1300);
  };

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Forms */}
        <div className="space-y-5 lg:col-span-2">
          {priceChanged && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">{t('checkout.priceChangedUp', { amount: fmt(orderTotal) })}</p>
                {!acknowledged && (
                  <button onClick={() => setAcknowledged(true)} className="btn bg-amber-500 text-white hover:bg-amber-600 mt-2 py-1.5">
                    <Check size={14} /> {t('common.continue')}
                  </button>
                )}
              </div>
            </div>
          )}

          {isMember && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700">
              <Award size={16} /> {t('checkout.member')}
            </div>
          )}

          {/* Contact */}
          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold text-ink-900">{t('checkout.contact')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={t('checkout.firstName')} value={first} onChange={setFirst} />
              <Input label={t('checkout.lastName')} value={last} onChange={setLast} />
              <Input label={t('checkout.email')} value={email} onChange={setEmail} type="email" />
              <Input label={t('checkout.phone')} value={phone} onChange={setPhone} type="tel" placeholder="+973 …" />
            </div>
          </section>

          {/* Payment */}
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">{t('checkout.payment')}</h2>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Lock size={13} /> Secure</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">{t('checkout.cardNumber')}</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input value={card} onChange={(e) => setCard(e.target.value)} className="input ps-9 tracking-widest" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('checkout.expiry')} value={exp} onChange={setExp} />
                <Input label={t('checkout.cvc')} value={cvc} onChange={setCvc} />
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> {t('checkout.securePayment')}</p>
          </section>
        </div>

        {/* Summary + pay */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 card p-5">
            <h3 className="mb-3 font-bold text-ink-900">{t('checkout.orderSummary')}</h3>
            {phase === 'revalidating' ? (
              <div className="flex items-center gap-2 py-6 text-sm text-ink-500">
                <Loader2 size={16} className="animate-spin" /> {t('checkout.repricing')}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map(({ item, pricing }) => (
                    <SummaryItem key={item.id} item={item} pricing={pricing} fmt={fmt} t={t} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="font-bold text-ink-900">{t('common.total')}</span>
                  <span className="text-xl font-extrabold text-ink-900">{fmt(orderTotal)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-400">{t('common.taxesIncluded')}</p>
              </>
            )}

            <button onClick={() => setShow3DS(true)} disabled={!canPay} className="btn-primary mt-4 w-full text-base">
              {phase === 'processing' ? (
                <><Loader2 size={18} className="animate-spin" /> {t('checkout.processing')}</>
              ) : (
                <><Lock size={16} /> {t('checkout.payNow')} · {fmt(orderTotal)}</>
              )}
            </button>
            {!user && <p className="mt-2 text-center text-xs text-ink-400">{t('checkout.guestCheckout')}</p>}
          </div>
        </aside>
      </div>

      {/* 3-D Secure */}
      <Modal open={show3DS} onClose={() => setShow3DS(false)} title={t('checkout.threeDS')} maxWidth="max-w-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ShieldCheck size={28} />
          </div>
          <p className="text-sm text-ink-600">{t('checkout.threeDSBody', { amount: fmt(orderTotal) })}</p>
          <div className="my-4 flex justify-center gap-2">
            {['•', '•', '•', '•', '•', '•'].map((d, i) => (
              <span key={i} className="flex h-10 w-8 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-lg font-bold text-ink-700">{d}</span>
            ))}
          </div>
          <button onClick={confirmPayment} className="btn-primary w-full">{t('checkout.approve')}</button>
          <p className="mt-3 text-xs text-ink-400">Sandbox · Visa •••• 4242 · no real charge</p>
        </div>
      </Modal>
    </div>
  );
}

function buildBooking(item: CartItem, pricing: PriceBreakdown, nowIso: string, guestName: string, guestEmail: string): Booking {
  // Determine travel date + cancellation policy from the selection.
  let travelDateIso = nowIso;
  let cancellation = { freeUntilHoursBefore: 24, lateCancelPenaltyRate: 0.5, refundable: true };
  if (item.selection.vertical === 'hotels') {
    const sel = item.selection as HotelSelection;
    travelDateIso = sel.checkIn ? new Date(sel.checkIn).toISOString() : nowIso;
    const hotel = getHotel(sel.hotelId);
    const plan = hotel?.rooms.find((r) => r.id === sel.roomTypeId)?.ratePlans.find((p) => p.id === sel.ratePlanId);
    if (plan) cancellation = plan.cancellation;
  } else {
    cancellation = { freeUntilHoursBefore: 0, lateCancelPenaltyRate: 1, refundable: false };
  }
  return {
    id: `bk_${Math.random().toString(36).slice(2, 9)}`,
    reference: makeReference(),
    status: 'confirmed',
    vertical: item.vertical,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    createdIso: nowIso,
    travelDateIso,
    selection: item.selection,
    pricing,
    voucherCode: makeVoucher(item.vertical),
    cancellation,
    ledger: buildLedger(pricing, nowIso),
    guestName,
    guestEmail,
  };
}

function SummaryItem({ item, pricing, fmt, t }: { item: CartItem; pricing: PriceBreakdown; fmt: (m: import('../../domain/money').Money) => string; t: (k: string) => string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-ink-800">{item.title}</span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-ink-900">{fmt(pricing.total)}</span>
      </div>
      <span className="text-xs text-ink-400">{item.subtitle}</span>
      {pricing.lines.some((l) => l.key === 'availability') && (
        <span className="ms-2 text-xs font-medium text-amber-600">· {t('price.availabilityAdj')}</span>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="input" />
    </div>
  );
}
