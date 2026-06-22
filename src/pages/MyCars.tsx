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
import { addOutline, carOutline, chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import CarCard, { CarCardData } from '../components/CarCard';
import { CarCardSkeleton } from '../components/CardSkeletons';
import { getMyCars, updateCar, deleteCar, Car } from '../lib/api';
import { useAuth } from '../lib/auth';
import './MyCars.css';

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const toCardData = (car: Car): CarCardData => ({
  id: String(car.id),
  brand: car.brand,
  model: car.model,
  year: car.year,
  pricePerDay: car.pricePerDay,
  photo: car.photo,
  location: car.location,
  transmission: car.transmission
    ? (TRANSMISSION_LABEL[car.transmission] ?? car.transmission)
    : undefined,
  active: car.active,
});

const MyCars: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    getMyCars()
      .then(setCars)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useIonViewWillEnter(loadData);

  const handleToggleActive = async (id: number, current: boolean) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
    try {
      await updateCar(id, { active: !current });
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    setCars(prev => prev.filter(c => c.id !== id));
    try {
      await deleteCar(id);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    if (!user) { (e.target as HTMLIonRefresherElement).complete(); return; }
    setLoading(true);
    try {
      setCars(await getMyCars());
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
          <IonTitle>Мои авто</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/add-car')}>
              <IonIcon icon={addOutline} style={{ fontSize: '24px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="my-cars-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <IonList lines="none" className="my-cars-list">
            {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
          </IonList>
        ) : cars.length === 0 ? (
          <div className="my-cars-empty">
            <div className="my-cars-empty-icon">
              <IonIcon icon={carOutline} />
            </div>
            <h3>У вас пока нет объявлений</h3>
            <p>Добавьте своё авто и начните получать заявки на аренду</p>
            <IonButton
              expand="block"
              className="my-cars-add-btn"
              onClick={() => history.push('/add-car')}
            >
              <IonIcon slot="start" icon={addOutline} />
              Добавить объявление
            </IonButton>
          </div>
        ) : (
          <IonList lines="none" className="my-cars-list">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={toCardData(car)}
                isOwn
                onToggleActive={() => handleToggleActive(car.id, car.active ?? true)}
                onDelete={() => handleDelete(car.id)}
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyCars;
