import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonNote,
  IonText,
  IonButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { homeOutline, homeSharp, carSportOutline, compassOutline, chevronForwardOutline } from 'ionicons/icons';
import { getHomeData, House, Car, Tour } from '../lib/api';
import { useAuth } from '../lib/auth';
import CarCard from '../components/CarCard';
import HouseCard from '../components/HouseCard';
import TourCard from '../components/TourCard';
import { HouseCardSkeleton, CarCardSkeleton, TourCardSkeleton } from '../components/CardSkeletons';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [housesTotal, setHousesTotal] = useState<number | null>(null);
  const [carsTotal, setCarsTotal] = useState<number | null>(null);
  const [toursTotal, setToursTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { houses, cars, tours } = await getHomeData();
      setHouses(houses.data);
      setCars(cars.data);
      setTours(tours.data);
      setHousesTotal(houses.total);
      setCarsTotal(cars.total);
      setToursTotal(tours.total);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async (e: CustomEvent) => {
    await fetchData(false);
    (e.target as HTMLIonRefresherElement).complete();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Путешествия по Дагестану</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonCard className="home-banner">
          <IonCardContent>
            <IonText color="light">
              <h1 className="home-banner-title">Откройте Дагестан</h1>
              <p className="home-banner-subtitle">Горы, море, древние города и гостеприимство</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonGrid className="categories-grid">
          <IonRow>
            <IonCol size="4">
              <IonCard routerLink="/houses" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon ios={homeOutline} md={homeSharp} className="cat-card-icon cat-card-icon--green" />
                  <IonLabel><strong>Дома</strong></IonLabel>
                  <IonNote>{loading ? '—' : housesTotal}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard routerLink="/cars" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon icon={carSportOutline} className="cat-card-icon cat-card-icon--teal" />
                  <IonLabel><strong>Авто</strong></IonLabel>
                  <IonNote>{loading ? '—' : carsTotal}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard routerLink="/tours" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon icon={compassOutline} className="cat-card-icon cat-card-icon--indigo" />
                  <IonLabel><strong>Туры</strong></IonLabel>
                  <IonNote>{loading ? '—' : toursTotal}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Аренда дома */}
        {(loading || houses.length > 0) && (
          <>
            <IonGrid className="section-grid">
              <IonRow className="ion-align-items-center ion-justify-content-between">
                <IonCol size="auto">
                  <IonText><strong>Аренда домов</strong></IonText>
                </IonCol>
                <IonCol size="auto">
                  <IonButton fill="clear" size="small" routerLink="/houses" className="section-btn">
                    Все <IonIcon icon={chevronForwardOutline} slot="end" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            <div className="scroll-row">
              <div className="scroll-row-pad" />
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="scroll-item"><HouseCardSkeleton /></div>
                  ))
                : houses.map((house) => {
                    const isOwn = !!user && house.userId === user.id;
                    return (
                      <div key={house.id} className="scroll-item">
                        <HouseCard
                          house={{
                            id: String(house.id),
                            name: house.name,
                            pricePerNight: house.pricePerNight,
                            photo: house.photo,
                            location: house.location,
                            rating: house.rating,
                            rooms: house.rooms,
                            guests: house.guests ?? undefined,
                          }}
                          href={`/houses/${house.id}`}
                          isOwn={isOwn}
                          showOwnBadge={isOwn}
                        />
                      </div>
                    );
                  })}
              <div className="scroll-row-pad" />
            </div>
          </>
        )}

        {/* Аренда авто */}
        {(loading || cars.length > 0) && (
          <>
            <IonGrid className="section-grid">
              <IonRow className="ion-align-items-center ion-justify-content-between">
                <IonCol size="auto">
                  <IonText><strong>Аренда авто</strong></IonText>
                </IonCol>
                <IonCol size="auto">
                  <IonButton fill="clear" size="small" routerLink="/cars" className="section-btn">
                    Все <IonIcon icon={chevronForwardOutline} slot="end" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            <div className="scroll-row">
              <div className="scroll-row-pad" />
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="scroll-item"><CarCardSkeleton /></div>
                  ))
                : cars.map((car) => (
                    <div key={car.id} className="scroll-item">
                      <CarCard
                        car={{
                          id: String(car.id),
                          brand: car.brand,
                          model: car.model,
                          pricePerDay: car.pricePerDay,
                          photo: car.photo,
                          type: car.type,
                          seats: car.seats,
                          transmission: car.transmission,
                        }}
                        href={`/cars/${car.id}`}
                      />
                    </div>
                  ))}
              <div className="scroll-row-pad" />
            </div>
          </>
        )}

        {/* Туры */}
        {(loading || tours.length > 0) && (
          <>
            <IonGrid className="section-grid">
              <IonRow className="ion-align-items-center ion-justify-content-between">
                <IonCol size="auto">
                  <IonText><strong>Туристические направления</strong></IonText>
                </IonCol>
                <IonCol size="auto">
                  <IonButton fill="clear" size="small" routerLink="/tours" className="section-btn">
                    Все <IonIcon icon={chevronForwardOutline} slot="end" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            <div className="scroll-row">
              <div className="scroll-row-pad" />
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="scroll-item"><TourCardSkeleton /></div>
                  ))
                : tours.map((tour) => (
                    <div key={tour.id} className="scroll-item">
                      <TourCard tour={tour} isOwn={!!user && tour.userId === user.id} showOwnBadge={!!user && tour.userId === user.id} />
                    </div>
                  ))}
              <div className="scroll-row-pad" />
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
