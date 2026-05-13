import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonLabel,
} from '@ionic/react';
import { settingsOutline, personOutline, callOutline, checkmarkCircleOutline, carSportOutline, homeOutline, compassOutline, bookmarkOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import PhoneInput from '../components/PhoneInput';
import './Account.css';

type AuthStep = 'phone' | 'code';

interface Profile {
  full_name: string | null;
  phone: string | null;
}

const ZVONOK_PHONE = import.meta.env.VITE_ZVONOK_PHONE || '+7 800 555-86-07';

const Account: React.FC = () => {
  const { user, signOut, sendPhoneCode, verifyPhoneCode } = useAuth();

  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pollKey, setPollKey] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Автополлинг — ждём пока пользователь позвонит на ZVONOK_PHONE
  React.useEffect(() => {
    if (authStep !== 'code') return;
    let active = true;
    setSubmitting(true);
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    verifyPhoneCode(cleanPhone, '').then(result => {
      if (!active) return;
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
      } else {
        resetPhoneForm();
      }
    });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStep, pollKey]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
      if (!error && data) setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetPhoneForm = () => {
    setPhone('');
    setError(null);
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setAuthStep('phone');
    setPollKey(0);
  };

  const handleLogout = async () => {
    await signOut();
    resetPhoneForm();
    setEditingProfile(false);
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
        setAuthStep('code');
        startCountdown();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const result = await sendPhoneCode(cleanPhone);
    if (!result.error) {
      setError(null);
      startCountdown();
      setPollKey(k => k + 1);
    } else {
      setError(result.error);
    }
  };

  const handleBackToPhone = () => {
    setAuthStep('phone');
    setError(null);
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startEditProfile = () => {
    if (!profile) return;
    setEditName(profile.full_name || '');
    setEditPhone(profile.phone || '');
    setError(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const nextName = editName.trim();
    const cleanPhone = editPhone.replace(/\D/g, '');
    if (!nextName) {
      setError('Введите имя');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: nextName, phone: cleanPhone || null, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) {
        setError('Ошибка при сохранении');
      } else {
        setProfile(prev => prev ? { ...prev, full_name: nextName, phone: cleanPhone || null } : null);
        setEditingProfile(false);
        setError(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setError(null);
  };

  const renderAuthForm = () => (
    <div className="account-auth">
      <div className="account-auth-header">
        <IonIcon icon={personOutline} className="account-auth-icon" />
        <h2>Вход / Регистрация</h2>
        <p>{authStep === 'phone' ? 'Введите номер телефона' : 'Позвоните на номер для подтверждения'}</p>
      </div>

      <IonList className="account-form">
        {authStep === 'phone' ? (
          <>
            <div className="account-phone-input">
              <PhoneInput value={phone} onChange={setPhone} disabled={submitting} />
            </div>
            <div className="account-actions">
              <IonButton expand="block" onClick={handleSendCode} disabled={submitting}>
                {submitting ? <IonSpinner name="crescent" /> : 'Продолжить'}
              </IonButton>
            </div>
          </>
        ) : (
          <>
            <div className="account-code-sent">
              <IonIcon icon={checkmarkCircleOutline} color="success" />
              <IonText color="success">Номер зарегистрирован</IonText>
            </div>

            <div className="account-call-instruction">
              <IonIcon icon={callOutline} color="primary" />
              <div>
                <p>Позвоните бесплатно с номера <strong>{phone}</strong> на:</p>
                <p className="account-zvonok-number">{ZVONOK_PHONE}</p>
              </div>
            </div>

            {submitting && (
              <div className="account-waiting">
                <IonSpinner name="crescent" />
                <IonText color="medium">Ожидаем звонок...</IonText>
              </div>
            )}

            <div className="account-actions">
              <IonButton expand="block" fill="outline" onClick={handleBackToPhone} disabled={submitting}>
                Изменить номер
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={handleResendCode} disabled={countdown > 0 || submitting}>
                {countdown > 0 ? `Запросить снова через ${countdown} сек` : 'Запросить снова'}
              </IonButton>
            </div>
          </>
        )}

        {error && (
          <div className="account-error">
            <IonText color="danger">{error}</IonText>
          </div>
        )}
      </IonList>
    </div>
  );

  const renderProfile = () => {
    const displayName = profile?.full_name || 'Пользователь';
    const displayPhone = profile?.phone || user?.phone || '';

    return (
      <div className="account-profile">
        <div className="account-profile-header">
          <div className="account-avatar">
            {displayName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="account-profile-info">
            <h2>{displayName}</h2>
            {displayPhone && <p className="account-phone">{displayPhone}</p>}
          </div>
          <button type="button" className="account-edit-btn" onClick={startEditProfile}>
            <IonIcon icon={settingsOutline} />
          </button>
        </div>

        {editingProfile && (
          <IonList className="account-edit-form">
            <IonItem>
              <IonIcon icon={personOutline} slot="start" color="medium" />
              <IonInput value={editName} placeholder="Ваше имя" onIonInput={(e) => setEditName(e.detail.value ?? '')} />
            </IonItem>

            <div className="account-actions account-actions--profile">
              <IonButton expand="block" onClick={handleSaveProfile} disabled={submitting}>
                {submitting ? <IonSpinner name="crescent" /> : 'Сохранить'}
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={cancelEditProfile}>
                Отмена
              </IonButton>
            </div>
          </IonList>
        )}

        {error && !editingProfile && (
          <div className="account-error">
            <IonText color="danger">{error}</IonText>
          </div>
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Личный кабинет</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="account-content">
        {user ? renderProfile() : renderAuthForm()}
      </IonContent>
    </IonPage>
  );
};

export default Account;
