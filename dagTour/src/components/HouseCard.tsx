import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonChip,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
  IonButton,
} from '@ionic/react';
import { locationOutline, star, bedOutline, peopleOutline, createOutline } from 'ionicons/icons';
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
      <IonImg src={house.photo ?? placeholder} alt={house.name} className="house-card-img" />
      <IonCardHeader>
        <div className="house-card-badges">
          {showOwnBadge && (
            <IonBadge color="success" className="house-card-own-badge">Моё объявление</IonBadge>
          )}
        </div>
        <IonCardTitle className="house-card-title">{house.name}</IonCardTitle>
        {house.location && (
          <IonCardSubtitle className="house-card-location">
            <IonIcon icon={locationOutline} /> {house.location}
          </IonCardSubtitle>
        )}
      </IonCardHeader>
      <IonCardContent>
        <div className="house-card-chips">
          {house.rating != null && (
            <IonChip className="house-card-chip house-card-chip--rating">
              <IonIcon icon={star} />
              <IonText>{house.rating}</IonText>
            </IonChip>
          )}
          {house.rooms != null && (
            <IonChip className="house-card-chip">
              <IonIcon icon={bedOutline} />
              <IonText>{house.rooms} комн.</IonText>
            </IonChip>
          )}
          {house.guests != null && (
            <IonChip className="house-card-chip">
              <IonIcon icon={peopleOutline} />
              <IonText>{house.guests} гостей</IonText>
            </IonChip>
          )}
        </div>
        <div className="house-card-footer">
          <IonText color="primary" className="house-card-price">
            <strong>{house.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
          </IonText>
          <IonNote className="house-card-per">/ ночь</IonNote>
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
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default HouseCard;
