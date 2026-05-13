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
  IonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { getCar, updateCar, deleteCar, Car } from '../lib/api';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import './AddCar.css';

const EditCar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const routerLocation = useLocation();
  const returnPath = new URLSearchParams(routerLocation.search).get('from') ?? '/my-cars';

  const [car, setCar] = useState<Car | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [transmission, setTransmission] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pickerLocation, setPickerLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const brandRef = useRef('');
  const modelRef = useRef('');
  const yearRef = useRef('');
  const priceRef = useRef('');
  const transmissionRef = useRef('');
  const descriptionRef = useRef('');
  const phoneRef = useRef('');

  useIonViewWillEnter(() => {
    getCar(Number(id)).then((found) => {
      if (!found) return;
      setCar(found);
      setBrand(found.brand); brandRef.current = found.brand;
      setModel(found.model); modelRef.current = found.model;
      setYear(found.year ? String(found.year) : ''); yearRef.current = found.year ? String(found.year) : '';
      setPrice(String(found.pricePerDay)); priceRef.current = String(found.pricePerDay);
      setTransmission(found.transmission ?? ''); transmissionRef.current = found.transmission ?? '';
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      setPhone(found.phone ?? ''); phoneRef.current = found.phone ?? '';
      setPickerLocation(
        found.lat != null && found.lng != null
          ? { address: found.address ?? '', lat: found.lat, lng: found.lng }
          : null
      );
      setPhotos(found.photos ?? []);
    });
  });

  const handleSave = async () => {
    const b = brandRef.current.trim();
    const m = modelRef.current.trim();
    const y = yearRef.current;
    const p = priceRef.current;

    if (!b) { setError('Укажите марку авто'); return; }
    if (!m) { setError('Укажите модель авто'); return; }
    if (!y || isNaN(Number(y))) { setError('Укажите корректный год'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await updateCar(Number(id), {
        brand: b,
        model: m,
        year: Number(y),
        pricePerDay: Number(p),
        transmission: transmissionRef.current || undefined,
        description: descriptionRef.current.trim() || undefined,
        phone: phoneRef.current.trim() || undefined,
        address: pickerLocation?.address,
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

  const handleDelete = async () => {
    try {
      await deleteCar(Number(id));
      history.replace('/my-cars');
    } catch {
      setError('Ошибка при удалении.');
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
              <IonLabel position="stacked">Коробка передач</IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={transmission}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setTransmission(v); transmissionRef.current = v; }}
              >
                <IonSelectOption value="auto">Автомат</IonSelectOption>
                <IonSelectOption value="manual">Механика</IonSelectOption>
                <IonSelectOption value="robot">Робот</IonSelectOption>
              </IonSelect>
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

            <LocationPicker value={pickerLocation} onChange={setPickerLocation} />

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее об автомобиле..."
                rows={4}
                value={description}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
              />
            </IonItem>
          </IonList>

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

export default EditCar;
