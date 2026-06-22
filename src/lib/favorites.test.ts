import { describe, it, expect, beforeEach } from 'vitest';
import { localFavorites } from './favorites';
import type { FavoriteItem } from './favorites';

const house1: FavoriteItem = { type: 'house', id: 1 };
const house2: FavoriteItem = { type: 'house', id: 2 };
const car1:   FavoriteItem = { type: 'car',   id: 1 };

beforeEach(() => {
  localFavorites.clear();
});

describe('localFavorites.get', () => {
  it('возвращает пустой массив если localStorage пуст', () => {
    expect(localFavorites.get()).toEqual([]);
  });

  it('возвращает сохранённые элементы', () => {
    localFavorites.set([house1, car1]);
    expect(localFavorites.get()).toEqual([house1, car1]);
  });

  it('возвращает пустой массив при битом JSON', () => {
    localStorage.setItem('dagtour_favorites', 'не-json');
    expect(localFavorites.get()).toEqual([]);
  });
});

describe('localFavorites.add', () => {
  it('добавляет новый элемент', () => {
    localFavorites.add(house1);
    expect(localFavorites.get()).toContainEqual(house1);
  });

  it('не добавляет дубликат', () => {
    localFavorites.add(house1);
    localFavorites.add(house1);
    expect(localFavorites.get()).toHaveLength(1);
  });

  it('разные id одного типа — разные элементы', () => {
    localFavorites.add(house1);
    localFavorites.add(house2);
    expect(localFavorites.get()).toHaveLength(2);
  });

  it('одинаковый id разных типов — разные элементы', () => {
    localFavorites.add(house1);
    localFavorites.add(car1); // тот же id=1, но тип другой
    expect(localFavorites.get()).toHaveLength(2);
  });
});

describe('localFavorites.remove', () => {
  it('удаляет элемент по типу и id', () => {
    localFavorites.set([house1, car1]);
    localFavorites.remove('house', 1);
    expect(localFavorites.get()).toEqual([car1]);
  });

  it('не удаляет ничего лишнего', () => {
    localFavorites.set([house1, house2]);
    localFavorites.remove('house', 1);
    expect(localFavorites.get()).toEqual([house2]);
  });

  it('не падает если элемент не существует', () => {
    localFavorites.set([house1]);
    expect(() => localFavorites.remove('tour', 99)).not.toThrow();
    expect(localFavorites.get()).toEqual([house1]);
  });
});

describe('localFavorites.clear', () => {
  it('очищает все избранные', () => {
    localFavorites.set([house1, car1]);
    localFavorites.clear();
    expect(localFavorites.get()).toEqual([]);
  });
});
