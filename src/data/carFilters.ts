import type { Car } from '../lib/api';
import type { LocationFilter } from '../components/LocationFilterPicker';
import { getSettlementDistrict } from './dagestanLocations';

export { EMPTY_LOCATION_FILTER } from '../components/LocationFilterPicker';

export const PRICE_MIN = 0;
export const PRICE_MAX = 99999;

const CAR_TYPE_MAP: Record<string, string> = {
  suv: 'Кроссовер',
  sedan: 'Седан',
  van: 'Минивэн',
  pickup: 'Пикап',
  hatchback: 'Хэтчбек',
};

export function carTypeLabel(value?: string): string | undefined {
  if (!value) return undefined;
  return CAR_TYPE_MAP[value.toLowerCase()] ?? value;
}

const TRANSMISSION_MAP: Record<string, string> = {
  automatic: 'автомат',
  manual: 'механика',
  robot: 'робот',
  автомат: 'автомат',
  механика: 'механика',
  робот: 'робот',
};

export const TRANSMISSION_LABEL: Record<string, string> = {
  автомат: 'Автомат',
  механика: 'Механика',
  робот: 'Робот',
};

export function transmissionLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = TRANSMISSION_MAP[value.toLowerCase()] ?? value;
  return TRANSMISSION_LABEL[normalized] ?? normalized;
}

function normalizeTransmission(value?: string): string | undefined {
  if (!value) return undefined;
  return TRANSMISSION_MAP[value.toLowerCase()] ?? value.toLowerCase();
}

export type CarType = 'Все' | 'Седан' | 'Хэтчбек' | 'Кроссовер' | 'Внедорожник' | 'Минивэн';

export interface CarFilters {
  locationFilter: LocationFilter;
  type: CarType;
  transmission: 'Все' | 'механика' | 'автомат' | 'робот';
  seatsMin: number;
  priceMin: number;
  priceMax: number;
  sort?: string;
}

export const DEFAULT_FILTERS: CarFilters = {
  locationFilter: { displayName: '' },
  type: 'Все',
  transmission: 'Все',
  seatsMin: 0,
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  sort: undefined,
};

export function applyFilters(cars: Car[], filters: CarFilters): Car[] {
  return cars.filter((c) => {
    const lf = filters.locationFilter;
    if (lf.city) {
      if (c.city !== lf.city && c.location !== lf.city) return false;
    } else if (lf.district) {
      const cityDistrict = getSettlementDistrict(c.city) ?? getSettlementDistrict(c.location);
      if (c.district !== lf.district && cityDistrict !== lf.district) return false;
    }

    if (filters.type !== 'Все' && c.type !== filters.type) return false;

    if (filters.transmission !== 'Все' && normalizeTransmission(c.transmission) !== filters.transmission) return false;

    if (filters.seatsMin > 0 && (c.seats ?? 0) < filters.seatsMin) return false;

    if (c.pricePerDay < filters.priceMin || c.pricePerDay > filters.priceMax) return false;

    return true;
  });
}

export function isFiltersActive(filters: CarFilters): boolean {
  return (
    !!filters.locationFilter.displayName ||
    filters.type !== 'Все' ||
    filters.transmission !== 'Все' ||
    filters.seatsMin !== 0 ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
    !!filters.sort
  );
}
