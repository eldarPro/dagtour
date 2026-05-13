import { supabase } from './supabase';

// === Unified interfaces ===

export interface Car {
  id: number;
  userId?: string;
  brand: string;
  model: string;
  year?: number;
  pricePerDay: number;
  photo?: string;
  photos?: string[];
  type?: string;
  seats?: number;
  transmission?: string;
  description?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface House {
  id: number;
  userId?: string;
  name: string;
  description?: string;
  pricePerNight: number;
  photo?: string;
  photos?: string[];
  location?: string;
  rating?: number;
  rooms?: number;
  guests?: number | null;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface Tour {
  id: number;
  userId?: string;
  name: string;
  description?: string;
  duration: string;
  price: number;
  photo?: string;
  photos?: string[];
  route: string[];
  phone?: string;
  meetingPoint?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

// === Mappers ===

const mapCar = (c: Record<string, unknown>): Car => {
  const photos = Array.isArray(c.photos) ? (c.photos as string[]).filter(Boolean) : [];
  const photo = photos[0] ?? (c.photo as string | undefined);
  return {
    id: c.id as number,
    userId: c.user_id as string | undefined,
    brand: c.brand as string,
    model: c.model as string,
    year: c.year as number | undefined,
    pricePerDay: c.price_per_day as number,
    photo,
    photos,
    type: c.type as string | undefined,
    seats: c.seats as number | undefined,
    transmission: c.transmission as string | undefined,
    description: c.description as string | undefined,
    phone: c.phone as string | undefined,
    address: c.address as string | undefined,
    lat: c.lat as number | undefined,
    lng: c.lng as number | undefined,
  };
};

const mapHouse = (h: Record<string, unknown>): House => {
  const photos = Array.isArray(h.photos) ? (h.photos as string[]).filter(Boolean) : [];
  const photo = photos[0] ?? (h.photo as string | undefined);
  return {
    id: h.id as number,
    userId: h.user_id as string | undefined,
    name: h.name as string,
    description: h.description as string | undefined,
    pricePerNight: h.price_per_night as number,
    photo,
    photos,
    location: h.location as string | undefined,
    rating: h.rating as number | undefined,
    rooms: h.rooms as number | undefined,
    guests: h.guests != null ? (h.guests as number) : null,
    phone: h.phone as string | undefined,
    lat: h.lat as number | undefined,
    lng: h.lng as number | undefined,
  };
};

const mapTour = (t: Record<string, unknown>): Tour => {
  const photos = Array.isArray(t.photos) ? (t.photos as string[]).filter(Boolean) : [];
  const photo = photos[0] ?? (t.photo as string | undefined);
  return {
    id: t.id as number,
    userId: t.user_id as string | undefined,
    name: t.name as string,
    description: t.description as string | undefined,
    duration: t.duration as string,
    price: t.price as number,
    photo,
    photos,
    route: t.route as string[],
    phone: t.phone as string | undefined,
    meetingPoint: t.meeting_point as string | undefined,
    address: t.address as string | undefined,
    lat: t.lat as number | undefined,
    lng: t.lng as number | undefined,
  };
};

// === META ===

const PRICE_FIELD: Record<string, { table: string; field: string }> = {
  cars_max_price:   { table: 'cars',   field: 'price_per_day'   },
  houses_max_price: { table: 'houses', field: 'price_per_night' },
  tours_max_price:  { table: 'tours',  field: 'price'           },
};

export const getMaxPrice = async (key: 'cars_max_price' | 'houses_max_price' | 'tours_max_price'): Promise<number> => {
  const { data: meta } = await supabase.from('meta').select('value').eq('key', key).maybeSingle();
  const metaVal = (meta?.value as number) ?? 0;
  if (metaVal > 0) return metaVal;

  const { table, field } = PRICE_FIELD[key];
  const { data: rows } = await supabase.from(table).select(field);
  if (!rows?.length) return 0;
  return Math.max(...rows.map((r) => ((r as unknown as Record<string, unknown>)[field] as number) ?? 0));
};

// === CARS ===

export interface CarFilterParams {
  type?: string;
  transmission?: string;
  seatsMin?: number;
  priceMin?: number;
  priceMax?: number;
  excludeUserId?: string;
}

export interface PagedResult<T> {
  data: T[];
  hasMore: boolean;
}

export const getCars = async (): Promise<Car[]> => {
  const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapCar);
};

export const getCarsFiltered = async (
  params: CarFilterParams,
  offset: number,
  limit: number,
): Promise<PagedResult<Car>> => {
  let query = supabase.from('cars').select('*', { count: 'exact' });

  if (params.excludeUserId) query = query.neq('user_id', params.excludeUserId);
  if (params.type && params.type !== 'Все') query = query.eq('type', params.type);
  if (params.transmission && params.transmission !== 'Все') query = query.eq('transmission', params.transmission);
  if (params.seatsMin && params.seatsMin > 0) query = query.gte('seats', params.seatsMin);
  if (params.priceMin != null) query = query.gte('price_per_day', params.priceMin);
  if (params.priceMax != null) query = query.lte('price_per_day', params.priceMax);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data.map(mapCar), hasMore: (count ?? 0) > offset + limit };
};

export const getMyCars = async (userId: string): Promise<Car[]> => {
  const { data, error } = await supabase.from('cars').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapCar);
};

