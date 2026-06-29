import { useState } from 'react';
import { Plane, ShoppingCart, Globe, User, Award, Menu, X } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '../../domain/money';
import { LocaleCode } from '../../domain/types';

export function Header() {
  const { t, navigate, cart, currency, setCurrency, locale, setLocale, isMember, points, signIn, signOut } =
    useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 font-extrabold text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane size={18} className="rtl-flip" />
          </span>
          <span className="text-xl tracking-tight">Voya</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <button onClick={() => navigate('searchHotels')} className="btn-ghost">
            {t('nav.hotels')}
          </button>
          <button onClick={() => navigate('searchFlights')} className="btn-ghost">
            {t('nav.flights')}
          </button>
          <button onClick={() => navigate('trips')} className="btn-ghost">
            {t('nav.trips')}
          </button>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Locale */}
          <div className="hidden items-center rounded-xl border border-ink-200 p-0.5 sm:flex">
            {(['en', 'ar'] as LocaleCode[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  locale === l ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {l === 'en' ? 'EN' : 'ع'}
              </button>
            ))}
          </div>

          {/* Currency */}
          <label className="hidden items-center gap-1 sm:flex">
            <Globe size={15} className="text-ink-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="cursor-pointer rounded-lg border border-ink-200 bg-white py-1.5 pe-6 ps-2 text-xs font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              aria-label="Currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Cart */}
          <button
            onClick={() => navigate('cart')}
            className="relative rounded-xl p-2 text-ink-700 hover:bg-ink-100"
            aria-label={t('nav.cart')}
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>

          {/* Auth */}
          {isMember ? (
            <button
              onClick={signOut}
              className="hidden items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 sm:flex"
            >
              <Award size={16} />
              {points.toLocaleString()} pts
            </button>
          ) : (
            <button onClick={signIn} className="btn-primary hidden sm:inline-flex">
              <User size={16} />
              {t('nav.signin')}
            </button>
          )}

          <button
            className="rounded-xl p-2 text-ink-700 hover:bg-ink-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <button onClick={() => { navigate('searchHotels'); setMobileOpen(false); }} className="btn-ghost justify-start">
              {t('nav.hotels')}
            </button>
            <button onClick={() => { navigate('searchFlights'); setMobileOpen(false); }} className="btn-ghost justify-start">
              {t('nav.flights')}
            </button>
            <button onClick={() => { navigate('trips'); setMobileOpen(false); }} className="btn-ghost justify-start">
              {t('nav.trips')}
            </button>
            <div className="flex items-center gap-2 pt-2">
              {(['en', 'ar'] as LocaleCode[]).map((l) => (
                <button key={l} onClick={() => setLocale(l)} className={`chip ${locale === l ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}>
                  {l === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="input w-auto py-1.5 text-xs"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {!isMember && (
              <button onClick={() => { signIn(); setMobileOpen(false); }} className="btn-primary mt-2">
                <User size={16} /> {t('nav.signin')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
