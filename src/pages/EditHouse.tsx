import React, { useState, useRef } from 'react';
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
  IonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { getHouse, updateHouse, deleteHouse, House } from '../lib/api';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import './AddHouse.css';

const EditHouse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const routerLocation = useLocation();
  const returnPath = new URLSearchParams(routerLocation.search).get('from') ?? '/my-houses';

  const [house, setHouse] = useState<House | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [guests, setGuests] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const nameRef = useRef('');
  const priceRef = useRef('');
  const roomsRef = useRef('');
  const guestsRef = useRef('');
  const descriptionRef = useRef('');
  const phoneRef = useRef('');

  useIonViewWillEnter(() => {
    getHouse(Number(id)).then((found) => {
      if (!found) return;
      setHouse(found);
      setName(found.name); nameRef.current = found.name;
      setPrice(String(found.pricePerNight)); priceRef.current = String(found.pricePerNight);
      setRooms(found.rooms != null ? String(found.rooms) : ''); roomsRef.current = found.rooms != null ? String(found.rooms) : '';
      setGuests(found.guests != null ? String(found.guests) : ''); guestsRef.current = found.guests != null ? String(found.guests) : '';
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      setPhone(found.phone ?? ''); phoneRef.current = found.phone ?? '';
      setLocation(
        found.lat != null && found.lng != null
          ? { address: found.location ?? '', lat: found.lat, lng: found.lng }
          : null
      );
      setPhotos(found.photos ?? []);
    });
  });

  const handleSave = async () => {
    const n = nameRef.current.trim();
    const p = priceRef.current;
    const r = roomsRef.current;
    const g = guestsRef.current;
    const d = descriptionRef.current.trim();
    const ph = phoneRef.current.trim();

    if (!n) { setError('Укажите название'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }
    if (!r || isNaN(Number(r))) { setError('Укажите количество комнат'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await updateHouse(Number(id), {
        name: n,
        pricePerNight: Number(p),
        rooms: Number(r),
        guests: g && !isNaN(Number(g)) ? Number(g) : null,
        description: d,
        phone: ph || undefined,
        location: location?.address,
        lat: location?.lat,
        lng: location?.lng,
        photos,
      });
      history.replace(returnPath);
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHouse(Number(id));
      history.replace('/my-houses');
    } catch {
      setError('Ошибка при удалении.');
    }
  };

  if (!house) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-houses" text="" icon={chevronBackOutline} />
            </IonButtons>
            <IonTitle>Редактирование</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="add-house-content">
          <div className="add-house-form-wrapper">
            <IonText color="medium">Загрузка...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-houses" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Редактирование</IonTitle>
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setName(v); nameRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/ночь) <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3000"
                value={price}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setPrice(v); priceRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Количество комнат <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3"
                value={rooms}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setRooms(v); roomsRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Максимум гостей</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 6"
                value={guests}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setGuests(v); guestsRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Телефон для связи</IonLabel>
              <IonInput
                type="tel"
                inputmode="tel"
                placeholder="Например: +7 900 000 00 00"
                value={phone}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setPhone(v); phoneRef.current = v; }}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} />

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о доме..."
                rows={4}
                value={description}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="add-house-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-house-actions">
            <IonButton expand="block" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.goBack()}>
              Отмена
            </IonButton>
            <IonButton expand="block" fill="outline" color="danger" onClick={() => setShowDeleteAlert(true)}>
              Удалить объявление
            </IonButton>
          </div>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showDeleteAlert}
        header="Удалить объявление?"
        message="Это действие нельзя отменить."
        buttons={[
          { text: 'Отмена', role: 'cancel', handler: () => setShowDeleteAlert(false) },
          { text: 'Удалить', role: 'destructive', handler: handleDelete },
        ]}
        onDidDismiss={() => setShowDeleteAlert(false)}
      />
    </IonPage>
  );
};

export default EditHouse;
