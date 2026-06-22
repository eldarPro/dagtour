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
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import { useUserPhone } from '../lib/useUserPhone';
import './AddCar.css';

const CAR_TYPES = ['Седан', 'Хэтчбек', 'Кроссовер', 'Внедорожник', 'Минивэн'];
const CONDITIONS_OPTIONS = ['Без водителя', 'С водителем', 'Разрешён выезд в горы', 'Доставка в аэропорт'];

const AddCar: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const userPhone = useUserPhone();
  const { contacts, contactErrors, updateContact, validateContacts, phoneKey, setPhoneKey } = useContactFields();

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
  const [location, setLocation] = useState<import('../components/LocationPicker').LocationValue | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (userPhone && !phoneKey) {
      updateContact('phone', userPhone);
      setPhoneKey(userPhone);
    }
  }, [userPhone]);

  const toggleCondition = (item: string) => {
    setConditions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!brand.trim()) { setError('Укажите марку авто'); return; }
    if (!model.trim()) { setError('Укажите модель авто'); return; }
    if (!carType) { setError('Укажите тип кузова'); return; }
    if (!year || isNaN(Number(year))) { setError('Укажите корректный год'); return; }
    if (!price || isNaN(Number(price))) { setError('Укажите цену аренды'); return; }
    if (!location) { setError('Укажите местоположение автомобиля'); return; }
    if (!user) { setError('Необходимо войти в аккаунт'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await createCar({
        userId: user.id,
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        pricePerDay: Number(price),
        type: carType,
        seats: seats ? Number(seats) : undefined,
        transmission: transmission || undefined,
        conditions,
        deposit: deposit ? Number(deposit) : undefined,
        description: description.trim() || undefined,
        phone: contacts.phone.trim() || undefined,
        whatsapp: contacts.whatsapp.trim() || undefined,
        telegram: contacts.telegram.trim() || undefined,
        vk: contacts.vk.trim() || undefined,
        address: location?.address,
        location: location?.city,
        city: location?.city,
        district: location?.district,
        region: location?.region,
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
              <IonLabel position="stacked">Тип кузова <span className="add-car-required">*</span></IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={carType}
                onIonChange={(e) => setCarType(e.detail.value ?? '')}
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
              <IonLabel position="stacked">Количество мест</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                placeholder="Например: 5"
                value={seats}
                onIonChange={(e) => setSeats(e.detail.value ?? '')}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Коробка передач</IonLabel>
              <IonSelect
                placeholder="Выберите тип"
                value={transmission}
                onIonChange={(e) => setTransmission(e.detail.value)}
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
                onIonChange={(e) => setDeposit(e.detail.value ?? '')}
              />
            </IonItem>

            <LocationPicker value={location} onChange={setLocation} required />
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
                onIonChange={(e) => setDescription(e.detail.value ?? '')}
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
