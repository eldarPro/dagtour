import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonRange,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { CarFilters, DEFAULT_FILTERS, PRICE_MIN } from '../data/carFilters';
import './HousesFilterModal.css';

const TYPES: Array<CarFilters['type']> = ['Все', 'эконом', 'комфорт', 'внедорожник'];
const TRANSMISSIONS: Array<CarFilters['transmission']> = ['Все', 'механика', 'автомат'];

interface Props {
  isOpen: boolean;
  filters: CarFilters;
  priceMax: number;
  onClose: () => void;
  onApply: (filters: CarFilters) => void;
}

const CarsFilterModal: React.FC<Props> = ({ isOpen, filters, priceMax, onClose, onApply }) => {
  const [local, setLocal] = React.useState<CarFilters>(filters);

  React.useEffect(() => {
    if (isOpen) setLocal(filters);
  }, [isOpen, filters]);

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleReset = () => {
    setLocal(DEFAULT_FILTERS);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.85]}
      initialBreakpoint={0.85}
      handleBehavior="cycle"
    >
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
        {/* Тип автомобиля */}
        <section className="filter-section">
          <h3 className="filter-section-title">Тип автомобиля</h3>
          <div className="filter-chips">
            {TYPES.map((type) => (
              <button
                key={type}
                className={`filter-chip ${local.type === type ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, type }))}
              >
                {type === 'Все' ? 'Все' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Трансмиссия */}
        <section className="filter-section">
          <h3 className="filter-section-title">Трансмиссия</h3>
          <div className="filter-chips">
            {TRANSMISSIONS.map((tr) => (
              <button
                key={tr}
                className={`filter-chip ${local.transmission === tr ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, transmission: tr }))}
              >
                {tr === 'Все' ? 'Любая' : tr.charAt(0).toUpperCase() + tr.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Количество мест */}
        <section className="filter-section">
          <IonItem lines="none" className="filter-select-item">
            <IonLabel>Количество мест</IonLabel>
            <IonSelect
              value={local.seatsMin}
              placeholder="Любое"
              onIonChange={(e) => setLocal((f) => ({ ...f, seatsMin: e.detail.value }))}
              interface="action-sheet"
              cancelText="Отмена"
            >
              {[0, 4, 5, 7].map((v) => (
                <IonSelectOption key={v} value={v}>
                  {v === 0 ? 'Любое' : `${v}+ мест`}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </section>

        {/* Цена за день */}
        <section className="filter-section">
          <h3 className="filter-section-title">Цена за день</h3>
          <div className="filter-price-labels">
            <span>{local.priceMin.toLocaleString('ru-RU')} ₽</span>
            <span>{Math.min(local.priceMax, priceMax).toLocaleString('ru-RU')} ₽</span>
          </div>
          <IonRange
            dualKnobs
            min={PRICE_MIN}
            max={priceMax}
            step={500}
            value={{ lower: local.priceMin, upper: Math.min(local.priceMax, priceMax) }}
            onIonChange={(e) => {
              const { lower, upper } = e.detail.value as { lower: number; upper: number };
              setLocal((f) => ({ ...f, priceMin: lower, priceMax: upper }));
            }}
            className="filter-price-range"
          />
        </section>

        <div className="filter-footer">
          <IonButton fill="outline" className="filter-btn-reset" onClick={handleReset}>
            Сбросить
          </IonButton>
          <IonButton expand="block" className="filter-btn-apply" onClick={handleApply}>
            Применить
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CarsFilterModal;

