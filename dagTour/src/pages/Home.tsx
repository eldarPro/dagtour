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
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonImg,
  IonBadge,
  IonText,
  IonButton,
  IonNote,
  IonLabel,
} from '@ionic/react';
import { homeOutline, carOutline, mapOutline, chevronForwardOutline, star, locationOutline, timeOutline, peopleOutline } from 'ionicons/icons';
import { houses, cars, tours } from '../data/mockData';
import './Home.css';

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>dagTour</IonTitle>
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
          {houses.slice(0, 4).map((house) => (
            <IonCard key={house.id} routerLink={`/houses/${house.id}`} className="mini-card">
              <IonImg src={house.photo} alt={house.name} className="mini-card-img" />
              <IonBadge className="mini-card-badge">
                <IonIcon icon={star} /> {house.rating}
              </IonBadge>
              <IonCardHeader className="mini-card-header">
                <IonCardTitle className="mini-card-title">{house.name}</IonCardTitle>
                <IonCardSubtitle className="mini-card-subtitle">
                  <IonIcon icon={locationOutline} /> {house.location}
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent className="mini-card-footer">
                <IonText color="primary">
                  <strong>{house.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
                </IonText>
                <IonNote> / ночь</IonNote>
              </IonCardContent>
            </IonCard>
          ))}
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
          {cars.slice(0, 4).map((car) => (
            <IonCard key={car.id} routerLink={`/cars/${car.id}`} className="mini-card">
              <IonImg src={car.photo} alt={`${car.brand} ${car.model}`} className="mini-card-img" />
              <IonBadge color="secondary" className="mini-card-badge mini-card-badge--type">
                {car.type}
              </IonBadge>
              <IonCardHeader className="mini-card-header">
                <IonCardTitle className="mini-card-title">{car.brand} {car.model}</IonCardTitle>
                <IonCardSubtitle className="mini-card-subtitle">
                  <IonIcon icon={peopleOutline} /> {car.seats} мест · {car.transmission}
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent className="mini-card-footer">
                <IonText color="primary">
                  <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
                </IonText>
                <IonNote> / день</IonNote>
              </IonCardContent>
            </IonCard>
          ))}
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
          {tours.slice(0, 4).map((tour) => (
            <IonCard key={tour.id} routerLink={`/tours/${tour.id}`} className="mini-card">
              <IonImg src={tour.photo} alt={tour.name} className="mini-card-img" />
              <IonBadge className="mini-card-badge mini-card-badge--duration">
                <IonIcon icon={timeOutline} /> {tour.duration}
              </IonBadge>
              <IonCardHeader className="mini-card-header">
                <IonCardTitle className="mini-card-title">{tour.name}</IonCardTitle>
                <IonCardSubtitle className="mini-card-subtitle">
                  {tour.route.slice(1, -1).join(' → ')}
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent className="mini-card-footer">
                <IonText color="primary">
                  <strong>{tour.price.toLocaleString('ru-RU')} ₽</strong>
                </IonText>
                <IonNote> / чел.</IonNote>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <div className="ion-padding-bottom" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
