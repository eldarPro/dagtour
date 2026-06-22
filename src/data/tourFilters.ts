import type { Tour } from '../lib/api';
import type { LocationFilter } from '../components/LocationFilterPicker';
import { getSettlementDistrict } from './dagestanLocations';

export { EMPTY_LOCATION_FILTER } from '../components/LocationFilterPicker';

export const PRICE_MIN = 0;
export const PRICE_MAX = 99999;

export type DurationFilter = 'Все' | 1 | 2 | 3 | '4+';

export interface TourFilters {
  locationFilter: LocationFilter;
  duration: DurationFilter;
  meetingPoint: string;
  priceMin: number;
  priceMax: number;
  sort?: string;
}

export const DEFAULT_FILTERS: TourFilters = {
  locationFilter: { displayName: '' },
  duration: 'Все',
  meetingPoint: 'Все',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  sort: undefined,
};

export function durationToParams(d: DurationFilter): { durationMin?: number; durationMax?: number } {
  if (d === 'Все') return {};
  if (d === '4+') return { durationMin: 4 };
  return { durationMin: d, durationMax: d };
}

export function applyFilters(tours: Tour[], filters: TourFilters): Tour[] {
  return tours.filter((t) => {
    const lf = filters.locationFilter;
    if (lf.city) {
      if (t.city !== lf.city) return false;
    } else if (lf.district) {
      const cityDistrict = getSettlementDistrict(t.city);
      if (t.district !== lf.district && cityDistrict !== lf.district) return false;
    }

    if (filters.duration !== 'Все') {
      if (filters.duration === '4+') {
        if (t.duration < 4) return false;
      } else {
        if (t.duration !== filters.duration) return false;
      }
    }

    if (filters.meetingPoint !== 'Все' && t.meetingPoint !== filters.meetingPoint) return false;

    if (t.price < filters.priceMin || t.price > filters.priceMax) return false;

    return true;
  });
}

export function isFiltersActive(filters: TourFilters): boolean {
  return (
    !!filters.locationFilter.displayName ||
    filters.duration !== 'Все' ||
    filters.meetingPoint !== 'Все' ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
    !!filters.sort
  );
}
