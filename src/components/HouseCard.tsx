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
import { locationOutline, bedOutline, peopleOutline } from 'ionicons/icons';
import BookmarkButton from './BookmarkButton';
import CardEditButton from './CardEditButton';
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
  const location = useLocation();
  const placeholder = `https://placehold.co/400x300/0E7490/FFFFFF?text=${encodeURIComponent(house.name)}`;

  return (
    <IonCard className={`house-card${showOwnBadge ? ' house-card--own' : ''}`} button={!!href} routerLink={href}>
      <IonImg src={house.photo ?? placeholder} alt={house.name} className="house-card-img" />
      <IonCardHeader>
        <IonCardTitle className="house-card-title">{house.name}</IonCardTitle>
        {house.location && (
          <IonCardSubtitle className="house-card-location">
            <IonIcon icon={locationOutline} /> {house.location}
          </IonCardSubtitle>
        )}
      </IonCardHeader>
      <IonCardContent>
        <div className="house-card-chips">
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
          <div className="house-card-actions">
            {isOwn && (
              <CardEditButton href={`/edit-house/${house.id}?from=${encodeURIComponent(location.pathname)}`} />
            )}
            <BookmarkButton type="house" id={Number(house.id)} />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default HouseCard;
