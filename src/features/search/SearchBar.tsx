import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Plane, BedDouble, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { searchPlaces, Place } from '../../domain/catalog/places';
import { FareFamily } from '../../domain/types';

type Tab = 'stay' | 'fly';

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function SearchBar({ initialTab = 'stay' }: { initialTab?: Tab }) {
  const { t, locale, navigate, setLastHotelSearch, setLastFlightSearch } = useApp();
  const [tab, setTab] = useState<Tab>(initialTab);

  // shared / hotel
  const [destination, setDestination] = useState('Dubai');
  const [origin, setOrigin] = useState('Manama');
  const [checkIn, setCheckIn] = useState(isoDaysFromNow(14));
  const [checkOut, setCheckOut] = useState(isoDaysFromNow(17));
  const [departDate, setDepartDate] = useState(isoDaysFromNow(14));
  const [returnDate, setReturnDate] = useState(isoDaysFromNow(21));
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [cabin, setCabin] = useState<FareFamily['cabin']>('economy');
  const [roundtrip, setRoundtrip] = useState(true);

  const submit = () => {
    if (tab === 'stay') {
      const nights = Math.max(
        1,
        Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
      );
      setLastHotelSearch({ destination, checkIn, checkOut, adults, rooms });
      navigate('searchHotels', { d: destination, nights: String(nights) });
    } else {
      setLastFlightSearch({
        origin: origin || 'BAH',
        destination,
        departDate,
        returnDate: roundtrip ? returnDate : undefined,
        adults,
        cabin,
      });
      navigate('searchFlights', { d: destination });
    }
  };

  return (
    <div className="card overflow-visible p-2 shadow-lift">
      {/* Tabs */}
      <div className="flex gap-1 px-1 pb-1 pt-1">
        <TabBtn active={tab === 'stay'} onClick={() => setTab('stay')} icon={<BedDouble size={16} />}>
          {t('search.stay')}
        </TabBtn>
        <TabBtn active={tab === 'fly'} onClick={() => setTab('fly')} icon={<Plane size={16} className="rtl-flip" />}>
          {t('search.fly')}
        </TabBtn>
      </div>

      <div className="grid grid-cols-1 gap-2 p-1 md:grid-cols-12">
        {tab === 'fly' && (
          <Field className="md:col-span-3" label={t('common.from')} icon={<MapPin size={16} />}>
            <PlaceInput value={origin} onChange={setOrigin} locale={locale} placeholder="Manama" />
          </Field>
        )}

        <Field className={tab === 'fly' ? 'md:col-span-3' : 'md:col-span-4'} label={t('search.destination')} icon={<MapPin size={16} />}>
          <PlaceInput value={destination} onChange={setDestination} locale={locale} placeholder="Dubai" />
        </Field>

        {tab === 'stay' ? (
          <>
            <Field className="md:col-span-2" label={t('search.checkIn')} icon={<Calendar size={16} />}>
              <input type="date" value={checkIn} min={isoDaysFromNow(0)} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink-900 focus:outline-none" />
            </Field>
            <Field className="md:col-span-2" label={t('search.checkOut')} icon={<Calendar size={16} />}>
              <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink-900 focus:outline-none" />
            </Field>
            <Field className="md:col-span-2" label={t('search.passengers')} icon={<Users size={16} />}>
              <GuestPicker adults={adults} setAdults={setAdults} rooms={rooms} setRooms={setRooms} t={t} />
            </Field>
          </>
        ) : (
          <>
            <Field className="md:col-span-2" label={t('search.depart')} icon={<Calendar size={16} />}>
              <input type="date" value={departDate} min={isoDaysFromNow(0)} onChange={(e) => setDepartDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink-900 focus:outline-none" />
            </Field>
            <Field className="md:col-span-2" label={t('search.return')} icon={<ArrowRightLeft size={16} />}>
              {roundtrip ? (
                <input type="date" value={returnDate} min={departDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-ink-900 focus:outline-none" />
              ) : (
                <button onClick={() => setRoundtrip(true)} className="text-sm font-medium text-brand-600">+ {t('search.return')}</button>
              )}
            </Field>
            <Field className="md:col-span-2" label={t('search.cabin')} icon={<Users size={16} />}>
              <select value={cabin} onChange={(e) => setCabin(e.target.value as FareFamily['cabin'])} className="w-full bg-transparent text-sm font-medium text-ink-900 focus:outline-none">
                <option value="economy">{t('search.economy')}</option>
                <option value="premium">{t('search.premium')}</option>
                <option value="business">{t('search.business')}</option>
              </select>
            </Field>
          </>
        )}

        <div className="flex items-end md:col-span-2">
          <button onClick={submit} className="btn-primary h-[52px] w-full text-base">
            <Search size={18} />
            {t('common.search')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
        active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({ className = '', label, icon, children }: { className?: string; label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-ink-200 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 ${className}`}>
      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        <span className="text-ink-400">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function PlaceInput({ value, onChange, locale, placeholder }: { value: string; onChange: (v: string) => void; locale: string; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setResults(searchPlaces(e.target.value));
          setOpen(true);
        }}
        onFocus={() => {
          setResults(searchPlaces(value));
          setOpen(true);
        }}
        className="w-full bg-transparent text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-ink-200 bg-white py-1 shadow-lift">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onChange(locale === 'ar' ? p.nameAr : p.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-ink-50"
              >
                <MapPin size={16} className="text-ink-400" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink-900">{locale === 'ar' ? p.nameAr : p.name}</span>
                  <span className="block text-xs text-ink-400">{p.country}</span>
                </span>
                <span className="chip">{p.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuestPicker({ adults, setAdults, rooms, setRooms, t }: { adults: number; setAdults: (n: number) => void; rooms: number; setRooms: (n: number) => void; t: (k: string) => string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
      <Stepper value={adults} setValue={setAdults} min={1} max={9} suffix={t('common.adults')} />
      <span className="text-ink-300">·</span>
      <Stepper value={rooms} setValue={setRooms} min={1} max={6} suffix={t('common.rooms')} />
    </div>
  );
}

function Stepper({ value, setValue, min, max, suffix }: { value: number; setValue: (n: number) => void; min: number; max: number; suffix: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => setValue(Math.max(min, value - 1))} className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-100">−</button>
      <span className="min-w-3 text-center tabular-nums">{value}</span>
      <button onClick={() => setValue(Math.min(max, value + 1))} className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-100">+</button>
      <span className="ms-0.5 text-xs text-ink-400">{suffix}</span>
    </span>
  );
}
