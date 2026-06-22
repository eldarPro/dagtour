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
  IonTextarea,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonBackButton,
  IonButtons,
  IonLabel,
} from '@ionic/react';
import { personOutline, documentTextOutline, callOutline, phonePortraitOutline, settingsOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth';
import { useHistory } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import AvatarPhoto from '../components/AvatarPhoto';
import './EditProfile.css';

type PhoneMode = 'hidden' | 'input' | 'waiting';

const formatPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) {
    return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return raw;
};

const toDialPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '8' + digits.slice(1);
  }
  return raw;
};

const EditProfile: React.FC = () => {
  const { user, updateProfile, updateAvatar, requestPhoneChange, verifyPhoneChange } = useAuth();
  const history = useHistory();

  const [name, setName] = useState(user?.full_name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (!avatarUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const { error } = await updateAvatar(file);
      if (error) setAvatarError(error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const [phoneMode, setPhoneMode] = useState<PhoneMode>('hidden');
  const [newPhone, setNewPhone] = useState('');
  const [phoneToCall, setPhoneToCall] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const pollingActive = useRef(false);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileError('Введите имя');
      return;
    }
    setSubmitting(true);
    setProfileError(null);
    try {
      const { error: err } = await updateProfile({ full_name: trimmedName, bio: bio.trim() || null });
      if (err) {
        setProfileError('Ошибка при сохранении');
      } else {
        history.goBack();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestPhoneChange = async () => {
    setPhoneError(null);
    setPhoneSubmitting(true);
    try {
      const result = await requestPhoneChange(newPhone);
      if (result.error) {
        setPhoneError(result.error);
        return;
      }
      setPhoneToCall(result.phoneToCall ?? '');
      setPhoneMode('waiting');
      pollingActive.current = true;

      verifyPhoneChange(result.requestId!).then((res) => {
        if (!pollingActive.current) return;
        pollingActive.current = false;
        if (res.error) {
          setPhoneError(res.error);
          setPhoneMode('input');
        } else {
          setPhoneMode('hidden');
          setNewPhone('');
        }
      });
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const cancelPhoneChange = () => {
    pollingActive.current = false;
    setPhoneMode('hidden');
    setNewPhone('');
    setPhoneError(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/account" />
          </IonButtons>
          <IonTitle>Личный профиль</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="edit-profile-content">
        <div className="edit-profile-form">

          {/* Аватарка */}
          <div className="edit-profile-avatar-wrap">
            <div style={{ position: 'relative' }}>
              <AvatarPhoto
                src={user?.avatar_url ?? undefined}
                className="edit-profile-avatar"
                placeholder={<span>{(user?.full_name ?? 'U')[0].toUpperCase()}</span>}
                onEditClick={!avatarUploading ? handleAvatarClick : undefined}
              />
              {avatarUploading && (
                <div className="edit-profile-avatar-uploading">
                  <IonSpinner name="crescent" />
                </div>
              )}
            </div>
            {avatarError && <p className="edit-profile-avatar-error">{avatarError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Имя и описание */}
          <IonList className="edit-profile-list">
            <IonItem>
              <IonIcon icon={personOutline} slot="start" color="medium" />
              <IonInput
                value={name}
                placeholder="Ваше имя"
                onIonInput={(e) => setName(e.detail.value ?? '')}
                label="Имя"
                labelPlacement="stacked"
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={documentTextOutline} slot="start" color="medium" />
              <IonTextarea
                value={bio}
                placeholder="Расскажите о себе или компании"
                onIonInput={(e) => setBio(e.detail.value ?? '')}
                label="Описание профиля"
                labelPlacement="stacked"
                rows={4}
                autoGrow
              />
            </IonItem>
          </IonList>

          {profileError && (
            <div className="edit-profile-error">
              <IonText color="danger">{profileError}</IonText>
            </div>
          )}

          <div className="edit-profile-actions">
            <IonButton expand="block" onClick={handleSaveProfile} disabled={submitting}>
              {submitting ? <IonSpinner name="crescent" /> : 'Сохранить'}
            </IonButton>
          </div>

          {/* Смена телефона */}
          <IonList className="edit-profile-list edit-profile-list--phone">
            <IonItem lines="none">
              <IonIcon icon={phonePortraitOutline} slot="start" color="medium" />
              <IonLabel>
                <p className="edit-profile-phone-label">Номер телефона</p>
                <p className="edit-profile-phone-value">{formatPhone(user?.phone ?? '')}</p>
              </IonLabel>
              {phoneMode === 'hidden' && (
                <button type="button" slot="end" className="edit-profile-edit-btn" onClick={() => setPhoneMode('input')}>
                  <IonIcon icon={settingsOutline} />
                </button>
              )}
            </IonItem>
          </IonList>

          {phoneMode === 'input' && (
            <div className="edit-profile-phone-panel">
              <p className="edit-profile-phone-hint">Введите новый номер. Для подтверждения нужно будет позвонить на выданный номер.</p>
              <div className="edit-profile-phone-input">
                <PhoneInput value={newPhone} onChange={setNewPhone} disabled={phoneSubmitting} />
              </div>
              {phoneError && (
                <div className="edit-profile-error">
                  <IonText color="danger">{phoneError}</IonText>
                </div>
              )}
              <div className="edit-profile-actions">
                <IonButton expand="block" onClick={handleRequestPhoneChange} disabled={phoneSubmitting}>
                  {phoneSubmitting ? <IonSpinner name="crescent" /> : 'Подтвердить звонком'}
                </IonButton>
                <IonButton expand="block" fill="outline" onClick={cancelPhoneChange}>
                  Отмена
                </IonButton>
              </div>
            </div>
          )}

          {phoneMode === 'waiting' && (
            <div className="edit-profile-phone-panel edit-profile-phone-panel--center">
              <div className="edit-profile-call-icon">
                <IonIcon icon={callOutline} />
              </div>
              <h3 className="edit-profile-call-title">Позвоните для подтверждения</h3>
              <p className="edit-profile-call-hint">Звонок бесплатный — сбрасывается сразу</p>
              <a href={`tel:${toDialPhone(phoneToCall)}`} className="edit-profile-call-btn">
                <IonIcon icon={callOutline} />
                <span>{formatPhone(phoneToCall)}</span>
              </a>
              <div className="edit-profile-waiting-row">
                <IonSpinner name="dots" />
                <IonText color="medium"><span>Ожидаем звонка…</span></IonText>
              </div>
              {phoneError && (
                <div className="edit-profile-error">
                  <IonText color="danger">{phoneError}</IonText>
                </div>
              )}
              <IonButton expand="block" fill="clear" onClick={cancelPhoneChange}>
                Изменить номер
              </IonButton>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default EditProfile;
