import { describe, it, expect } from 'vitest';
import type { Car } from '../lib/api';
import {
  applyFilters,
  isFiltersActive,
  carTypeLabel,
  transmissionLabel,
  DEFAULT_FILTERS,
  PRICE_MIN,
  PRICE_MAX,
} from './carFilters';

const car = (overrides: Partial<Car> = {}): Car => ({
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  pricePerDay: 3000,
  ...overrides,
});

describe('applyFilters — местоположение', () => {
  it('без фильтров возвращает все машины', () => {
    const cars = [car({ id: 1 }), car({ id: 2 }), car({ id: 3 })];
    expect(applyFilters(cars, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it('фильтр по городу — совпадение по полю city', () => {
    const cars = [
      car({ id: 1, city: 'Махачкала' }),
      car({ id: 2, city: 'Дербент' }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по городу — совпадение по полю location (запасной вариант)', () => {
    const cars = [
      car({ id: 1, city: undefined, location: 'Махачкала' }),
      car({ id: 2, city: 'Дербент' }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по городу не выбирает машины без совпадения', () => {
    const cars = [car({ city: 'Каспийск' })];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } });
    expect(result).toHaveLength(0);
  });

  it('фильтр по району — совпадение по полю district', () => {
    const cars = [
      car({ id: 1, district: 'Акушинский район' }),
      car({ id: 2, district: 'Ахтынский район' }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по району — определяет район через населённый пункт в city', () => {
    // Акуша → Акушинский район (через getSettlementDistrict)
    const cars = [
      car({ id: 1, city: 'Акуша', district: undefined }),
      car({ id: 2, city: 'Ахты',  district: undefined }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('фильтр по району — определяет район через населённый пункт в location', () => {
    const cars = [car({ id: 1, city: undefined, location: 'Акуша', district: undefined })];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, locationFilter: { displayName: 'Акушинский район', district: 'Акушинский район' } });
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — тип и трансмиссия', () => {
  it('фильтр по типу — возвращает только нужный тип', () => {
    const cars = [
      car({ id: 1, type: 'Седан' }),
      car({ id: 2, type: 'Кроссовер' }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, type: 'Седан' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('тип "Все" не фильтрует', () => {
    const cars = [car({ type: 'Седан' }), car({ type: 'Кроссовер' })];
    expect(applyFilters(cars, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по трансмиссии — нормализует значение', () => {
    const cars = [
      car({ id: 1, transmission: 'автомат' }),
      car({ id: 2, transmission: 'Automatic' }),
      car({ id: 3, transmission: 'механика' }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, transmission: 'автомат' });
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining([1, 2]));
    expect(result.find((c) => c.id === 3)).toBeUndefined();
  });

  it('трансмиссия "Все" не фильтрует', () => {
    const cars = [car({ transmission: 'автомат' }), car({ transmission: 'механика' })];
    expect(applyFilters(cars, DEFAULT_FILTERS)).toHaveLength(2);
  });
});

describe('applyFilters — места и цена', () => {
  it('фильтр по минимальному числу мест', () => {
    const cars = [
      car({ id: 1, seats: 3 }),
      car({ id: 2, seats: 5 }),
      car({ id: 3, seats: 7 }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, seatsMin: 5 });
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining([2, 3]));
    expect(result.find((c) => c.id === 1)).toBeUndefined();
  });

  it('seatsMin = 0 не фильтрует', () => {
    const cars = [car({ seats: 2 }), car({ seats: 5 })];
    expect(applyFilters(cars, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('фильтр по диапазону цен', () => {
    const cars = [
      car({ id: 1, pricePerDay: 1000 }),
      car({ id: 2, pricePerDay: 3000 }),
      car({ id: 3, pricePerDay: 8000 }),
    ];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, priceMin: 2000, priceMax: 5000 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('граничные значения цены включены', () => {
    const cars = [car({ pricePerDay: 2000 }), car({ pricePerDay: 5000 })];
    const result = applyFilters(cars, { ...DEFAULT_FILTERS, priceMin: 2000, priceMax: 5000 });
    expect(result).toHaveLength(2);
  });
});

describe('isFiltersActive', () => {
  it('дефолтные фильтры неактивны', () => {
    expect(isFiltersActive(DEFAULT_FILTERS)).toBe(false);
  });

  it('активен при выбранном городе', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, locationFilter: { displayName: 'Махачкала', city: 'Махачкала' } })).toBe(true);
  });

  it('активен при выбранном типе', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, type: 'Седан' })).toBe(true);
  });

  it('активен при выбранной трансмиссии', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, transmission: 'автомат' })).toBe(true);
  });

  it('активен при seatsMin > 0', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, seatsMin: 4 })).toBe(true);
  });

  it('активен при изменённом диапазоне цен', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMin: 1000 })).toBe(true);
    expect(isFiltersActive({ ...DEFAULT_FILTERS, priceMax: 5000 })).toBe(true);
  });

  it('активен при выбранной сортировке', () => {
    expect(isFiltersActive({ ...DEFAULT_FILTERS, sort: 'price_asc' })).toBe(true);
  });
});

describe('carTypeLabel', () => {
  it('переводит английский тип на русский', () => {
    expect(carTypeLabel('suv')).toBe('Кроссовер');
    expect(carTypeLabel('sedan')).toBe('Седан');
    expect(carTypeLabel('van')).toBe('Минивэн');
  });

  it('не чувствителен к регистру', () => {
    expect(carTypeLabel('SUV')).toBe('Кроссовер');
  });

  it('возвращает исходное значение если тип неизвестен', () => {
    expect(carTypeLabel('unknown')).toBe('unknown');
  });

  it('возвращает undefined для undefined', () => {
    expect(carTypeLabel(undefined)).toBeUndefined();
  });
});

describe('transmissionLabel', () => {
  it('переводит значения трансмиссии', () => {
    expect(transmissionLabel('автомат')).toBe('Автомат');
    expect(transmissionLabel('механика')).toBe('Механика');
    expect(transmissionLabel('робот')).toBe('Робот');
  });

  it('нормализует английские значения', () => {
    expect(transmissionLabel('automatic')).toBe('Автомат');
    expect(transmissionLabel('manual')).toBe('Механика');
  });

  it('возвращает undefined для undefined', () => {
    expect(transmissionLabel(undefined)).toBeUndefined();
  });
});
