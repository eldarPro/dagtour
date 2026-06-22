import type { House } from '../lib/api';
import type { LocationFilter } from '../components/LocationFilterPicker';
import { getSettlementDistrict } from './dagestanLocations';

export { EMPTY_LOCATION_FILTER } from '../components/LocationFilterPicker';

export const PRICE_MIN = 0;
export const PRICE_MAX = 99999;

export interface HouseFilters {
  locationFilter: LocationFilter;
  houseType: string;
  priceMin: number;
  priceMax: number;
  minRooms: number;
  minGuests: number;
  sort?: string;
}

export const DEFAULT_FILTERS: HouseFilters = {
  locationFilter: { displayName: '' },
  houseType: 'Все',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  minRooms: 0,
  minGuests: 0,
  sort: undefined,
};

export function applyFilters(houses: House[], filters: HouseFilters): House[] {
  return houses.filter((h) => {
    const lf = filters.locationFilter;
    if (lf.city) {
      if (h.city !== lf.city && h.location !== lf.city) return false;
    } else if (lf.district) {
      const cityDistrict = getSettlementDistrict(h.city) ?? getSettlementDistrict(h.location);
      if (h.district !== lf.district && cityDistrict !== lf.district) return false;
    }

    if (filters.houseType !== 'Все' && h.houseType !== filters.houseType) return false;

    if (h.pricePerNight < filters.priceMin || h.pricePerNight > filters.priceMax) return false;

    if (filters.minRooms > 0 && (h.rooms ?? 0) < filters.minRooms) return false;

    if (filters.minGuests > 0 && (h.guests ?? 0) < filters.minGuests) return false;

    return true;
  });
}

export function isFiltersActive(filters: HouseFilters): boolean {
  return (
    !!filters.locationFilter.displayName ||
    filters.houseType !== 'Все' ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
    filters.minRooms !== 0 ||
    filters.minGuests !== 0 ||
    !!filters.sort
  );
}
