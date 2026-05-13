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
  IonBadge,
  IonImg,
  IonText,
  IonNote,
  IonLabel,
  IonList,
  IonItem,
  IonFooter,
  IonSpinner,
} from '@ionic/react';
import { peopleOutline, cogOutline, checkmarkCircleOutline, calendarOutline, chevronBackOutline, callOutline, settingsOutline, bookmark, bookmarkOutline } from 'ionicons/icons';
import { getCar, Car } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import PhotoGallery from '../components/PhotoGallery';
import './CarDetail.css';

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCar(Number(id))
      .then(setCar)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding loading-container">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!car) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>Автомобиль не найден</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const isOwn = !!user && car.userId === user.id;
  const transmission = car.transmission
    ? (TRANSMISSION_LABEL[car.transmission] ?? car.transmission)
    : null;

  const conditions = [
    'Минимальный возраст водителя: 21 год',
    'Стаж вождения: от 2 лет',
    `Залог: ${(car.pricePerDay * 3).toLocaleString('ru-RU')} ₽`,
    'Пробег: без ограничений',
  ];

  const placeholder = `https://placehold.co/800x500/2E7D32/FFFFFF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;
  const photos = car.photos?.length ? car.photos : (car.photo ? [car.photo] : [placeholder]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{car.brand} {car.model}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => toggle('car', car.id)}>
              <IonIcon slot="icon-only" icon={isFavorited('car', car.id) ? bookmark : bookmarkOutline} style={isFavorited('car', car.id) ? { color: '#ef4444' } : undefined} />
            </IonButton>
            {isOwn && (
              <IonButton routerLink={`/edit-car/${car.id}`}>
                <IonIcon slot="icon-only" icon={settingsOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <PhotoGallery photos={photos} alt={`${car.brand} ${car.model}`} />
        <div className="detail-body">
          {car.type && <IonBadge color="secondary" className="car-detail-type">{car.type}</IonBadge>}

          <IonText>
            <h1 className="detail-title">{car.brand} {car.model}</h1>
          </IonText>

          <div className="detail-chips">
            {car.year && (
              <IonChip>
                <IonIcon icon={calendarOutline} color="primary" />
                <IonLabel>{car.year} г.</IonLabel>
              </IonChip>
            )}
            {car.seats && (
              <IonChip>
                <IonIcon icon={peopleOutline} color="primary" />
                <IonLabel>{car.seats} мест</IonLabel>
              </IonChip>
            )}
            {transmission && (
              <IonChip>
                <IonIcon icon={cogOutline} color="primary" />
                <IonLabel>{transmission}</IonLabel>
              </IonChip>
            )}
          </div>

          {car.description && (
            <>
              <IonText>
                <h2 className="detail-section-title">Описание</h2>
              </IonText>
              <IonText color="medium">
                <p className="detail-description">{car.description}</p>
              </IonText>
            </>
          )}

          <IonText>
            <h2 className="detail-section-title">Условия аренды</h2>
          </IonText>
          <IonList lines="inset" className="conditions-list">
            {conditions.map((condition, idx) => (
              <IonItem key={idx}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" color="primary" />
                <IonLabel className="ion-text-wrap">{condition}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
      <IonFooter className="detail-footer">
        <IonToolbar className="detail-footer-toolbar">
          <div className="detail-price-wrap" slot="start">
            <IonText color="primary" className="detail-price">
              <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
            </IonText>
            <IonNote className="detail-per">/ день</IonNote>
          </div>
          {car.phone && (
            <IonButton slot="end" fill="outline" shape="round" className="detail-book-btn" href={`tel:${car.phone}`}>
              <IonIcon slot="start" icon={callOutline} />
              {car.phone}
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default CarDetail;