export const getCar = async (id: number): Promise<Car | null> => {
  const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
  if (error) return null;
  return mapCar(data);
};

export const createCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  const photos = car.photos ?? [];
  const payload: Record<string, unknown> = {
    user_id: car.userId,
    brand: car.brand,
    model: car.model,
    price_per_day: car.pricePerDay,
    transmission: car.transmission,
    description: car.description,
    phone: car.phone || null,
    address: car.address,
    lat: car.lat,
    lng: car.lng,
    photos,
    photo: photos[0] ?? null,
  };
  if (car.year) payload.year = car.year;
  const { data, error } = await supabase.from('cars').insert(payload).select().single();
  if (error) throw error;
  return mapCar(data);
};

export const updateCar = async (id: number, updates: Partial<Car>): Promise<Car> => {
  const payload: Record<string, unknown> = {};
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.model !== undefined) payload.model = updates.model;
  if (updates.year !== undefined) payload.year = updates.year;
  if (updates.pricePerDay !== undefined) payload.price_per_day = updates.pricePerDay;
  if (updates.transmission !== undefined) payload.transmission = updates.transmission;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;
  if (updates.photos !== undefined) {
    payload.photos = updates.photos;
    payload.photo = updates.photos[0] ?? null;
  }
  const { data, error } = await supabase.from('cars').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapCar(data);
};

export const deleteCar = async (id: number): Promise<void> => {
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) throw error;
};

// === HOUSES ===

export interface HouseFilterParams {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  minRooms?: number;
  minRating?: number;
  minGuests?: number;
  excludeUserId?: string;
}

export const getHouseLocations = async (): Promise<string[]> => {
  const { data } = await supabase.from('houses').select('location').not('location', 'is', null);
  const unique = [...new Set((data ?? []).map((r) => r.location as string).filter(Boolean))].sort();
  return ['Все', ...unique];
};

export const getHouses = async (): Promise<House[]> => {
  const { data, error } = await supabase.from('houses').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapHouse);
};

export const getHousesFiltered = async (
  params: HouseFilterParams,
  offset: number,
  limit: number,
): Promise<PagedResult<House>> => {
  let query = supabase.from('houses').select('*', { count: 'exact' });

  if (params.excludeUserId) query = query.neq('user_id', params.excludeUserId);
  if (params.location && params.location !== 'Все') query = query.eq('location', params.location);
  if (params.priceMin != null) query = query.gte('price_per_night', params.priceMin);
  if (params.priceMax != null) query = query.lte('price_per_night', params.priceMax);
  if (params.minRooms && params.minRooms > 0) {
    if (params.minRooms >= 4) query = query.gte('rooms', 4);
    else query = query.eq('rooms', params.minRooms);
  }
  if (params.minRating && params.minRating > 0) query = query.gte('rating', params.minRating);
  if (params.minGuests && params.minGuests > 0) query = query.gte('guests', params.minGuests);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data.map(mapHouse), hasMore: (count ?? 0) > offset + limit };
};

