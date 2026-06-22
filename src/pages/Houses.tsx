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
import HouseCard, { HouseCardData } from '../components/HouseCard';
import { HouseCardSkeleton } from '../components/CardSkeletons';
import HousesMap, { MapHouseItem } from '../components/HousesMap';
import HousesFilterModal from '../components/HousesFilterModal';
import { getHousesFiltered, getMyHouses, getMaxPrice, getHousePins, updateHouse, deleteHouse, House } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { HouseFilters, DEFAULT_FILTERS, isFiltersActive, applyFilters } from '../data/houseFilters';
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
  active: h.active,
});

const Houses: React.FC = () => {
  const { user } = useAuth();
  const { navigate: addHouse, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-house');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<HouseFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [myHouses, setMyHouses] = useState<House[]>([]);
  const [otherHouses, setOtherHouses] = useState<House[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(0);
  const [mapPins, setMapPins] = useState<MapHouseItem[]>([]);

  const loadMapPins = useCallback(async (currentFilters: HouseFilters) => {
    const lf = currentFilters.locationFilter;
    const pins = await getHousePins({
      city: lf.city,
      district: !lf.city ? lf.district : undefined,
      citiesInDistrict: !lf.city ? lf.citiesInDistrict : undefined,
      houseType: currentFilters.houseType,
      priceMin: currentFilters.priceMin,
      priceMax: currentFilters.priceMax,
      minRooms: currentFilters.minRooms,
      minGuests: currentFilters.minGuests,
      sort: currentFilters.sort,
    });
    setMapPins(pins.map((p) => ({ id: p.id, pricePerNight: p.pricePerNight, lat: p.lat, lng: p.lng, name: p.name, photo: p.photo, location: p.location, rooms: p.rooms, guests: p.guests })));
  }, []);

  const loadOtherHouses = useCallback(async (currentFilters: HouseFilters, currentOffset: number, userId?: string) => {
    const lf = currentFilters.locationFilter;
    const { data, hasMore: more } = await getHousesFiltered(
      {
        city: lf.city,
        district: !lf.city ? lf.district : undefined,
        citiesInDistrict: !lf.city ? lf.citiesInDistrict : undefined,
        houseType: currentFilters.houseType,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        minRooms: currentFilters.minRooms,
        minGuests: currentFilters.minGuests,
        excludeUserId: userId,
        sort: currentFilters.sort,
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
    const currentFilters = filters;
    Promise.all([
      getMaxPrice('houses_max_price'),
      userId ? getMyHouses() : Promise.resolve([]),
      loadOtherHouses(currentFilters, 0, userId),
      loadMapPins(currentFilters),
    ])
      .then(([max, my]) => {
        setPriceMax(max);
        setMyHouses(my as House[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const handleApplyFilters = (newFilters: HouseFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadOtherHouses(newFilters, 0, user?.id).catch(console.error);
    loadMapPins(newFilters).catch(console.error);
  };

  const handleReset = () => {
    handleApplyFilters(DEFAULT_FILTERS);
  };

  const handleRefresh = async (e: CustomEvent) => {
    const userId = user?.id;
    setOffset(0);
    await Promise.all([
      getMaxPrice('houses_max_price').then(setPriceMax),
      userId ? getMyHouses().then(setMyHouses) : Promise.resolve(),
      loadOtherHouses(filters, 0, userId),
      loadMapPins(filters),
    ]).catch(console.error);
    (e.target as HTMLIonRefresherElement).complete();
  };

  const filteredOwn = applyFilters(myHouses, filters);
  const allVisible = [...filteredOwn, ...otherHouses];
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
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
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
                const handleToggleActive = isOwn ? async () => {
                  const id = house.id; const next = !house.active;
                  setMyHouses(prev => prev.map(h => h.id === id ? { ...h, active: next } : h));
                  setOtherHouses(prev => prev.map(h => h.id === id ? { ...h, active: next } : h));
                  try { await updateHouse(id, { active: next }); } catch (err) { console.error(err); }
                } : undefined;
                const handleDelete = isOwn ? async () => {
                  const id = house.id;
                  setMyHouses(prev => prev.filter(h => h.id !== id));
                  setOtherHouses(prev => prev.filter(h => h.id !== id));
                  try { await deleteHouse(id); } catch (err) { console.error(err); }
                } : undefined;
                return (
                  <HouseCard
                    key={house.id}
                    house={houseToCardData(house)}
                    href={`/houses/${house.id}`}
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
        <IonContent className="map-content">
          <HousesMap houses={mapPins} userLocation={mapUserLocation} />
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
