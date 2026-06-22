import React, { useEffect, useState, useCallback } from 'react';
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
} from '@ionic/react';
import { timeOutline, navigateOutline, ellipseOutline, flagOutline, locationOutline, chevronBackOutline, callOutline, settingsOutline, bookmark, bookmarkOutline } from 'ionicons/icons';
import { getTour, updateTour, deleteTour, Tour } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import CardMenuButton from '../components/CardMenuButton';
import PhotoGallery from '../components/PhotoGallery';
import ReviewsLink from '../components/ReviewsLink';
import AuthorLink from '../components/AuthorLink';
import SocialLinks from '../components/SocialLinks';
import { formatDays } from '../lib/formatDays';
import './TourDetail.css';

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await getTour(Number(id));
      setTour(data);
    } catch (error) {
      console.error('Failed to load tour:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
              <IonBackButton defaultHref="/tours" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding loading-container">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!tour) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tours" text="" icon={chevronBackOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>Тур не найден</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const isOwn = !!user && tour?.userId === user.id;

  const handleToggleActive = async () => {
    try {
      const updated = await updateTour(tour.id, { active: !tour.active });
      setTour(prev => prev ? { ...prev, active: updated.active } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTour(tour.id);
      history.goBack();
    } catch (err) {
      console.error(err);
    }
  };
  const placeholder = `https://placehold.co/800x500/2E7D32/FFFFFF?text=${encodeURIComponent(tour.name)}`;
  const photos = tour.photos?.length ? tour.photos : (tour.photo ? [tour.photo] : [placeholder]);

  const getRouteIcon = (index: number, total: number) => {
    if (index === 0) return flagOutline;
    if (index === total - 1) return locationOutline;
    return ellipseOutline;
  };

  const getRouteColor = (index: number, total: number) => {
    if (index === 0) return 'primary';
    if (index === total - 1) return 'danger';
    return 'medium';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tours" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{tour.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => toggle('tour', tour.id)}>
              <IonIcon slot="icon-only" icon={isFavorited('tour', tour.id) ? bookmark : bookmarkOutline} style={isFavorited('tour', tour.id) ? { color: '#ef4444' } : undefined} />
            </IonButton>
            {isOwn && (
              <CardMenuButton
                editHref={`/edit-tour/${tour.id}`}
                active={tour.active}
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
        <PhotoGallery photos={photos} alt={tour.name} />
        <div className="detail-body">
          <IonText>
            <h1 className="detail-title">{tour.name}</h1>
          </IonText>

          <div className="detail-chips">
            <IonChip>
              <IonIcon icon={timeOutline} color="primary" />
              <IonLabel>{formatDays(tour.duration)}</IonLabel>
            </IonChip>
            {tour.meetingPoint && (
              <IonChip>
                <IonIcon icon={locationOutline} color="primary" />
                <IonLabel>Выезд: {tour.meetingPoint}</IonLabel>
              </IonChip>
            )}
          </div>

          <IonText>
            <h2 className="detail-section-title">Описание</h2>
          </IonText>
          <IonText color="medium">
            <p className="detail-description">{tour.description}</p>
          </IonText>

          <IonText>
            <h2 className="detail-section-title">Маршрут</h2>
          </IonText>
          <IonList lines="none" className="route-list">
            {tour.route.map((point, index) => (
              <IonItem key={index} className="route-item">
                <IonIcon
                  icon={getRouteIcon(index, tour.route.length)}
                  slot="start"
                  color={getRouteColor(index, tour.route.length)}
                  className="route-icon"
                />
                <IonLabel>
                  <IonText>{point}</IonText>
                  <IonNote>
                    {index === 0 ? 'Старт' : index === tour.route.length - 1 ? 'Финиш' : `Точка ${index}`}
                  </IonNote>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
          <ReviewsLink itemType="tour" itemId={tour.id} />
          <AuthorLink author={tour.author} />
          <SocialLinks whatsapp={tour.whatsapp} telegram={tour.telegram} vk={tour.vk} />
        </div>
      </IonContent>
      <IonFooter className="detail-footer">
        <IonToolbar className="detail-footer-toolbar">
          <div className="detail-price-wrap" slot="start">
            <IonText className="detail-price">
              <strong>{tour.price.toLocaleString('ru-RU')} ₽</strong>
            </IonText>
            <IonNote className="detail-per">/ чел.</IonNote>
          </div>
          {tour.phone && (
            <IonButton slot="end" fill="outline" shape="round" className="detail-book-btn" href={`tel:${tour.phone}`}>
              <IonIcon slot="start" icon={callOutline} />
              {formatPhone(tour.phone)}
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default TourDetail;
