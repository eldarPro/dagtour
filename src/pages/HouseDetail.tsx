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
import { locationOutline, bedOutline, peopleOutline, chevronBackOutline, callOutline, settingsOutline, bookmark, bookmarkOutline } from 'ionicons/icons';
import { getHouse, House } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import PhotoGallery from '../components/PhotoGallery';
import './HouseDetail.css';

const HouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHouse(Number(id))
      .then(setHouse)
      .catch(console.error)
      .finally(() => setLoading(false));
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
              <IonButton routerLink={`/edit-house/${house.id}`}>
                <IonIcon slot="icon-only" icon={settingsOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <PhotoGallery photos={photos} alt={house.name} />
        <div className="detail-body">
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
              {house.phone}
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default HouseDetail;
