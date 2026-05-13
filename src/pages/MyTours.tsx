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
import { addOutline, mapOutline, chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import TourCard from '../components/TourCard';
import { TourCardSkeleton } from '../components/CardSkeletons';
import { getMyTours, Tour } from '../lib/api';
import { useAuth } from '../lib/auth';
import './MyTours.css';

const MyTours: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useIonViewWillEnter(() => {
    if (!user) return;
    setLoading(true);
    getMyTours(user.id)
      .then(setTours)
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
          <IonTitle>Мои туры</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/add-tour')}>
              <IonIcon icon={addOutline} style={{ fontSize: '24px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="my-tours-content">
        {loading ? (
          <IonList lines="none" className="my-tours-list">
            {Array.from({ length: 4 }).map((_, i) => <TourCardSkeleton key={i} />)}
          </IonList>
        ) : tours.length === 0 ? (
          <div className="my-tours-empty">
            <div className="my-tours-empty-icon">
              <IonIcon icon={mapOutline} />
            </div>
            <h3>У вас пока нет туров</h3>
            <p>Добавьте свой тур и начните принимать туристов</p>
            <IonButton
              expand="block"
              className="my-tours-add-btn"
              onClick={() => history.push('/add-tour')}
            >
              <IonIcon slot="start" icon={addOutline} />
              Добавить тур
            </IonButton>
          </div>
        ) : (
          <IonList lines="none" className="my-tours-list">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} isOwn showOwnBadge />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyTours;
