export interface MyHouse {
  id: string;
  name: string;
  pricePerNight: number;
  rooms: number;
  guests: number;
  description: string;
  createdAt: number;
  address?: string;
  lat?: number;
  lng?: number;
}

const KEY = 'dagtour_my_houses';

export const loadMyHouses = (): MyHouse[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyHouse[]) : [];
  } catch {
    return [];
  }
};

export const saveMyHouse = (house: MyHouse): void => {
  try {
    const list = loadMyHouses();
    localStorage.setItem(KEY, JSON.stringify([...list, house]));
  } catch {
    // ignore
  }
};

export const updateMyHouse = (updated: MyHouse): void => {
  try {
    const list = loadMyHouses().map((h) => (h.id === updated.id ? updated : h));
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const deleteMyHouse = (id: string): void => {
  try {
    const list = loadMyHouses().filter((h) => h.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};
