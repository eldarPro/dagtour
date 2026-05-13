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
import { createCar } from '../lib/api';
import { useAuth } from '../lib/auth';
import { chevronBackOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker';
import PhotoUpload from '../components/PhotoUpload';
import { useUserPhone } from '../lib/useUserPhone';
import './AddCar.css';

const AddCar: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [transmission, setTransmission] = useState('');
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
    if (!brand.trim()) { setError('Укажите марку авто'); return; }
    if (!model.trim()) { setError('Укажите модель авто'); return; }
    if (!year || isNaN(Number(year))) { setError('Укажите корректный год'); return; }
    if (!price || isNaN(Number(price))) { setError('Укажите цену аренды'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await createCar({
        userId: user.id,
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        pricePerDay: Number(price),
        transmission: transmission || undefined,
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        address: location?.address,
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
            <IonBackButton defaultHref="/my-cars" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Новое объявление</IonTitle>
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
                onIonChange={(e) => setBrand(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Модель <span className="add-car-required">*</span></IonLabel>
              <IonInput
                placeholder="Например: Camry"
                value={model}
                onIonChange={(e) => setModel(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Год выпуска <span className="add-car-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 2020"
                value={year}
                onIonChange={(e) => setYear(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Цена аренды (₽/сутки) <span className="add-car-required">*</span></IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 3000"
                value={price}
                onIonChange={(e) => setPrice(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Коробка передач</IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={transmission}
                onIonChange={(e) => setTransmission(e.detail.value)}
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
                onIonChange={(e) => setPhone(e.detail.value ?? '')}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} />

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее об автомобиле..."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="add-car-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}

          <div className="add-car-actions">
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

export default AddCar;
