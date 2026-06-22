import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { formatPhone } from '../lib/formatPhone';
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
  IonList,
  IonItem,
  IonFooter,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonModal,
} from '@ionic/react';
import { locationOutline, peopleOutline, cogOutline, checkmarkCircleOutline, calendarOutline, chevronBackOutline, callOutline, settingsOutline, bookmark, bookmarkOutline, closeOutline } from 'ionicons/icons';
import { getCar, updateCar, deleteCar, Car } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import CardMenuButton from '../components/CardMenuButton';
import PhotoGallery from '../components/PhotoGallery';
import ReviewsLink from '../components/ReviewsLink';
import AuthorLink from '../components/AuthorLink';
import SocialLinks from '../components/SocialLinks';
import { transmissionLabel, carTypeLabel } from '../data/carFilters';
import './CarDetail.css';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getCar(Number(id));
      setCar(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!mapOpen || !car?.lat || !car?.lng) return;
    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !mapContainerRef.current || modalMapRef.current) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
      const map = new YMap(mapContainerRef.current, {
        location: { center: [car.lng, car.lat], zoom: 14 },
      });
      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      const el = document.createElement('div');
      el.className = 'detail-map-marker';
      map.addChild(new YMapMarker({ coordinates: [car.lng, car.lat] }, el));
      modalMapRef.current = map;
    };

    if ((window as any).ymaps3) {
      initMap();
    } else if (!document.getElementById('ymaps3-script')) {
      const script = document.createElement('script');
      script.id = 'ymaps3-script';
      script.src = 'https://api-maps.yandex.ru/v3/?apikey=57398362-80f4-4fe3-a697-4fbd3ceb320c&lang=ru_RU';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      document.getElementById('ymaps3-script')!.addEventListener('load', initMap);
    }

    return () => {
      cancelled = true;
      modalMapRef.current?.destroy?.();
      modalMapRef.current = null;
    };
  }, [mapOpen, car]);

  const handleRefresh = async (e: CustomEvent) => {
    await fetchData();
    (e.target as HTMLIonRefresherElement).complete();
  };

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

  const handleToggleActive = async () => {
    try {
      const updated = await updateCar(car.id, { active: !car.active });
      setCar(prev => prev ? { ...prev, active: updated.active } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCar(car.id);
      history.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  const transmission = transmissionLabel(car.transmission) ?? null;

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
              <CardMenuButton
                editHref={`/edit-car/${car.id}`}
                active={car.active}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <PhotoGallery photos={photos} alt={`${car.brand} ${car.model}`} />
        <div className="detail-body">
          <IonText>
            <h1 className="detail-title">
              {car.brand} {car.model}
              {car.type && <span className="detail-car-type"> · {carTypeLabel(car.type)}</span>}
            </h1>
          </IonText>

          {car.location && (
            <div
              className={`detail-location${car.lat && car.lng ? ' detail-location--clickable' : ''}`}
              onClick={() => car.lat && car.lng && setMapOpen(true)}
            >
              <IonIcon icon={locationOutline} />
              <span>{car.location}</span>
            </div>
          )}

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
          <ReviewsLink itemType="car" itemId={car.id} />
          <AuthorLink author={car.author} />
          <SocialLinks whatsapp={car.whatsapp} telegram={car.telegram} vk={car.vk} />
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
              {formatPhone(car.phone)}
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
      <IonModal isOpen={mapOpen} onDidDismiss={() => setMapOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{car.location}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setMapOpen(false)}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div ref={mapContainerRef} className="detail-map-container" />
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default CarDetail;
