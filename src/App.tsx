import { AppStoreProvider, useApp } from './state/AppStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toasts } from './components/Toasts';
import { HomePage } from './features/home/HomePage';
import { HotelResults } from './features/results/HotelResults';
import { FlightResults } from './features/results/FlightResults';
import { HotelDetail } from './features/detail/HotelDetail';
import { FlightDetail } from './features/detail/FlightDetail';
import { CartPage } from './features/cart/CartPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { ConfirmationPage } from './features/confirm/ConfirmationPage';
import { TripsPage } from './features/trips/TripsPage';

function Router() {
  const { route } = useApp();
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'searchHotels':
      return <HotelResults />;
    case 'searchFlights':
      return <FlightResults />;
    case 'hotel':
      return <HotelDetail />;
    case 'flight':
      return <FlightDetail />;
    case 'cart':
      return <CartPage />;
    case 'checkout':
      return <CheckoutPage />;
    case 'confirm':
      return <ConfirmationPage />;
    case 'trips':
      return <TripsPage />;
    default:
      return <HomePage />;
  }
}

function Shell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  );
}
