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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createHouse, fetchHouseTypes } from '../lib/api';
import { useAuth } from '../lib/auth';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import { useUserPhone } from '../lib/useUserPhone';
import './AddHouse.css';

const AMENITIES_OPTIONS = [
  'Wi-Fi', 'Кухня', 'Стиральная машина', 'Кондиционер',
  'Отопление', 'Горячая вода', 'Парковка', 'Мангал/беседка',
];

const AddHouse: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();
  const { contacts, contactErrors, updateContact, validateContacts, phoneKey, setPhoneKey } = useContactFields();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [houseType, setHouseType] = useState('');
  const [rooms, setRooms] = useState('');
  const [guests, setGuests] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationPicker, setLocationPicker] = useState<import('../components/LocationPicker').LocationValue | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [houseTypes, setHouseTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchHouseTypes().then(setHouseTypes);
  }, []);

  useEffect(() => {
    if (userPhone && !phoneKey) {
      updateContact('phone', userPhone);
      setPhoneKey(userPhone);
    }
  }, [userPhone]);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Укажите название'); return; }
    if (!houseType) { setError('Укажите тип жилья'); return; }
    if (!price || isNaN(Number(price))) { setError('Укажите цену аренды'); return; }
    if (!locationPicker) { setError('Укажите местоположение'); return; }
    if (!rooms || isNaN(Number(rooms))) { setError('Укажите количество комнат'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await createHouse({
        userId: user.id,
        name: name.trim(),
        pricePerNight: Number(price),
        houseType,
        rooms: Number(rooms),
        guests: Number(guests),
        amenities,
        description: description.trim(),
        phone: contacts.phone.trim() || undefined,
        whatsapp: contacts.whatsapp.trim() || undefined,
        telegram: contacts.telegram.trim() || undefined,
        vk: contacts.vk.trim() || undefined,
        address: locationPicker?.address,
        location: locationPicker?.city,
        city: locationPicker?.city,
        district: locationPicker?.district,
        region: locationPicker?.region,
        lat: locationPicker?.lat,
        lng: locationPicker?.lng,
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
              <IonLabel position="stacked">Тип жилья <span className="add-house-required">*</span></IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={houseType}
                onIonChange={(e) => setHouseType(e.detail.value ?? '')}
                interface="action-sheet"
                cancelText="Отмена"
              >
                {houseTypes.map((t) => (
                  <IonSelectOption key={t} value={t}>{t}</IonSelectOption>
                ))}
              </IonSelect>
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

            <LocationPicker value={locationPicker} onChange={setLocationPicker} required />
          </IonList>

          <IonList className="add-house-form" style={{ marginTop: 16 }}>
            <IonItem lines="none">
              <IonLabel position="stacked">Удобства</IonLabel>
            </IonItem>
            {AMENITIES_OPTIONS.map((item) => (
              <CheckboxRow key={item} label={item} checked={amenities.includes(item)} onChange={() => toggleAmenity(item)} />
            ))}
          </IonList>

          <IonList className="add-house-form" style={{ marginTop: 16 }}>
            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Ваше описание о доме..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          <ContactSection contacts={contacts} onChange={updateContact} phoneKey={phoneKey} errors={contactErrors} />

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
