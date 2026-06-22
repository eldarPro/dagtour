import React, { useState, useCallback } from 'react';
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
  IonFab,
  IonFabButton,
  IonAlert,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import { listOutline, mapOutline, optionsOutline, addOutline } from 'ionicons/icons';
import CarCard, { CarCardData } from '../components/CarCard';
import { CarCardSkeleton } from '../components/CardSkeletons';
import CarsMap, { MapCarItem } from '../components/CarsMap';
import { getCarsFiltered, getCarPins, updateCar, deleteCar, Car } from '../lib/api';
import CarsFilterModal from '../components/CarsFilterModal';
import { useAuth } from '../lib/auth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { CarFilters, DEFAULT_FILTERS, isFiltersActive, applyFilters } from '../data/carFilters';
import './Cars.css';

type ViewMode = 'list' | 'map';

const PAGE_SIZE = 10;

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: 'Автомат',
  manual: 'Механика',
  robot: 'Робот',
};

const carToCardData = (car: Car): CarCardData => ({
  id: String(car.id),
  brand: car.brand,
  model: car.model,
  year: car.year,
  pricePerDay: car.pricePerDay,
  photo: car.photo,
  location: car.location,
  type: car.type,
  seats: car.seats,
  transmission: car.transmission
    ? (TRANSMISSION_LABEL[car.transmission] ?? car.transmission)
    : undefined,
  active: car.active,
});

const Cars: React.FC = () => {
  const { user } = useAuth();
  const { navigate: addCar, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-car');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [otherCars, setOtherCars] = useState<Car[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapPins, setMapPins] = useState<MapCarItem[]>([]);
  const [mapPinsLoaded, setMapPinsLoaded] = useState(false);

  const loadCars = useCallback(async (currentFilters: CarFilters, currentOffset: number, userId?: string) => {
    const lf = currentFilters.locationFilter;
    const { data, hasMore: more } = await getCarsFiltered(
      {
        type: currentFilters.type,
        transmission: currentFilters.transmission,
        seatsMin: currentFilters.seatsMin,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        city: lf.city,
        district: !lf.city ? lf.district : undefined,
        citiesInDistrict: !lf.city ? lf.citiesInDistrict : undefined,
        sort: currentFilters.sort,
      },
      currentOffset,
      PAGE_SIZE,
    );
    if (currentOffset === 0) {
      setMyCars(data.filter((c) => c.userId === userId));
      setOtherCars(data.filter((c) => c.userId !== userId));
    } else {
      setOtherCars((prev) => [...prev, ...data.filter((c) => c.userId !== userId)]);
    }
    setHasMore(more);
    setOffset(currentOffset + data.length);
  }, []);

  const loadMapPins = useCallback(async (currentFilters: CarFilters) => {
    const lf = currentFilters.locationFilter;
    const pins = await getCarPins({
      type: currentFilters.type,
      transmission: currentFilters.transmission,
      seatsMin: currentFilters.seatsMin,
      priceMin: currentFilters.priceMin,
      priceMax: currentFilters.priceMax,
      city: lf.city,
      district: !lf.city ? lf.district : undefined,
      citiesInDistrict: !lf.city ? lf.citiesInDistrict : undefined,
      sort: currentFilters.sort,
    });
    setMapPins(pins.map((p) => ({ id: p.id, pricePerDay: p.pricePerDay, lat: p.lat, lng: p.lng, name: p.name, photo: p.photo, location: p.location, seats: p.seats, transmission: p.transmission, year: p.year })));
    setMapPinsLoaded(true);
  }, []);

  useIonViewWillEnter(() => {
    setLoading(true);
    setMapPinsLoaded(false);
    loadCars(filters, 0, user?.id)
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const handleApplyFilters = (newFilters: CarFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadCars(newFilters, 0, user?.id).catch(console.error);
    if (viewMode === 'map') {
      loadMapPins(newFilters).catch(console.error);
    } else {
      setMapPinsLoaded(false);
    }
  };

  const handleReset = () => {
    handleApplyFilters(DEFAULT_FILTERS);
  };

  const handleRefresh = async (e: CustomEvent) => {
    setOffset(0);
    setMapPinsLoaded(false);
    await loadCars(filters, 0, user?.id).catch(console.error);
    (e.target as HTMLIonRefresherElement).complete();
  };

  const filteredOwn = applyFilters(myCars, filters);
  const allVisible = [...filteredOwn, ...otherCars];
  const hasActiveFilters = isFiltersActive(filters);

  const lf = filters.locationFilter;
  const mapUserLocation =
    lf.lat != null && lf.lng != null
      ? { lat: lf.lat, lng: lf.lng, zoom: lf.city ? 12 : lf.district ? 9 : 7 }
      : undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда авто</IonTitle>
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
            onIonChange={(e) => {
              const newMode = e.detail.value as ViewMode;
              setViewMode(newMode);
              if (newMode === 'map' && !mapPinsLoaded) {
                loadMapPins(filters).catch(console.error);
              }
            }}
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
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
          {loading ? (
            <IonList lines="none" className="card-list">
              {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
            </IonList>
          ) : allVisible.length === 0 ? (
            <div className="no-results">
              <p>Ничего не найдено</p>
              <IonButton fill="clear" onClick={handleReset}>
                Сбросить фильтры
              </IonButton>
            </div>
          ) : (
            <IonList lines="none" className="card-list">
              {allVisible.map((car) => {
                const isOwn = car.userId === user?.id;
                const handleToggleActive = isOwn ? async () => {
                  const id = car.id; const next = !car.active;
                  setMyCars(prev => prev.map(c => c.id === id ? { ...c, active: next } : c));
                  setOtherCars(prev => prev.map(c => c.id === id ? { ...c, active: next } : c));
                  try { await updateCar(id, { active: next }); } catch (err) { console.error(err); }
                } : undefined;
                const handleDelete = isOwn ? async () => {
                  const id = car.id;
                  setMyCars(prev => prev.filter(c => c.id !== id));
                  setOtherCars(prev => prev.filter(c => c.id !== id));
                  try { await deleteCar(id); } catch (err) { console.error(err); }
                } : undefined;
                return (
                  <CarCard
                    key={car.id}
                    car={carToCardData(car)}
                    href={`/cars/${car.id}`}
                    isOwn={isOwn}
                    showOwnBadge={isOwn}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                );
              })}
            </IonList>
          )}
          <IonInfiniteScroll
            onIonInfinite={async (e) => {
              await loadCars(filters, offset, user?.id);
              (e.target as HTMLIonInfiniteScrollElement).complete();
            }}
            disabled={loading || !hasMore}
          >
            <IonInfiniteScrollContent loadingText="Загрузка..." />
          </IonInfiniteScroll>
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={addCar}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      ) : (
        <IonContent className="map-content">
          <CarsMap cars={mapPins} userLocation={mapUserLocation} />
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={addCar}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      )}

      <CarsFilterModal
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
      />
      <IonAlert
        isOpen={showAlert}
        header="Требуется вход"
        message="Войдите в аккаунт, чтобы добавить объявление."
        buttons={[
          { text: 'Отмена', role: 'cancel', handler: () => setShowAlert(false) },
          { text: 'Войти', handler: goToLogin },
        ]}
        onDidDismiss={() => setShowAlert(false)}
      />
    </IonPage>
  );
};

export default Cars;
