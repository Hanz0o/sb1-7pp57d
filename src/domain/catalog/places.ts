/** Geo + alias-aware autocomplete dataset (destinations and airports). */
export interface Place {
  id: string;
  type: 'city' | 'airport';
  name: string;
  nameAr: string;
  country: string;
  /** IATA for airports, metro code for cities. */
  code: string;
  aliases: string[];
}

export const PLACES: Place[] = [
  { id: 'dxb', type: 'city', name: 'Dubai', nameAr: 'دبي', country: 'United Arab Emirates', code: 'DXB', aliases: ['dubai', 'uae', 'emirates'] },
  { id: 'auh', type: 'city', name: 'Abu Dhabi', nameAr: 'أبو ظبي', country: 'United Arab Emirates', code: 'AUH', aliases: ['abu dhabi', 'uae'] },
  { id: 'bah', type: 'city', name: 'Manama', nameAr: 'المنامة', country: 'Bahrain', code: 'BAH', aliases: ['manama', 'bahrain'] },
  { id: 'ruh', type: 'city', name: 'Riyadh', nameAr: 'الرياض', country: 'Saudi Arabia', code: 'RUH', aliases: ['riyadh', 'ksa', 'saudi'] },
  { id: 'jed', type: 'city', name: 'Jeddah', nameAr: 'جدة', country: 'Saudi Arabia', code: 'JED', aliases: ['jeddah', 'ksa', 'saudi'] },
  { id: 'doh', type: 'city', name: 'Doha', nameAr: 'الدوحة', country: 'Qatar', code: 'DOH', aliases: ['doha', 'qatar'] },
  { id: 'lon', type: 'city', name: 'London', nameAr: 'لندن', country: 'United Kingdom', code: 'LON', aliases: ['london', 'uk', 'england'] },
  { id: 'par', type: 'city', name: 'Paris', nameAr: 'باريس', country: 'France', code: 'PAR', aliases: ['paris', 'france'] },
  { id: 'nyc', type: 'city', name: 'New York', nameAr: 'نيويورك', country: 'United States', code: 'NYC', aliases: ['new york', 'nyc', 'usa'] },
  { id: 'ist', type: 'city', name: 'Istanbul', nameAr: 'إسطنبول', country: 'Türkiye', code: 'IST', aliases: ['istanbul', 'turkey'] },
  { id: 'mle', type: 'city', name: 'Maldives', nameAr: 'المالديف', country: 'Maldives', code: 'MLE', aliases: ['maldives', 'male'] },
  { id: 'cai', type: 'city', name: 'Cairo', nameAr: 'القاهرة', country: 'Egypt', code: 'CAI', aliases: ['cairo', 'egypt'] },
];

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLACES.slice(0, limit);
  return PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.nameAr.includes(query.trim()) ||
      p.code.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.aliases.some((a) => a.includes(q)),
  ).slice(0, limit);
}

export function placeByCode(code: string): Place | undefined {
  return PLACES.find((p) => p.code.toLowerCase() === code.toLowerCase());
}
