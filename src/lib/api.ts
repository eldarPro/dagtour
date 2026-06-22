import { apiFetch, buildQuery, ApiError } from './apiClient';

// === Base interfaces ===

export interface Author {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface BaseListing {
  id: number;
  userId?: string;
  photo?: string;
  photos?: string[];
  description?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  vk?: string;
  address?: string;
  lat?: number;
  lng?: number;
  location?: string;
  city?: string;
  district?: string;
  region?: string;
  rating?: number;
  reviewsCount?: number;
  active?: boolean;
  author?: Author;
}

export interface Car extends BaseListing {
  brand: string;
  model: string;
  year?: number;
  pricePerDay: number;
  type?: string;
  seats?: number;
  transmission?: string;
  conditions?: string[];
  deposit?: number;
}

export interface House extends BaseListing {
  name: string;
  pricePerNight: number;
  rooms?: number;
  guests?: number | null;
  houseType?: string;
  amenities?: string[];
}

export interface Tour extends BaseListing {
  name: string;
  duration: number;
  price: number;
  route: string[];
  meetingPoint?: string;
  included?: string[];
  maxPeople?: number;
}

export interface PagedResult<T> {
  data: T[];
  hasMore: boolean;
}

interface PagedResponse {
  data: Record<string, unknown>[];
  has_more: boolean;
}

// === Shared mappers ===

const mapAuthor = (a: unknown): Author | undefined => {
  if (!a || typeof a !== 'object') return undefined;
  const u = a as Record<string, unknown>;
  return { id: u.id as string, fullName: u.full_name as string | undefined, avatarUrl: u.avatar_url as string | undefined, bio: u.bio as string | undefined };
};

const mapPhotos = (data: Record<string, unknown>) => {
  const photos = Array.isArray(data.photos) ? (data.photos as string[]).filter(Boolean) : [];
  return { photo: photos[0] ?? (data.photo as string | undefined), photos };
};

const mapBaseFields = (data: Record<string, unknown>): BaseListing => {
  const { photo, photos } = mapPhotos(data);
  return {
    id: data.id as number,
    userId: data.user_id as string | undefined,
    photo,
    photos,
    description: data.description as string | undefined,
    phone: data.phone as string | undefined,
    whatsapp: data.whatsapp as string | undefined,
    telegram: data.telegram as string | undefined,
    vk: data.vk as string | undefined,
    address: data.address as string | undefined,
    lat: data.lat as number | undefined,
    lng: data.lng as number | undefined,
    location: data.location as string | undefined,
    city: data.city as string | undefined,
    district: data.district as string | undefined,
    region: data.region as string | undefined,
    rating: data.rating != null ? parseFloat(data.rating as string) : undefined,
    reviewsCount: data.reviews_count as number | undefined,
    active: data.active as boolean | undefined,
    author: mapAuthor(data.author),
  };
};

const buildCommonPayload = (item: Partial<BaseListing>): Record<string, unknown> => {
  const p: Record<string, unknown> = {};
  if (item.description !== undefined) p.description = item.description;
  if (item.phone !== undefined) p.phone = item.phone || null;
  if (item.whatsapp !== undefined) p.whatsapp = item.whatsapp || null;
  if (item.telegram !== undefined) p.telegram = item.telegram || null;
  if (item.vk !== undefined) p.vk = item.vk || null;
  if (item.address !== undefined) p.address = item.address;
  if (item.location !== undefined) p.location = item.location;
  if (item.city !== undefined) p.city = item.city;
  if (item.district !== undefined) p.district = item.district;
  if (item.region !== undefined) p.region = item.region;
  if (item.lat !== undefined) p.lat = item.lat;
  if (item.lng !== undefined) p.lng = item.lng;
  if (item.photos !== undefined) p.photos = item.photos;
  if (item.active !== undefined) p.active = item.active;
  return p;
};

// === Specific mappers ===

const mapCar = (c: Record<string, unknown>): Car => ({
  ...mapBaseFields(c),
  brand: c.brand as string,
  model: c.model as string,
  year: c.year as number | undefined,
  pricePerDay: c.price_per_day as number,
  type: c.type as string | undefined,
  seats: c.seats as number | undefined,
  transmission: c.transmission as string | undefined,
  conditions: Array.isArray(c.conditions) ? (c.conditions as string[]).filter(Boolean) : [],
  deposit: c.deposit as number | undefined,
});

const mapHouse = (h: Record<string, unknown>): House => ({
  ...mapBaseFields(h),
  name: h.name as string,
  pricePerNight: h.price_per_night as number,
  rooms: h.rooms as number | undefined,
  guests: h.guests != null ? (h.guests as number) : null,
  houseType: h.house_type as string | undefined,
  amenities: Array.isArray(h.amenities) ? (h.amenities as string[]).filter(Boolean) : [],
});

const mapTour = (t: Record<string, unknown>): Tour => ({
  ...mapBaseFields(t),
  name: t.name as string,
  duration: Number(t.duration),
  price: t.price as number,
  route: (t.route as string[]) ?? [],
  meetingPoint: t.meeting_point as string | undefined,
  included: Array.isArray(t.included) ? (t.included as string[]).filter(Boolean) : [],
  maxPeople: t.max_people as number | undefined,
});

// === META ===

let _metaCache: Record<string, unknown> | null = null;

const fetchMeta = async (): Promise<Record<string, unknown>> => {
  if (_metaCache) return _metaCache;
  _metaCache = await apiFetch<Record<string, unknown>>('/meta');
  return _metaCache!;
};

export const getMaxPrice = async (key: 'cars_max_price' | 'houses_max_price' | 'tours_max_price'): Promise<number> => {
  const meta = await fetchMeta();
  return (meta[key] as number) ?? 0;
};

export const fetchHouseTypes = async (): Promise<string[]> => {
  const meta = await fetchMeta();
  return (meta.house_types as string[]) ?? [];
};

// === CARS ===

export interface CarFilterParams {
  type?: string;
  transmission?: string;
  seatsMin?: number;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  district?: string;
  citiesInDistrict?: string[];
  excludeUserId?: string;
  sort?: string;
}

export interface CarPin {
  id: number;
  lat: number;
  lng: number;
  pricePerDay: number;
  name: string;
  photo?: string;
  location?: string;
  seats?: number;
  transmission?: string;
  year?: number;
}

export const getCars = async (): Promise<Car[]> => {
  const res = await apiFetch<PagedResponse>(`/cars${buildQuery({ limit: 100 })}`);
  return res.data.map(mapCar);
};

export const getCarsByIds = async (ids: number[]): Promise<Car[]> => {
  if (ids.length === 0) return [];
  const res = await apiFetch<PagedResponse>(`/cars${buildQuery({ ids, limit: ids.length })}`);
  return res.data.map(mapCar);
};

export const getCarsFiltered = async (params: CarFilterParams, offset: number, limit: number): Promise<PagedResult<Car>> => {
  const query = buildQuery({
    type: params.type && params.type !== 'Все' ? params.type : undefined,
    transmission: params.transmission && params.transmission !== 'Все' ? params.transmission : undefined,
    seats_min: params.seatsMin && params.seatsMin > 0 ? params.seatsMin : undefined,
    price_min: params.priceMin,
    price_max: params.priceMax,
    city: params.city || undefined,
    district: params.district || undefined,
    cities_in_district: params.citiesInDistrict,
    exclude_user_id: params.excludeUserId,
    sort: params.sort,
    offset,
    limit,
  });
  const res = await apiFetch<PagedResponse>(`/cars${query}`);
  return { data: res.data.map(mapCar), hasMore: res.has_more };
};

export const getCarPins = async (params: CarFilterParams): Promise<CarPin[]> => {
  const query = buildQuery({
    type: params.type && params.type !== 'Все' ? params.type : undefined,
    transmission: params.transmission && params.transmission !== 'Все' ? params.transmission : undefined,
    seats_min: params.seatsMin && params.seatsMin > 0 ? params.seatsMin : undefined,
    price_min: params.priceMin,
    price_max: params.priceMax,
    city: params.city || undefined,
    district: params.district || undefined,
    cities_in_district: params.citiesInDistrict,
    sort: params.sort,
  });
  const data = await apiFetch<Array<Record<string, unknown>>>(`/cars/pins${query}`);
  return data.map((d) => ({ id: d.id as number, lat: d.lat as number, lng: d.lng as number, pricePerDay: d.price_per_day as number, name: d.name as string, photo: d.photo as string | undefined, location: d.location as string | undefined, seats: d.seats as number | undefined, transmission: d.transmission as string | undefined, year: d.year as number | undefined }));
};

export const getMyCars = async (): Promise<Car[]> => {
  const res = await apiFetch<PagedResponse>('/cars/my');
  return res.data.map(mapCar);
};

export const getCar = async (id: number): Promise<Car | null> => {
  try {
    return mapCar(await apiFetch<Record<string, unknown>>(`/cars/${id}`));
  } catch {
    return null;
  }
};

const carPayload = (car: Partial<Car>): Record<string, unknown> => {
  const p = buildCommonPayload(car);
  if (car.brand !== undefined) p.brand = car.brand;
  if (car.model !== undefined) p.model = car.model;
  if (car.year !== undefined) p.year = car.year;
  if (car.pricePerDay !== undefined) p.price_per_day = car.pricePerDay;
  if (car.type !== undefined) p.car_type = car.type;
  if (car.seats !== undefined) p.seats = car.seats;
  if (car.transmission !== undefined) p.transmission = car.transmission;
  if (car.conditions !== undefined) p.conditions = car.conditions;
  if (car.deposit !== undefined) p.deposit = car.deposit;
  return p;
};

export const createCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  return mapCar(await apiFetch<Record<string, unknown>>('/cars', { method: 'POST', body: JSON.stringify(carPayload({ ...car, photos: car.photos ?? [] })) }));
};

