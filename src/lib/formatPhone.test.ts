import { describe, it, expect } from 'vitest';
import { formatPhone } from './formatPhone';

describe('formatPhone', () => {
  it('форматирует российский номер +7', () => {
    const result = formatPhone('+79001234567');
    expect(result).toContain('+7');
    expect(result).toContain('900');
  });

  it('форматирует номер без плюса (добавляет + перед поиском)', () => {
    const result = formatPhone('79001234567');
    expect(result).toContain('+7');
  });

  it('возвращает исходное значение если страна не распознана', () => {
    expect(formatPhone('0001234567')).toBe('0001234567');
  });

  it('возвращает пустую строку для пустого значения', () => {
    expect(formatPhone('')).toBe('');
  });

  it('форматирует азербайджанский номер +994', () => {
    const result = formatPhone('+994501234567');
    expect(result).toContain('+994');
  });
});
