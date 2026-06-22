import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import { useFavorites } from '../lib/favoritesContext';
import HouseCard, { HouseCardData } from '../components/HouseCard';
import CarCard, { CarCardData } from '../components/CarCard';
import TourCard from '../components/TourCard';
import FavoritesMap from '../components/FavoritesMap';
import { Tour, FavoritePin, getHousesByIds, getCarsByIds, getToursByIds, getFavoritePins } from '../lib/api';
import { HouseCardSkeleton } from '../components/CardSkeletons';
import './Favorites.css';

type Tab = 'houses' | 'cars' | 'tours' | 'map';

const Favorites: React.FC = () => {
  const { favorites, loading: favLoading } = useFavorites();
  const [houses, setHouses] = useState<HouseCardData[]>([]);
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [pins, setPins] = useState<FavoritePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('houses');

  const loadFavorites = useCallback(async () => {
    if (favLoading) return;

    const houseIds = favorites.filter((f) => f.type === 'house').map((f) => f.id);
    const carIds = favorites.filter((f) => f.type === 'car').map((f) => f.id);
    const tourIds = favorites.filter((f) => f.type === 'tour').map((f) => f.id);

    if (houseIds.length === 0 && carIds.length === 0 && tourIds.length === 0) {
      setHouses([]);
      setCars([]);
      setTours([]);
      setPins([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [housesRes, carsRes, toursRes, pinsRes] = await Promise.all([
      getHousesByIds(houseIds),
      getCarsByIds(carIds),
      getToursByIds(tourIds),
      getFavoritePins(),
    ]);

    setHouses(
      housesRes.map((h) => ({
        id: String(h.id),
        name: h.name,
        pricePerNight: h.pricePerNight,
        photo: h.photo,
        location: h.location,
        rating: h.rating,
        rooms: h.rooms,
        guests: h.guests ?? undefined,
      }))
    );

    setCars(
      carsRes.map((c) => ({
        id: String(c.id),
        brand: c.brand,
        model: c.model,
        year: c.year,
        pricePerDay: c.pricePerDay,
        photo: c.photo,
        type: c.type,
        seats: c.seats,
        transmission: c.transmission,
      }))
    );

    setTours(toursRes);
    setPins(pinsRes);
    setLoading(false);
  }, [favorites, favLoading]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleRefresh = async (e: CustomEvent) => {
    await loadFavorites();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const tabContent = () => {
    if (loading || favLoading) {
      return (
        <section className="favorites-section">
          <IonList lines="none" className="card-list">
            <HouseCardSkeleton />
            <HouseCardSkeleton />
          </IonList>
        </section>
      );
    }
    if (tab === 'map') {
      return null;
    }
    if (tab === 'houses') {
      return houses.length > 0 ? (
        <IonList lines="none" className="card-list">
          {houses.map((house) => (
            <HouseCard key={house.id} house={house} href={`/houses/${house.id}`} />
          ))}
        </IonList>
      ) : (
        <div className="favorites-tab-empty">
          <p>Нет сохранённых объявлений</p>
        </div>
      );
    }
    if (tab === 'cars') {
      return cars.length > 0 ? (
        <IonList lines="none" className="card-list">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
          ))}
        </IonList>
      ) : (
        <div className="favorites-tab-empty">
          <p>Нет сохранённых авто</p>
        </div>
      );
    }
    if (tab === 'tours') {
      return tours.length > 0 ? (
        <IonList lines="none" className="card-list">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </IonList>
      ) : (
        <div className="favorites-tab-empty">
          <p>Нет сохранённых туров</p>
        </div>
      );
    }
    return null;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/account" />
          </IonButtons>
          <IonTitle>Избранное</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={tab !== 'map'} className={tab === 'map' ? 'favorites-map-page' : 'favorites-content'}>
        {tab !== 'map' && (
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
        )}

        <IonSegment
          value={tab}
          onIonChange={(e) => setTab(e.detail.value as Tab)}
          className="favorites-segment"
        >
          <IonSegmentButton value="houses">
            <IonLabel>Дома</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="cars">
            <IonLabel>Авто</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="tours">
            <IonLabel>Туры</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="map">
            <IonLabel>Карта</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {tab === 'map' ? (
          <div className="favorites-map-wrapper">
            {pins.length > 0 ? (
              <FavoritesMap pins={pins} />
            ) : (
              <div className="favorites-tab-empty">
                <p>Нет избранных с координатами</p>
              </div>
            )}
          </div>
        ) : (
          <div className="favorites-tab-content">
            {tabContent()}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
