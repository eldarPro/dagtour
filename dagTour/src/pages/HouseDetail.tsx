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
  IonBadge,
  IonFooter,
} from '@ionic/react';
import { locationOutline, star, bedOutline, peopleOutline } from 'ionicons/icons';
import { houses } from '../data/mockData';
import { loadMyHouses } from '../data/myHousesStorage';
import './HouseDetail.css';

const HouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mockHouse = houses.find((h) => h.id === Number(id));
  const myHouse = mockHouse ? undefined : loadMyHouses().find((h) => h.id === id);

  if (!mockHouse && !myHouse) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText>Дом не найден</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const house = mockHouse ?? {
    id: myHouse!.id,
    name: myHouse!.name,
    description: myHouse!.description,
    pricePerNight: myHouse!.pricePerNight,
    photo: undefined as string | undefined,
    location: myHouse!.address,
    rating: undefined as number | undefined,
    rooms: myHouse!.rooms,
    guests: myHouse!.guests,
  };

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
        <IonImg
          src={house.photo ?? `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(house.name)}`}
          alt={house.name}
          className="detail-img"
        />
        <div className="detail-body">
          {myHouse ? (
            <IonBadge color="success" className="detail-own-badge">Моё объявление</IonBadge>
          ) : house.rating != null ? (
            <IonChip className="detail-rating-chip">
              <IonIcon icon={star} />
              <IonLabel>{house.rating}</IonLabel>
            </IonChip>
          ) : null}

          <IonText>
            <h1 className="detail-title">{house.name}</h1>
          </IonText>

          {house.location && (
            <IonChip className="detail-location-chip" outline>
              <IonIcon icon={locationOutline} color="primary" />
              <IonLabel>{house.location}</IonLabel>
            </IonChip>
          )}

          <div className="detail-chips">
            {house.rooms != null && (
              <IonChip>
                <IonIcon icon={bedOutline} color="primary" />
                <IonLabel>{house.rooms} комнат</IonLabel>
              </IonChip>
            )}
            {house.guests != null && (
              <IonChip>
                <IonIcon icon={peopleOutline} color="primary" />
                <IonLabel>до {house.guests} гостей</IonLabel>
              </IonChip>
            )}
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
          {!myHouse && (
            <IonButton slot="end" color="primary" shape="round" className="detail-book-btn">
              Забронировать
            </IonButton>
          )}
          {myHouse && (
            <IonButton
              slot="end"
              fill="outline"
              shape="round"
              routerLink={`/edit-house/${myHouse.id}`}
              className="detail-book-btn"
            >
              Редактировать
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default HouseDetail;
