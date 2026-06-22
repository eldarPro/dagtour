import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface FilterModalProps<T> {
  isOpen: boolean;
  filters: T;
  defaultFilters: T;
  onClose: () => void;
  onApply: (filters: T) => void;
  children: (local: T, setLocal: React.Dispatch<React.SetStateAction<T>>) => React.ReactNode;
}

function FilterModal<T>({
  isOpen,
  filters,
  defaultFilters,
  onClose,
  onApply,
  children,
}: FilterModalProps<T>) {
  const [local, setLocal] = useState<T>(filters);

  useEffect(() => {
    if (isOpen) setLocal(filters);
  }, [isOpen, filters]);

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Фильтры</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="filter-modal-content">
        {children(local, setLocal)}
        <div className="filter-footer">
          <IonButton fill="outline" className="filter-btn-reset" onClick={() => setLocal(defaultFilters)}>
            Сбросить
          </IonButton>
          <IonButton expand="block" className="filter-btn-apply" onClick={handleApply}>
            Применить
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}

export default FilterModal;
