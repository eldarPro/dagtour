import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  useIonViewWillEnter,
} from '@ionic/react';
import { addOutline, homeOutline, chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HouseCard, { HouseCardData } from '../components/HouseCard';
import { HouseCardSkeleton } from '../components/CardSkeletons';
import { getMyHouses, House } from '../lib/api';
import { useAuth } from '../lib/auth';
import './MyHouses.css';

const toCardData = (house: House): HouseCardData => ({
  id: String(house.id),
  name: house.name,
  pricePerNight: house.pricePerNight,
  photo: house.photo,
  location: house.location,
  rooms: house.rooms,
  guests: house.guests ?? undefined,
});

const MyHouses: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useIonViewWillEnter(() => {
    if (!user) return;
    setLoading(true);
    getMyHouses(user.id)
      .then(setHouses)
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/account" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Мои дома</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/add-house')}>
              <IonIcon icon={addOutline} style={{ fontSize: '24px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="my-houses-content">
        {loading ? (
          <IonList lines="none" className="my-houses-list">
            {Array.from({ length: 4 }).map((_, i) => <HouseCardSkeleton key={i} />)}
          </IonList>
        ) : houses.length === 0 ? (
          <div className="my-houses-empty">
            <div className="my-houses-empty-icon">
              <IonIcon icon={homeOutline} />
            </div>
            <h3>У вас пока нет объявлений</h3>
            <p>Добавьте свой дом и начните получать заявки на аренду</p>
            <IonButton
              expand="block"
              className="my-houses-add-btn"
              onClick={() => history.push('/add-house')}
            >
              <IonIcon slot="start" icon={addOutline} />
              Добавить объявление
            </IonButton>
          </div>
        ) : (
          <IonList lines="none" className="my-houses-list">
            {houses.map((house) => (
              <HouseCard key={house.id} house={toCardData(house)} isOwn />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyHouses;
