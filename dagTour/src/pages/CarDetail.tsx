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
import { peopleOutline, cogOutline, checkmarkCircleOutline, calendarOutline, chevronBackOutline } from 'ionicons/icons';
import { getCar, Car } from '../lib/api';
import { loadMyCars, MyCar } from '../data/myCarsStorage';
import './CarDetail.css';

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [myCar, setMyCar] = useState<MyCar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const myCars = loadMyCars();
      const foundMyCar = myCars.find((c) => c.id === id);

      if (foundMyCar) {
        setMyCar(foundMyCar);
      } else {
        try {
          const data = await getCar(Number(id));
          setCar(data);
        } catch (error) {
          console.error('Failed to load car:', error);
        }
      }
      setLoading(false);
    };
    fetchData();
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

  if (!car && !myCar) {
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

  if (myCar) {
    const transmission = myCar.transmission
      ? (TRANSMISSION_LABEL[myCar.transmission] ?? myCar.transmission)
      : null;

    const conditions = [
      'Минимальный возраст водителя: 21 год',
      'Стаж вождения: от 2 лет',
      `Залог: ${(myCar.pricePerDay * 3).toLocaleString('ru-RU')} ₽`,
      'Пробег: без ограничений',
    ];

    const placeholder = `https://placehold.co/800x500/2E7D32/FFFFFF?text=${encodeURIComponent(myCar.brand + ' ' + myCar.model)}`;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
            </IonButtons>
            <IonTitle>{myCar.brand} {myCar.model}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonImg src={placeholder} alt={`${myCar.brand} ${myCar.model}`} className="detail-img" />
          <div className="detail-body">
            <IonBadge color="success" className="car-detail-type">Моё объявление</IonBadge>

            <IonText>
              <h1 className="detail-title">{myCar.brand} {myCar.model}</h1>
            </IonText>

            <div className="detail-chips">
              <IonChip>
                <IonIcon icon={calendarOutline} color="primary" />
                <IonLabel>{myCar.year} г.</IonLabel>
              </IonChip>
              {transmission && (
                <IonChip>
                  <IonIcon icon={cogOutline} color="primary" />
                  <IonLabel>{transmission}</IonLabel>
                </IonChip>
              )}
            </div>

            {myCar.description ? (
              <>
                <IonText>
                  <h2 className="detail-section-title">Описание</h2>
                </IonText>
                <IonText>
                  <p className="detail-description">{myCar.description}</p>
                </IonText>
              </>
            ) : null}

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
                <strong>{myCar.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
              </IonText>
              <IonNote className="detail-per">/ день</IonNote>
            </div>
            <IonButton slot="end" color="primary" shape="round" className="detail-book-btn">
              Забронировать
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }

  const displayCar = car!;
  const conditions = [
    'Минимальный возраст водителя: 21 год',
    'Стаж вождения: от 2 лет',
    `Залог: ${(displayCar.pricePerDay * 3).toLocaleString('ru-RU')} ₽`,
    'Пробег: без ограничений',
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{displayCar.brand} {displayCar.model}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonImg src={displayCar.photo} alt={`${displayCar.brand} ${displayCar.model}`} className="detail-img" />
        <div className="detail-body">
          <IonBadge color="secondary" className="car-detail-type">{displayCar.type}</IonBadge>

          <IonText>
            <h1 className="detail-title">{displayCar.brand} {displayCar.model}</h1>
          </IonText>

          <div className="detail-chips">
            <IonChip>
              <IonIcon icon={peopleOutline} color="primary" />
              <IonLabel>{displayCar.seats} мест</IonLabel>
            </IonChip>
            <IonChip>
              <IonIcon icon={cogOutline} color="primary" />
              <IonLabel>{displayCar.transmission}</IonLabel>
            </IonChip>
          </div>

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
              <strong>{displayCar.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
            </IonText>
            <IonNote className="detail-per">/ день</IonNote>
          </div>
          <IonButton slot="end" color="primary" shape="round" className="detail-book-btn">
            Забронировать
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default CarDetail;
