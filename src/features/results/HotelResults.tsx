import { useEffect, useMemo, useState } from 'react';
import { MapPin, Wifi, Star, SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { SearchBar } from '../search/SearchBar';
import { ResultCardSkeleton } from '../../components/ui/Skeleton';
import { Stars, ReviewBadge } from '../../components/ui/Stars';
import { searchHotels, HotelSearchResult } from '../../domain/catalog/hotels';
import { priceHotel } from '../../domain/pricing';
import { HotelSearchParams, HotelSelection, PriceBreakdown } from '../../domain/types';

type Sort = 'recommended' | 'price' | 'rating';

function nightsBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function HotelResults() {
  const { t, fmt, currency, isMember, coupon, lastHotelSearch, navigate } = useApp();
  const params: HotelSearchParams =
    lastHotelSearch ?? { destination: 'Dubai', checkIn: '', checkOut: '', adults: 2, rooms: 1 };
  const nights = params.checkIn && params.checkOut ? nightsBetween(params.checkIn, params.checkOut) : 3;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<HotelSearchResult[]>([]);
  const [sort, setSort] = useState<Sort>('recommended');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    searchHotels(params).then((r) => {
      if (alive) {
        setResults(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.destination, nights]);

  // Lead price per hotel: cheapest rate plan over the stay.
  const priced = useMemo(() => {
    return results.map((r) => {
      const cheapest = r.hotel.rooms
        .flatMap((room) => room.ratePlans.map((p) => ({ room, p })))
        .filter(({ p }) => isMember || !p.membersOnly)
        .sort((a, b) => a.p.netNightlyUsd - b.p.netNightlyUsd)[0];
      const sel: HotelSelection = {
        vertical: 'hotels',
        hotelId: r.hotel.id,
        roomTypeId: cheapest.room.id,
        ratePlanId: cheapest.p.id,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
        rooms: params.rooms,
        adults: params.adults,
      };
      const pricing: PriceBreakdown = priceHotel(r.hotel, sel, { currency, isMember, coupon: coupon ?? undefined });
      return { ...r, pricing };
    });
  }, [results, currency, isMember, coupon, nights, params.checkIn, params.checkOut, params.rooms, params.adults]);

  const sorted = useMemo(() => {
    const copy = [...priced];
    if (sort === 'price') copy.sort((a, b) => a.pricing.total.amount - b.pricing.total.amount);
    if (sort === 'rating') copy.sort((a, b) => b.hotel.reviewScore - a.hotel.reviewScore);
    return copy;
  }, [priced, sort]);

  return (
    <div className="bg-ink-50 pb-16">
      <div className="border-b border-ink-100 bg-white">
        <div className="container-page py-4">
          <SearchBar initialTab="stay" />
        </div>
      </div>

      <div className="container-page mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-ink-900">
            {params.destination} ·{' '}
            <span className="font-medium text-ink-500">
              {loading ? t('common.loading') : `${results.length} ${t('common.results')} · ${nights} ${nights === 1 ? t('common.night') : t('common.nights')}`}
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMap((s) => !s)} className={`btn-secondary ${showMap ? 'border-brand-300 text-brand-700' : ''}`}>
              <MapIcon size={16} /> {t('results.mapView')}
            </button>
            <label className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">
              <SlidersHorizontal size={16} className="text-ink-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-transparent font-semibold text-ink-700 focus:outline-none">
                <option value="recommended">{t('common.recommended')}</option>
                <option value="price">{t('common.priceLowHigh')}</option>
                <option value="rating">{t('common.rating')}</option>
              </select>
            </label>
          </div>
        </div>

        {showMap && (
          <div className="mb-4 grid h-56 place-items-center overflow-hidden rounded-2xl border border-ink-200 bg-[radial-gradient(circle_at_30%_30%,#dbe6ff,transparent),radial-gradient(circle_at_70%_60%,#eef5ff,transparent)] text-center">
            <div className="text-sm text-ink-500">
              <MapPin className="mx-auto mb-2 text-brand-500" />
              Map view · {sorted.length} properties around {params.destination}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ResultCardSkeleton key={i} />)
            : sorted.length === 0
            ? <EmptyState text={t('common.emptyResults')} />
            : sorted.map((r) => (
                <HotelCard
                  key={r.hotel.id}
                  data={r}
                  nights={nights}
                  fmt={fmt}
                  t={t}
                  onView={() => navigate('hotel', { id: r.hotel.id })}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function HotelCard({
  data,
  nights,
  fmt,
  t,
  onView,
}: {
  data: HotelSearchResult & { pricing: PriceBreakdown };
  nights: number;
  fmt: (m: import('../../domain/money').Money) => string;
  t: (k: string) => string;
  onView: () => void;
}) {
  const h = data.hotel;
  const perNight = { amount: Math.round(data.pricing.total.amount / nights), currency: data.pricing.currency };
  return (
    <div className="card group flex flex-col overflow-hidden sm:flex-row">
      <div className="relative h-52 w-full overflow-hidden sm:h-auto sm:w-64 sm:shrink-0">
        <img src={h.images[0]} alt={h.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute start-3 top-3 chip bg-white/95"><Star size={12} className="text-amber-400" fill="currentColor" strokeWidth={0} /> {h.starRating}.0</span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1 sm:pe-6">
          <div className="flex items-center gap-2">
            <Stars rating={h.starRating} />
          </div>
          <h3 className="mt-1 text-lg font-bold text-ink-900">{h.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
            <MapPin size={14} /> {h.address}
          </p>
          <div className="mt-2">
            <ReviewBadge score={h.reviewScore} label={`${t('results.reviewScore')} · ${h.reviewCount.toLocaleString()}`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {h.amenities.slice(0, 4).map((a) => (
              <span key={a} className="chip"><Wifi size={11} /> {a}</span>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-emerald-600">{t('common.freeCancellation')} · {t('common.taxesIncluded')}</p>
        </div>
        <div className="mt-4 flex shrink-0 flex-col items-end justify-end border-t border-ink-100 pt-3 sm:mt-0 sm:border-s sm:border-t-0 sm:ps-6 sm:pt-0">
          <span className="text-xs text-ink-400">{nights} {nights === 1 ? t('common.night') : t('common.nights')}, {t('common.total')}</span>
          <span className="text-2xl font-extrabold text-ink-900">{fmt(data.pricing.total)}</span>
          <span className="text-xs text-ink-400">{fmt(perNight)} {t('common.perNight')}</span>
          <button onClick={onView} className="btn-primary mt-3">{t('common.viewDetails')}</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card grid place-items-center py-16 text-center">
      <MapPin className="mb-3 text-ink-300" size={32} />
      <p className="text-ink-500">{text}</p>
    </div>
  );
}
