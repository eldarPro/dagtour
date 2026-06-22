import React, { useState } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { closeOutline, createOutline } from 'ionicons/icons';

interface Props {
  src?: string;
  placeholder: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onEditClick?: () => void;
}

const AvatarPhoto: React.FC<Props> = ({ src, placeholder, className, style, onEditClick }) => {
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    setOpen(false);
    onEditClick?.();
  };

  return (
    <>
      <div
        className={className}
        style={{ ...style, borderRadius: '50%', overflow: 'hidden', cursor: (src || onEditClick) ? 'pointer' : 'default' }}
        onClick={() => {
          if (src) setOpen(true);
          else if (onEditClick) onEditClick();
        }}
      >
        {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : placeholder}
      </div>

      {src && (
        <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} style={{ '--background': 'rgba(0,0,0,0.9)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.92)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0' }}>
              {onEditClick ? (
                <button
                  onClick={handleEdit}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <IonIcon icon={createOutline} />
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Изменить</span>
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', padding: 4 }}
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16, objectFit: 'contain' }} />
            </div>
          </div>
        </IonModal>
      )}
    </>
  );
};

export default AvatarPhoto;
