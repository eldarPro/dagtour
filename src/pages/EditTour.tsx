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
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { getTour, updateTour } from '../lib/api';
import { cities } from '../data/dagestanLocations';
import { chevronBackOutline } from 'ionicons/icons';
import PhotoUpload from '../components/PhotoUpload';
import RouteTagInput from '../components/RouteTagInput';
import ContactSection from '../components/ContactSection';
import CheckboxRow from '../components/CheckboxRow';
import { useContactFields } from '../lib/useContactFields';
import './AddTour.css';

const INCLUDED_OPTIONS = ['Транспорт', 'Питание', 'Проживание', 'Гид', 'Входные билеты'];

const EditTour: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { contacts, contactRef, contactErrors, updateContact, loadContacts, validateContacts, phoneKey } = useContactFields();

  const [name, setName] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [maxPeople, setMaxPeople] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef('');
  const meetingPointRef = useRef('');
  const durationRef = useRef('');
  const priceRef = useRef('');
  const routeRef = useRef<string[]>([]);
  const includedRef = useRef<string[]>([]);
  const maxPeopleRef = useRef('');
  const descriptionRef = useRef('');

  useIonViewWillEnter(() => {
    getTour(Number(id)).then((found) => {
      if (!found) return;
      setName(found.name); nameRef.current = found.name;
      const mp = found.meetingPoint ?? ''; setMeetingPoint(mp); meetingPointRef.current = mp;
      setDuration(String(found.duration)); durationRef.current = String(found.duration);
      const p = String(found.price || ''); setPrice(p); priceRef.current = p;
      setRoute(found.route); routeRef.current = found.route;
      const inc = found.included ?? []; setIncluded(inc); includedRef.current = inc;
      const maxP = found.maxPeople ? String(found.maxPeople) : ''; setMaxPeople(maxP); maxPeopleRef.current = maxP;
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      loadContacts({
        phone: found.phone ?? '',
        whatsapp: found.whatsapp ?? '',
        telegram: found.telegram ?? '',
        vk: found.vk ?? '',
      }, found.phone || 'loaded');
      setPhotos(found.photos ?? []);
      setLoaded(true);
    });
  });

  const toggleIncluded = (item: string) => {
    const next = includedRef.current.includes(item)
      ? includedRef.current.filter((i) => i !== item)
      : [...includedRef.current, item];
    setIncluded(next);
    includedRef.current = next;
  };

  const handleSave = async () => {
    const n = nameRef.current.trim();
    const d = durationRef.current.trim();
    const r = routeRef.current;

    if (!n) { setError('Укажите название тура'); return; }
    if (!d) { setError('Укажите длительность'); return; }
    if (!priceRef.current || isNaN(Number(priceRef.current)) || Number(priceRef.current) <= 0) {
      setError('Укажите цену'); return;
    }
    if (!meetingPointRef.current.trim()) { setError('Укажите город выезда'); return; }
    if (r.length === 0) { setError('Укажите маршрут'); return; }
    if (!validateContacts()) return;

    setError(null);
    setSubmitting(true);
    try {
      await updateTour(Number(id), {
        name: n,
        meetingPoint: meetingPointRef.current.trim(),
        duration: Number(d),
        price: parseFloat(priceRef.current),
        route: r,
        included: includedRef.current,
        maxPeople: maxPeopleRef.current ? Number(maxPeopleRef.current) : undefined,
        description: descriptionRef.current.trim(),
        phone: contactRef.current.phone.trim() || undefined,
        whatsapp: contactRef.current.whatsapp.trim() || undefined,
        telegram: contactRef.current.telegram.trim() || undefined,
        vk: contactRef.current.vk.trim() || undefined,
        photos,
      });
      history.replace('/my-tours');
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-tours" text="" icon={chevronBackOutline} />
            </IonButtons>
            <IonTitle>Редактирование</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="add-tour-content">
          <div className="add-tour-form-wrapper">
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
            <IonBackButton defaultHref="/my-tours" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Редактирование</IonTitle>
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setName(v); nameRef.current = v; }}
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDuration(v); durationRef.current = v; }}
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setPrice(v); priceRef.current = v; }}
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setMaxPeople(v); maxPeopleRef.current = v; }}
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
                    onClick={() => { setMeetingPoint(city.name); meetingPointRef.current = city.name; }}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <RouteTagInput
              value={route}
              onChange={(r) => { setRoute(r); routeRef.current = r; }}
              required
            />
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
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
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

export default EditTour;
