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
  IonIcon,
  IonRange,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { HouseFilters, DEFAULT_FILTERS, PRICE_MIN } from '../data/houseFilters';
import './HousesFilterModal.css';

const ROOMS_OPTIONS = [
  { label: 'Любое', value: 0 },
  { label: '2 комнаты', value: 2 },
  { label: '3 комнаты', value: 3 },
  { label: '4+', value: 4 },
];

const RATING_OPTIONS = [
  { label: 'Любой', value: 0 },
  { label: '4.5+', value: 4.5 },
  { label: '4.7+', value: 4.7 },
  { label: '4.9+', value: 4.9 },
];

interface Props {
  isOpen: boolean;
  filters: HouseFilters;
  priceMax: number;
  locations: string[];
  onClose: () => void;
  onApply: (filters: HouseFilters) => void;
}

const HousesFilterModal: React.FC<Props> = ({ isOpen, filters, priceMax, locations, onClose, onApply }) => {
  const [local, setLocal] = React.useState<HouseFilters>(filters);

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
        {/* Город */}
        <section className="filter-section">
          <h3 className="filter-section-title">Город</h3>
          <div className="filter-chips">
            {locations.map((loc) => (
              <button
                key={loc}
                className={`filter-chip ${local.location === loc ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, location: loc }))}
              >
                {loc}
              </button>
            ))}
          </div>
        </section>

        {/* Ценовой диапазон */}
        <section className="filter-section">
          <h3 className="filter-section-title">Цена за ночь</h3>
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

        {/* Количество комнат */}
        <section className="filter-section">
          <IonItem lines="none" className="filter-select-item">
            <IonLabel>Количество комнат</IonLabel>
            <IonSelect
              value={local.minRooms}
              placeholder="Любое"
              onIonChange={(e) => setLocal((f) => ({ ...f, minRooms: e.detail.value }))}
              interface="action-sheet"
              cancelText="Отмена"
            >
              {ROOMS_OPTIONS.map((opt) => (
                <IonSelectOption key={opt.value} value={opt.value}>{opt.label}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </section>

        {/* Рейтинг */}
        <section className="filter-section">
          <h3 className="filter-section-title">Рейтинг</h3>
          <div className="filter-chips">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`filter-chip ${local.minRating === opt.value ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, minRating: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Гости */}
        <section className="filter-section">
          <IonItem lines="none" className="filter-select-item">
            <IonLabel>Количество гостей</IonLabel>
            <IonSelect
              value={local.minGuests}
              placeholder="Любое"
              onIonChange={(e) => setLocal((f) => ({ ...f, minGuests: e.detail.value }))}
              interface="action-sheet"
              cancelText="Отмена"
            >
              {[
                { label: 'Любое', value: 0 },
                { label: '2–4 гостя', value: 2 },
                { label: '5–6 гостей', value: 5 },
                { label: '7+ гостей', value: 7 },
              ].map((opt) => (
                <IonSelectOption key={opt.value} value={opt.value}>{opt.label}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
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

export default HousesFilterModal;
