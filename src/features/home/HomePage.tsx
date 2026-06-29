import { ShieldCheck, BadgePercent, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { SearchBar } from '../search/SearchBar';

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const TRENDING = [
  { name: 'Dubai', country: 'United Arab Emirates', img: IMG('photo-1512453979798-5ea266f8880c'), price: 'from $112' },
  { name: 'Manama', country: 'Bahrain', img: IMG('photo-1578895101408-1a36b834405b'), price: 'from $74' },
  { name: 'Paris', country: 'France', img: IMG('photo-1502602898657-3e91760cbb34'), price: 'from $130' },
  { name: 'Maldives', country: 'Maldives', img: IMG('photo-1514282401047-d79a71a590e8'), price: 'from $340' },
  { name: 'London', country: 'United Kingdom', img: IMG('photo-1513635269975-59663e0ac1ad'), price: 'from $118' },
  { name: 'Istanbul', country: 'Türkiye', img: IMG('photo-1524231757912-21f4fe3a7200'), price: 'from $88' },
];

export function HomePage() {
  const { t, navigate, setLastHotelSearch } = useApp();

  const goDestination = (name: string) => {
    setLastHotelSearch({
      destination: name,
      checkIn: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      checkOut: new Date(Date.now() + 17 * 86400000).toISOString().slice(0, 10),
      adults: 2,
      rooms: 1,
    });
    navigate('searchHotels', { d: name });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/50 to-ink-950/30" />
        </div>
        <div className="container-page relative pb-28 pt-20 sm:pt-28">
          <div className="max-w-2xl animate-fade-up">
            <span className="chip border-white/30 bg-white/10 text-white backdrop-blur">
              <Sparkles size={14} /> {t('brand.tagline')}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">{t('home.heroSubtitle')}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} /> {t('home.trustNoFees')}</span>
              <span className="inline-flex items-center gap-1.5"><BadgePercent size={16} /> {t('home.trustFree')}</span>
              <span className="inline-flex items-center gap-1.5"><Award size={16} /> {t('home.trustMembers')}</span>
            </div>
          </div>
        </div>
        {/* Search overlapping hero */}
        <div className="container-page relative -mb-16 -translate-y-12">
          <SearchBar />
        </div>
      </section>

      {/* Trending */}
      <section className="container-page mt-24">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-ink-900">{t('home.trending')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {TRENDING.map((d) => (
            <button
              key={d.name}
              onClick={() => goDestination(d.name)}
              className="group relative h-48 overflow-hidden rounded-2xl text-start shadow-card"
            >
              <img src={d.img} alt={d.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <div className="font-bold">{d.name}</div>
                <div className="text-xs text-white/80">{d.price}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="container-page mt-20">
        <h2 className="mb-6 text-2xl font-extrabold text-ink-900">{t('home.why')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, tk: 'home.why1' },
            { icon: Award, tk: 'home.why2' },
            { icon: BadgePercent, tk: 'home.why3' },
          ].map(({ icon: Icon, tk }) => (
            <div key={tk} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{t(`${tk}Title`)}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{t(`${tk}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-sell */}
      <section className="container-page mt-20">
        <div className="card flex flex-col items-center justify-between gap-4 bg-brand-600 p-8 text-white sm:flex-row">
          <div>
            <h3 className="text-xl font-extrabold">{t('home.completeTrip')}</h3>
            <p className="mt-1 text-white/85">{t('home.heroSubtitle')}</p>
          </div>
          <button onClick={() => navigate('searchFlights')} className="btn bg-white text-brand-700 hover:bg-brand-50">
            {t('nav.flights')} <ArrowRight size={16} className="rtl-flip" />
          </button>
        </div>
      </section>
    </div>
  );
}
