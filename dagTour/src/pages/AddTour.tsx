import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { saveMyTour } from '../data/myToursStorage';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import './AddTour.css';

const AddTour: React.FC = () => {
  const history = useHistory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [routeText, setRouteText] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) { setError('Укажите название тура'); return; }
    if (!price || isNaN(Number(price))) { setError('Укажите цену за человека'); return; }
    if (!duration) { setError('Укажите длительность тура'); return; }
    if (!routeText.trim()) { setError('Укажите маршрут тура'); return; }

    const route = routeText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (route.length === 0) { setError('Укажите хотя бы одну точку маршрута'); return; }

    setError(null);
    saveMyTour({
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      duration,
      route,
      meetingPoint: meetingPoint.trim() || undefined,
      createdAt: Date.now(),
      ...(location ? { address: location.address, lat: location.lat, lng: location.lng } : {}),
    });
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-tours" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Новый тур</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="add-tour-content">
        <div className="add-tour-form-wrapper">
          <IonList className="add-tour-form">
            <IonItem>
              <IonLabel position="stacked">Название тура <span className="add-tour-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Тур по горному Дагестану"
                value={name}
                onIonChange={(e) => setName(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена (₽/чел.) <span className="add-tour-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 5000"
                value={price}
                onIonChange={(e) => setPrice(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Длительность <span className="add-tour-required">*</span></IonLabel>
              <IonSelect
                placeholder="Выберите длительность"
                value={duration}
                onIonChange={(e) => setDuration(e.detail.value)}
              >
                <IonSelectOption value="1 день">1 день</IonSelectOption>
                <IonSelectOption value="2 дня">2 дня</IonSelectOption>
                <IonSelectOption value="3 дня">3 дня</IonSelectOption>
                <IonSelectOption value="4 дня">4 дня</IonSelectOption>
                <IonSelectOption value="5 дней">5 дней</IonSelectOption>
                <IonSelectOption value="Неделя">Неделя</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Маршрут (через запятую) <span className="add-tour-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Махачкала, Гуниб, Хунзах"
                value={routeText}
                onIonChange={(e) => setRouteText(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Место встречи</IonLabel>
              <IonInput
                placeholder="Например: Площадь Ленина, Махачкала"
                value={meetingPoint}
                onIonChange={(e) => setMeetingPoint(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о туре..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} />
          </IonList>

          {error && (
            <div className="add-tour-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-tour-actions">
            <IonButton expand="block" onClick={handleSubmit}>
              Опубликовать
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.goBack()}>
              Отмена
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AddTour;
