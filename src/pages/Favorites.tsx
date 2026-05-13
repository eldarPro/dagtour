import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButton,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { useFavorites } from '../lib/favoritesContext';
import { supabase } from '../lib/supabase';
import HouseCard, { HouseCardData } from '../components/HouseCard';
import CarCard, { CarCardData } from '../components/CarCard';
import TourCard from '../components/TourCard';
import { Tour } from '../lib/api';
import { HouseCardSkeleton, CarCardSkeleton, TourCardSkeleton } from '../components/CardSkeletons';
import './Favorites.css';

const Favorites: React.FC = () => {
  const { favorites, loading: favLoading } = useFavorites();
  const [houses, setHouses] = useState<HouseCardData[]>([]);
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favLoading) return;

    const houseIds = favorites.filter((f) => f.type === 'house').map((f) => f.id);
    const carIds = favorites.filter((f) => f.type === 'car').map((f) => f.id);
    const tourIds = favorites.filter((f) => f.type === 'tour').map((f) => f.id);

    if (houseIds.length === 0 && carIds.length === 0 && tourIds.length === 0) {
      setHouses([]);
      setCars([]);
      setTours([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const load = async () => {
      const [housesRes, carsRes, toursRes] = await Promise.all([
        houseIds.length > 0 ? supabase.from('houses').select('*').in('id', houseIds) : null,
        carIds.length > 0 ? supabase.from('cars').select('*').in('id', carIds) : null,
        tourIds.length > 0 ? supabase.from('tours').select('*').in('id', tourIds) : null,
      ]);

      setHouses(
        housesRes?.data?.map((h) => ({
          id: String(h.id),
          name: h.name,
          pricePerNight: h.price_per_night,
          photo: h.photo,
          location: h.location,
          rating: h.rating,
          rooms: h.rooms,
          guests: h.guests ?? undefined,
        })) ?? []
      );

      setCars(
        carsRes?.data?.map((c) => ({
          id: String(c.id),
          brand: c.brand,
          model: c.model,
          year: c.year,
          pricePerDay: c.price_per_day,
          photo: c.photo,
          type: c.type,
          seats: c.seats,
          transmission: c.transmission,
        })) ?? []
      );

      setTours(
        toursRes?.data?.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          duration: t.duration,
          price: t.price,
          photo: t.photo,
          route: t.route ?? [],
        })) ?? []
      );

      setLoading(false);
    };

    load();
  }, [favorites, favLoading]);

  const isEmpty = houses.length === 0 && cars.length === 0 && tours.length === 0;

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
      <IonContent fullscreen className="favorites-content">
        {(loading || favLoading) ? (
          <>
            <section className="favorites-section">
              <h2 className="favorites-section-title">Дома</h2>
              <IonList lines="none" className="card-list">
                <HouseCardSkeleton />
                <HouseCardSkeleton />
              </IonList>
            </section>
            <section className="favorites-section">
              <h2 className="favorites-section-title">Авто</h2>
              <IonList lines="none" className="card-list">
                <CarCardSkeleton />
                <CarCardSkeleton />
              </IonList>
            </section>
            <section className="favorites-section">
              <h2 className="favorites-section-title">Туры</h2>
              <IonList lines="none" className="card-list">
                <TourCardSkeleton />
                <TourCardSkeleton />
              </IonList>
            </section>
          </>
        ) : isEmpty ? (
          <div className="favorites-empty">
            <p>Нет избранных объявлений</p>
            <p className="favorites-empty-hint">Нажмите на закладку на карточке, чтобы сохранить</p>
          </div>
        ) : (
          <>
            {houses.length > 0 && (
              <section className="favorites-section">
                <h2 className="favorites-section-title">Дома</h2>
                <IonList lines="none" className="card-list">
                  {houses.map((house) => (
                    <HouseCard key={house.id} house={house} href={`/houses/${house.id}`} />
                  ))}
                </IonList>
              </section>
            )}
            {cars.length > 0 && (
              <section className="favorites-section">
                <h2 className="favorites-section-title">Авто</h2>
                <IonList lines="none" className="card-list">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
                  ))}
                </IonList>
              </section>
            )}
            {tours.length > 0 && (
              <section className="favorites-section">
                <h2 className="favorites-section-title">Туры</h2>
                <IonList lines="none" className="card-list">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </IonList>
              </section>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
