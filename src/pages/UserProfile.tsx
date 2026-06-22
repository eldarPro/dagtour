import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonText, IonSpinner,
  IonSegment, IonSegmentButton, IonLabel,
} from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { getUserProfile, UserProfile as IUserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';
import AvatarPhoto from '../components/AvatarPhoto';
import HouseCard from '../components/HouseCard';
import CarCard from '../components/CarCard';
import TourCard from '../components/TourCard';
import './UserProfile.css';

type Tab = 'houses' | 'cars' | 'tours';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab | null>(null);
  const isOwn = !!user && user.id === id;

  useEffect(() => {
    getUserProfile(id).then((p) => {
      setProfile(p);
      // Выбираем первый непустой таб
      if (p.houses.length > 0) setTab('houses');
      else if (p.cars.length > 0) setTab('cars');
      else if (p.tours.length > 0) setTab('tours');
      else setTab(null);
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Профиль</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div className="up-center"><IonSpinner name="crescent" /></div>
        ) : !profile ? (
          <div className="up-center"><IonText color="medium">Не найдено</IonText></div>
        ) : (
          <>
            <div className="up-header">
              <AvatarPhoto
                src={profile.user.avatarUrl}
                className="up-avatar"
                placeholder={
                  <div className="up-avatar-placeholder">
                    {profile.user.fullName ? profile.user.fullName[0].toUpperCase() : '?'}
                  </div>
                }
              />
              <IonText><h1 className="up-name">{profile.user.fullName ?? 'Пользователь'}</h1></IonText>
              {profile.user.bio && (
                <IonText color="medium"><p className="up-bio">{profile.user.bio}</p></IonText>
              )}
            </div>

            {tab === null ? (
              <div className="up-center" style={{ marginTop: 32 }}>
                <IonText color="medium"><p>Нет объявлений</p></IonText>
              </div>
            ) : (
              <>
                {[profile.houses, profile.cars, profile.tours].filter(a => a.length > 0).length > 1 && (
                  <IonSegment value={tab} onIonChange={e => setTab(e.detail.value as Tab)} className="up-segment">
                    {profile.houses.length > 0 && (
                      <IonSegmentButton value="houses">
                        <IonLabel>Дома ({profile.houses.length})</IonLabel>
                      </IonSegmentButton>
                    )}
                    {profile.cars.length > 0 && (
                      <IonSegmentButton value="cars">
                        <IonLabel>Авто ({profile.cars.length})</IonLabel>
                      </IonSegmentButton>
                    )}
                    {profile.tours.length > 0 && (
                      <IonSegmentButton value="tours">
                        <IonLabel>Туры ({profile.tours.length})</IonLabel>
                      </IonSegmentButton>
                    )}
                  </IonSegment>
                )}

                <div className="up-tab-content">
                  {tab === 'houses' && profile.houses.map(h =>
                    <HouseCard key={h.id} house={{ ...h, id: String(h.id), guests: h.guests ?? undefined }} isOwn={isOwn} href={`/houses/${h.id}`} />
                  )}
                  {tab === 'cars' && profile.cars.map(c =>
                    <CarCard key={c.id} car={{ ...c, id: String(c.id) }} isOwn={isOwn} href={`/cars/${c.id}`} />
                  )}
                  {tab === 'tours' && profile.tours.map(t =>
                    <TourCard key={t.id} tour={t} isOwn={isOwn} />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UserProfilePage;
