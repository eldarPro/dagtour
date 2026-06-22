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
import { timeOutline, navigateOutline, locationOutline } from 'ionicons/icons';
import { Tour } from '../lib/api';
import { formatDays } from '../lib/formatDays';
import BookmarkButton from './BookmarkButton';
import CardMenuButton from './CardMenuButton';
import './TourCard.css';

interface TourCardProps {
  tour: Tour;
  isOwn?: boolean;
  showOwnBadge?: boolean;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, isOwn, showOwnBadge, onToggleActive, onDelete }) => {
  const location = useLocation();
  const inactive = tour.active === false;
  return (
    <IonCard
      className={`tour-card${showOwnBadge ? ' tour-card--own' : ''}${inactive ? ' tour-card--inactive' : ''}`}
      routerLink={`/tours/${tour.id}`}
      button
    >
      <div className="card-img-wrap">
        <IonImg
          src={tour.photo ?? `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(tour.name)}`}
          alt={tour.name}
          className="tour-card-img"
        />
        {inactive && <span className="card-hidden-badge">Скрыто</span>}
      </div>
      <IonCardHeader>
        <IonCardTitle className="tour-card-title">{tour.name}</IonCardTitle>
        {tour.description && (
          <IonCardSubtitle className="tour-card-desc">
            {tour.description}
          </IonCardSubtitle>
        )}
      </IonCardHeader>
      <IonCardContent>
        <div className="tour-card-chips">
          <IonChip className="tour-card-chip">
            <IonIcon icon={timeOutline} />
            <IonText>{formatDays(tour.duration)}</IonText>
          </IonChip>
          {tour.meetingPoint && (
            <IonChip className="tour-card-chip tour-card-chip--location">
              <IonIcon icon={locationOutline} />
              <IonText className="tour-card-chip-text">Выезд: {tour.meetingPoint}</IonText>
            </IonChip>
          )}
        </div>
        <div className="tour-card-footer">
          <IonText color="primary" className="tour-card-price">
            <strong>{tour.price.toLocaleString('ru-RU')} ₽</strong>
          </IonText>
          <IonNote className="tour-card-per">/ чел.</IonNote>
          <div className="tour-card-actions">
            {isOwn
              ? (
                <CardMenuButton
                  editHref={`/edit-tour/${tour.id}?from=${encodeURIComponent(location.pathname)}`}
                  active={tour.active}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              )
              : <BookmarkButton type="tour" id={tour.id} />
            }
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default TourCard;
