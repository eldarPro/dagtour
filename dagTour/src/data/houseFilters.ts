import type { House } from '../lib/api';

export const PRICE_MIN = 0;
export const PRICE_MAX = 6000;

export interface HouseFilters {
  location: string;
  priceMin: number;
  priceMax: number;
  minRooms: number;
  minRating: number;
  minGuests: number;
}

export const DEFAULT_FILTERS: HouseFilters = {
  location: 'Все',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  minRooms: 0,
  minRating: 0,
  minGuests: 0,
};

export function applyFilters(houses: House[], filters: HouseFilters): House[] {
  return houses.filter((h) => {
    if (filters.location !== 'Все' && h.location !== filters.location) return false;

    if (h.pricePerNight < filters.priceMin || h.pricePerNight > filters.priceMax) return false;

    if (filters.minRooms > 0) {
      if (filters.minRooms === 4 ? h.rooms < 4 : h.rooms !== filters.minRooms) return false;
    }

    if (filters.minRating > 0 && h.rating < filters.minRating) return false;

    if (filters.minGuests > 0 && h.guests < filters.minGuests) return false;

    return true;
  });
}

export function isFiltersActive(filters: HouseFilters): boolean {
  return (
    filters.location !== 'Все' ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
    filters.minRooms !== 0 ||
    filters.minRating !== 0 ||
    filters.minGuests !== 0
  );
}
