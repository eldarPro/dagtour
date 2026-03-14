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
import { locationOutline, star, createOutline } from 'ionicons/icons';
import './HouseCard.css';

export interface HouseCardData {
  id: string;
  name: string;
  pricePerNight: number;
  photo?: string;
  location?: string;
  rating?: number;
  rooms?: number;
  guests?: number;
}

interface HouseCardProps {
  house: HouseCardData;
  href?: string;
  isOwn?: boolean;
  showOwnBadge?: boolean;
}

const HouseCard: React.FC<HouseCardProps> = ({ house, href, isOwn, showOwnBadge }) => {
  const placeholder = `https://placehold.co/400x300/0E7490/FFFFFF?text=${encodeURIComponent(house.name)}`;

  return (
    <IonCard className="house-card" button={!!href} routerLink={href}>
      <div className="house-card-img-wrap">
        <IonImg src={house.photo ?? placeholder} alt={house.name} className="house-card-img" />
        <div className="house-card-badges-overlay">
          {house.rating != null && (
            <IonBadge className="house-card-badge house-card-badge--rating">
              <IonIcon icon={star} /> {house.rating}
            </IonBadge>
          )}
          {showOwnBadge && (
            <IonBadge color="success" className="house-card-badge">Моё</IonBadge>
          )}
        </div>
      </div>
      <IonCardHeader className="house-card-header">
        <IonCardTitle className="house-card-title">{house.name}</IonCardTitle>
        {house.location && (
          <IonCardSubtitle className="house-card-subtitle">
            <IonIcon icon={locationOutline} /> {house.location}
          </IonCardSubtitle>
        )}
      </IonCardHeader>
      <IonCardContent className="house-card-footer">
        <IonText color="primary">
          <strong>{house.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
        </IonText>
        <IonNote> / ночь</IonNote>
        {isOwn && (
          <IonButton
            fill="clear"
            size="small"
            className="house-card-edit-btn"
            routerLink={`/edit-house/${house.id}`}
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

export default HouseCard;
