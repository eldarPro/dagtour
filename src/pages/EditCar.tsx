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
import { getCar, updateCar, Car } from '../lib/api';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import './AddCar.css';

const CAR_TYPES = ['Седан', 'Хэтчбек', 'Кроссовер', 'Внедорожник', 'Минивэн'];
const CONDITIONS_OPTIONS = ['Без водителя', 'С водителем', 'Разрешён выезд в горы', 'Доставка в аэропорт'];

const EditCar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const routerLocation = useLocation();
  const returnPath = new URLSearchParams(routerLocation.search).get('from') ?? '/my-cars';
  const { contacts, contactRef, contactErrors, updateContact, loadContacts, validateContacts, phoneKey } = useContactFields();

  const [car, setCar] = useState<Car | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [carType, setCarType] = useState('');
  const [seats, setSeats] = useState('');
  const [transmission, setTransmission] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickerLocation, setPickerLocation] = useState<import('../components/LocationPicker').LocationValue | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const brandRef = useRef('');
  const modelRef = useRef('');
  const yearRef = useRef('');
  const priceRef = useRef('');
  const carTypeRef = useRef('');
  const seatsRef = useRef('');
  const transmissionRef = useRef('');
  const conditionsRef = useRef<string[]>([]);
  const depositRef = useRef('');
  const descriptionRef = useRef('');

  useIonViewWillEnter(() => {
    getCar(Number(id)).then((found) => {
      if (!found) return;
      setCar(found);
      setBrand(found.brand); brandRef.current = found.brand;
      setModel(found.model); modelRef.current = found.model;
      setYear(found.year ? String(found.year) : ''); yearRef.current = found.year ? String(found.year) : '';
      setPrice(String(found.pricePerDay)); priceRef.current = String(found.pricePerDay);
      const ct = found.type ?? ''; setCarType(ct); carTypeRef.current = ct;
      const s = found.seats ? String(found.seats) : ''; setSeats(s); seatsRef.current = s;
      setTransmission(found.transmission ?? ''); transmissionRef.current = found.transmission ?? '';
      const cond = found.conditions ?? []; setConditions(cond); conditionsRef.current = cond;
      const dep = found.deposit ? String(found.deposit) : ''; setDeposit(dep); depositRef.current = dep;
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      loadContacts({
        phone: found.phone ?? '',
        whatsapp: found.whatsapp ?? '',
        telegram: found.telegram ?? '',
        vk: found.vk ?? '',
      }, found.phone || 'loaded');
      setPickerLocation(
        found.lat != null && found.lng != null
          ? { address: found.address ?? '', city: found.city ?? found.location, district: found.district, region: found.region, lat: found.lat, lng: found.lng }
          : null
      );
      setPhotos(found.photos ?? []);
    });
  });

  const toggleCondition = (item: string) => {
    const next = conditionsRef.current.includes(item)
      ? conditionsRef.current.filter((i) => i !== item)
      : [...conditionsRef.current, item];
    setConditions(next);
    conditionsRef.current = next;
  };

  const handleSave = async () => {
    const b = brandRef.current.trim();
    const m = modelRef.current.trim();
    const y = yearRef.current;
    const p = priceRef.current;

    if (!b) { setError('Укажите марку авто'); return; }
    if (!m) { setError('Укажите модель авто'); return; }
    if (!carTypeRef.current) { setError('Укажите тип кузова'); return; }
    if (!y || isNaN(Number(y))) { setError('Укажите корректный год'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }
    if (!pickerLocation) { setError('Укажите местоположение автомобиля'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await updateCar(Number(id), {
        brand: b,
        model: m,
        year: Number(y),
        pricePerDay: Number(p),
        type: carTypeRef.current || undefined,
        seats: seatsRef.current ? Number(seatsRef.current) : undefined,
        transmission: transmissionRef.current || undefined,
        conditions: conditionsRef.current,
        deposit: depositRef.current ? Number(depositRef.current) : undefined,
        description: descriptionRef.current.trim() || undefined,
        phone: contactRef.current.phone.trim() || undefined,
        whatsapp: contactRef.current.whatsapp.trim() || undefined,
        telegram: contactRef.current.telegram.trim() || undefined,
        vk: contactRef.current.vk.trim() || undefined,
        address: pickerLocation?.address,
        location: pickerLocation?.city,
        city: pickerLocation?.city,
        district: pickerLocation?.district,
        region: pickerLocation?.region,
        lat: pickerLocation?.lat,
        lng: pickerLocation?.lng,
        photos,
      });
      history.replace(returnPath);
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!car) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-cars" text="" icon={chevronBackOutline} />
            </IonButtons>
            <IonTitle>Редактирование</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="add-car-content">
          <div className="add-car-form-wrapper">
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
            <IonBackButton defaultHref="/my-cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Редактирование</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="add-car-content">
        <div className="add-car-form-wrapper">
          <PhotoUpload photos={photos} onChange={setPhotos} folder="cars" />
          <IonList className="add-car-form">
            <IonItem>
              <IonLabel position="stacked">Марка <span className="add-car-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Toyota"
                value={brand}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setBrand(v); brandRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Модель <span className="add-car-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Camry"
                value={model}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setModel(v); modelRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Тип кузова <span className="add-car-required">*</span></IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={carType}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setCarType(v); carTypeRef.current = v; }}
                interface="action-sheet"
                cancelText="Отмена"
              >
                {CAR_TYPES.map((t) => (
                  <IonSelectOption key={t} value={t}>{t}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Год выпуска <span className="add-car-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 2020"
                value={year}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setYear(v); yearRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/сутки) <span className="add-car-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3000"
                value={price}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setPrice(v); priceRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Количество мест</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 5"
                value={seats}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setSeats(v); seatsRef.current = v; }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Коробка передач</IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={transmission}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setTransmission(v); transmissionRef.current = v; }}
                interface="action-sheet"
                cancelText="Отмена"
              >
                <IonSelectOption value="автомат">Автомат</IonSelectOption>
                <IonSelectOption value="механика">Механика</IonSelectOption>
                <IonSelectOption value="робот">Робот</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Залог (₽)</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 5000"
                value={deposit}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDeposit(v); depositRef.current = v; }}
              />
            </IonItem>

            <LocationPicker value={pickerLocation} onChange={setPickerLocation} required />
          </IonList>

          <IonList className="add-car-form" style={{ marginTop: 16 }}>
            <IonItem lines="none">
              <IonLabel position="stacked">Условия аренды</IonLabel>
            </IonItem>
            {CONDITIONS_OPTIONS.map((item) => (
              <CheckboxRow key={item} label={item} checked={conditions.includes(item)} onChange={() => toggleCondition(item)} />
            ))}
          </IonList>

          <IonList className="add-car-form" style={{ marginTop: 16 }}>
            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Ваше описание об автомобиле..."
                rows={4}
                value={description}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
              />
            </IonItem>
          </IonList>

          <ContactSection contacts={contacts} onChange={updateContact} phoneKey={phoneKey} errors={contactErrors} />

          {error && (
            <div className="add-car-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-car-actions">
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

export default EditCar;
