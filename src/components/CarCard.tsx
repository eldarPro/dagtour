import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonChip,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { locationOutline, peopleOutline, cogOutline } from 'ionicons/icons';
import BookmarkButton from './BookmarkButton';
import CardMenuButton from './CardMenuButton';
import { transmissionLabel } from '../data/carFilters';
import './CarCard.css';

export interface CarCardData {
  id: string;
  brand: string;
  model: string;
  year?: number;
  pricePerDay: number;
  photo?: string;
  location?: string;
  type?: string;
  seats?: number;
  transmission?: string;
  active?: boolean;
}

interface CarCardProps {
  car: CarCardData;
  href?: string;
  isOwn?: boolean;
  showOwnBadge?: boolean;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, href, isOwn, showOwnBadge, onToggleActive, onDelete }) => {
  const location = useLocation();
  const placeholder = `https://placehold.co/400x300/0E7490/FFFFFF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;
  const inactive = car.active === false;

  return (
    <IonCard
      className={`car-card${showOwnBadge ? ' car-card--own' : ''}${inactive ? ' car-card--inactive' : ''}`}
      button={!!href || !!isOwn}
      routerLink={isOwn ? `/cars/${car.id}` : href}
    >
      <div className="card-img-wrap">
        <IonImg src={car.photo ?? placeholder} alt={`${car.brand} ${car.model}`} className="car-card-img" />
        {inactive && <span className="card-hidden-badge">Скрыто</span>}
      </div>
      <IonCardHeader>
        <IonCardTitle className="car-card-title">{car.brand} {car.model}</IonCardTitle>
        {car.location && (
          <IonCardSubtitle className="car-card-location">
            <IonIcon icon={locationOutline} /> {car.location}
          </IonCardSubtitle>
        )}
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
              <IonText>{transmissionLabel(car.transmission)}</IonText>
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
            {isOwn
              ? (
                <CardMenuButton
                  editHref={`/edit-car/${car.id}?from=${encodeURIComponent(location.pathname)}`}
                  active={car.active}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              )
              : <BookmarkButton type="car" id={Number(car.id)} />
            }
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default CarCard;
