import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonRange,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { tours } from '../data/mockData';
import { TourFilters, DEFAULT_FILTERS, PRICE_MIN, PRICE_MAX, DurationFilter } from '../data/tourFilters';
import './HousesFilterModal.css';

const DURATIONS: DurationFilter[] = ['Все', '1 день', '2 дня', '3 дня'];

const ROUTE_POINTS = ['Все', ...Array.from(new Set(tours.flatMap((t) => t.route))).sort()];

interface Props {
  isOpen: boolean;
  filters: TourFilters;
  onClose: () => void;
  onApply: (filters: TourFilters) => void;
}

const ToursFilterModal: React.FC<Props> = ({ isOpen, filters, onClose, onApply }) => {
  const [local, setLocal] = React.useState<TourFilters>(filters);

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
        <section className="filter-section">
          <h3 className="filter-section-title">Длительность</h3>
          <div className="filter-chips">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`filter-chip ${local.duration === d ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, duration: d }))}
              >
                {d === 'Все' ? 'Любая' : d}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Пункт маршрута</h3>
          <div className="filter-chips">
            {ROUTE_POINTS.map((point) => (
              <button
                key={point}
                className={`filter-chip ${local.routePoint === point ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, routePoint: point }))}
              >
                {point}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Цена</h3>
          <div className="filter-price-labels">
            <span>{local.priceMin.toLocaleString('ru-RU')} ₽</span>
            <span>{local.priceMax.toLocaleString('ru-RU')} ₽</span>
          </div>
          <IonRange
            dualKnobs
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={500}
            value={{ lower: local.priceMin, upper: local.priceMax }}
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

export default ToursFilterModal;
