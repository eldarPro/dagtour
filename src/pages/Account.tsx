import React, { useState } from 'react';
import { formatPhone } from '../lib/formatPhone';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { settingsOutline, personOutline, callOutline, carSportOutline, homeOutline, compassOutline, bookmarkOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth';
import { useHistory } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import AvatarPhoto from '../components/AvatarPhoto';
import './Account.css';

const toDialPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '8' + digits.slice(1);
  }
  return raw;
};

type AuthStep = 'phone' | 'code';

const Account: React.FC = () => {
  const { user, signOut, refreshUser, sendPhoneCode, verifyPhoneCode } = useAuth();

  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [phoneToCall, setPhoneToCall] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const history = useHistory();

  React.useEffect(() => {
    if (authStep !== 'code') return;
    let active = true;
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    verifyPhoneCode(cleanPhone, '').then(result => {
      if (!active) return;
      if (result.error) {
        setError(result.error);
      } else {
        resetPhoneForm();
      }
    });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStep]);

  const resetPhoneForm = () => {
    setPhone('');
    setPhoneToCall('');
    setError(null);
    setAuthStep('phone');
  };

  const handleLogout = async () => {
    await signOut();
    resetPhoneForm();
  };

  const handleSendCode = async () => {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setError('Введите корректный номер телефона');
      return;
    }
    setSubmitting(true);
    try {
      const result = await sendPhoneCode(cleanPhone);
      if (result.error) {
        setError(result.error);
      } else {
        setPhoneToCall(result.phoneToCall || '');
        setAuthStep('code');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToPhone = () => {
    setAuthStep('phone');
    setError(null);
  };

  const renderAuthForm = () => {
    if (authStep === 'code') {
      return (
        <div className="account-auth">
          <div className="account-auth-card account-auth-card--center">
            <div className="account-icon-circle account-icon-circle--call">
              <IonIcon icon={callOutline} />
            </div>
            <h2 className="account-call-title">Позвоните для подтверждения</h2>
            <IonText color="medium">
              <p className="account-call-subtitle">Звонок бесплатный — сбрасывается сразу</p>
            </IonText>
            <a href={`tel:${toDialPhone(phoneToCall)}`} className="account-call-btn">
              <IonIcon icon={callOutline} />
              <span>{formatPhone(phoneToCall)}</span>
            </a>
            <div className="account-waiting-row">
              <IonSpinner name="dots" />
              <IonText color="medium"><span>Ожидаем звонка…</span></IonText>
            </div>
            {error && <p className="account-error-text">{error}</p>}
            <IonButton expand="block" fill="clear" onClick={handleBackToPhone}>
              Изменить номер
            </IonButton>
          </div>
        </div>
      );
    }

    return (
      <div className="account-auth">
        <div className="account-auth-header">
          <IonIcon icon={personOutline} className="account-auth-icon" />
          <h2>Вход / Регистрация</h2>
          <p>Введите номер телефона</p>
        </div>
        <IonList className="account-form">
          <div className="account-phone-input">
            <PhoneInput value={phone} onChange={setPhone} disabled={submitting} />
          </div>
          <div className="account-actions">
            <IonButton expand="block" onClick={handleSendCode} disabled={submitting}>
              {submitting ? <IonSpinner name="crescent" /> : 'Продолжить'}
            </IonButton>
          </div>
          {error && (
            <div className="account-error">
              <IonText color="danger">{error}</IonText>
            </div>
          )}
        </IonList>
      </div>
    );
  };

  const renderProfile = () => {
    const displayName = user?.full_name || 'Пользователь';
    const displayPhone = user?.phone || '';
    const bio = user?.bio ?? '';
    const bioTruncated = bio.length > 250 ? bio.slice(0, 250) + '…' : bio;

    return (
      <div className="account-profile">
        <div className="account-profile-header">
          <AvatarPhoto
            src={user?.avatar_url ?? undefined}
            className="account-avatar"
            placeholder={<span>{displayName[0].toUpperCase()}</span>}
          />
          <div className="account-profile-info">
            <h2>{displayName}</h2>
            {displayPhone && <p className="account-phone">{formatPhone(displayPhone)}</p>}
          </div>
          <button type="button" className="account-edit-btn" onClick={() => history.push('/edit-profile')}>
            <IonIcon icon={settingsOutline} />
          </button>
        </div>

        {bioTruncated && (
          <p className="account-bio">{bioTruncated}</p>
        )}

        <IonList className="account-menu">
          <IonItem button detail={true} routerLink="/my-houses" lines="full">
            <IonIcon icon={homeOutline} slot="start" className="account-menu-icon" />
            <IonLabel>Мои дома</IonLabel>
          </IonItem>
          <IonItem button detail={true} routerLink="/my-cars" lines="full">
            <IonIcon icon={carSportOutline} slot="start" className="account-menu-icon" />
            <IonLabel>Мои авто</IonLabel>
          </IonItem>
          <IonItem button detail={true} routerLink="/my-tours" lines="full">
            <IonIcon icon={compassOutline} slot="start" className="account-menu-icon" />
            <IonLabel>Мои туры</IonLabel>
          </IonItem>
          <IonItem button detail={true} routerLink="/favorites" lines="none">
            <IonIcon icon={bookmarkOutline} slot="start" className="account-menu-icon" />
            <IonLabel>Избранное</IonLabel>
          </IonItem>
        </IonList>

        <div className="account-logout-item">
          <IonButton expand="block" fill="outline" color="danger" onClick={handleLogout}>
            Выйти из аккаунта
          </IonButton>
        </div>
      </div>
    );
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refreshUser();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Личный кабинет</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="account-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        {user ? renderProfile() : renderAuthForm()}
      </IonContent>
    </IonPage>
  );
};

export default Account;