export const updateCar = async (id: number, updates: Partial<Car>): Promise<Car> => {
  return mapCar(await apiFetch<Record<string, unknown>>(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(carPayload(updates)) }));
};

export const deleteCar = async (id: number): Promise<void> => {
  await apiFetch(`/cars/${id}`, { method: 'DELETE' });
};

// === HOUSES ===

export interface HouseFilterParams {
  city?: string;
  district?: string;
  citiesInDistrict?: string[];
  houseType?: string;
  priceMin?: number;
  priceMax?: number;
  minRooms?: number;
  minGuests?: number;
  excludeUserId?: string;
  sort?: string;
}

export interface HousePin {
  id: number;
  lat: number;
  lng: number;
  pricePerNight: number;
  name: string;
  photo?: string;
  location?: string;
  rooms?: number;
  guests?: number;
}

export const getHouses = async (): Promise<House[]> => {
  const res = await apiFetch<PagedResponse>(`/houses${buildQuery({ limit: 100 })}`);
  return res.data.map(mapHouse);
};

export const getHousesByIds = async (ids: number[]): Promise<House[]> => {
  if (ids.length === 0) return [];
  const res = await apiFetch<PagedResponse>(`/houses${buildQuery({ ids, limit: ids.length })}`);
  return res.data.map(mapHouse);
};

