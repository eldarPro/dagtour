import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
} from '@ionic/react';
import { peopleOutline, cogOutline } from 'ionicons/icons';
import { Car } from '../data/mockData';
import './CarCard.css';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <IonCard className="car-card" routerLink={`/cars/${car.id}`} button>
      <IonImg src={car.photo} alt={`${car.brand} ${car.model}`} className="car-card-img" />
      <IonCardHeader>
        <IonBadge color="secondary" className="car-card-type">{car.type}</IonBadge>
        <IonCardTitle className="car-card-title">{car.brand} {car.model}</IonCardTitle>
        <IonCardSubtitle className="car-card-details">
          <IonIcon icon={peopleOutline} /> {car.seats} мест
          <span className="car-card-dot">·</span>
          <IonIcon icon={cogOutline} /> {car.transmission}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="car-card-footer">
        <IonText color="primary" className="car-card-price">
          <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
        </IonText>
        <IonNote className="car-card-per">/ день</IonNote>
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
