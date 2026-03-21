import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { pencilSharp, mailOutline, lockClosedOutline, personOutline, callOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import './Account.css';

type Mode = 'login' | 'register';

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

const Account: React.FC = () => {
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
  };

  const handleLogout = async () => {
    await signOut();
    resetForm();
    setEditingProfile(false);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Введите email');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Введите имя');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password);
        if (result.error) {
          setError(result.error);
        } else {
          resetForm();
        }
      } else {
        const result = await signUp(email.trim(), password, name.trim());
        if (result.error) {
          setError(result.error);
        } else {
          setError(null);
          alert('Регистрация успешна! Проверьте email для подтверждения.');
          resetForm();
          setMode('login');
        }
      }
    } finally {
      setSubmitting(false);
    }
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
        <p>Войдите или зарегистрируйтесь</p>
      </div>

      <IonSegment
        mode="md"
        value={mode}
        onIonChange={(e) => {
          setMode(e.detail.value as Mode);
          setError(null);
        }}
      >
        <IonSegmentButton value="login">
          <IonLabel>Вход</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="register">
          <IonLabel>Регистрация</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      <IonList className="account-form">
        {mode === 'register' && (
          <IonItem>
            <IonIcon icon={personOutline} slot="start" color="medium" />
            <IonInput
              value={name}
              placeholder="Ваше имя"
              onIonInput={(e) => setName(e.detail.value ?? '')}
            />
          </IonItem>
        )}

        <IonItem>
          <IonIcon icon={mailOutline} slot="start" color="medium" />
          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
          <IonInput
            type="password"
            placeholder="Пароль"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
          />
        </IonItem>

        <div className="account-actions">
          <IonButton expand="block" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <IonSpinner name="crescent" /> : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
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

