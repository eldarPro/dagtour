import React, { useState, useEffect } from 'react';
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
  IonSpinner,
} from '@ionic/react';
import { listOutline, mapOutline, optionsOutline } from 'ionicons/icons';
import CarCard, { CarCardData } from '../components/CarCard';
import CarsMap, { MapCarItem } from '../components/CarsMap';
import { getCars, Car } from '../lib/api';
import CarsFilterModal from '../components/CarsFilterModal';
import { CarFilters, DEFAULT_FILTERS, applyFilters, isFiltersActive } from '../data/carFilters';
import { MyCar, loadMyCars } from '../data/myCarsStorage';
import './Cars.css';

type ViewMode = 'list' | 'map';

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const carToCardData = (car: Car): CarCardData => ({
  id: String(car.id),
  brand: car.brand,
  model: car.model,
  pricePerDay: car.pricePerDay,
  photo: car.photo,
  type: car.type,
  seats: car.seats,
  transmission: car.transmission,
});

const myCarToCardData = (car: MyCar): CarCardData => ({
  id: car.id,
  brand: car.brand,
  model: car.model,
  year: car.year,
  pricePerDay: car.pricePerDay,
  transmission: car.transmission ? (TRANSMISSION_LABEL[car.transmission] ?? car.transmission) : undefined,
});

const Cars: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [myCars, setMyCars] = useState<MyCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (error) {
        console.error('Failed to load cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setMyCars(loadMyCars());
  }, []);

  const filteredCars = applyFilters(cars, filters);

  const filteredOwn = myCars.filter(
    (c) => c.pricePerDay >= filters.priceMin && c.pricePerDay <= filters.priceMax
  );

  const hasActiveFilters = isFiltersActive(filters);

  const mapItems: MapCarItem[] = filteredCars.map((c) => ({
    id: c.id,
    brand: c.brand,
    model: c.model,
    pricePerDay: c.pricePerDay,
    lat: c.lat,
    lng: c.lng,
  }));

  const ownMapItems: MapCarItem[] = myCars
    .filter((c) => c.lat != null && c.lng != null)
    .map((c) => ({
      id: c.id,
      brand: c.brand,
      model: c.model,
      pricePerDay: c.pricePerDay,
      lat: c.lat!,
      lng: c.lng!,
    }));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда авто</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={() => setFilterOpen(true)}
              className="filter-icon-btn"
            >
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
          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
            </div>
          ) : filteredCars.length === 0 && filteredOwn.length === 0 ? (
            <div className="no-results">
              <p>Ничего не найдено</p>
              <IonButton fill="clear" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Сбросить фильтры
              </IonButton>
            </div>
          ) : (
            <IonList lines="none" className="card-list">
              {filteredOwn.map((car) => (
                <CarCard
                  key={car.id}
                  car={myCarToCardData(car)}
                  href={`/cars/${car.id}`}
                  isOwn
                  showOwnBadge
                />
              ))}
              {filteredCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={carToCardData(car)}
                  href={`/cars/${car.id}`}
                />
              ))}
            </IonList>
          )}
        </IonContent>
      ) : (
        <IonContent fullscreen className="map-content">
          <CarsMap cars={[...ownMapItems, ...mapItems]} />
        </IonContent>
      )}

      <CarsFilterModal
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </IonPage>
  );
};

export default Cars;
