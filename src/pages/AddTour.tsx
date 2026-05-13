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
import { createTour } from '../lib/api';
import { useAuth } from '../lib/auth';
import { chevronBackOutline } from 'ionicons/icons';
import PhotoUpload from '../components/PhotoUpload';
import RouteTagInput from '../components/RouteTagInput';
import { useUserPhone } from '../lib/useUserPhone';
import './AddTour.css';

const AddTour: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userPhone) setPhone(prev => prev || userPhone);
  }, [userPhone]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Укажите название тура'); return; }
    if (!duration.trim()) { setError('Укажите длительность'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }

    if (route.length === 0) { setError('Укажите маршрут'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await createTour({
        userId: user.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        duration: duration.trim(),
        route,
        phone: phone.trim() || undefined,
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
            <IonBackButton defaultHref="/my-tours" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Новый тур</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="add-tour-content">
        <div className="add-tour-form-wrapper">
          <PhotoUpload photos={photos} onChange={setPhotos} folder="tours" />
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
              <IonLabel position="stacked">Длительность (дней) <span className="add-tour-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="1"
                placeholder="Например: 3"
                value={duration}
                onIonChange={(e) => setDuration(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена (₽ / чел.)</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="Например: 5000"
                value={price}
                onIonChange={(e) => setPrice(e.detail.value ?? '')}
              />
            </IonItem>

            <RouteTagInput value={route} onChange={setRoute} required />

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

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о туре..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="add-tour-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-tour-actions">
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

export default AddTour;
