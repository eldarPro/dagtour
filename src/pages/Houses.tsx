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
import HouseCard, { HouseCardData } from '../components/HouseCard';
import { HouseCardSkeleton } from '../components/CardSkeletons';
import HousesMap, { MapHouseItem } from '../components/HousesMap';
import HousesFilterModal from '../components/HousesFilterModal';
import { getHousesFiltered, getMyHouses, getMaxPrice, getHouseLocations, House } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { HouseFilters, DEFAULT_FILTERS, isFiltersActive } from '../data/houseFilters';
import { useFavorites } from '../lib/favoritesContext';
import './Houses.css';

type ViewMode = 'list' | 'map';

const PAGE_SIZE = 10;

const houseToCardData = (h: House): HouseCardData => ({
  id: String(h.id),
  name: h.name,
  pricePerNight: h.pricePerNight,
  photo: h.photo,
  location: h.location,
  rating: h.rating,
  rooms: h.rooms,
  guests: h.guests ?? undefined,
});

const Houses: React.FC = () => {
  const { user } = useAuth();
  const { navigate: addHouse, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-house');
  const { favorites } = useFavorites();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<HouseFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [myHouses, setMyHouses] = useState<House[]>([]);
  const [otherHouses, setOtherHouses] = useState<House[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(0);
  const [locations, setLocations] = useState<string[]>(['Все']);

  useIonViewWillLeave(() => setFavoritesOnly(false));

  const loadOtherHouses = useCallback(async (currentFilters: HouseFilters, currentOffset: number, userId?: string) => {
    const { data, hasMore: more } = await getHousesFiltered(
      {
        location: currentFilters.location,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        minRooms: currentFilters.minRooms,
        minRating: currentFilters.minRating,
        minGuests: currentFilters.minGuests,
        excludeUserId: userId,
      },
      currentOffset,
      PAGE_SIZE,
    );
    if (currentOffset === 0) {
      setOtherHouses(data);
    } else {
      setOtherHouses((prev) => [...prev, ...data]);
    }
    setHasMore(more);
    setOffset(currentOffset + data.length);
  }, []);

  useIonViewWillEnter(() => {
    setLoading(true);
    const userId = user?.id;
    Promise.all([
      getMaxPrice('houses_max_price'),
      getHouseLocations(),
      userId ? getMyHouses(userId) : Promise.resolve([]),
      loadOtherHouses(DEFAULT_FILTERS, 0, userId),
    ])
      .then(([max, locs, my]) => {
        setPriceMax(max);
        setLocations(locs);
        setMyHouses(my);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const handleApplyFilters = (newFilters: HouseFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadOtherHouses(newFilters, 0, user?.id).catch(console.error);
  };

  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, priceMax };
    handleApplyFilters(reset);
  };

  const favoriteHouseIds = new Set(favorites.filter((f) => f.type === 'house').map((f) => f.id));

  const filteredOwn = myHouses.filter(
    (h) =>
      h.pricePerNight >= filters.priceMin &&
      h.pricePerNight <= filters.priceMax &&
      (!favoritesOnly || favoriteHouseIds.has(h.id))
  );
  const visibleOther = favoritesOnly
    ? otherHouses.filter((h) => favoriteHouseIds.has(h.id))
    : otherHouses;
  const allVisible = [...filteredOwn, ...visibleOther];
  const hasActiveFilters = isFiltersActive(filters);

  const mapItems: MapHouseItem[] = visibleOther
    .filter((h) => h.lat != null && h.lng != null)
    .map((h) => ({ id: h.id, name: h.name, pricePerNight: h.pricePerNight, lat: h.lat!, lng: h.lng! }));

  const ownMapItems: MapHouseItem[] = filteredOwn
    .filter((h) => h.lat != null && h.lng != null)
    .map((h) => ({ id: h.id, name: h.name, pricePerNight: h.pricePerNight, lat: h.lat!, lng: h.lng! }));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда домов</IonTitle>
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
              {Array.from({ length: 4 }).map((_, i) => <HouseCardSkeleton key={i} />)}
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
              {allVisible.map((house) => {
                const isOwn = house.userId === user?.id;
                return (
                  <HouseCard key={house.id} house={houseToCardData(house)} href={`/houses/${house.id}`} isOwn={isOwn} showOwnBadge={isOwn} />
                );
              })}
            </IonList>
          )}
          <IonInfiniteScroll
            onIonInfinite={async (e) => {
              await loadOtherHouses(filters, offset, user?.id);
              (e.target as HTMLIonInfiniteScrollElement).complete();
            }}
            disabled={loading || !hasMore}
          >
            <IonInfiniteScrollContent loadingText="Загрузка..." />
          </IonInfiniteScroll>
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={addHouse}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      ) : (
        <IonContent fullscreen className="map-content">
          <HousesMap houses={[...ownMapItems, ...mapItems]} />
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={addHouse}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      )}

      <HousesFilterModal
        isOpen={filterOpen}
        filters={filters}
        priceMax={priceMax}
        locations={locations}
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

export default Houses;
