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
import { timeOutline, navigateOutline } from 'ionicons/icons';
import { Tour } from '../data/mockData';
import './TourCard.css';

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <IonCard className="tour-card" routerLink={`/tours/${tour.id}`} button>
      <IonImg src={tour.photo} alt={tour.name} className="tour-card-img" />
      <IonCardHeader>
        <IonCardTitle className="tour-card-title">{tour.name}</IonCardTitle>
        <IonCardSubtitle className="tour-card-desc">
          {tour.description.slice(0, 80)}...
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="tour-card-chips">
          <IonChip className="tour-card-chip">
            <IonIcon icon={timeOutline} />
            <IonText>{tour.duration}</IonText>
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
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default TourCard;
