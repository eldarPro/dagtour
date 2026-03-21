import type { Car } from '../lib/api';

export const PRICE_MIN = 0;
export const PRICE_MAX = 6000;

export interface CarFilters {
  type: 'Все' | 'эконом' | 'комфорт' | 'внедорожник';
  transmission: 'Все' | 'механика' | 'автомат';
  seatsMin: number;
  priceMin: number;
  priceMax: number;
}

export const DEFAULT_FILTERS: CarFilters = {
  type: 'Все',
  transmission: 'Все',
  seatsMin: 0,
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
};

export function applyFilters(cars: Car[], filters: CarFilters): Car[] {
  return cars.filter((c) => {
    if (filters.type !== 'Все' && c.type !== filters.type) return false;

    if (filters.transmission !== 'Все' && c.transmission !== filters.transmission) return false;

    if (filters.seatsMin > 0 && c.seats < filters.seatsMin) return false;

    if (c.pricePerDay < filters.priceMin || c.pricePerDay > filters.priceMax) return false;

    return true;
  });
}

export function isFiltersActive(filters: CarFilters): boolean {
  return (
    filters.type !== 'Все' ||
    filters.transmission !== 'Все' ||
    filters.seatsMin !== 0 ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX
  );
}

