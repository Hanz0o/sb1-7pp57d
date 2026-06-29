import { useMemo, useState } from 'react';
import { MapPin, Check, Users, BedDouble, Ruler, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { Stars, ReviewBadge } from '../../components/ui/Stars';
import { PriceBreakdownView } from '../../components/ui/PriceBreakdownView';
import { getHotel } from '../../domain/catalog/hotels';
import { mockFxProvider } from '../../domain/fx';
import { priceHotel } from '../../domain/pricing';
import { HotelSelection, RatePlan, CartItem } from '../../domain/types';

const REVIEWS = [
  { name: 'Sara A.', score: 9.6, text: 'Spotless room, incredible views and the staff went above and beyond.' },
  { name: 'James P.', score: 9.0, text: 'Great location, walkable to everything. Breakfast was excellent.' },
  { name: 'Noor H.', score: 8.8, text: 'Comfortable beds and quiet despite being central. Would return.' },
];

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 3;
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function HotelDetail() {
  const { t, fmt, currency, isMember, coupon, route, navigate, addToCart, lastHotelSearch } = useApp();
  const hotel = getHotel(route.params.id);
  const search = lastHotelSearch;
  const nights = nightsBetween(search?.checkIn ?? '', search?.checkOut ?? '');

  const [activeImg, setActiveImg] = useState(0);
  const firstRoom = hotel?.rooms[0];
  const defaultPlan = firstRoom?.ratePlans.find((p) => isMember || !p.membersOnly) ?? firstRoom?.ratePlans[0];
  const [sel, setSel] = useState<{ roomId: string; planId: string }>({
    roomId: firstRoom?.id ?? '',
    planId: defaultPlan?.id ?? '',
  });

  const selection: HotelSelection | null = useMemo(() => {
    if (!hotel) return null;
    return {
      vertical: 'hotels',
      hotelId: hotel.id,
      roomTypeId: sel.roomId,
      ratePlanId: sel.planId,
      checkIn: search?.checkIn ?? '',
      checkOut: search?.checkOut ?? '',
      nights,
      rooms: search?.rooms ?? 1,
      adults: search?.adults ?? 2,
    };
  }, [hotel, sel, search, nights]);

  const pricing = useMemo(() => {
    if (!hotel || !selection) return null;
    try {
      return priceHotel(hotel, selection, { currency, isMember, coupon: coupon ?? undefined });
    } catch {
      return null;
    }
  }, [hotel, selection, currency, isMember, coupon]);

  if (!hotel) {
    return (
      <div className="container-page py-20 text-center text-ink-500">
        Property not found. <button onClick={() => navigate('searchHotels')} className="font-semibold text-brand-600">Back to search</button>
      </div>
    );
  }

  const addToCartNow = () => {
    if (!pricing || !selection) return;
    const item: CartItem = {
      id: `ci_${Date.now()}`,
      vertical: 'hotels',
      title: hotel.name,
      subtitle: `${hotel.city} · ${nights} ${nights === 1 ? t('common.night') : t('common.nights')}`,
      image: hotel.images[0],
      selection,
      pricedAt: pricing,
    };
    addToCart(item);
    navigate('cart');
  };

  return (
    <div className="container-page py-6">
      <button onClick={() => navigate('searchHotels')} className="btn-ghost mb-3 ps-0">
        <ArrowLeft size={16} className="rtl-flip" /> {t('common.back')}
      </button>

      {/* Gallery */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div className="relative sm:col-span-3">
          <img src={hotel.images[activeImg]} alt={hotel.name} className="h-72 w-full rounded-2xl object-cover sm:h-[26rem]" />
        </div>
        <div className="flex gap-2 sm:flex-col">
          {hotel.images.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)} className={`overflow-hidden rounded-xl ${activeImg === i ? 'ring-2 ring-brand-500' : ''}`}>
              <img src={img} alt="" className="h-20 w-full object-cover sm:h-[8.1rem]" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Stars rating={hotel.starRating} size={16} />
            <span className="text-sm text-ink-400">· {hotel.city}, {hotel.country}</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-ink-900">{hotel.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500"><MapPin size={14} /> {hotel.address}</p>
          <div className="mt-3"><ReviewBadge score={hotel.reviewScore} label={`${t('results.reviewScore')} · ${hotel.reviewCount.toLocaleString()} reviews`} /></div>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-ink-900">{t('detail.amenities')}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {hotel.amenities.map((a) => (
                <span key={a} className="flex items-center gap-2 text-sm text-ink-600"><Check size={15} className="text-emerald-500" /> {a}</span>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-ink-900">{t('detail.location')}</h2>
            <div className="mt-3 grid h-44 place-items-center overflow-hidden rounded-2xl border border-ink-200 bg-[radial-gradient(circle_at_30%_30%,#dbe6ff,transparent),radial-gradient(circle_at_70%_60%,#eef5ff,transparent)]">
              <div className="text-center text-sm text-ink-500"><MapPin className="mx-auto mb-1 text-brand-500" /> {hotel.lat.toFixed(2)}, {hotel.lng.toFixed(2)}</div>
            </div>
            <div className="mt-3 space-y-1">
              {hotel.landmarks.map((l) => (
                <div key={l.name} className="flex items-center justify-between text-sm text-ink-600">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-ink-400" /> {l.name}</span>
                  <span className="text-ink-400">{l.distanceKm} km</span>
                </div>
              ))}
            </div>
          </section>

          {/* Rooms */}
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-ink-900">{t('detail.chooseRoom')}</h2>
            <div className="mt-4 space-y-4">
              {hotel.rooms.map((room) => (
                <div key={room.id} className="card overflow-hidden">
                  <div className="border-b border-ink-100 bg-ink-50/60 p-4">
                    <h3 className="font-bold text-ink-900">{room.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Users size={13} /> {t('detail.maxOccupancy')} {room.maxOccupancy}</span>
                      <span className="flex items-center gap-1"><BedDouble size={13} /> {room.beds}</span>
                      <span className="flex items-center gap-1"><Ruler size={13} /> {room.sizeSqm} m²</span>
                    </div>
                  </div>
                  <div className="divide-y divide-ink-100">
                    {room.ratePlans
                      .filter((p) => isMember || !p.membersOnly)
                      .map((plan) => (
                        <RatePlanRow
                          key={plan.id}
                          plan={plan}
                          nights={nights}
                          rooms={search?.rooms ?? 1}
                          selected={sel.roomId === room.id && sel.planId === plan.id}
                          onSelect={() => setSel({ roomId: room.id, planId: plan.id })}
                          fmt={fmt}
                          currency={currency}
                          t={t}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-ink-900">{t('detail.reviews')}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {REVIEWS.map((r) => (
                <div key={r.name} className="card p-4">
                  <ReviewBadge score={r.score} label={r.name} />
                  <p className="mt-2 text-sm text-ink-600">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: sticky price panel */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-500">{nights} {nights === 1 ? t('common.night') : t('common.nights')}</span>
              {isMember && <span className="chip border-brand-200 bg-brand-50 text-brand-700">{t('checkout.member')}</span>}
            </div>
            {pricing && <PriceBreakdownView pricing={pricing} />}
            <button onClick={addToCartNow} className="btn-primary mt-4 w-full text-base">{t('detail.addToCart')}</button>
            <div className="mt-3 space-y-1.5 text-xs text-ink-400">
              <p className="flex items-center gap-1.5"><ShieldCheck size={13} /> {t('cart.priceGuard')}</p>
              <p className="flex items-center gap-1.5"><Lock size={13} /> {t('checkout.securePayment')}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RatePlanRow({
  plan,
  nights,
  rooms,
  selected,
  onSelect,
  fmt,
  currency,
  t,
}: {
  plan: RatePlan;
  nights: number;
  rooms: number;
  selected: boolean;
  onSelect: () => void;
  fmt: (m: import('../../domain/money').Money) => string;
  currency: import('../../domain/money').CurrencyCode;
  t: (k: string) => string;
}) {
  // Indicative per-stay charge in the display currency (full total shown in the side panel).
  const indicative = mockFxProvider.convert({ amount: plan.netNightlyUsd * nights * rooms, currency: 'USD' }, currency);
  return (
    <button onClick={onSelect} className={`flex w-full items-center justify-between gap-4 p-4 text-start transition ${selected ? 'bg-brand-50/60' : 'hover:bg-ink-50'}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300'}`}>
            {selected && <Check size={12} className="text-white" />}
          </span>
          <span className="font-semibold text-ink-900">{plan.name}</span>
        </div>
        <div className="mt-1 ps-7 text-xs">
          {plan.cancellation.refundable ? (
            <span className="font-semibold text-emerald-600">{t('common.freeCancellation')}</span>
          ) : (
            <span className="text-ink-400">{t('common.nonRefundable')}</span>
          )}
          {plan.membersOnly && <span className="ms-2 text-brand-600">· {t('checkout.member')}</span>}
        </div>
      </div>
      <div className="text-end">
        <div className="text-xs text-ink-400">{nights}n · {rooms} {t('common.rooms')}</div>
        <div className="text-lg font-extrabold text-ink-900">{fmt(indicative)}</div>
        <div className="text-[11px] text-ink-400">+ {t('price.taxes')}</div>
      </div>
    </button>
  );
}
