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
      <div className="car-card-img-wrap">
        <IonImg src={car.photo ?? placeholder} alt={`${car.brand} ${car.model}`} className="car-card-img" />
        <div className="car-card-badges-overlay">
          {car.type && (
            <IonBadge color="secondary" className="car-card-badge">{car.type}</IonBadge>
          )}
          {showOwnBadge && (
            <IonBadge color="success" className="car-card-badge">Моё</IonBadge>
          )}
        </div>
      </div>
      <IonCardHeader className="car-card-header">
        <IonCardTitle className="car-card-title">{car.brand} {car.model}</IonCardTitle>
        <IonCardSubtitle className="car-card-subtitle">
          {car.seats != null && <><IonIcon icon={peopleOutline} /> {car.seats} мест</>}
          {car.seats != null && car.transmission && <span> · </span>}
          {car.transmission && <><IonIcon icon={cogOutline} /> {car.transmission}</>}
          {!car.seats && car.year && <span>{car.year} г.</span>}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="car-card-footer">
        <IonText color="primary">
          <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
        </IonText>
        <IonNote> / день</IonNote>
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
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
