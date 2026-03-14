import React from 'react';
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
} from '@ionic/react';
import { peopleOutline, cogOutline, checkmarkCircleOutline, calendarOutline, chevronBackOutline } from 'ionicons/icons';
import { cars } from '../data/mockData';
import { loadMyCars, MyCar } from '../data/myCarsStorage';
import './CarDetail.css';

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const mockCar = cars.find((c) => c.id === Number(id));
  const myCar: MyCar | undefined = mockCar ? undefined : loadMyCars().find((c) => c.id === id);

  if (!mockCar && !myCar) {
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

  const car = mockCar!;
  const conditions = [
    'Минимальный возраст водителя: 21 год',
    'Стаж вождения: от 2 лет',
    `Залог: ${(car.pricePerDay * 3).toLocaleString('ru-RU')} ₽`,
    'Пробег: без ограничений',
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{car.brand} {car.model}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonImg src={car.photo} alt={`${car.brand} ${car.model}`} className="detail-img" />
        <div className="detail-body">
          <IonBadge color="secondary" className="car-detail-type">{car.type}</IonBadge>

          <IonText>
            <h1 className="detail-title">{car.brand} {car.model}</h1>
          </IonText>

          <div className="detail-chips">
            <IonChip>
              <IonIcon icon={peopleOutline} color="primary" />
              <IonLabel>{car.seats} мест</IonLabel>
            </IonChip>
            <IonChip>
              <IonIcon icon={cogOutline} color="primary" />
              <IonLabel>{car.transmission}</IonLabel>
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
              <strong>{car.pricePerDay.toLocaleString('ru-RU')} ₽</strong>
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
