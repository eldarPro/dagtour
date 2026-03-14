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
import { MyHouse, loadMyHouses } from '../data/myHousesStorage';
import './MyHouses.css';

const toCardData = (house: MyHouse): HouseCardData => ({
  id: house.id,
  name: house.name,
  pricePerNight: house.pricePerNight,
  location: house.address,
  rooms: house.rooms,
  guests: house.guests,
});

const MyHouses: React.FC = () => {
  const history = useHistory();
  const [houses, setHouses] = useState<MyHouse[]>([]);

  useIonViewWillEnter(() => {
    setHouses(loadMyHouses());
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
        {houses.length === 0 ? (
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
              <HouseCard
                key={house.id}
                house={toCardData(house)}
                isOwn
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyHouses;
