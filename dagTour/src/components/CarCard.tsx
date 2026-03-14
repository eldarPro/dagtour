import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonChip,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
  IonButton,
} from '@ionic/react';
import { peopleOutline, cogOutline, createOutline } from 'ionicons/icons';
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
  const placeholder = `https://placehold.co/400x300/0E7490/FFFFFF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;

  return (
    <IonCard className="car-card" button={!!href} routerLink={href}>
      <IonImg src={car.photo ?? placeholder} alt={`${car.brand} ${car.model}`} className="car-card-img" />
      <IonCardHeader>
        <div className="car-card-badges">
          {showOwnBadge && (
            <IonBadge color="success" className="car-card-own-badge">Моё объявление</IonBadge>
          )}
        </div>
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
          {isOwn && (
            <IonButton
              fill="clear"
              size="small"
              className="car-card-edit-btn"
              routerLink={`/edit-car/${car.id}`}
              routerDirection="forward"
              onClick={(e) => e.stopPropagation()}
            >
              <IonIcon slot="start" icon={createOutline} />
              Редактировать
            </IonButton>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
