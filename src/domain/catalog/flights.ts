/**
 * Mock flights supply adapter. Simulates a GDS/NDC aggregator: given search
 * params it synthesises a deterministic set of offers with fare families.
 */
import { FlightOffer, FlightSegment, FareFamily, FlightSearchParams } from '../types';
import { placeByCode, PLACES } from './places';

interface Carrier {
  code: string;
  name: string;
  baseFareUsd: number; // economy net, USD minor units, for a ~3h hop
}

const CARRIERS: Carrier[] = [
  { code: 'EK', name: 'Emirates', baseFareUsd: 24000 },
  { code: 'GF', name: 'Gulf Air', baseFareUsd: 18000 },
  { code: 'SV', name: 'Saudia', baseFareUsd: 17000 },
  { code: 'QR', name: 'Qatar Airways', baseFareUsd: 22000 },
  { code: 'BA', name: 'British Airways', baseFareUsd: 31000 },
  { code: 'TK', name: 'Turkish Airlines', baseFareUsd: 21000 },
];

function cityFor(code: string): string {
  return placeByCode(code)?.name ?? PLACES[0].name;
}

/** Deterministic pseudo-random from a string seed (keeps results stable). */
function seedRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fareFamilies(baseNet: number, cabin: FareFamily['cabin']): FareFamily[] {
  const mult = cabin === 'business' ? 3.4 : cabin === 'premium' ? 1.9 : 1;
  const b = Math.round(baseNet * mult);
  return [
    {
      id: 'ff_basic', name: 'Basic', cabin,
      baggage: { carryOn: true, checkedBags: 0 },
      changeable: false, refundable: false, seatSelection: false,
      netFareUsd: b,
    },
    {
      id: 'ff_standard', name: 'Standard', cabin,
      baggage: { carryOn: true, checkedBags: 1 },
      changeable: true, refundable: false, seatSelection: true,
      netFareUsd: Math.round(b * 1.22),
    },
    {
      id: 'ff_flex', name: 'Flex', cabin,
      baggage: { carryOn: true, checkedBags: 2 },
      changeable: true, refundable: true, seatSelection: true,
      netFareUsd: Math.round(b * 1.55),
    },
  ];
}

function addMinutes(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60000).toISOString();
}

function buildSegment(
  carrier: Carrier,
  from: string,
  to: string,
  departIso: string,
  durationMin: number,
  flightNo: string,
): FlightSegment {
  return {
    from, to, fromCity: cityFor(from), toCity: cityFor(to),
    departIso, arriveIso: addMinutes(departIso, durationMin),
    carrier: carrier.code, carrierName: carrier.name, flightNo, durationMin,
  };
}

const latency = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  await latency(500 + Math.floor(((Date.now() % 11) / 11) * 500));
  const rand = seedRand(`${params.origin}-${params.destination}-${params.departDate}-${params.cabin}`);
  const baseDuration = 150 + Math.floor(rand() * 240); // 2.5h–6.5h
  const departBase = `${params.departDate}T06:00:00.000Z`;

  const offers: FlightOffer[] = CARRIERS.map((carrier, i) => {
    const stops = rand() > 0.62 ? 1 : 0;
    const departIso = addMinutes(departBase, Math.floor(rand() * 14) * 60);
    const flightNo = `${carrier.code}${100 + Math.floor(rand() * 800)}`;
    const segments: FlightSegment[] = [];
    if (stops === 0) {
      segments.push(buildSegment(carrier, params.origin, params.destination, departIso, baseDuration, flightNo));
    } else {
      const via = ['DOH', 'IST', 'AUH'].find((c) => c !== params.origin && c !== params.destination) ?? 'DOH';
      const leg1 = Math.round(baseDuration * 0.55);
      const layover = 70 + Math.floor(rand() * 90);
      segments.push(buildSegment(carrier, params.origin, via, departIso, leg1, flightNo));
      segments.push(
        buildSegment(carrier, via, params.destination, addMinutes(departIso, leg1 + layover), baseDuration - leg1, `${carrier.code}${200 + i}`),
      );
    }
    const totalDurationMin =
      (new Date(segments[segments.length - 1].arriveIso).getTime() - new Date(segments[0].departIso).getTime()) / 60000;
    // small per-carrier price wobble
    const fareNet = Math.round(carrier.baseFareUsd * (0.9 + rand() * 0.35) * (baseDuration / 200));
    return {
      id: `fo_${carrier.code}_${i}`,
      vertical: 'flights' as const,
      segments,
      stops,
      totalDurationMin: Math.round(totalDurationMin),
      fareFamilies: fareFamilies(fareNet, params.cabin),
      supplierId: `gds_${carrier.code.toLowerCase()}`,
    };
  });

  return offers.sort((a, b) => a.fareFamilies[0].netFareUsd - b.fareFamilies[0].netFareUsd);
}

const offerCache = new Map<string, FlightOffer>();

export function cacheOffers(offers: FlightOffer[]): void {
  offers.forEach((o) => offerCache.set(o.id, o));
}

export function getOffer(id: string): FlightOffer | undefined {
  return offerCache.get(id);
}
