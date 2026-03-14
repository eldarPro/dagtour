import React, { useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
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
} from '@ionic/react';
import { homeOutline, carOutline, mapOutline, chevronForwardOutline } from 'ionicons/icons';
import { houses, cars, tours } from '../data/mockData';
import CarCard from '../components/CarCard';
import HouseCard from '../components/HouseCard';
import TourCard from '../components/TourCard';
import './Home.css';

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Путешествия по Дагестану</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-content">

        <IonCard className="home-banner">
          <IonCardContent>
            <IonText color="light">
              <h1 className="home-banner-title">Откройте Дагестан</h1>
              <p className="home-banner-subtitle">Горы, море, древние города и гостеприимство</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value ?? '')}
          placeholder="Куда вы хотите поехать?"
          className="home-searchbar"
        />

        <IonGrid className="categories-grid">
          <IonRow>
            <IonCol size="4">
              <IonCard routerLink="/houses" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon icon={homeOutline} className="cat-card-icon cat-card-icon--green" />
                  <IonLabel><strong>Дома</strong></IonLabel>
                  <IonNote>{houses.length}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard routerLink="/cars" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon icon={carOutline} className="cat-card-icon cat-card-icon--teal" />
                  <IonLabel><strong>Авто</strong></IonLabel>
                  <IonNote>{cars.length}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard routerLink="/tours" className="cat-card" button>
                <IonCardContent className="cat-card-content">
                  <IonIcon icon={mapOutline} className="cat-card-icon cat-card-icon--indigo" />
                  <IonLabel><strong>Туры</strong></IonLabel>
                  <IonNote>{tours.length}</IonNote>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Популярные дома */}
        <IonGrid className="section-grid">
          <IonRow className="ion-align-items-center ion-justify-content-between">
            <IonCol size="auto">
              <IonText><strong>Популярные дома</strong></IonText>
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
          {houses.slice(0, 4).map((house) => (
            <div key={house.id} className="scroll-item">
              <HouseCard
                house={{
                  id: String(house.id),
                  name: house.name,
                  pricePerNight: house.pricePerNight,
                  photo: house.photo,
                  location: house.location,
                  rating: house.rating,
                }}
                href={`/houses/${house.id}`}
              />
            </div>
          ))}
          <div className="scroll-row-pad" />
        </div>

        {/* Аренда авто */}
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
          {cars.slice(0, 4).map((car) => (
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

        {/* Популярные туры */}
        <IonGrid className="section-grid">
          <IonRow className="ion-align-items-center ion-justify-content-between">
            <IonCol size="auto">
              <IonText><strong>Популярные туры</strong></IonText>
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
          {tours.slice(0, 4).map((tour) => (
            <div key={tour.id} className="scroll-item">
              <TourCard tour={tour} />
            </div>
          ))}
          <div className="scroll-row-pad" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