export const getMyHouses = async (userId: string): Promise<House[]> => {
  const { data, error } = await supabase.from('houses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapHouse);
};

export const getHouse = async (id: number): Promise<House | null> => {
  const { data, error } = await supabase.from('houses').select('*').eq('id', id).single();
  if (error) return null;
  return mapHouse(data);
};

export const createHouse = async (house: Omit<House, 'id'>): Promise<House> => {
  const photos = house.photos ?? [];
  const payload: Record<string, unknown> = {
    user_id: house.userId,
    name: house.name,
    description: house.description,
    price_per_night: house.pricePerNight,
    rooms: house.rooms,
    guests: house.guests ?? null,
    phone: house.phone || null,
    location: house.location,
    lat: house.lat,
    lng: house.lng,
    photos,
    photo: photos[0] ?? null,
  };
  const { data, error } = await supabase.from('houses').insert(payload).select().single();
  if (error) throw error;
  return mapHouse(data);
};

export const updateHouse = async (id: number, updates: Partial<House>): Promise<House> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.pricePerNight !== undefined) payload.price_per_night = updates.pricePerNight;
  if (updates.rooms !== undefined) payload.rooms = updates.rooms;
  if ('guests' in updates) payload.guests = updates.guests ?? null;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;
  if (updates.photos !== undefined) {
    payload.photos = updates.photos;
    payload.photo = updates.photos[0] ?? null;
  }
  const { data, error } = await supabase.from('houses').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapHouse(data);
};

export const deleteHouse = async (id: number): Promise<void> => {
  const { error } = await supabase.from('houses').delete().eq('id', id);
  if (error) throw error;
};

export const getTourRoutePoints = async (): Promise<string[]> => {
  const { data } = await supabase.from('tours').select('route');
  const points = (data ?? []).flatMap((r) => (r.route as string[]) ?? []);
  const unique = [...new Set(points)].sort();
  return ['Все', ...unique];
};

// === TOURS ===

export interface TourFilterParams {
  duration?: string;
  routePoint?: string;
  priceMin?: number;
  priceMax?: number;
}

export const getTours = async (): Promise<Tour[]> => {
  const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapTour);
};

export const getToursFiltered = async (
  params: TourFilterParams,
  offset: number,
  limit: number,
): Promise<PagedResult<Tour>> => {
  let query = supabase.from('tours').select('*', { count: 'exact' });

  if (params.duration && params.duration !== 'Все') query = query.eq('duration', params.duration);
  if (params.routePoint && params.routePoint !== 'Все') query = query.contains('route', [params.routePoint]);
  if (params.priceMin != null) query = query.gte('price', params.priceMin);
  if (params.priceMax != null) query = query.lte('price', params.priceMax);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data.map(mapTour), hasMore: (count ?? 0) > offset + limit };
};

export const getMyTours = async (userId: string): Promise<Tour[]> => {
  const { data, error } = await supabase.from('tours').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapTour);
};

export const getTour = async (id: number): Promise<Tour | null> => {
  const { data, error } = await supabase.from('tours').select('*').eq('id', id).single();
  if (error) return null;
  return mapTour(data);
};

export const createTour = async (tour: Omit<Tour, 'id'>): Promise<Tour> => {
  const photos = tour.photos ?? [];
  const payload: Record<string, unknown> = {
    user_id: tour.userId,
    name: tour.name,
    description: tour.description,
    duration: tour.duration,
    price: tour.price,
    route: tour.route,
    phone: tour.phone || null,
    meeting_point: tour.meetingPoint,
    address: tour.address,
    lat: tour.lat,
    lng: tour.lng,
    photos,
    photo: photos[0] ?? null,
  };
  const { data, error } = await supabase.from('tours').insert(payload).select().single();
  if (error) throw error;
  return mapTour(data);
};

export const updateTour = async (id: number, updates: Partial<Tour>): Promise<Tour> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.duration !== undefined) payload.duration = updates.duration;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.route !== undefined) payload.route = updates.route;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.meetingPoint !== undefined) payload.meeting_point = updates.meetingPoint;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;
  if (updates.photos !== undefined) {
    payload.photos = updates.photos;
    payload.photo = updates.photos[0] ?? null;
  }
  const { data, error } = await supabase.from('tours').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapTour(data);
};

export const deleteTour = async (id: number): Promise<void> => {
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) throw error;
};
