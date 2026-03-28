export interface MyTour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  route: string[];
  meetingPoint?: string;
  address?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
}

const KEY = 'dagtour_my_tours';

export const loadMyTours = (): MyTour[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyTour[]) : [];
  } catch {
    return [];
  }
};

export const saveMyTour = (tour: MyTour): void => {
  try {
    const list = loadMyTours();
    localStorage.setItem(KEY, JSON.stringify([...list, tour]));
  } catch {
    // ignore
  }
};

export const updateMyTour = (updated: MyTour): void => {
  try {
    const list = loadMyTours().map((t) => (t.id === updated.id ? updated : t));
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const deleteMyTour = (id: string): void => {
  try {
    const list = loadMyTours().filter((t) => t.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};
