import { useMemo, useState } from 'react';
import { Plane, ArrowLeft, Check, Briefcase, Armchair, RefreshCw, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { PriceBreakdownView } from '../../components/ui/PriceBreakdownView';
import { getOffer } from '../../domain/catalog/flights';
import { priceFlight, SEAT_FEE_USD, BAG_FEE_USD } from '../../domain/pricing';
import { mockFxProvider } from '../../domain/fx';
import { FlightSelection, FareFamily, CartItem } from '../../domain/types';

export function FlightDetail() {
  const { t, fmt, locale, currency, isMember, coupon, route, navigate, addToCart, lastFlightSearch } = useApp();
  const offer = getOffer(route.params.id);
  const adults = lastFlightSearch?.adults ?? 1;

  const [fareId, setFareId] = useState(offer?.fareFamilies[1]?.id ?? offer?.fareFamilies[0]?.id ?? '');
  const [seats, setSeats] = useState(0);
  const [extraBags, setExtraBags] = useState(0);

  const selection: FlightSelection | null = useMemo(() => {
    if (!offer) return null;
    return { vertical: 'flights', offerId: offer.id, fareFamilyId: fareId, adults, seats, extraBags };
  }, [offer, fareId, adults, seats, extraBags]);

  const pricing = useMemo(() => {
    if (!offer || !selection) return null;
    try {
      return priceFlight(offer, selection, { currency, isMember, coupon: coupon ?? undefined });
    } catch {
      return null;
    }
  }, [offer, selection, currency, isMember, coupon]);

  if (!offer) {
    return (
      <div className="container-page py-20 text-center text-ink-500">
        Offer expired. <button onClick={() => navigate('searchFlights')} className="font-semibold text-brand-600">Search again</button>
      </div>
    );
  }

  const seatFee = mockFxProvider.convert({ amount: SEAT_FEE_USD, currency: 'USD' }, currency);
  const bagFee = mockFxProvider.convert({ amount: BAG_FEE_USD, currency: 'USD' }, currency);
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];

  const addToCartNow = () => {
    if (!pricing || !selection) return;
    const item: CartItem = {
      id: `ci_${Date.now()}`,
      vertical: 'flights',
      title: `${first.fromCity} → ${last.toCity}`,
      subtitle: `${first.carrierName} · ${offer.stops === 0 ? t('results.stops_0') : t('results.stops_1')}`,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      selection,
      pricedAt: pricing,
    };
    addToCart(item);
    navigate('cart');
  };

  const time = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar' : 'en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

  return (
    <div className="container-page py-6">
      <button onClick={() => navigate('searchFlights')} className="btn-ghost mb-3 ps-0">
        <ArrowLeft size={16} className="rtl-flip" /> {t('common.back')}
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Itinerary */}
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Plane size={20} className="rtl-flip" /></span>
              <div>
                <h1 className="text-xl font-extrabold text-ink-900">{first.fromCity} → {last.toCity}</h1>
                <p className="text-sm text-ink-400">{first.carrierName} · {Math.floor(offer.totalDurationMin / 60)}h {offer.totalDurationMin % 60}m</p>
              </div>
            </div>
            <ol className="mt-5 space-y-4">
              {offer.segments.map((s, i) => (
                <li key={i} className="relative ps-6">
                  <span className="absolute start-0 top-1.5 h-3 w-3 rounded-full border-2 border-brand-500 bg-white" />
                  {i < offer.segments.length - 1 && <span className="absolute start-[5px] top-5 h-full w-px bg-ink-200" />}
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="font-bold text-ink-900">{s.from} → {s.to}</div>
                      <div className="text-sm text-ink-500">{time(s.departIso)} — {time(s.arriveIso)}</div>
                    </div>
                    <span className="chip">{s.carrierName} {s.flightNo}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Fare families */}
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">{t('detail.chooseFare')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {offer.fareFamilies.map((f) => (
              <FareCard key={f.id} fare={f} selected={fareId === f.id} onSelect={() => setFareId(f.id)} fmt={fmt} currency={currency} adults={adults} t={t} />
            ))}
          </div>

          {/* Ancillaries */}
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">{t('detail.seats')} & {t('detail.extraBags')}</h2>
          <div className="mt-4 space-y-3">
            <AncillaryRow icon={<Armchair size={18} />} title={t('detail.seats')} price={`${fmt(seatFee)} / seat`} value={seats} setValue={setSeats} max={adults * 4} />
            <AncillaryRow icon={<Briefcase size={18} />} title={t('detail.extraBags')} price={`${fmt(bagFee)} / bag`} value={extraBags} setValue={setExtraBags} max={6} />
          </div>
        </div>

        {/* Price panel */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 card p-5">
            <div className="mb-3 text-sm font-semibold text-ink-500">{adults} {t('search.passengers')}</div>
            {pricing && <PriceBreakdownView pricing={pricing} />}
            <button onClick={addToCartNow} className="btn-primary mt-4 w-full text-base">{t('detail.addToCart')}</button>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> {t('cart.priceGuard')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FareCard({ fare, selected, onSelect, fmt, currency, adults, t }: { fare: FareFamily; selected: boolean; onSelect: () => void; fmt: (m: import('../../domain/money').Money) => string; currency: import('../../domain/money').CurrencyCode; adults: number; t: (k: string) => string }) {
  const price = mockFxProvider.convert({ amount: fare.netFareUsd * adults, currency: 'USD' }, currency);
  return (
    <button onClick={onSelect} className={`card flex flex-col p-4 text-start transition ${selected ? 'ring-2 ring-brand-500' : 'hover:border-brand-200'}`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink-900">{fare.name}</span>
        {selected && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={12} /></span>}
      </div>
      <div className="mt-2 space-y-1 text-xs text-ink-500">
        <div className="flex items-center gap-1.5"><Briefcase size={12} /> {fare.baggage.checkedBags > 0 ? `${fare.baggage.checkedBags} ${fare.baggage.checkedBags === 1 ? t('results.checkedBag') : t('results.checkedBags')}` : t('results.carryOn')}</div>
        <div className={`flex items-center gap-1.5 ${fare.changeable ? 'text-emerald-600' : 'text-ink-400'}`}><RefreshCw size={12} /> {t('results.changeable')}</div>
        <div className={`flex items-center gap-1.5 ${fare.refundable ? 'text-emerald-600' : 'text-ink-400'}`}><ShieldCheck size={12} /> {t('results.refundable')}</div>
      </div>
      <div className="mt-3 text-lg font-extrabold text-ink-900">{fmt(price)}</div>
      <div className="text-[11px] text-ink-400">+ {t('price.taxes')}</div>
    </button>
  );
}

function AncillaryRow({ icon, title, price, value, setValue, max }: { icon: React.ReactNode; title: string; price: string; value: number; setValue: (n: number) => void; max: number }) {
  return (
    <div className="card flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600">{icon}</span>
        <div>
          <div className="font-semibold text-ink-900">{title}</div>
          <div className="text-xs text-ink-400">{price}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setValue(Math.max(0, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-100"><Minus size={14} /></button>
        <span className="w-4 text-center font-bold tabular-nums">{value}</span>
        <button onClick={() => setValue(Math.min(max, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-100"><Plus size={14} /></button>
      </div>
    </div>
  );
}