export const getHousesFiltered = async (params: HouseFilterParams, offset: number, limit: number): Promise<PagedResult<House>> => {
  const query = buildQuery({
    city: params.city || undefined,
    district: params.district || undefined,
    cities_in_district: params.citiesInDistrict,
    house_type: params.houseType && params.houseType !== 'Все' ? params.houseType : undefined,
    price_min: params.priceMin,
    price_max: params.priceMax,
    min_rooms: params.minRooms && params.minRooms > 0 ? params.minRooms : undefined,
    min_guests: params.minGuests && params.minGuests > 0 ? params.minGuests : undefined,
    exclude_user_id: params.excludeUserId,
    sort: params.sort,
    offset,
    limit,
  });
  const res = await apiFetch<PagedResponse>(`/houses${query}`);
  return { data: res.data.map(mapHouse), hasMore: res.has_more };
};

export const getHousePins = async (params: HouseFilterParams): Promise<HousePin[]> => {
  const query = buildQuery({
    city: params.city || undefined,
    district: params.district || undefined,
    cities_in_district: params.citiesInDistrict,
    house_type: params.houseType && params.houseType !== 'Все' ? params.houseType : undefined,
    price_min: params.priceMin,
    price_max: params.priceMax,
    min_rooms: params.minRooms && params.minRooms > 0 ? params.minRooms : undefined,
    min_guests: params.minGuests && params.minGuests > 0 ? params.minGuests : undefined,
    sort: params.sort,
  });
  const data = await apiFetch<Array<Record<string, unknown>>>(`/houses/pins${query}`);
  return data.map((d) => ({ id: d.id as number, lat: d.lat as number, lng: d.lng as number, pricePerNight: d.price_per_night as number, name: d.name as string, photo: d.photo as string | undefined, location: d.location as string | undefined, rooms: d.rooms as number | undefined, guests: d.guests as number | undefined }));
};

