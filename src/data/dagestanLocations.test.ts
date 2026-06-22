import { describe, it, expect } from 'vitest';
import { getSettlementDistrict, cities, districts } from './dagestanLocations';

describe('getSettlementDistrict', () => {
  it('возвращает название района для известного населённого пункта', () => {
    expect(getSettlementDistrict('Акуша')).toBe('Акушинский район');
  });

  it('не чувствителен к регистру', () => {
    expect(getSettlementDistrict('акуша')).toBe('Акушинский район');
    expect(getSettlementDistrict('АКУША')).toBe('Акушинский район');
  });

  it('возвращает undefined для неизвестного населённого пункта', () => {
    expect(getSettlementDistrict('Москва')).toBeUndefined();
  });

  it('возвращает undefined для undefined', () => {
    expect(getSettlementDistrict(undefined)).toBeUndefined();
  });

  it('возвращает undefined для пустой строки', () => {
    expect(getSettlementDistrict('')).toBeUndefined();
  });

  it('каждый населённый пункт из districts возвращает какой-то район', () => {
    // Примечание: одинаковые названия в разных районах → Map возвращает последнее вхождение.
    // Тест проверяет, что функция возвращает непустую строку для каждого известного сёла.
    for (const d of districts) {
      for (const s of d.settlements) {
        const result = getSettlementDistrict(s.name);
        expect(result, `${s.name} должен быть в каком-то районе`).toBeTruthy();
        expect(result).toMatch(/район$/);
      }
    }
  });

  it('массив cities содержит хотя бы Махачкалу и Дербент', () => {
    const names = cities.map((c) => c.name);
    expect(names).toContain('Махачкала');
    expect(names).toContain('Дербент');
  });
});
