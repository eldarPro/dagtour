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
  IonBadge,
  IonFooter,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonModal,
} from '@ionic/react';
import { locationOutline, bedOutline, peopleOutline, chevronBackOutline, callOutline, settingsOutline, bookmark, bookmarkOutline, closeOutline } from 'ionicons/icons';
import { getHouse, updateHouse, deleteHouse, House } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import CardMenuButton from '../components/CardMenuButton';
import PhotoGallery from '../components/PhotoGallery';
import ReviewsLink from '../components/ReviewsLink';
import AuthorLink from '../components/AuthorLink';
import SocialLinks from '../components/SocialLinks';
import './HouseDetail.css';

const HouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getHouse(Number(id));
      setHouse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!mapOpen || !house?.lat || !house?.lng) return;
    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !mapContainerRef.current || modalMapRef.current) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
      const map = new YMap(mapContainerRef.current, {
        location: { center: [house.lng, house.lat], zoom: 14 },
      });
      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      const el = document.createElement('div');
      el.className = 'detail-map-marker';
      map.addChild(new YMapMarker({ coordinates: [house.lng, house.lat] }, el));
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
  }, [mapOpen, house]);

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

  if (!house) {
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

  const isOwn = !!user && house.userId === user.id;

  const handleToggleActive = async () => {
    try {
      const updated = await updateHouse(house.id, { active: !house.active });
      setHouse(prev => prev ? { ...prev, active: updated.active } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHouse(house.id);
      history.goBack();
    } catch (err) {
      console.error(err);
    }
  };
  const placeholder = `https://placehold.co/800x500/2E7D32/FFFFFF?text=${encodeURIComponent(house.name)}`;
  const photos = house.photos?.length ? house.photos : (house.photo ? [house.photo] : [placeholder]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/houses" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{house.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => toggle('house', house.id)}>
              <IonIcon slot="icon-only" icon={isFavorited('house', house.id) ? bookmark : bookmarkOutline} style={isFavorited('house', house.id) ? { color: '#ef4444' } : undefined} />
            </IonButton>
            {isOwn && (
              <CardMenuButton
                editHref={`/edit-house/${house.id}`}
                active={house.active}
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
        <PhotoGallery photos={photos} alt={house.name} />
        <div className="detail-body">
          <IonText>
            <h1 className="detail-title">{house.name}</h1>
          </IonText>

          {house.location && (
            <div
              className={`detail-location${house.lat && house.lng ? ' detail-location--clickable' : ''}`}
              onClick={() => house.lat && house.lng && setMapOpen(true)}
            >
              <IonIcon icon={locationOutline} />
              <span>{house.location}</span>
            </div>
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

          {house.description && (
            <>
              <IonText>
                <h2 className="detail-section-title">Описание</h2>
              </IonText>
              <IonText color="medium">
                <p className="detail-description">{house.description}</p>
              </IonText>
            </>
          )}
          <ReviewsLink itemType="house" itemId={house.id} rating={house.rating} />
          <AuthorLink author={house.author} />
          <SocialLinks whatsapp={house.whatsapp} telegram={house.telegram} vk={house.vk} />
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
          {house.phone && (
            <IonButton slot="end" fill="outline" shape="round" className="detail-book-btn" href={`tel:${house.phone}`}>
              <IonIcon slot="start" icon={callOutline} />
              {formatPhone(house.phone)}
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
      <IonModal isOpen={mapOpen} onDidDismiss={() => setMapOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{house.location}</IonTitle>
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

export default HouseDetail;
