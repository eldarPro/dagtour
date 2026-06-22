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
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import { addOutline, homeOutline, chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HouseCard, { HouseCardData } from '../components/HouseCard';
import { HouseCardSkeleton } from '../components/CardSkeletons';
import { getMyHouses, updateHouse, deleteHouse, House } from '../lib/api';
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
  active: house.active,
});

const MyHouses: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    getMyHouses()
      .then(setHouses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useIonViewWillEnter(loadData);

  const handleToggleActive = async (id: number, current: boolean) => {
    setHouses(prev => prev.map(h => h.id === id ? { ...h, active: !current } : h));
    try {
      await updateHouse(id, { active: !current });
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    setHouses(prev => prev.filter(h => h.id !== id));
    try {
      await deleteHouse(id);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    if (!user) { (e.target as HTMLIonRefresherElement).complete(); return; }
    setLoading(true);
    try {
      setHouses(await getMyHouses());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      (e.target as HTMLIonRefresherElement).complete();
    }
  };

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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
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
              <HouseCard
                key={house.id}
                house={toCardData(house)}
                isOwn
                onToggleActive={() => handleToggleActive(house.id, house.active ?? true)}
                onDelete={() => handleDelete(house.id)}
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyHouses;
