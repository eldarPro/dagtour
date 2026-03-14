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
  useIonViewWillEnter,
} from '@ionic/react';
import { listOutline, mapOutline, optionsOutline } from 'ionicons/icons';
import HouseCard, { HouseCardData } from '../components/HouseCard';
import HousesMap, { MapHouseItem } from '../components/HousesMap';
import HousesFilterModal from '../components/HousesFilterModal';
import { houses, House } from '../data/mockData';
import { HouseFilters, DEFAULT_FILTERS, applyFilters, isFiltersActive } from '../data/houseFilters';
import { MyHouse, loadMyHouses } from '../data/myHousesStorage';
import './Houses.css';

type ViewMode = 'list' | 'map';

const mockToCardData = (h: House): HouseCardData => ({
  id: String(h.id),
  name: h.name,
  pricePerNight: h.pricePerNight,
  photo: h.photo,
  location: h.location,
  rating: h.rating,
  rooms: h.rooms,
  guests: h.guests,
});

const myHouseToCardData = (h: MyHouse): HouseCardData => ({
  id: h.id,
  name: h.name,
  pricePerNight: h.pricePerNight,
  location: h.address,
  rooms: h.rooms,
  guests: h.guests,
});

const Houses: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<HouseFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [myHouses, setMyHouses] = useState<MyHouse[]>([]);

  useIonViewWillEnter(() => {
    setMyHouses(loadMyHouses());
  });

  const filtered = applyFilters(houses, filters);
  const filteredOwn = myHouses.filter(
    (h) => h.pricePerNight >= filters.priceMin && h.pricePerNight <= filters.priceMax
  );
  const hasActiveFilters = isFiltersActive(filters);

  const mockMapItems: MapHouseItem[] = filtered.map((h) => ({
    id: h.id,
    name: h.name,
    pricePerNight: h.pricePerNight,
    lat: h.lat,
    lng: h.lng,
  }));

  const ownMapItems: MapHouseItem[] = myHouses
    .filter((h) => h.lat != null && h.lng != null)
    .map((h) => ({
      id: h.id,
      name: h.name,
      pricePerNight: h.pricePerNight,
      lat: h.lat!,
      lng: h.lng!,
    }));

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
            mode="md"
            value={viewMode}
            onIonChange={(e) => setViewMode(e.detail.value as ViewMode)}
          >
            <IonSegmentButton value="list" layout="icon-start">
              <IonIcon icon={listOutline} />
              <IonLabel>Список</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="map" layout="icon-start">
              <IonIcon icon={mapOutline} />
              <IonLabel>Карта</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      {viewMode === 'list' ? (
        <IonContent fullscreen className="list-content">
          {filtered.length === 0 && filteredOwn.length === 0 ? (
            <div className="no-results">
              <p>Ничего не найдено</p>
              <IonButton fill="clear" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Сбросить фильтры
              </IonButton>
            </div>
          ) : (
            <IonList lines="none" className="card-list">
              {filteredOwn.map((house) => (
                <HouseCard
                  key={house.id}
                  house={myHouseToCardData(house)}
                  href={`/houses/${house.id}`}
                  isOwn
                  showOwnBadge
                />
              ))}
              {filtered.map((house) => (
                <HouseCard
                  key={house.id}
                  house={mockToCardData(house)}
                  href={`/houses/${house.id}`}
                />
              ))}
            </IonList>
          )}
        </IonContent>
      ) : (
        <IonContent fullscreen className="map-content">
          <HousesMap houses={[...ownMapItems, ...mockMapItems]} />
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
