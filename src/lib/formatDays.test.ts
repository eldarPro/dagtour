import { describe, it, expect } from 'vitest';
import { formatDays } from './formatDays';

describe('formatDays', () => {
  it('1 → "1 день"', () => {
    expect(formatDays(1)).toBe('1 день');
  });

  it('2, 3, 4 → "дня"', () => {
    expect(formatDays(2)).toBe('2 дня');
    expect(formatDays(3)).toBe('3 дня');
    expect(formatDays(4)).toBe('4 дня');
  });

  it('5–20 → "дней"', () => {
    [5, 6, 10, 11, 12, 13, 14, 20].forEach((n) => {
      expect(formatDays(n)).toBe(`${n} дней`);
    });
  });

  it('21 → "21 день"', () => {
    expect(formatDays(21)).toBe('21 день');
  });

  it('22, 23, 24 → "дня"', () => {
    expect(formatDays(22)).toBe('22 дня');
    expect(formatDays(23)).toBe('23 дня');
  });

  it('25–30 → "дней"', () => {
    expect(formatDays(25)).toBe('25 дней');
    expect(formatDays(30)).toBe('30 дней');
  });

  it('111, 112 → "дней" (исключения для 11-14)', () => {
    expect(formatDays(111)).toBe('111 дней');
    expect(formatDays(112)).toBe('112 дней');
  });
});
