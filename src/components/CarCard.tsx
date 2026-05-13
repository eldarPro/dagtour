import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { peopleOutline, cogOutline } from 'ionicons/icons';
import BookmarkButton from './BookmarkButton';
import CardEditButton from './CardEditButton';
import './CarCard.css';

export interface CarCardData {
  id: string;
  brand: string;
  model: string;
  year?: number;
  pricePerDay: number;
  photo?: string;
  type?: string;
  seats?: number;
  transmission?: string;
}

interface CarCardProps {
  car: CarCardData;
  href?: string;
  isOwn?: boolean;
  showOwnBadge?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, href, isOwn, showOwnBadge }) => {
  const location = useLocation();
  const placeholder = `https://placehold.co/400x300/0E7490/FFFFFF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;

  return (
    <IonCard className={`car-card${showOwnBadge ? ' car-card--own' : ''}`} button={!!href} routerLink={href}>
      <IonImg src={car.photo ?? placeholder} alt={`${car.brand} ${car.model}`} className="car-card-img" />
      <IonCardHeader>
        <IonCardTitle className="car-card-title">{car.brand} {car.model}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="car-card-chips">
          {car.seats != null && (
            <IonChip className="car-card-chip">
              <IonIcon icon={peopleOutline} />
              <IonText>{car.seats} мест</IonText>
            </IonChip>
          )}
          {car.transmission && (
            <IonChip className="car-card-chip">
              <IonIcon icon={cogOutline} />
              <IonText>{car.transmission}</IonText>
            </IonChip>
          )}
          {car.year && !car.seats && (
            <IonChip className="car-card-chip">
              <IonText>{car.year} г.</IonText>
            </IonChip>
          )}
        </div>
        <div className="car-card-footer">
          <IonText color="primary" className="car-card-price">
            <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
          </IonText>
          <IonNote className="car-card-per">/ день</IonNote>
          <div className="car-card-actions">
            {isOwn && (
              <CardEditButton href={`/edit-car/${car.id}?from=${encodeURIComponent(location.pathname)}`} />
            )}
            <BookmarkButton type="car" id={Number(car.id)} />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
