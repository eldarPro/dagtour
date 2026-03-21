import { supabase } from './supabase';

// === Типы для фронтенда (camelCase) ===

export interface House {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  photo: string;
  location: string;
  rating: number;
  rooms: number;
  guests: number;
  lat: number;
  lng: number;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  pricePerDay: number;
  photo: string;
  type: 'эконом' | 'комфорт' | 'внедорожник';
  seats: number;
  transmission: string;
  lat: number;
  lng: number;
}

export interface Tour {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  photo: string;
  route: string[];
}

export interface UserCar {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  transmission: string;
  description: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface UserHouse {
  id: string;
  userId: string;
  name: string;
  pricePerNight: number;
  rooms: number;
  guests: number;
  description: string;
  address?: string;
  lat?: number;
  lng?: number;
}

// === Конвертеры snake_case → camelCase ===

const mapHouse = (h: Record<string, unknown>): House => ({
  id: h.id as number,
  name: h.name as string,
  description: h.description as string,
  pricePerNight: h.price_per_night as number,
  photo: h.photo as string,
  location: h.location as string,
  rating: h.rating as number,
  rooms: h.rooms as number,
  guests: h.guests as number,
  lat: h.lat as number,
  lng: h.lng as number,
});

const mapCar = (c: Record<string, unknown>): Car => ({
  id: c.id as number,
  brand: c.brand as string,
  model: c.model as string,
  pricePerDay: c.price_per_day as number,
  photo: c.photo as string,
  type: c.type as Car['type'],
  seats: c.seats as number,
  transmission: c.transmission as string,
  lat: c.lat as number,
  lng: c.lng as number,
});

const mapTour = (t: Record<string, unknown>): Tour => ({
  id: t.id as number,
  name: t.name as string,
  description: t.description as string,
  duration: t.duration as string,
  price: t.price as number,
  photo: t.photo as string,
  route: t.route as string[],
});

const mapUserCar = (c: Record<string, unknown>): UserCar => ({
  id: c.id as string,
  userId: c.user_id as string,
  brand: c.brand as string,
  model: c.model as string,
  year: c.year as number,
  pricePerDay: c.price_per_day as number,
  transmission: c.transmission as string,
  description: c.description as string,
  address: c.address as string | undefined,
  lat: c.lat as number | undefined,
  lng: c.lng as number | undefined,
});

const mapUserHouse = (h: Record<string, unknown>): UserHouse => ({
  id: h.id as string,
  userId: h.user_id as string,
  name: h.name as string,
  pricePerNight: h.price_per_night as number,
  rooms: h.rooms as number,
  guests: h.guests as number,
  description: h.description as string,
  address: h.address as string | undefined,
  lat: h.lat as number | undefined,
  lng: h.lng as number | undefined,
});

// === HOUSES ===

export const getHouses = async (): Promise<House[]> => {
  const { data, error } = await supabase.from('houses').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapHouse);
};

export const getHouse = async (id: number): Promise<House | null> => {
  const { data, error } = await supabase.from('houses').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? mapHouse(data) : null;
};

// === CARS ===

export const getCars = async (): Promise<Car[]> => {
  const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapCar);
};

export const getCar = async (id: number): Promise<Car | null> => {
  const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? mapCar(data) : null;
};

// === TOURS ===

export const getTours = async (): Promise<Tour[]> => {
  const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapTour);
};

export const getTour = async (id: number): Promise<Tour | null> => {
  const { data, error } = await supabase.from('tours').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? mapTour(data) : null;
};

// === USER CARS ===

export const getUserCars = async (userId: string): Promise<UserCar[]> => {
  const { data, error } = await supabase.from('user_cars').select('*').eq('user_id', userId);
  if (error) throw error;
  return data.map(mapUserCar);
};

export const createUserCar = async (car: Omit<UserCar, 'id'>): Promise<UserCar> => {
  const payload = {
    user_id: car.userId,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price_per_day: car.pricePerDay,
    transmission: car.transmission,
    description: car.description,
    address: car.address,
    lat: car.lat,
    lng: car.lng,
  };
  const { data, error } = await supabase.from('user_cars').insert(payload).select().single();
  if (error) throw error;
  return mapUserCar(data);
};

export const updateUserCar = async (id: string, updates: Partial<UserCar>): Promise<UserCar> => {
  const payload: Record<string, unknown> = {};
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.model !== undefined) payload.model = updates.model;
  if (updates.year !== undefined) payload.year = updates.year;
  if (updates.pricePerDay !== undefined) payload.price_per_day = updates.pricePerDay;
  if (updates.transmission !== undefined) payload.transmission = updates.transmission;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;

  const { data, error } = await supabase.from('user_cars').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapUserCar(data);
};

export const deleteUserCar = async (id: string): Promise<void> => {
  const { error } = await supabase.from('user_cars').delete().eq('id', id);
  if (error) throw error;
};

// === USER HOUSES ===

export const getUserHouses = async (userId: string): Promise<UserHouse[]> => {
  const { data, error } = await supabase.from('user_houses').select('*').eq('user_id', userId);
  if (error) throw error;
  return data.map(mapUserHouse);
};

export const createUserHouse = async (house: Omit<UserHouse, 'id'>): Promise<UserHouse> => {
  const payload = {
    user_id: house.userId,
    name: house.name,
    price_per_night: house.pricePerNight,
    rooms: house.rooms,
    guests: house.guests,
    description: house.description,
    address: house.address,
    lat: house.lat,
    lng: house.lng,
  };
  const { data, error } = await supabase.from('user_houses').insert(payload).select().single();
  if (error) throw error;
  return mapUserHouse(data);
};

export const updateUserHouse = async (id: string, updates: Partial<UserHouse>): Promise<UserHouse> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.pricePerNight !== undefined) payload.price_per_night = updates.pricePerNight;
  if (updates.rooms !== undefined) payload.rooms = updates.rooms;
  if (updates.guests !== undefined) payload.guests = updates.guests;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;

  const { data, error } = await supabase.from('user_houses').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapUserHouse(data);
};

export const deleteUserHouse = async (id: string): Promise<void> => {
  const { error } = await supabase.from('user_houses').delete().eq('id', id);
  if (error) throw error;
};
