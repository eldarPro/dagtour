import { Tour } from './mockData';

export const PRICE_MIN = 0;
export const PRICE_MAX = 10000;

export type DurationFilter = 'Все' | '1 день' | '2 дня' | '3 дня';

export interface TourFilters {
  duration: DurationFilter;
  routePoint: string;
  priceMin: number;
  priceMax: number;
}

export const DEFAULT_FILTERS: TourFilters = {
  duration: 'Все',
  routePoint: 'Все',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
};

export function applyFilters(tours: Tour[], filters: TourFilters): Tour[] {
  return tours.filter((t) => {
    if (filters.duration !== 'Все' && t.duration !== filters.duration) return false;

    if (filters.routePoint !== 'Все' && !t.route.includes(filters.routePoint)) return false;

    if (t.price < filters.priceMin || t.price > filters.priceMax) return false;

    return true;
  });
}

export function isFiltersActive(filters: TourFilters): boolean {
  return (
    filters.duration !== 'Все' ||
    filters.routePoint !== 'Все' ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX
  );
}
