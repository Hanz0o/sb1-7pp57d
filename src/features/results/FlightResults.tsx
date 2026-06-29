import { useEffect, useMemo, useState } from 'react';
import { Plane, Clock, Briefcase, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { SearchBar } from '../search/SearchBar';
import { ResultCardSkeleton } from '../../components/ui/Skeleton';
import { searchFlights, cacheOffers, getOffer } from '../../domain/catalog/flights';
import { priceFlight } from '../../domain/pricing';
import { FlightOffer, FlightSearchParams, FlightSelection } from '../../domain/types';
import { Money } from '../../domain/money';

type Sort = 'price' | 'duration';

function fmtTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale === 'ar' ? 'ar' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
function fmtDur(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function FlightResults() {
  const { t, fmt, locale, currency, isMember, coupon, lastFlightSearch, navigate } = useApp();
  const params: FlightSearchParams =
    lastFlightSearch ?? { origin: 'Manama', destination: 'Dubai', departDate: '', adults: 1, cabin: 'economy' };

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [sort, setSort] = useState<Sort>('price');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    searchFlights(params).then((r) => {
      if (!alive) return;
      cacheOffers(r);
      setOffers(r);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.origin, params.destination, params.departDate, params.cabin]);

  const priced = useMemo(
    () =>
      offers.map((o) => {
        const sel: FlightSelection = {
          vertical: 'flights',
          offerId: o.id,
          fareFamilyId: o.fareFamilies[0].id,
          adults: params.adults,
          seats: 0,
          extraBags: 0,
        };
        return { offer: o, pricing: priceFlight(o, sel, { currency, isMember, coupon: coupon ?? undefined }) };
      }),
    [offers, currency, isMember, coupon, params.adults],
  );

  const sorted = useMemo(() => {
    const c = [...priced];
    if (sort === 'price') c.sort((a, b) => a.pricing.total.amount - b.pricing.total.amount);
    if (sort === 'duration') c.sort((a, b) => a.offer.totalDurationMin - b.offer.totalDurationMin);
    return c;
  }, [priced, sort]);

  return (
    <div className="bg-ink-50 pb-16">
      <div className="border-b border-ink-100 bg-white">
        <div className="container-page py-4">
          <SearchBar initialTab="fly" />
        </div>
      </div>

      <div className="container-page mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-ink-900">
            {params.origin} <ArrowRight size={16} className="rtl-flip inline" /> {params.destination} ·{' '}
            <span className="font-medium text-ink-500">
              {loading ? t('common.loading') : `${offers.length} ${t('common.results')}`}
            </span>
          </h1>
          <label className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">
            <SlidersHorizontal size={16} className="text-ink-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-transparent font-semibold text-ink-700 focus:outline-none">
              <option value="price">{t('common.priceLowHigh')}</option>
              <option value="duration">Fastest</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <ResultCardSkeleton key={i} />)
            : sorted.map(({ offer, pricing }) => (
                <FlightCard
                  key={offer.id}
                  offer={offer}
                  total={pricing.total}
                  fmt={fmt}
                  t={t}
                  locale={locale}
                  fmtTime={fmtTime}
                  fmtDur={fmtDur}
                  onSelect={() => {
                    if (!getOffer(offer.id)) cacheOffers([offer]);
                    navigate('flight', { id: offer.id });
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function FlightCard({
  offer,
  total,
  fmt,
  t,
  locale,
  fmtTime: ft,
  fmtDur: fd,
  onSelect,
}: {
  offer: FlightOffer;
  total: Money;
  fmt: (m: Money) => string;
  t: (k: string) => string;
  locale: string;
  fmtTime: (iso: string, locale: string) => string;
  fmtDur: (m: number) => string;
  onSelect: () => void;
}) {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const bags = offer.fareFamilies[0].baggage.checkedBags;
  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex w-44 shrink-0 items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Plane size={18} className="rtl-flip" />
        </span>
        <div>
          <div className="text-sm font-bold text-ink-900">{first.carrierName}</div>
          <div className="text-xs text-ink-400">{first.flightNo}</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="text-center">
          <div className="text-lg font-extrabold text-ink-900">{ft(first.departIso, locale)}</div>
          <div className="text-xs text-ink-400">{first.from}</div>
        </div>
        <div className="flex flex-1 flex-col items-center px-2">
          <div className="text-xs text-ink-400">{fd(offer.totalDurationMin)}</div>
          <div className="relative my-1 h-px w-full bg-ink-200">
            <span className="absolute -top-1 start-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-500" />
          </div>
          <div className={`text-xs font-semibold ${offer.stops === 0 ? 'text-emerald-600' : 'text-ink-500'}`}>
            {offer.stops === 0 ? t('results.stops_0') : `${t('results.stops_1')} · ${offer.segments[0].to}`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-extrabold text-ink-900">{ft(last.arriveIso, locale)}</div>
          <div className="text-xs text-ink-400">{last.to}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-ink-100 pt-3 sm:flex-col sm:items-end sm:border-s sm:border-t-0 sm:ps-5 sm:pt-0">
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <Clock size={12} /> <Briefcase size={12} /> {bags > 0 ? `${bags} ${t('results.checkedBag')}` : t('results.carryOn')}
        </div>
        <div className="text-end">
          <div className="text-xs text-ink-400">{t('results.from')}</div>
          <div className="text-xl font-extrabold text-ink-900">{fmt(total)}</div>
        </div>
        <button onClick={onSelect} className="btn-primary">{t('results.selectFare')}</button>
      </div>
    </div>
  );
}
