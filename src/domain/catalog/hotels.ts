/**
 * Mock hotels supply adapter + seed inventory. Mirrors a bedbank/aggregator
 * adapter (Hotelbeds / EPS-style) behind a clean interface so a live connector
 * can replace it without touching search or pricing.
 */
import { Hotel, RoomType, RatePlan, HotelSearchParams } from '../types';

let planSeq = 0;
function plan(
  name: string,
  board: RatePlan['boardBasis'],
  netNightlyUsd: number,
  opts: { refundable: boolean; freeHours: number; membersOnly?: boolean },
): RatePlan {
  return {
    id: `rp_${planSeq++}`,
    name,
    boardBasis: board,
    netNightlyUsd,
    membersOnly: opts.membersOnly ?? false,
    cancellation: {
      refundable: opts.refundable,
      freeUntilHoursBefore: opts.freeHours,
      lateCancelPenaltyRate: opts.refundable ? 0.5 : 1,
    },
  };
}

function room(
  id: string,
  name: string,
  maxOccupancy: number,
  beds: string,
  sizeSqm: number,
  baseNet: number,
): RoomType {
  return {
    id,
    name,
    maxOccupancy,
    beds,
    sizeSqm,
    ratePlans: [
      plan('Non-refundable · Room only', 'room_only', Math.round(baseNet * 0.88), { refundable: false, freeHours: 0 }),
      plan('Free cancellation · Breakfast', 'breakfast', baseNet, { refundable: true, freeHours: 48 }),
      plan('Members save · Half board', 'half_board', Math.round(baseNet * 0.95), { refundable: true, freeHours: 24, membersOnly: true }),
    ],
  };
}

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const HOTELS: Hotel[] = [
  {
    id: 'h_dxb_1', vertical: 'hotels', name: 'Marina Bay Grand', city: 'Dubai', country: 'United Arab Emirates',
    address: 'Dubai Marina Walk, Dubai', starRating: 5, reviewScore: 9.1, reviewCount: 4213,
    lat: 25.08, lng: 55.14, supplierId: 's_emirates_hotels',
    images: [IMG('photo-1566073771259-6a8506099945'), IMG('photo-1582719478250-c89cae4dc85b'), IMG('photo-1611892440504-42a792e24d32')],
    amenities: ['Free WiFi', 'Infinity pool', 'Spa', 'Beach access', 'Valet parking', 'Gym'],
    landmarks: [{ name: 'Dubai Marina', distanceKm: 0.2 }, { name: 'JBR Beach', distanceKm: 1.1 }],
    rooms: [room('r1', 'Deluxe Marina View', 2, '1 King', 42, 28000), room('r2', 'Premier Suite', 4, '1 King + Sofa', 68, 46000)],
  },
  {
    id: 'h_dxb_2', vertical: 'hotels', name: 'Downtown Boulevard Hotel', city: 'Dubai', country: 'United Arab Emirates',
    address: 'Sheikh Mohammed bin Rashid Blvd, Dubai', starRating: 4, reviewScore: 8.6, reviewCount: 2890,
    lat: 25.19, lng: 55.27, supplierId: 's_jumeirah_collection',
    images: [IMG('photo-1564013799919-ab600027ffc6'), IMG('photo-1631049307264-da0ec9d70304')],
    amenities: ['Free WiFi', 'Rooftop pool', 'Restaurant', 'Burj Khalifa view', 'Gym'],
    landmarks: [{ name: 'Burj Khalifa', distanceKm: 0.6 }, { name: 'Dubai Mall', distanceKm: 0.9 }],
    rooms: [room('r1', 'Classic City View', 2, '2 Twin', 30, 16000), room('r2', 'Skyline King', 2, '1 King', 38, 22000)],
  },
  {
    id: 'h_bah_1', vertical: 'hotels', name: 'Manama Pearl Resort', city: 'Manama', country: 'Bahrain',
    address: 'King Faisal Highway, Manama', starRating: 5, reviewScore: 8.9, reviewCount: 1542,
    lat: 26.24, lng: 50.58, supplierId: 's_gulf_hospitality',
    images: [IMG('photo-1551882547-ff40c63fe5fa'), IMG('photo-1542314831-068cd1dbfeeb')],
    amenities: ['Free WiFi', 'Private beach', 'Spa', 'Marina', 'Kids club'],
    landmarks: [{ name: 'Bahrain World Trade Center', distanceKm: 1.4 }, { name: 'Bab Al Bahrain', distanceKm: 2.0 }],
    rooms: [room('r1', 'Garden Room', 2, '1 Queen', 34, 14000), room('r2', 'Sea View Suite', 3, '1 King + Sofa', 55, 24000)],
  },
  {
    id: 'h_ruh_1', vertical: 'hotels', name: 'Kingdom Tower Suites', city: 'Riyadh', country: 'Saudi Arabia',
    address: 'Olaya Street, Riyadh', starRating: 5, reviewScore: 9.0, reviewCount: 1987,
    lat: 24.71, lng: 46.67, supplierId: 's_najd_hotels',
    images: [IMG('photo-1611892440504-42a792e24d32'), IMG('photo-1610641818989-c2051b5e2cfd')],
    amenities: ['Free WiFi', 'Indoor pool', 'Business center', 'Spa', 'Fine dining'],
    landmarks: [{ name: 'Kingdom Centre', distanceKm: 0.5 }, { name: 'Al Faisaliah', distanceKm: 3.2 }],
    rooms: [room('r1', 'Executive King', 2, '1 King', 40, 21000), room('r2', 'Royal Suite', 4, '2 King', 80, 52000)],
  },
  {
    id: 'h_lon_1', vertical: 'hotels', name: 'Westminster Court Hotel', city: 'London', country: 'United Kingdom',
    address: 'Victoria Street, London', starRating: 4, reviewScore: 8.7, reviewCount: 6120,
    lat: 51.49, lng: -0.13, supplierId: 's_albion_group',
    images: [IMG('photo-1455587734955-081b22074882'), IMG('photo-1445019980597-93fa8acb246c')],
    amenities: ['Free WiFi', 'Afternoon tea', 'Concierge', 'Restaurant', 'Pet friendly'],
    landmarks: [{ name: 'Buckingham Palace', distanceKm: 0.8 }, { name: 'Westminster Abbey', distanceKm: 0.9 }],
    rooms: [room('r1', 'Cosy Double', 2, '1 Double', 22, 26000), room('r2', 'Deluxe Suite', 3, '1 King + Sofa', 44, 42000)],
  },
  {
    id: 'h_par_1', vertical: 'hotels', name: 'Rive Gauche Boutique', city: 'Paris', country: 'France',
    address: 'Boulevard Saint-Germain, Paris', starRating: 4, reviewScore: 9.2, reviewCount: 3340,
    lat: 48.85, lng: 2.34, supplierId: 's_lumiere_hotels',
    images: [IMG('photo-1520250497591-112f2f40a3f4'), IMG('photo-1571896349842-33c89424de2d')],
    amenities: ['Free WiFi', 'Bistro', 'Bar', 'Bicycle hire', 'Eiffel view'],
    landmarks: [{ name: 'Notre-Dame', distanceKm: 1.0 }, { name: 'Louvre', distanceKm: 1.8 }],
    rooms: [room('r1', 'Parisian Classic', 2, '1 Queen', 20, 30000), room('r2', 'Eiffel View Suite', 2, '1 King', 36, 54000)],
  },
  {
    id: 'h_mle_1', vertical: 'hotels', name: 'Coral Atoll Overwater Resort', city: 'Maldives', country: 'Maldives',
    address: 'North Malé Atoll', starRating: 5, reviewScore: 9.5, reviewCount: 980,
    lat: 4.17, lng: 73.51, supplierId: 's_indian_ocean_resorts',
    images: [IMG('photo-1582719478250-c89cae4dc85b'), IMG('photo-1551882547-ff40c63fe5fa')],
    amenities: ['Free WiFi', 'Overwater villa', 'House reef', 'Spa', 'All-inclusive', 'Seaplane transfer'],
    landmarks: [{ name: 'Malé Airport', distanceKm: 28 }, { name: 'House Reef', distanceKm: 0.05 }],
    rooms: [
      { id: 'r1', name: 'Lagoon Villa', maxOccupancy: 2, beds: '1 King', sizeSqm: 90,
        ratePlans: [
          plan('Non-refundable · All inclusive', 'all_inclusive', 78000, { refundable: false, freeHours: 0 }),
          plan('Free cancellation · All inclusive', 'all_inclusive', 92000, { refundable: true, freeHours: 72 }),
        ] },
    ],
  },
  {
    id: 'h_nyc_1', vertical: 'hotels', name: 'Midtown Skyline Hotel', city: 'New York', country: 'United States',
    address: '7th Avenue, Manhattan, New York', starRating: 4, reviewScore: 8.4, reviewCount: 7821,
    lat: 40.76, lng: -73.98, supplierId: 's_metropolitan_stays',
    images: [IMG('photo-1631049307264-da0ec9d70304'), IMG('photo-1564013799919-ab600027ffc6')],
    amenities: ['Free WiFi', 'Fitness center', '24h dining', 'Times Square view', 'Business center'],
    landmarks: [{ name: 'Times Square', distanceKm: 0.4 }, { name: 'Central Park', distanceKm: 1.6 }],
    rooms: [room('r1', 'Urban Queen', 2, '1 Queen', 24, 32000), room('r2', 'Skyline King', 3, '1 King', 34, 44000)],
  },
];

/* ----------------------------- Adapter surface ----------------------------- */

const latency = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface HotelSearchResult {
  hotel: Hotel;
  /** Cheapest net nightly across rate plans, USD minor units, for sort/badge. */
  leadNetNightlyUsd: number;
}

export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
  await latency(450 + Math.floor(((Date.now() % 13) / 13) * 400)); // simulate live fan-out
  const q = params.destination.trim().toLowerCase();
  const matches = HOTELS.filter(
    (h) =>
      !q ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q),
  );
  return matches.map((hotel) => ({
    hotel,
    leadNetNightlyUsd: Math.min(
      ...hotel.rooms.flatMap((r) => r.ratePlans.map((p) => p.netNightlyUsd)),
    ),
  }));
}

export function getHotel(id: string): Hotel | undefined {
  return HOTELS.find((h) => h.id === id);
}
