import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/react';
import { listOutline, mapOutline, optionsOutline } from 'ionicons/icons';
import HouseCard from '../components/HouseCard';
import HousesMap from '../components/HousesMap';
import HousesFilterModal from '../components/HousesFilterModal';
import { houses } from '../data/mockData';
import { HouseFilters, DEFAULT_FILTERS, applyFilters, isFiltersActive } from '../data/houseFilters';
import './Houses.css';

type ViewMode = 'list' | 'map';

const Houses: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<HouseFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = applyFilters(houses, filters);
  const hasActiveFilters = isFiltersActive(filters);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда домов</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setFilterOpen(true)} className="filter-icon-btn">
              <IonIcon icon={optionsOutline} />
              {hasActiveFilters && <span className="filter-badge" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar className="view-toolbar">
          <IonSegment
            value={viewMode}
            onIonChange={(e) => setViewMode(e.detail.value as ViewMode)}
          >
            <IonSegmentButton value="list">
              <IonIcon icon={listOutline} />
              <IonLabel>Список</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="map">
              <IonIcon icon={mapOutline} />
              <IonLabel>По карте</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      {viewMode === 'list' ? (
        <IonContent fullscreen className="list-content">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>Ничего не найдено</p>
              <IonButton fill="clear" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Сбросить фильтры
              </IonButton>
            </div>
          ) : (
            <IonList lines="none" className="card-list">
              {filtered.map((house) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </IonList>
          )}
        </IonContent>
      ) : (
        <IonContent fullscreen className="map-content">
          <HousesMap houses={filtered} />
        </IonContent>
      )}

      <HousesFilterModal
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </IonPage>
  );
};

export default Houses;