export const getMyHouses = async (): Promise<House[]> => {
  const res = await apiFetch<PagedResponse>('/houses/my');
  return res.data.map(mapHouse);
};

export const getHouse = async (id: number): Promise<House | null> => {
  try {
    return mapHouse(await apiFetch<Record<string, unknown>>(`/houses/${id}`));
  } catch {
    return null;
  }
};

const housePayload = (house: Partial<House>): Record<string, unknown> => {
  const p = buildCommonPayload(house);
  if (house.name !== undefined) p.name = house.name;
  if (house.pricePerNight !== undefined) p.price_per_night = house.pricePerNight;
  if (house.rooms !== undefined) p.rooms = house.rooms;
  if ('guests' in house) p.guests = house.guests ?? null;
  if (house.houseType !== undefined) p.house_type = house.houseType;
  if (house.amenities !== undefined) p.amenities = house.amenities;
  return p;
};

export const createHouse = async (house: Omit<House, 'id'>): Promise<House> => {
  return mapHouse(await apiFetch<Record<string, unknown>>('/houses', { method: 'POST', body: JSON.stringify(housePayload({ ...house, photos: house.photos ?? [] })) }));
};

export const updateHouse = async (id: number, updates: Partial<House>): Promise<House> => {
  return mapHouse(await apiFetch<Record<string, unknown>>(`/houses/${id}`, { method: 'PUT', body: JSON.stringify(housePayload(updates)) }));
};

export const deleteHouse = async (id: number): Promise<void> => {
  await apiFetch(`/houses/${id}`, { method: 'DELETE' });
};

// === TOURS ===

export interface TourFilterParams {
  city?: string;
  district?: string;
  citiesInDistrict?: string[];
  durationMin?: number;
  durationMax?: number;
  meetingPoint?: string;
  priceMin?: number;
  priceMax?: number;
  excludeUserId?: string;
  sort?: string;
}

export interface FavoritePin {
  id: number;
  type: 'car' | 'house' | 'tour';
  lat: number;
  lng: number;
  price: number;
  name: string;
  photo?: string;
  location?: string;
  seats?: number;
  transmission?: string;
  year?: number;
  rooms?: number;
  guests?: number;
  description?: string;
  duration?: number;
  meetingPoint?: string;
}

export const getTours = async (): Promise<Tour[]> => {
  const res = await apiFetch<PagedResponse>(`/tours${buildQuery({ limit: 100 })}`);
  return res.data.map(mapTour);
};

export const getToursByIds = async (ids: number[]): Promise<Tour[]> => {
  if (ids.length === 0) return [];
  const res = await apiFetch<PagedResponse>(`/tours${buildQuery({ ids, limit: ids.length })}`);
  return res.data.map(mapTour);
};

export const getToursFiltered = async (params: TourFilterParams, offset: number, limit: number): Promise<PagedResult<Tour>> => {
  const query = buildQuery({
    city: params.city || undefined,
    district: params.district || undefined,
    cities_in_district: params.citiesInDistrict,
    duration_min: params.durationMin,
    duration_max: params.durationMax,
    meeting_point: params.meetingPoint && params.meetingPoint !== 'Все' ? params.meetingPoint : undefined,
    price_min: params.priceMin,
    price_max: params.priceMax,
    exclude_user_id: params.excludeUserId,
    sort: params.sort,
    offset,
    limit,
  });
  const res = await apiFetch<PagedResponse>(`/tours${query}`);
  return { data: res.data.map(mapTour), hasMore: res.has_more };
};

