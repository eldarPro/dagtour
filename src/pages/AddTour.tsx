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
import { cities } from '../data/dagestanLocations';
import { useAuth } from '../lib/auth';
import { chevronBackOutline } from 'ionicons/icons';
import PhotoUpload from '../components/PhotoUpload';
import RouteTagInput from '../components/RouteTagInput';
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import { useUserPhone } from '../lib/useUserPhone';
import './AddTour.css';

const INCLUDED_OPTIONS = ['Транспорт', 'Питание', 'Проживание', 'Гид', 'Входные билеты'];

const AddTour: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();
  const { contacts, contactErrors, updateContact, validateContacts, phoneKey, setPhoneKey } = useContactFields();

  const [name, setName] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [maxPeople, setMaxPeople] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userPhone && !phoneKey) {
      updateContact('phone', userPhone);
      setPhoneKey(userPhone);
    }
  }, [userPhone]);

  const toggleIncluded = (item: string) => {
    setIncluded((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Укажите название тура'); return; }
    if (!duration.trim()) { setError('Укажите длительность'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Укажите цену'); return; }
    if (!meetingPoint.trim()) { setError('Укажите город выезда'); return; }
    if (route.length === 0) { setError('Укажите маршрут'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await createTour({
        userId: user.id,
        name: name.trim(),
        meetingPoint: meetingPoint.trim(),
        description: description.trim(),
        price: parseFloat(price),
        duration: Number(duration.trim()),
        route,
        included,
        maxPeople: maxPeople ? Number(maxPeople) : undefined,
        phone: contacts.phone.trim() || undefined,
        whatsapp: contacts.whatsapp.trim() || undefined,
        telegram: contacts.telegram.trim() || undefined,
        vk: contacts.vk.trim() || undefined,
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
              <IonLabel position="stacked">Цена (₽ / чел.) <span className="add-tour-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="1"
                placeholder="Например: 5000"
                value={price}
                onIonChange={(e) => setPrice(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Размер группы (макс. чел.)</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="1"
                placeholder="Например: 8"
                value={maxPeople}
                onIonChange={(e) => setMaxPeople(e.detail.value ?? '')}
              />
            </IonItem>

            <div className="city-picker-item">
              <div className="city-picker-label">Город выезда <span>*</span></div>
              <div className="city-picker-chips">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    className={`city-picker-chip${meetingPoint === city.name ? ' active' : ''}`}
                    onClick={() => setMeetingPoint(city.name)}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <RouteTagInput value={route} onChange={setRoute} required />
          </IonList>

          <IonList className="add-tour-form" style={{ marginTop: 16 }}>
            <IonItem lines="none">
              <IonLabel position="stacked">Что включено</IonLabel>
            </IonItem>
            {INCLUDED_OPTIONS.map((item) => (
              <CheckboxRow key={item} label={item} checked={included.includes(item)} onChange={() => toggleIncluded(item)} />
            ))}
          </IonList>

          <IonList className="add-tour-form" style={{ marginTop: 16 }}>
            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Ваше описание о туре..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          <ContactSection contacts={contacts} onChange={updateContact} phoneKey={phoneKey} errors={contactErrors} />

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
