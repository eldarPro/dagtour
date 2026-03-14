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
import { useHistory, useParams } from 'react-router-dom';
import { loadMyCars, updateMyCar, deleteMyCar, MyCar } from '../data/myCarsStorage';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import './AddCar.css';

const EditCar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [car, setCar] = useState<MyCar | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [transmission, setTransmission] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

  // refs для актуальных значений из IonInput
  const brandRef = useRef(brand);
  const modelRef = useRef(model);
  const yearRef = useRef(year);
  const priceRef = useRef(price);
  const transmissionRef = useRef(transmission);
  const descriptionRef = useRef(description);

  useIonViewWillEnter(() => {
    const found = loadMyCars().find((c) => c.id === id) ?? null;
    if (found) {
      setCar(found);
      setBrand(found.brand);
      setModel(found.model);
      setYear(String(found.year));
      setPrice(String(found.pricePerDay));
      setTransmission(found.transmission ?? '');
      setDescription(found.description ?? '');
      brandRef.current = found.brand;
      modelRef.current = found.model;
      yearRef.current = String(found.year);
      priceRef.current = String(found.pricePerDay);
      transmissionRef.current = found.transmission ?? '';
      descriptionRef.current = found.description ?? '';
      setLocation(
        found.lat != null && found.lng != null
          ? { address: found.address ?? '', lat: found.lat, lng: found.lng }
          : null
      );
    }
  });

  const handleSave = () => {
    const b = brandRef.current.trim();
    const m = modelRef.current.trim();
    const y = yearRef.current;
    const p = priceRef.current;
    const t = transmissionRef.current;
    const d = descriptionRef.current.trim();

    if (!b) { setError('Укажите марку авто'); return; }
    if (!m) { setError('Укажите модель авто'); return; }
    if (!y || isNaN(Number(y))) { setError('Укажите корректный год'); return; }
    if (!p || isNaN(Number(p))) { setError('Укажите цену аренды'); return; }

    const current = loadMyCars().find((c) => c.id === id);
    if (!current) { setError('Объявление не найдено'); return; }

    setError(null);
    updateMyCar({
      ...current,
      brand: b,
      model: m,
      year: Number(y),
      pricePerDay: Number(p),
      transmission: t,
      description: d,
      ...(location ? { address: location.address, lat: location.lat, lng: location.lng } : {}),
    });
    history.goBack();
  };

  const handleDelete = () => {
    deleteMyCar(id);
    history.replace('/my-cars');
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
            <IonBackButton defaultHref="/my-cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Редактирование</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="add-car-content">
        <div className="add-car-form-wrapper">
          <IonList className="add-car-form">
            <IonItem>
              <IonLabel position="stacked">Марка <span className="add-car-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Toyota"
                value={brand}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setBrand(v);
                  brandRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Модель <span className="add-car-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Camry"
                value={model}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setModel(v);
                  modelRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Год выпуска <span className="add-car-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 2020"
                value={year}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setYear(v);
                  yearRef.current = v;
                }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/сутки) <span className="add-car-required">*</span></IonLabel>
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
              <IonLabel position="stacked">Коробка передач</IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={transmission}
                onIonChange={(e) => {
                  const v = e.detail.value ?? '';
                  setTransmission(v);
                  transmissionRef.current = v;
                }}
              >
                <IonSelectOption value="auto">Автомат</IonSelectOption>
                <IonSelectOption value="manual">Механика</IonSelectOption>
                <IonSelectOption value="robot">Робот</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее об автомобиле..."
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
            <div className="add-car-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-car-actions">
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

export default EditCar;
