import React, { useEffect, useState } from 'react';
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
  IonSpinner,
} from '@ionic/react';
import { locationOutline, star, bedOutline, peopleOutline, chevronBackOutline } from 'ionicons/icons';
import { getHouse, House } from '../lib/api';
import { loadMyHouses, MyHouse } from '../data/myHousesStorage';
import './HouseDetail.css';

const HouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [house, setHouse] = useState<House | null>(null);
  const [myHouse, setMyHouse] = useState<MyHouse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const myHouses = loadMyHouses();
      const foundMyHouse = myHouses.find((h) => h.id === id);

      if (foundMyHouse) {
        setMyHouse(foundMyHouse);
      } else {
        try {
          const data = await getHouse(Number(id));
          setHouse(data);
        } catch (error) {
          console.error('Failed to load house:', error);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/houses" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding loading-container">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!house && !myHouse) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/houses" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>Дом не найден</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const displayHouse = house ?? {
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
            <IonBackButton defaultHref="/houses" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{displayHouse.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonImg
          src={displayHouse.photo ?? `https://placehold.co/400x300/2E7D32/FFFFFF?text=${encodeURIComponent(displayHouse.name)}`}
          alt={displayHouse.name}
          className="detail-img"
        />
        <div className="detail-body">
          {myHouse ? (
            <IonBadge color="success" className="detail-own-badge">Моё объявление</IonBadge>
          ) : displayHouse.rating != null ? (
            <IonChip className="detail-rating-chip">
              <IonIcon icon={star} />
              <IonLabel>{displayHouse.rating}</IonLabel>
            </IonChip>
          ) : null}

          <IonText>
            <h1 className="detail-title">{displayHouse.name}</h1>
          </IonText>

          {displayHouse.location && (
            <IonChip className="detail-location-chip" outline>
              <IonIcon icon={locationOutline} color="primary" />
              <IonLabel>{displayHouse.location}</IonLabel>
            </IonChip>
          )}

          <div className="detail-chips">
            {displayHouse.rooms != null && (
              <IonChip>
                <IonIcon icon={bedOutline} color="primary" />
                <IonLabel>{displayHouse.rooms} комнат</IonLabel>
              </IonChip>
            )}
            {displayHouse.guests != null && (
              <IonChip>
                <IonIcon icon={peopleOutline} color="primary" />
                <IonLabel>до {displayHouse.guests} гостей</IonLabel>
              </IonChip>
            )}
          </div>

          <IonText>
            <h2 className="detail-section-title">Описание</h2>
          </IonText>
          <IonText color="medium">
            <p className="detail-description">{displayHouse.description}</p>
          </IonText>
        </div>
      </IonContent>
      <IonFooter className="detail-footer">
        <IonToolbar className="detail-footer-toolbar">
          <div className="detail-price-wrap" slot="start">
            <IonText color="primary" className="detail-price">
              <strong>{displayHouse.pricePerNight.toLocaleString('ru-RU')} ₽</strong>
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
