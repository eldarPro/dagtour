import { countries } from '../data/countries';

const applyMask = (digits: string, mask: string | string[]): string => {
  const m = Array.isArray(mask) ? mask[0] : mask;
  let result = '';
  let di = 0;
  for (let i = 0; i < m.length; i++) {
    if (di >= digits.length) break;
    if (m[i] === '9') {
      result += digits[di++];
    } else {
      result += m[i];
    }
  }
  return result;
};

const sorted = [...countries].sort((a, b) => b.code.length - a.code.length);

export const formatPhone = (val: string): string => {
  if (!val) return val;
  const normalized = val.startsWith('+') ? val : '+' + val;
  const match = sorted.find(c => normalized.startsWith(c.code));
  if (match) {
    const digits = normalized.slice(match.code.length).replace(/\D/g, '');
    return `${match.code} ${applyMask(digits, match.mask)}`;
  }
  return val;
};
