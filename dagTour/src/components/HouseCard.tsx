import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonBadge,
  IonImg,
  IonText,
  IonNote,
} from '@ionic/react';
import { locationOutline, star } from 'ionicons/icons';
import { House } from '../data/mockData';
import './HouseCard.css';

interface HouseCardProps {
  house: House;
}

const HouseCard: React.FC<HouseCardProps> = ({ house }) => {
  return (
    <IonCard className="house-card" routerLink={`/houses/${house.id}`} button>
      <IonImg src={house.photo} alt={house.name} className="house-card-img" />
      <IonCardHeader>
        <IonBadge className="house-card-rating">
          <IonIcon icon={star} /> {house.rating}
        </IonBadge>
        <IonCardTitle className="house-card-title">{house.name}</IonCardTitle>
        <IonCardSubtitle className="house-card-location">
          <IonIcon icon={locationOutline} /> {house.location}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="house-card-footer">
        <IonText color="primary" className="house-card-price">
          <strong>{house.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
        </IonText>
        <IonNote className="house-card-per">/ ночь</IonNote>
      </IonCardContent>
    </IonCard>
  );
};

export default HouseCard;
