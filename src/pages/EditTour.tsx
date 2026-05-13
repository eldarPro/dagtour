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
import { getTour, updateTour, deleteTour } from '../lib/api';
import { chevronBackOutline } from 'ionicons/icons';
import PhotoUpload from '../components/PhotoUpload';
import RouteTagInput from '../components/RouteTagInput';
import { useUserPhone } from '../lib/useUserPhone';
import './AddTour.css';

const EditTour: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const userPhone = useUserPhone();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const nameRef = useRef('');
  const durationRef = useRef('');
  const priceRef = useRef('');
  const routeRef = useRef<string[]>([]);
  const descriptionRef = useRef('');
  const phoneRef = useRef('');

  useIonViewWillEnter(() => {
    getTour(Number(id)).then((found) => {
      if (!found) return;
      setName(found.name); nameRef.current = found.name;
      setDuration(found.duration); durationRef.current = found.duration;
      const p = String(found.price || ''); setPrice(p); priceRef.current = p;
      setRoute(found.route); routeRef.current = found.route;
      setDescription(found.description ?? ''); descriptionRef.current = found.description ?? '';
      setPhone(found.phone ?? userPhone); phoneRef.current = found.phone ?? userPhone;
      setPhotos(found.photos ?? []);
      setLoaded(true);
    });
  });

  const handleSave = async () => {
    const n = nameRef.current.trim();
    const d = durationRef.current.trim();
    const desc = descriptionRef.current.trim();
    const ph = phoneRef.current.trim();
    const route = routeRef.current;

    if (!n) { setError('Укажите название тура'); return; }
    if (!d) { setError('Укажите длительность'); return; }
    if (route.length === 0) { setError('Укажите маршрут'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await updateTour(Number(id), {
        name: n,
        duration: d,
        price: parseFloat(priceRef.current) || 0,
        route,
        description: desc,
        phone: ph || undefined,
        photos,
      });
      history.replace('/my-tours');
    } catch {
      setError('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTour(Number(id));
      history.replace('/my-tours');
    } catch {
      setError('Ошибка при удалении.');
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
              <IonLabel position="stacked">Цена (₽ / чел.)</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="Например: 5000"
                value={price}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setPrice(v); priceRef.current = v; }}
              />
            </IonItem>

            <RouteTagInput
              value={route}
              onChange={(r) => { setRoute(r); routeRef.current = r; }}
              required
            />

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

            <IonItem>
              <IonLabel position="stacked">Описание</IonLabel>
              <IonTextarea
                placeholder="Расскажите подробнее о туре..."
                rows={4}
                value={description}
                onIonChange={(e) => { const v = e.detail.value ?? ''; setDescription(v); descriptionRef.current = v; }}
              />
            </IonItem>
          </IonList>

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
            <IonButton expand="block" fill="outline" color="danger" onClick={() => setShowDeleteAlert(true)}>
              Удалить тур
            </IonButton>
          </div>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showDeleteAlert}
        header="Удалить тур?"
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

export default EditTour;
