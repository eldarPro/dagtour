import React, { useRef, useState } from 'react';
import { IonIcon, IonSpinner, IonText } from '@ionic/react';
import { addOutline, closeCircle } from 'ionicons/icons';
import { uploadPhoto, deletePhoto } from '../lib/storage';
import './PhotoUpload.css';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  folder: string;
}

const MAX_PHOTOS = 5;

const PhotoUpload: React.FC<Props> = ({ photos, onChange, folder }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, slots);
    setError(null);
    setUploading(true);
    try {
      const urls = await Promise.all(toUpload.map((f) => uploadPhoto(f, folder)));
      onChange([...photos, ...urls]);
    } catch {
      setError('Ошибка загрузки. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent, url: string, idx: number) => {
    e.stopPropagation();
    onChange(photos.filter((_, i) => i !== idx));
    deletePhoto(url);
  };

  return (
    <div className="photo-upload">
      <p className="photo-upload-label">Фотографии (до {MAX_PHOTOS} шт.)</p>
      <div className="photo-upload-grid">
        {photos.map((url, idx) => (
          <div key={url} className="photo-upload-thumb">
            <img src={url} alt={`фото ${idx + 1}`} />
            <button
              type="button"
              className="photo-upload-remove"
              onClick={(e) => handleRemove(e, url, idx)}
            >
              <IonIcon icon={closeCircle} />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            className="photo-upload-add"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <IonSpinner name="crescent" /> : <IonIcon icon={addOutline} />}
          </button>
        )}
      </div>
      {error && (
        <IonText color="danger">
          <p className="photo-upload-error">{error}</p>
        </IonText>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default PhotoUpload;
