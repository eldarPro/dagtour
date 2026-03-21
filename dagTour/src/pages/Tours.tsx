import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { optionsOutline } from 'ionicons/icons';
import TourCard from '../components/TourCard';
import ToursFilterModal from '../components/ToursFilterModal';
import { getTours, Tour } from '../lib/api';
import { TourFilters, DEFAULT_FILTERS, applyFilters, isFiltersActive } from '../data/tourFilters';
import './Tours.css';

const Tours: React.FC = () => {
  const [filters, setFilters] = useState<TourFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTours();
        setTours(data);
      } catch (error) {
        console.error('Failed to load tours:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = applyFilters(tours, filters);
  const hasActiveFilters = isFiltersActive(filters);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Направления туров</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setFilterOpen(true)} className="filter-icon-btn">
              <IonIcon icon={optionsOutline} />
              {hasActiveFilters && <span className="filter-badge" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="list-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <p>Ничего не найдено</p>
            <IonButton fill="clear" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Сбросить фильтры
            </IonButton>
          </div>
        ) : (
          <IonList lines="none" className="card-list">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </IonList>
        )}
      </IonContent>

      <ToursFilterModal
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </IonPage>
  );
};

export default Tours;
