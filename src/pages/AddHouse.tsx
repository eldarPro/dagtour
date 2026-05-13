import React, { useState, useEffect } from 'react';
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
  IonButton,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createHouse } from '../lib/api';
import { useAuth } from '../lib/auth';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import { useUserPhone } from '../lib/useUserPhone';
import './AddHouse.css';

const AddHouse: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [guests, setGuests] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (userPhone) setPhone(prev => prev || userPhone);
  }, [userPhone]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Укажите название'); return; }
    if (!price || isNaN(Number(price))) { setError('Укажите цену аренды'); return; }
    if (!rooms || isNaN(Number(rooms))) { setError('Укажите количество комнат'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await createHouse({
        userId: user.id,
        name: name.trim(),
        pricePerNight: Number(price),
        rooms: Number(rooms),
        guests: guests && !isNaN(Number(guests)) ? Number(guests) : null,
        description: description.trim(),
        phone: phone.trim() || undefined,
        location: location?.address,
        lat: location?.lat,
        lng: location?.lng,
        photos,
      });
      history.goBack();
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-houses" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Новое объявление</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="add-house-content">
        <div className="add-house-form-wrapper">
          <PhotoUpload photos={photos} onChange={setPhotos} folder="houses" />
          <IonList className="add-house-form">
            <IonItem>
              <IonLabel position="stacked">Название <span className="add-house-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Горный дом в Гунибе"
                value={name}
                onIonChange={(e) => setName(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/ночь) <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3000"
                value={price}
                onIonChange={(e) => setPrice(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Количество комнат <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3"
                value={rooms}
                onIonChange={(e) => setRooms(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Максимум гостей</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 6"
                value={guests}
                onIonChange={(e) => setGuests(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Телефон для связи</IonLabel>
              <IonInput
                type="tel"
                inputmode="tel"
                placeholder="Например: +7 900 000 00 00"
                value={phone}
                onIonChange={(e) => setPhone(e.detail.value ?? '')}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} />

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о доме..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="add-house-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-house-actions">
            <IonButton expand="block" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Опубликовать'}
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

export default AddHouse;
