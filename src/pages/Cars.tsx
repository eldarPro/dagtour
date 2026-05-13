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
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { listOutline, mapOutline, optionsOutline, addOutline, bookmarkOutline, bookmark } from 'ionicons/icons';
import CarCard, { CarCardData } from '../components/CarCard';
import { CarCardSkeleton } from '../components/CardSkeletons';
import CarsMap, { MapCarItem } from '../components/CarsMap';
import { getCarsFiltered, getMyCars, getMaxPrice, Car } from '../lib/api';
import CarsFilterModal from '../components/CarsFilterModal';
import { useAuth } from '../lib/auth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { CarFilters, DEFAULT_FILTERS, isFiltersActive } from '../data/carFilters';
import { useFavorites } from '../lib/favoritesContext';
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
  type: car.type,
  seats: car.seats,
  transmission: car.transmission
    ? (TRANSMISSION_LABEL[car.transmission] ?? car.transmission)
    : undefined,
});

const Cars: React.FC = () => {
  const { user } = useAuth();
  const { navigate: addCar, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-car');
  const { favorites } = useFavorites();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [otherCars, setOtherCars] = useState<Car[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(0);

  useIonViewWillLeave(() => setFavoritesOnly(false));

  const loadOtherCars = useCallback(async (currentFilters: CarFilters, currentOffset: number, userId?: string) => {
    const { data, hasMore: more } = await getCarsFiltered(
      {
        type: currentFilters.type,
        transmission: currentFilters.transmission,
        seatsMin: currentFilters.seatsMin,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        excludeUserId: userId,
      },
      currentOffset,
      PAGE_SIZE,
    );
    if (currentOffset === 0) {
      setOtherCars(data);
    } else {
      setOtherCars((prev) => [...prev, ...data]);
    }
    setHasMore(more);
    setOffset(currentOffset + data.length);
  }, []);

  useIonViewWillEnter(() => {
    setLoading(true);
    const userId = user?.id;
    Promise.all([
      getMaxPrice('cars_max_price'),
      userId ? getMyCars(userId) : Promise.resolve([]),
      loadOtherCars(DEFAULT_FILTERS, 0, userId),
    ])
      .then(([max, my]) => {
        setPriceMax(max);
        setMyCars(my);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const handleApplyFilters = (newFilters: CarFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadOtherCars(newFilters, 0, user?.id).catch(console.error);
  };

  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, priceMax };
    handleApplyFilters(reset);
  };

  const favoriteCarIds = new Set(favorites.filter((f) => f.type === 'car').map((f) => f.id));

  const filteredOwn = myCars.filter(
    (c) =>
      c.pricePerDay >= filters.priceMin &&
      c.pricePerDay <= filters.priceMax &&
      (!favoritesOnly || favoriteCarIds.has(c.id))
  );
  const visibleOther = favoritesOnly
    ? otherCars.filter((c) => favoriteCarIds.has(c.id))
    : otherCars;
  const allVisible = [...filteredOwn, ...visibleOther];
  const hasActiveFilters = isFiltersActive(filters);

  const mapItems: MapCarItem[] = visibleOther
    .filter((c) => c.lat != null && c.lng != null)
    .map((c) => ({ id: c.id, brand: c.brand, model: c.model, pricePerDay: c.pricePerDay, lat: c.lat!, lng: c.lng! }));

  const ownMapItems: MapCarItem[] = filteredOwn
    .filter((c) => c.lat != null && c.lng != null)
    .map((c) => ({ id: c.id, brand: c.brand, model: c.model, pricePerDay: c.pricePerDay, lat: c.lat!, lng: c.lng! }));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда авто</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setFavoritesOnly((v) => !v)} className="filter-icon-btn">
              <IonIcon icon={favoritesOnly ? bookmark : bookmarkOutline} style={favoritesOnly ? { color: '#ef4444' } : undefined} />
            </IonButton>
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
                return (
                  <CarCard key={car.id} car={carToCardData(car)} href={`/cars/${car.id}`} isOwn={isOwn} showOwnBadge={isOwn} />
                );
              })}
            </IonList>
          )}
          <IonInfiniteScroll
            onIonInfinite={async (e) => {
              await loadOtherCars(filters, offset, user?.id);
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
        <IonContent fullscreen className="map-content">
          <CarsMap cars={[...ownMapItems, ...mapItems]} />
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
        priceMax={priceMax}
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
