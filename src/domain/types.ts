/**
 * Core domain types shared across verticals. A trimmed, frontend-facing subset
 * of the data model in §6 of the build spec — the shapes that the consumer
 * marketplace actually needs to render search → quote → book → manage.
 */
import { CurrencyCode, Money } from './money';

export type Vertical = 'hotels' | 'flights';

export type LocaleCode = 'en' | 'ar';

/* ---------------------------------- Hotels --------------------------------- */

export interface CancellationPolicy {
  /** Free cancellation up to this many hours before check-in. 0 = non-refundable. */
  freeUntilHoursBefore: number;
  /** Penalty as a fraction of total if cancelled inside the free window. */
  lateCancelPenaltyRate: number;
  refundable: boolean;
}

export interface RatePlan {
  id: string;
  name: string;
  boardBasis: 'room_only' | 'breakfast' | 'half_board' | 'all_inclusive';
  cancellation: CancellationPolicy;
  membersOnly: boolean;
  /** Net nightly rate from the supplier, in USD minor units (pre-markup). */
  netNightlyUsd: number;
}

export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  beds: string;
  sizeSqm: number;
  ratePlans: RatePlan[];
}

export interface Hotel {
  id: string;
  vertical: 'hotels';
  name: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  lat: number;
  lng: number;
  images: string[];
  amenities: string[];
  landmarks: { name: string; distanceKm: number }[];
  rooms: RoomType[];
  supplierId: string;
}

/* --------------------------------- Flights --------------------------------- */

export interface FlightSegment {
  from: string; // IATA
  to: string; // IATA
  fromCity: string;
  toCity: string;
  departIso: string;
  arriveIso: string;
  carrier: string;
  carrierName: string;
  flightNo: string;
  durationMin: number;
}

export interface FareFamily {
  id: string;
  name: 'Basic' | 'Standard' | 'Flex';
  cabin: 'economy' | 'premium' | 'business';
  baggage: { carryOn: boolean; checkedBags: number };
  changeable: boolean;
  refundable: boolean;
  seatSelection: boolean;
  /** Net fare from the GDS, USD minor units (pre-markup), per passenger. */
  netFareUsd: number;
}

export interface FlightOffer {
  id: string;
  vertical: 'flights';
  segments: FlightSegment[];
  stops: number;
  totalDurationMin: number;
  fareFamilies: FareFamily[];
  supplierId: string;
}

/* ----------------------------- Search & quoting ---------------------------- */

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  cabin: FareFamily['cabin'];
}

export interface PriceLine {
  key: string;
  /** i18n key for the label. */
  labelKey: string;
  amount: Money;
  kind: 'charge' | 'tax' | 'fee' | 'discount';
}

export interface PriceBreakdown {
  currency: CurrencyCode;
  lines: PriceLine[];
  total: Money;
  /** Sum of taxes + fees, for the "includes taxes & fees" disclosure. */
  taxesAndFees: Money;
  /** Loyalty points this purchase would earn. */
  pointsEarned: number;
}

/* ------------------------------- Cart & orders ----------------------------- */

export interface CartItem {
  id: string;
  vertical: Vertical;
  title: string;
  subtitle: string;
  image: string;
  /** Opaque selection payload used to re-price on the way to checkout. */
  selection: HotelSelection | FlightSelection;
  /** The breakdown captured at add-to-cart time, in display currency. */
  pricedAt: PriceBreakdown;
}

export interface HotelSelection {
  vertical: 'hotels';
  hotelId: string;
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
}

export interface FlightSelection {
  vertical: 'flights';
  offerId: string;
  fareFamilyId: string;
  adults: number;
  seats: number; // selected paid seats
  extraBags: number;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

export interface LedgerEntry {
  id: string;
  ts: string;
  account: 'customer' | 'supplier_payable' | 'revenue' | 'tax_payable' | 'refunds';
  /** Signed amount in display currency minor units (debit +, credit -). */
  amount: Money;
  memo: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  vertical: Vertical;
  title: string;
  subtitle: string;
  image: string;
  createdIso: string;
  travelDateIso: string;
  selection: HotelSelection | FlightSelection;
  pricing: PriceBreakdown;
  /** Voucher / e-ticket payload. */
  voucherCode: string;
  cancellation: CancellationPolicy;
  ledger: LedgerEntry[];
  refund?: { amount: Money; penalty: Money; processedIso: string };
  guestName: string;
  guestEmail: string;
}