export const getFavoritePins = async (): Promise<FavoritePin[]> => {
  const data = await apiFetch<Array<Record<string, unknown>>>('/favorites/pins');
  return data.map((d) => ({ id: d.id as number, type: d.type as 'car' | 'house' | 'tour', lat: d.lat as number, lng: d.lng as number, price: d.price as number, name: d.name as string, photo: d.photo as string | undefined, location: d.location as string | undefined, seats: d.seats as number | undefined, transmission: d.transmission as string | undefined, year: d.year as number | undefined, rooms: d.rooms as number | undefined, guests: d.guests as number | undefined, description: d.description as string | undefined, duration: d.duration as number | undefined, meetingPoint: d.meeting_point as string | undefined }));
};

export const getMyTours = async (): Promise<Tour[]> => {
  const res = await apiFetch<PagedResponse>('/tours/my');
  return res.data.map(mapTour);
};

export const getTour = async (id: number): Promise<Tour | null> => {
  try {
    return mapTour(await apiFetch<Record<string, unknown>>(`/tours/${id}`));
  } catch {
    return null;
  }
};

const tourPayload = (tour: Partial<Tour>): Record<string, unknown> => {
  const p = buildCommonPayload(tour);
  if (tour.name !== undefined) p.name = tour.name;
  if (tour.duration !== undefined) p.duration = tour.duration;
  if (tour.price !== undefined) p.price = tour.price;
  if (tour.route !== undefined) p.route = tour.route;
  if (tour.meetingPoint !== undefined) p.meeting_point = tour.meetingPoint;
  if (tour.included !== undefined) p.included = tour.included;
  if (tour.maxPeople !== undefined) p.max_people = tour.maxPeople;
  return p;
};

export const createTour = async (tour: Omit<Tour, 'id'>): Promise<Tour> => {
  return mapTour(await apiFetch<Record<string, unknown>>('/tours', { method: 'POST', body: JSON.stringify(tourPayload({ ...tour, photos: tour.photos ?? [] })) }));
};

export const updateTour = async (id: number, updates: Partial<Tour>): Promise<Tour> => {
  return mapTour(await apiFetch<Record<string, unknown>>(`/tours/${id}`, { method: 'PUT', body: JSON.stringify(tourPayload(updates)) }));
};

export const deleteTour = async (id: number): Promise<void> => {
  await apiFetch(`/tours/${id}`, { method: 'DELETE' });
};

// === USERS ===

export interface UserProfile {
  user: Author;
  houses: House[];
  cars: Car[];
  tours: Tour[];
}

export const getUserProfile = async (id: string): Promise<UserProfile> => {
  const data = await apiFetch<Record<string, unknown>>(`/users/${id}`);
  const u = data.user as Record<string, unknown>;
  return {
    user: { id: u.id as string, fullName: u.full_name as string | undefined, avatarUrl: u.avatar_url as string | undefined, bio: u.bio as string | undefined },
    houses: (data.houses as Record<string, unknown>[]).map(mapHouse),
    cars:   (data.cars   as Record<string, unknown>[]).map(mapCar),
    tours:  (data.tours  as Record<string, unknown>[]).map(mapTour),
  };
};

// === REVIEWS ===

export interface Review {
  id: number;
  userId: string;
  itemType: string;
  itemId: number;
  rating: number;
  body?: string;
  createdAt: string;
  user: { fullName?: string; avatarUrl?: string };
}

const mapReview = (r: Record<string, unknown>): Review => ({
  id: r.id as number,
  userId: r.user_id as string,
  itemType: r.item_type as string,
  itemId: r.item_id as number,
  rating: r.rating as number,
  body: r.body as string | undefined,
  createdAt: r.created_at as string,
  user: (() => { const u = (r.user as { full_name?: string; avatar_url?: string } | undefined) ?? {}; return { fullName: u.full_name, avatarUrl: u.avatar_url }; })(),
});

export const getReviews = async (itemType: string, itemId: number): Promise<Review[]> => {
  const res = await apiFetch<{ data: Record<string, unknown>[]; has_more: boolean }>(
    `/reviews${buildQuery({ item_type: itemType, item_id: itemId, limit: 100 })}`,
  );
  return res.data.map(mapReview);
};

export const createReview = async (itemType: string, itemId: number, rating: number, body: string): Promise<Review> => {
  return mapReview(await apiFetch<Record<string, unknown>>('/reviews', {
    method: 'POST',
    body: JSON.stringify({ item_type: itemType, item_id: itemId, rating, body }),
  }));
};

export const deleteReview = async (id: number): Promise<void> => {
  await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
};

export { ApiError };
