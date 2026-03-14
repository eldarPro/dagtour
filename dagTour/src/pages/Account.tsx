import React, { useEffect, useState } from 'react';
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
} from '@ionic/react';
import { pencilSharp } from 'ionicons/icons';
import './Account.css';

type Mode = 'login' | 'register';

interface User {
  name: string;
  phone: string;
}

const STORAGE_KEY = 'dagtour_user';

/** Моковые данные для входа (только для разработки). Телефон: +7 900 123-45-67, код: 1234 */
const MOCK_AUTH = {
  phone: '79001234567',
  code: '1234',
  name: 'Тестовый пользователь',
};

const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const saveUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const resetForm = () => {
    setPhone('');
    setName('');
    setCode('');
    setCodeRequested(false);
    setError(null);
  };

  const handleLogout = () => {
    saveUser(null);
    setUser(null);
    resetForm();
    setEditingProfile(false);
  };

  const handleRequestCode = () => {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    setCodeRequested(true);
  };

  const handleSubmitLogin = () => {
    setError(null);
    if (!code || code.trim().length < 4) {
      setError('Введите код из SMS');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const trimmedCode = code.trim();

    if (cleanPhone === MOCK_AUTH.phone) {
      if (trimmedCode !== MOCK_AUTH.code) {
        setError('Неверный код');
        return;
      }
      const newUser: User = { name: MOCK_AUTH.name, phone: cleanPhone };
      saveUser(newUser);
      setUser(newUser);
      resetForm();
      return;
    }

    const newUser: User = { name: 'Гость', phone: cleanPhone };
    saveUser(newUser);
    setUser(newUser);
    resetForm();
  };

  const handleSubmitRegister = () => {
    setError(null);
    if (!name.trim()) {
      setError('Введите имя');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    if (!code || code.trim().length < 4) {
      setError('Введите код из SMS');
      return;
    }
    const newUser: User = {
      name: name.trim(),
      phone: cleanPhone,
    };
    saveUser(newUser);
    setUser(newUser);
    resetForm();
  };

  const startEditProfile = () => {
    if (!user) return;
    setEditName(user.name);
    setEditPhone(user.phone);
    setError(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    const nextName = editName.trim();
    const cleanPhone = editPhone.replace(/\D/g, '');
    if (!nextName) {
      setError('Введите имя');
      return;
    }
    if (cleanPhone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    const updated: User = { name: nextName, phone: cleanPhone };
    saveUser(updated);
    setUser(updated);
    setEditingProfile(false);
    setError(null);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setError(null);
  };

  const renderAuthForm = () => (
    <div className="account-auth">
      <p className="account-mock-hint">
        Для теста: телефон <strong>+7 900 123-45-67</strong>, код <strong>1234</strong>
      </p>
      <IonSegment
        mode="md"
        value={mode}
        onIonChange={(e) => {
          const value = e.detail.value as Mode;
          setMode(value);
          setError(null);
          setCode('');
          setCodeRequested(false);
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
            <IonLabel position="stacked">Имя</IonLabel>
            <IonInput
              value={name}
              placeholder="Ваше имя"
              onIonChange={(e) => setName(e.detail.value ?? '')}
            />
          </IonItem>
        )}

        <IonItem>
          <IonLabel position="stacked">Номер телефона</IonLabel>
          <IonInput
            type="tel"
            inputmode="tel"
            placeholder="+7 ..."
            value={phone}
            onIonChange={(e) => setPhone(e.detail.value ?? '')}
          />
        </IonItem>

        {!codeRequested && (
          <div className="account-actions">
            <IonButton expand="block" onClick={handleRequestCode}>
              Получить код
            </IonButton>
          </div>
        )}

        {codeRequested && (
          <>
            <IonItem>
              <IonLabel position="stacked">Код из SMS</IonLabel>
              <IonInput
                type="tel"
                inputmode="numeric"
                maxlength={6}
                placeholder="Введите код"
                value={code}
                onIonChange={(e) => setCode(e.detail.value ?? '')}
              />
            </IonItem>
            <div className="account-actions">
              {mode === 'login' ? (
                <IonButton expand="block" onClick={handleSubmitLogin}>
                  Войти
                </IonButton>
              ) : (
                <IonButton expand="block" onClick={handleSubmitRegister}>
                  Зарегистрироваться
                </IonButton>
              )}
              <IonButton
                fill="clear"
                size="small"
                onClick={() => {
                  setCode('');
                  setCodeRequested(false);
                }}
              >
                Изменить номер телефона
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

  const renderProfile = () => (
    <div className="account-profile">
      <div className="account-profile-header">
        <div className="account-avatar">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="account-profile-info">
          <h2>{user?.name || 'Пользователь'}</h2>
          <p>{user?.phone}</p>
        </div>
        <button
          type="button"
          className="account-edit-btn"
          onClick={startEditProfile}
        >
          <IonIcon icon={pencilSharp} />
        </button>
      </div>

      {editingProfile && (
        <IonList className="account-edit-form">
          <IonItem>
            <IonLabel position="stacked">Имя</IonLabel>
            <IonInput
              value={editName}
              placeholder="Ваше имя"
              onIonChange={(e) => setEditName(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Номер телефона</IonLabel>
            <IonInput
              type="tel"
              inputmode="tel"
              value={editPhone}
              placeholder="+7 ..."
              onIonChange={(e) => setEditPhone(e.detail.value ?? '')}
            />
          </IonItem>
          <div className="account-actions account-actions--profile">
            <IonButton expand="block" onClick={handleSaveProfile}>
              Сохранить
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={cancelEditProfile}>
              Отмена
            </IonButton>
          </div>
        </IonList>
      )}

      {error && !codeRequested && (
        <div className="account-error">
          <IonText color="danger">{error}</IonText>
        </div>
      )}

      <IonList className="account-menu">
        <IonItem button detail={true} routerLink="/my-cars">
          <IonLabel>Мои авто</IonLabel>
        </IonItem>
        <IonItem button detail={true}>
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

