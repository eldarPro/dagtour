import { describe, it, expect } from 'vitest';
import type { Tour } from '../lib/api';
import {
  applyFilters,
  isFiltersActive,
  durationToParams,
  DEFAULT_FILTERS,
  PRICE_MIN,
  PRICE_MAX,
} from './tourFilters';

const tour = (overrides: Partial<Tour> = {}): Tour => ({
  id: 1,
  name: 'Тестовый тур',
  duration: 1,
  price: 5000,
  route: [],
  ...overrides,
});

describe('applyFilters — местоположение', () => {
  it('без фильтров возвращает все туры', () => {
    const tours = [tour({ id: 1 }), tour({ id: 2 })];
    expect(applyFilters(tours, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по городу — совпадение по city', () => {
    const tours = [
      tour({ id: 1, city: 'Махачкала' }),
      tour({ id: 2, city: 'Дербент' }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по городу не смотрит в location (в отличие от домов и машин)', () => {
    const tours = [tour({ id: 1, city: undefined, location: 'Махачкала' })];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(0);
  });

  it('фильтр по району — совпадение по district', () => {
    const tours = [
      tour({ id: 1, district: 'Акушинский район' }),
      tour({ id: 2, district: 'Ахтынский район' }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по району — определяет район через населённый пункт в city', () => {
    const tours = [
      tour({ id: 1, city: 'Акуша', district: undefined }),
      tour({ id: 2, city: 'Ахты',  district: undefined }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

describe('applyFilters — продолжительность', () => {
  it('фильтр по конкретной продолжительности (точное совпадение)', () => {
    const tours = [
      tour({ id: 1, duration: 1 }),
      tour({ id: 2, duration: 2 }),
      tour({ id: 3, duration: 3 }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, duration: 2 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('фильтр "4+" включает туры продолжительностью 4 и более дней', () => {
    const tours = [
      tour({ id: 1, duration: 3 }),
      tour({ id: 2, duration: 4 }),
      tour({ id: 3, duration: 7 }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, duration: '4+' });
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([2, 3]));
    expect(result.find((t) => t.id === 1)).toBeUndefined();
  });

  it('продолжительность "Все" не фильтрует', () => {
    const tours = [tour({ duration: 1 }), tour({ duration: 5 })];
    expect(applyFilters(tours, DEFAULT_FILTERS)).toHaveLength(2);
  });
});

describe('applyFilters — точка встречи и цена', () => {
  it('фильтр по точке встречи', () => {
    const tours = [
      tour({ id: 1, meetingPoint: 'Махачкала' }),
      tour({ id: 2, meetingPoint: 'Дербент' }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, meetingPoint: 'Махачкала' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('meetingPoint "Все" не фильтрует', () => {
    const tours = [tour({ meetingPoint: 'Махачкала' }), tour({ meetingPoint: 'Дербент' })];
    expect(applyFilters(tours, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по диапазону цен', () => {
    const tours = [
      tour({ id: 1, price: 1000 }),
      tour({ id: 2, price: 5000 }),
      tour({ id: 3, price: 15000 }),
    ];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, priceMin: 3000, priceMax: 10000 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('граничные значения цены включены', () => {
    const tours = [tour({ price: 3000 }), tour({ price: 10000 })];
    const result = applyFilters(tours, { ...DEFAULT_FILTERS, priceMin: 3000, priceMax: 10000 });
    expect(result).toHaveLength(2);
  });
});

describe('durationToParams', () => {
  it('"Все" возвращает пустой объект', () => {
    expect(durationToParams('Все')).toEqual({});
  });

  it('конкретное число возвращает min и max равными', () => {
    expect(durationToParams(1)).toEqual({ durationMin: 1, durationMax: 1 });
    expect(durationToParams(3)).toEqual({ durationMin: 3, durationMax: 3 });
  });

  it('"4+" возвращает только durationMin: 4', () => {
    expect(durationToParams('4+')).toEqual({ durationMin: 4 });
  });
});

describe('isFiltersActive', () => {
  it('дефолтные фильтры неактивны', () => {
    expect(isFiltersActive(DEFAULT_FILTERS)).toBe(false);
  });

  it('активен при выбранном городе', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } })).toBe(true);
  });

  it('активен при выбранной продолжительности', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, duration: 2 })).toBe(true);
  });

  it('активен при выбранной точке встречи', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, meetingPoint: 'Дербент' })).toBe(true);
  });

  it('активен при изменённом диапазоне цен', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMin: 1000 })).toBe(true);
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMax: 20000 })).toBe(true);
  });

  it('активен при выбранной сортировке', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, sort: 'rating_desc' })).toBe(true);
  });
});
