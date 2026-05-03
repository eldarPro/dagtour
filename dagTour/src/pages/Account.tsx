import React, { useState } from 'react';
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
import { pencilSharp, personOutline, callOutline, chatbubbleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import './Account.css';

type AuthStep = 'phone' | 'code';

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

const Account: React.FC = () => {
  const { user, loading: authLoading, signOut, sendPhoneCode, verifyPhoneCode } = useAuth();

  // Phone auth состояния
  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Загрузка профиля при авторизации
  React.useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const resetPhoneForm = () => {
    setPhone('');
    setCode('');
    setError(null);
    setCodeSent(false);
    setCountdown(0);
  };

  const handleLogout = async () => {
    await signOut();
    resetPhoneForm();
    setEditingProfile(false);
    setAuthStep('phone');
  };

  // Отправка кода на телефон
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
        setCodeSent(true);
        setAuthStep('code');
        // Запускаем обратный отсчет
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Проверка кода
  const handleVerifyCode = async () => {
    setError(null);
    
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanCode = code.replace(/\D/g, '');
    
    if (cleanCode.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyPhoneCode(cleanPhone, cleanCode);
      if (result.error) {
        setError(result.error);
      } else {
        // Успешная авторизация - профиль загрузится через useEffect
        resetPhoneForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Повторная отправка кода
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    const cleanPhone = phone.replace(/\D/g, '');
    const result = await sendPhoneCode(cleanPhone);
    
    if (!result.error) {
      setCode('');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error);
    }
  };

  // Вернуться к вводу телефона
  const handleBackToPhone = () => {
    setAuthStep('phone');
    setCode('');
    setCodeSent(false);
    setError(null);
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
        .update({
          full_name: nextName,
          phone: cleanPhone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setError('Ошибка при сохранении');
      } else {
        setProfile((prev) => prev ? { ...prev, full_name: nextName, phone: cleanPhone || null } : null);
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
        <h2>Добро пожаловать</h2>
        <p>{authStep === 'phone' ? 'Введите номер телефона' : 'Введите код из SMS'}</p>
      </div>

      <IonList className="account-form">
        {authStep === 'phone' ? (
          // Шаг 1: Ввод телефона
          <>
            <IonItem>
              <IonIcon icon={callOutline} slot="start" color="medium" />
              <IonInput
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onIonInput={(e) => setPhone(e.detail.value ?? '')}
                disabled={submitting}
              />
            </IonItem>

            <div className="account-actions">
              <IonButton expand="block" onClick={handleSendCode} disabled={submitting}>
                {submitting ? <IonSpinner name="crescent" /> : 'Получить код'}
              </IonButton>
            </div>
          </>
        ) : (
          // Шаг 2: Ввод кода
          <>
            <IonItem>
              <IonIcon icon={chatbubbleOutline} slot="start" color="medium" />
              <IonInput
                type="tel"
                placeholder="123456"
                value={code}
                maxlength={6}
                onIonInput={(e) => setCode(e.detail.value ?? '')}
                disabled={submitting}
              />
            </IonItem>

            <div className="account-actions">
              <IonButton expand="block" onClick={handleVerifyCode} disabled={submitting}>
                {submitting ? <IonSpinner name="crescent" /> : 'Подтвердить'}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={handleBackToPhone}
                disabled={submitting}
              >
                Изменить номер
              </IonButton>
              
              <IonButton
                expand="block"
                fill="clear"
                onClick={handleResendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Повторить через ${countdown} сек` : 'Отправить код повторно'}
              </IonButton>
            </div>
          </>
        )}

        {error && (
          <div className="account-error">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        {codeSent && authStep === 'code' && (
          <div className="account-success">
            <IonText color="success">
              <IonIcon icon={checkmarkCircleOutline} slot="start" />
              Код отправлен на номер {phone}
            </IonText>
          </div>
        )}
      </IonList>
    </div>
  );

  const renderProfile = () => {
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Пользователь';
    const displayEmail = profile?.email || user?.email || '';

    return (
      <div className="account-profile">
        <div className="account-profile-header">
          <div className="account-avatar">
            {displayName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="account-profile-info">
            <h2>{displayName}</h2>
            <p>{displayEmail}</p>
            {profile?.phone && <p className="account-phone">{profile.phone}</p>}
          </div>
          <button
            type="button"
            className="account-edit-btn"
            onClick={startEditProfile}
          >
            <IonIcon icon={pencilSharp} />
          </button>
        </div>

        {loadingProfile && (
          <div className="account-loading">
            <IonSpinner name="crescent" />
          </div>
        )}

        {editingProfile && (
          <IonList className="account-edit-form">
            <IonItem>
              <IonIcon icon={personOutline} slot="start" color="medium" />
              <IonInput
                value={editName}
                placeholder="Ваше имя"
                onIonInput={(e) => setEditName(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={callOutline} slot="start" color="medium" />
              <IonInput
                type="tel"
                placeholder="Телефон"
                value={editPhone}
                onIonInput={(e) => setEditPhone(e.detail.value ?? '')}
              />
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
          <IonItem button detail={true} routerLink="/my-cars">
            <IonLabel>Мои авто</IonLabel>
          </IonItem>
          <IonItem button detail={true} routerLink="/my-houses">
            <IonLabel>Мои дома</IonLabel>
          </IonItem>
          <IonItem button detail={true}>
            <IonLabel>Избранное</IonLabel>
          </IonItem>
          <IonItem lines="none" className="account-logout-item">
            <IonButton expand="block" fill="outline" color="danger" onClick={handleLogout}>
              Выйти из аккаунта
            </IonButton>
          </IonItem>
        </IonList>
      </div>
    );
  };

  if (authLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Личный кабинет</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="account-loading">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

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

