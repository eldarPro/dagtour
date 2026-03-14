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
import { useHistory, useParams } from 'react-router-dom';
import { loadMyHouses, updateMyHouse, deleteMyHouse, MyHouse } from '../data/myHousesStorage';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import './AddHouse.css';

const EditHouse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [house, setHouse] = useState<MyHouse | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [guests, setGuests] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

  // refs для актуальных значений из IonInput
  const nameRef = useRef(name);
  const priceRef = useRef(price);
  const roomsRef = useRef(rooms);
  const guestsRef = useRef(guests);
  const descriptionRef = useRef(description);

  useIonViewWillEnter(() => {
    const found = loadMyHouses().find((h) => h.id === id) ?? null;
    if (found) {
      setHouse(found);
      setName(found.name);
      setPrice(String(found.pricePerNight));
      setRooms(String(found.rooms));
      setGuests(String(found.guests));
      setDescription(found.description ?? '');
      nameRef.current = found.name;
      priceRef.current = String(found.pricePerNight);
      roomsRef.current = String(found.rooms);
      guestsRef.current = String(found.guests);
      descriptionRef.current = found.description ?? '';
      setLocation(
        found.lat != null && found.lng != null
          ? { address: found.address ?? '', lat: found.lat, lng: found.lng }
          : null
      );
    }
  });

  const handleSave = () => {
    const n = nameRef.current.trim();
    const p = priceRef.current;
    const r = roomsRef.current;
    const g = guestsRef.current;
    const d = descriptionRef.current.trim();

    if (!n) { setError('Укажите название'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }
    if (!r || isNaN(Number(r))) { setError('Укажите количество комнат'); return; }
    if (!g || isNaN(Number(g))) { setError('Укажите количество гостей'); return; }

    const current = loadMyHouses().find((h) => h.id === id);
    if (!current) { setError('Объявление не найдено'); return; }

    setError(null);
    updateMyHouse({
      ...current,
      name: n,
      pricePerNight: Number(p),
      rooms: Number(r),
      guests: Number(g),
      description: d,
      ...(location ? { address: location.address, lat: location.lat, lng: location.lng } : {}),
    });
    history.goBack();
  };

  const handleDelete = () => {
    deleteMyHouse(id);
    history.replace('/my-houses');
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
            <IonText color="danger">Объявление не найдено</IonText>
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
          <IonList className="add-house-form">
            <IonItem>
              <IonLabel position="stacked">Название <span className="add-house-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Горный дом в Гунибе"
                value={name}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setName(v);
                  nameRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/ночь) <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3000"
                value={price}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setPrice(v);
                  priceRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Количество комнат <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3"
                value={rooms}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setRooms(v);
                  roomsRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Максимум гостей <span className="add-house-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 6"
                value={guests}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setGuests(v);
                  guestsRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о доме..."
                rows={4}
                value={description}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setDescription(v);
                  descriptionRef.current = v;
                }}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} />
          </IonList>

          {error && (
            <div className="add-house-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-house-actions">
            <IonButton expand="block" onClick={handleSave}>
              Сохранить
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
