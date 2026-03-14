export interface MyCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  transmission: string;
  description: string;
  createdAt: number;
  address?: string;
  lat?: number;
  lng?: number;
}

const KEY = 'dagtour_my_cars';

export const loadMyCars = (): MyCar[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyCar[]) : [];
  } catch {
    return [];
  }
};

export const saveMyCar = (car: MyCar): void => {
  try {
    const list = loadMyCars();
    localStorage.setItem(KEY, JSON.stringify([...list, car]));
  } catch {
    // ignore
  }
};

export const updateMyCar = (updated: MyCar): void => {
  try {
    const list = loadMyCars().map((c) => (c.id === updated.id ? updated : c));
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const deleteMyCar = (id: string): void => {
  try {
    const list = loadMyCars().filter((c) => c.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};
