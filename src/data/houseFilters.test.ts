import { describe, it, expect } from 'vitest';
import type { House } from '../lib/api';
import {
  applyFilters,
  isFiltersActive,
  DEFAULT_FILTERS,
  PRICE_MIN,
  PRICE_MAX,
} from './houseFilters';

const house = (overrides: Partial<House> = {}): House => ({
  id: 1,
  name: 'Тестовое жильё',
  pricePerNight: 2000,
  ...overrides,
});

describe('applyFilters — местоположение', () => {
  it('без фильтров возвращает все дома', () => {
    const houses = [house({ id: 1 }), house({ id: 2 }), house({ id: 3 })];
    expect(applyFilters(houses, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it('фильтр по городу — совпадение по city', () => {
    const houses = [
      house({ id: 1, city: 'Махачкала' }),
      house({ id: 2, city: 'Дербент' }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по городу — совпадение по location (запасной вариант)', () => {
    const houses = [
      house({ id: 1, city: undefined, location: 'Махачкала' }),
      house({ id: 2, city: 'Дербент' }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по району — совпадение по district', () => {
    const houses = [
      house({ id: 1, district: 'Акушинский район' }),
      house({ id: 2, district: 'Ахтынский район' }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по району — определяет район через населённый пункт в city', () => {
    const houses = [
      house({ id: 1, city: 'Акуша', district: undefined }),
      house({ id: 2, city: 'Ахты',  district: undefined }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

describe('applyFilters — тип, цена, комнаты, гости', () => {
  it('фильтр по типу жилья', () => {
    const houses = [
      house({ id: 1, houseType: 'Квартира' }),
      house({ id: 2, houseType: 'Дом' }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, houseType: 'Квартира' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('тип "Все" не фильтрует', () => {
    const houses = [house({ houseType: 'Квартира' }), house({ houseType: 'Дом' })];
    expect(applyFilters(houses, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по диапазону цен', () => {
    const houses = [
      house({ id: 1, pricePerNight: 500 }),
      house({ id: 2, pricePerNight: 2000 }),
      house({ id: 3, pricePerNight: 8000 }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, priceMin: 1000, priceMax: 5000 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('граничные значения цены включены', () => {
    const houses = [house({ pricePerNight: 1000 }), house({ pricePerNight: 5000 })];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, priceMin: 1000, priceMax: 5000 });
    expect(result).toHaveLength(2);
  });

  it('фильтр по числу комнат — минимум N комнат', () => {
    const houses = [
      house({ id: 1, rooms: 1 }),
      house({ id: 2, rooms: 2 }),
      house({ id: 3, rooms: 3 }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, minRooms: 2 });
    expect(result.map((h) => h.id)).toEqual(expect.arrayContaining([2, 3]));
    expect(result.find((h) => h.id === 1)).toBeUndefined();
  });

  it('minRooms = 0 не фильтрует', () => {
    const houses = [house({ rooms: 1 }), house({ rooms: 5 })];
    expect(applyFilters(houses, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по минимальному числу гостей', () => {
    const houses = [
      house({ id: 1, guests: 2 }),
      house({ id: 2, guests: 6 }),
    ];
    const result = applyFilters(houses, { ...DEFAULT_FILTERS, minGuests: 4 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('minGuests = 0 не фильтрует', () => {
    const houses = [house({ guests: 1 }), house({ guests: 10 })];
    expect(applyFilters(houses, DEFAULT_FILTERS)).toHaveLength(2);
  });
});

describe('isFiltersActive', () => {
  it('дефолтные фильтры неактивны', () => {
    expect(isFiltersActive(DEFAULT_FILTERS)).toBe(false);
  });

  it('активен при выбранном городе', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, locationFilter: { displayName: 'Дербент', city: 'Дербент' } })).toBe(true);
  });

  it('активен при выбранном типе жилья', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, houseType: 'Квартира' })).toBe(true);
  });

  it('активен при изменённом диапазоне цен', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMin: 500 })).toBe(true);
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMax: 10000 })).toBe(true);
  });

  it('активен при minRooms > 0', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, minRooms: 2 })).toBe(true);
  });

  it('активен при minGuests > 0', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, minGuests: 3 })).toBe(true);
  });

  it('активен при выбранной сортировке', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, sort: 'price_asc' })).toBe(true);
  });
});
