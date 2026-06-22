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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { getHouse, updateHouse, fetchHouseTypes, House } from '../lib/api';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import './AddHouse.css';


const AMENITIES_OPTIONS = [
  'Wi-Fi', 'Кухня', 'Стиральная машина', 'Кондиционер',
  'Отопление', 'Горячая вода', 'Парковка', 'Мангал/беседка',
];

const EditHouse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const routerLocation = useLocation();
  const returnPath = new URLSearchParams(routerLocation.search).get('from') ?? '/my-houses';
  const { contacts, contactRef, contactErrors, updateContact, loadContacts, validateContacts, phoneKey } = useContactFields();

  const [house, setHouse] = useState<House | null>(null);
  const [houseTypes, setHouseTypes] = useState<string[]>([]);
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

  const nameRef = useRef('');
  const priceRef = useRef('');
  const houseTypeRef = useRef('');
  const roomsRef = useRef('');
  const guestsRef = useRef('');
  const amenitiesRef = useRef<string[]>([]);
  const descriptionRef = useRef('');

  React.useEffect(() => {
    fetchHouseTypes().then(setHouseTypes);
  }, []);

  useIonViewWillEnter(() => {
    getHouse(Number(id)).then((found) => {
      if (!found) return;
      setHouse(found);
      setName(found.name); nameRef.current = found.name;
      setPrice(String(found.pricePerNight)); priceRef.current = String(found.pricePerNight);
      const ht = found.houseType ?? ''; setHouseType(ht); houseTypeRef.current = ht;
      setRooms(found.rooms != null ? String(found.rooms) : ''); roomsRef.current = found.rooms != null ? String(found.rooms) : '';
      setGuests(found.guests != null ? String(found.guests) : ''); guestsRef.current = found.guests != null ? String(found.guests) : '';
      const am = found.amenities ?? []; setAmenities(am); amenitiesRef.current = am;
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      loadContacts({
        phone: found.phone ?? '',
        whatsapp: found.whatsapp ?? '',
        telegram: found.telegram ?? '',
        vk: found.vk ?? '',
      }, found.phone || 'loaded');
      setLocationPicker(
        found.lat != null && found.lng != null
          ? { address: found.address ?? '', city: found.city ?? found.location, district: found.district, region: found.region, lat: found.lat, lng: found.lng }
          : null
      );
      setPhotos(found.photos ?? []);
    });
  });

  const toggleAmenity = (item: string) => {
    const next = amenitiesRef.current.includes(item)
      ? amenitiesRef.current.filter((i) => i !== item)
      : [...amenitiesRef.current, item];
    setAmenities(next);
    amenitiesRef.current = next;
  };

  const handleSave = async () => {
    const n = nameRef.current.trim();
    const p = priceRef.current;
    const r = roomsRef.current;

    if (!n) { setError('Укажите название'); return; }
    if (!houseTypeRef.current) { setError('Укажите тип жилья'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }
    if (!locationPicker) { setError('Укажите местоположение'); return; }
    if (!r || isNaN(Number(r))) { setError('Укажите количество комнат'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await updateHouse(Number(id), {
        name: n,
        pricePerNight: Number(p),
        houseType: houseTypeRef.current,
        rooms: Number(r),
        guests: Number(guestsRef.current),
        amenities: amenitiesRef.current,
        description: descriptionRef.current.trim(),
        phone: contactRef.current.phone.trim() || undefined,
        whatsapp: contactRef.current.whatsapp.trim() || undefined,
        telegram: contactRef.current.telegram.trim() || undefined,
        vk: contactRef.current.vk.trim() || undefined,
        address: locationPicker?.address,
        location: locationPicker?.city,
        city: locationPicker?.city,
        district: locationPicker?.district,
        region: locationPicker?.region,
        lat: locationPicker?.lat,
        lng: locationPicker?.lng,
        photos,
      });
      history.replace(returnPath);
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
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
              <IonLabel position="stacked">Тип жилья <span className="add-house-required">*</span></IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={houseType}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setHouseType(v); houseTypeRef.current = v; }}
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

            <LocationPicker value={locationPicker} onChange={setLocationPicker} required />
          </IonList>

          <IonList className="add-house-form">
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
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
            <IonButton expand="block" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Сохранить'}
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

export default EditHouse;
