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
  /** Куда ведёт клик по карточке */
  href?: string;
  /** Показывает кнопку редактирования */
  isOwn?: boolean;
  /** Показывает бейдж «Моё объявление» (только на общей странице авто) */
  showOwnBadge?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, href, isOwn, showOwnBadge }) => {
  const placeholder = `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;

  return (
    <IonCard
      className="car-card"
      button={!!href}
      routerLink={href}
    >
      <IonImg src={car.photo ?? placeholder} alt={`${car.brand} ${car.model}`} className="car-card-img" />
      <IonCardHeader>
        <div className="car-card-badges">
          {car.type && (
            <IonBadge color="secondary" className="car-card-type">{car.type}</IonBadge>
          )}
          {showOwnBadge && (
            <IonBadge color="success" className="car-card-own-badge">Моё объявление</IonBadge>
          )}
        </div>
        <IonCardTitle className="car-card-title">{car.brand} {car.model}</IonCardTitle>
        <IonCardSubtitle className="car-card-details">
          {car.seats != null && (
            <>
              <IonIcon icon={peopleOutline} /> {car.seats} мест
            </>
          )}
          {car.seats != null && car.transmission && <span className="car-card-dot">·</span>}
          {car.transmission && (
            <>
              <IonIcon icon={cogOutline} /> {car.transmission}
            </>
          )}
          {car.year && !car.seats && (
            <span>{car.year} г.</span>
          )}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="car-card-footer">
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
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
