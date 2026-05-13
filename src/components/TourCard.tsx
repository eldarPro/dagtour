import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonImg,
  IonText,
  IonNote,
  IonChip,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { timeOutline, navigateOutline } from 'ionicons/icons';
import { Tour } from '../lib/api';
import { formatDays } from '../lib/formatDays';
import BookmarkButton from './BookmarkButton';
import CardEditButton from './CardEditButton';
import './TourCard.css';

interface TourCardProps {
  tour: Tour;
  isOwn?: boolean;
  showOwnBadge?: boolean;
}

const TourCard: React.FC<TourCardProps> = ({ tour, isOwn, showOwnBadge }) => {
  const location = useLocation();
  return (
    <IonCard className={`tour-card${showOwnBadge ? ' tour-card--own' : ''}`} routerLink={`/tours/${tour.id}`} button>
      <IonImg
        src={tour.photo ?? `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(tour.name)}`}
        alt={tour.name}
        className="tour-card-img"
      />
      <IonCardHeader>
        <IonCardTitle className="tour-card-title">{tour.name}</IonCardTitle>
        {tour.description && (
          <IonCardSubtitle className="tour-card-desc">
            {tour.description.slice(0, 80)}...
          </IonCardSubtitle>
        )}
      </IonCardHeader>
      <IonCardContent>
        <div className="tour-card-chips">
          <IonChip className="tour-card-chip">
            <IonIcon icon={timeOutline} />
            <IonText>{formatDays(tour.duration)}</IonText>
          </IonChip>
          <IonChip className="tour-card-chip">
            <IonIcon icon={navigateOutline} />
            <IonText>{tour.route.length} точек</IonText>
          </IonChip>
        </div>
        <div className="tour-card-footer">
          <IonText color="primary" className="tour-card-price">
            <strong>{tour.price.toLocaleString('ru-RU')} ₽</strong>
          </IonText>
          <IonNote className="tour-card-per">/ чел.</IonNote>
          <div className="tour-card-actions">
            {isOwn && (
              <CardEditButton href={`/edit-tour/${tour.id}?from=${encodeURIComponent(location.pathname)}`} />
            )}
            <BookmarkButton type="tour" id={tour.id} />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default TourCard;
