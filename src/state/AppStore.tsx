/**
 * AppStore — the single client-side state container for the consumer surface.
 * Bundles locale/RTL, currency, a mock auth session, the cart, bookings
 * ("My Trips"), toasts and an in-memory router. In a real deployment these
 * would be separate BFF-backed stores; here one provider keeps the demo cohesive.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { CurrencyCode, Money, formatMoney as fmtMoney } from '../domain/money';
import { LocaleCode, CartItem, Booking } from '../domain/types';
import { Coupon } from '../domain/coupons';
import {
  HotelSearchParams,
  FlightSearchParams,
} from '../domain/types';
import { translate } from '../i18n/translations';

export type RouteName =
  | 'home'
  | 'searchHotels'
  | 'searchFlights'
  | 'hotel'
  | 'flight'
  | 'cart'
  | 'checkout'
  | 'confirm'
  | 'trips';

export interface Route {
  name: RouteName;
  params: Record<string, string>;
}

export interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'info' | 'error';
}

interface AppState {
  // i18n
  locale: LocaleCode;
  dir: 'ltr' | 'rtl';
  setLocale: (l: LocaleCode) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  // currency
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  fmt: (m: Money) => string;
  // auth (mock)
  user: { name: string; email: string } | null;
  isMember: boolean;
  points: number;
  signIn: () => void;
  signOut: () => void;
  // cart
  cart: CartItem[];
  coupon: Coupon | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setCoupon: (c: Coupon | null) => void;
  // bookings / trips
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string, refund: Booking['refund']) => void;
  // search params (last run)
  lastHotelSearch: HotelSearchParams | null;
  setLastHotelSearch: (p: HotelSearchParams) => void;
  lastFlightSearch: FlightSearchParams | null;
  setLastFlightSearch: (p: FlightSearchParams) => void;
  // routing
  route: Route;
  navigate: (name: RouteName, params?: Record<string, string>) => void;
  // toasts
  toasts: Toast[];
  toast: (message: string, kind?: Toast['kind']) => void;
}

const Ctx = createContext<AppState | undefined>(undefined);

let toastSeq = 1;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [user, setUser] = useState<AppState['user']>(null);
  const [points, setPoints] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastHotelSearch, setLastHotelSearch] = useState<HotelSearchParams | null>(null);
  const [lastFlightSearch, setLastFlightSearch] = useState<FlightSearchParams | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home', params: {} });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';

  // Reflect locale/dir on <html> for native RTL + correct font.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((l: LocaleCode) => setLocaleState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => translate(locale, key, vars),
    [locale],
  );

  const fmt = useCallback((m: Money) => fmtMoney(m, locale), [locale]);

  const toast = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = toastSeq++;
    setToasts((ts) => [...ts, { id, message, kind }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200);
  }, []);

  const navigate = useCallback((name: RouteName, params: Record<string, string> = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const hash = params.id ? `#/${name}/${params.id}` : `#/${name}`;
    window.history.replaceState(null, '', hash);
  }, []);

  const signIn = useCallback(() => {
    setUser({ name: 'Hani', email: 'hani.salih@gmail.com' });
    setPoints(2450);
    toast(translate(locale, 'toast.signedIn'), 'success');
  }, [locale, toast]);

  const signOut = useCallback(() => {
    setUser(null);
    setPoints(0);
    toast(translate(locale, 'toast.signedOut'), 'info');
  }, [locale, toast]);

  const addToCart = useCallback(
    (item: CartItem) => {
      setCart((c) => [...c, item]);
      toast(translate(locale, 'toast.added'), 'success');
    },
    [locale, toast],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((c) => c.filter((i) => i.id !== id));
      toast(translate(locale, 'toast.removed'), 'info');
    },
    [locale, toast],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings((bs) => [b, ...bs]);
    setPoints((p) => p + b.pricing.pointsEarned);
  }, []);

  const cancelBooking = useCallback(
    (id: string, refund: Booking['refund']) => {
      setBookings((bs) =>
        bs.map((b) => (b.id === id ? { ...b, status: 'cancelled', refund } : b)),
      );
      toast(translate(locale, 'toast.cancelled'), 'success');
    },
    [locale, toast],
  );

  const value = useMemo<AppState>(
    () => ({
      locale, dir, setLocale, t,
      currency, setCurrency, fmt,
      user, isMember: !!user, points, signIn, signOut,
      cart, coupon, addToCart, removeFromCart, clearCart, setCoupon,
      bookings, addBooking, cancelBooking,
      lastHotelSearch, setLastHotelSearch, lastFlightSearch, setLastFlightSearch,
      route, navigate,
      toasts, toast,
    }),
    [
      locale, dir, setLocale, t, currency, fmt, user, points, signIn, signOut,
      cart, coupon, addToCart, removeFromCart, clearCart,
      bookings, addBooking, cancelBooking,
      lastHotelSearch, lastFlightSearch, route, navigate, toasts, toast,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppStoreProvider');
  return ctx;
}
