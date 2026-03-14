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
  /** Куда ведёт клик по карточке */
  href?: string;
  /** Показывает кнопку редактирования */
  isOwn?: boolean;
  /** Показывает бейдж «Моё объявление» (только на общей странице домов) */
  showOwnBadge?: boolean;
}

const HouseCard: React.FC<HouseCardProps> = ({ house, href, isOwn, showOwnBadge }) => {
  const placeholder = `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(house.name)}`;

  return (
    <IonCard
      className="house-card"
      button={!!href}
      routerLink={href}
    >
      <IonImg src={house.photo ?? placeholder} alt={house.name} className="house-card-img" />
      <IonCardHeader>
        <div className="house-card-badges">
          {house.rating != null && (
            <IonBadge className="house-card-rating">
              <IonIcon icon={star} /> {house.rating}
            </IonBadge>
          )}
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
      <IonCardContent className="house-card-footer">
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
      </IonCardContent>
    </IonCard>
  );
};

export default HouseCard;
