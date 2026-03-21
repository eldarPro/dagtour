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
  IonList,
  IonItem,
  IonFooter,
  IonSpinner,
} from '@ionic/react';
import { timeOutline, navigateOutline, ellipseOutline, flagOutline, locationOutline, chevronBackOutline } from 'ionicons/icons';
import { getTour, Tour } from '../lib/api';
import './TourDetail.css';

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTour(Number(id));
        setTour(data);
      } catch (error) {
        console.error('Failed to load tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonImg src={tour.photo} alt={tour.name} className="detail-img" />
        <div className="detail-body">
          <IonText>
            <h1 className="detail-title">{tour.name}</h1>
          </IonText>

          <div className="detail-chips">
            <IonChip>
              <IonIcon icon={timeOutline} color="primary" />
              <IonLabel>{tour.duration}</IonLabel>
            </IonChip>
            <IonChip>
              <IonIcon icon={navigateOutline} color="primary" />
              <IonLabel>{tour.route.length} точек</IonLabel>
            </IonChip>
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
          <IonButton slot="end" color="primary" shape="round" className="detail-book-btn">
            Записаться
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default TourDetail;
