import React from 'react';
import { useParams } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonChip,
  IonImg,
  IonText,
  IonNote,
  IonLabel,
  IonFooter,
} from '@ionic/react';
import { locationOutline, star, bedOutline, peopleOutline } from 'ionicons/icons';
import { houses } from '../data/mockData';
import './HouseDetail.css';

const HouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const house = houses.find((h) => h.id === Number(id));

  if (!house) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText>Дом не найден</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/houses" text="Назад" />
          </IonButtons>
          <IonTitle>{house.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonImg src={house.photo} alt={house.name} className="detail-img" />
        <div className="detail-body">
          <IonChip className="detail-rating-chip">
            <IonIcon icon={star} />
            <IonLabel>{house.rating}</IonLabel>
          </IonChip>

          <IonText>
            <h1 className="detail-title">{house.name}</h1>
          </IonText>

          <IonChip className="detail-location-chip" outline>
            <IonIcon icon={locationOutline} color="primary" />
            <IonLabel>{house.location}</IonLabel>
          </IonChip>

          <div className="detail-chips">
            <IonChip>
              <IonIcon icon={bedOutline} color="primary" />
              <IonLabel>{house.rooms} комнат</IonLabel>
            </IonChip>
            <IonChip>
              <IonIcon icon={peopleOutline} color="primary" />
              <IonLabel>до {house.guests} гостей</IonLabel>
            </IonChip>
          </div>

          <IonText>
            <h2 className="detail-section-title">Описание</h2>
          </IonText>
          <IonText color="medium">
            <p className="detail-description">{house.description}</p>
          </IonText>
        </div>
      </IonContent>
      <IonFooter className="detail-footer">
        <IonToolbar className="detail-footer-toolbar">
          <div className="detail-price-wrap" slot="start">
            <IonText color="primary" className="detail-price">
              <strong>{house.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
            </IonText>
            <IonNote className="detail-per">/ ночь</IonNote>
          </div>
          <IonButton slot="end" color="primary" shape="round" className="detail-book-btn">
            Забронировать
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default HouseDetail;
