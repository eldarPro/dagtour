import React, { useState, useEffect, useCallback } from 'react';
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
  IonFab,
  IonFabButton,
  IonAlert,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillLeave,
} from '@ionic/react';
import { optionsOutline, addOutline, bookmarkOutline, bookmark } from 'ionicons/icons';
import TourCard from '../components/TourCard';
import { TourCardSkeleton } from '../components/CardSkeletons';
import ToursFilterModal from '../components/ToursFilterModal';
import { getToursFiltered, getMaxPrice, getTourRoutePoints, Tour } from '../lib/api';
import { TourFilters, DEFAULT_FILTERS, isFiltersActive } from '../data/tourFilters';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favoritesContext';
import './Tours.css';

const PAGE_SIZE = 10;

const Tours: React.FC = () => {
  const { navigate: addTour, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-tour');
  const { user } = useAuth();
  const { favorites } = useFavorites();
  useIonViewWillLeave(() => setFavoritesOnly(false));
  const [filters, setFilters] = useState<TourFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(0);
  const [routePoints, setRoutePoints] = useState<string[]>(['Все']);

  const loadTours = useCallback(async (currentFilters: TourFilters, currentOffset: number) => {
    const { data, hasMore: more } = await getToursFiltered(
      {
        duration: currentFilters.duration,
        routePoint: currentFilters.routePoint,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
      },
      currentOffset,
      PAGE_SIZE,
    );
    if (currentOffset === 0) {
      setTours(data);
    } else {
      setTours((prev) => [...prev, ...data]);
    }
    setHasMore(more);
    setOffset(currentOffset + data.length);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMaxPrice('tours_max_price'),
      getTourRoutePoints(),
      loadTours(DEFAULT_FILTERS, 0),
    ])
      .then(([max, points]) => {
        setPriceMax(max);
        setRoutePoints(points);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadTours]);

  const handleApplyFilters = (newFilters: TourFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadTours(newFilters, 0).catch(console.error);
  };

  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, priceMax };
    handleApplyFilters(reset);
  };

  const favoriteTourIds = new Set(favorites.filter((f) => f.type === 'tour').map((f) => f.id));
  const visible = favoritesOnly ? tours.filter((t) => favoriteTourIds.has(t.id)) : tours;
  const hasActiveFilters = isFiltersActive(filters);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Направления туров</IonTitle>
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
      </IonHeader>
      <IonContent fullscreen className="list-content">
        {loading ? (
          <IonList lines="none" className="card-list">
            {Array.from({ length: 4 }).map((_, i) => <TourCardSkeleton key={i} />)}
          </IonList>
        ) : visible.length === 0 ? (
          <div className="no-results">
            <p>Ничего не найдено</p>
            <IonButton fill="clear" onClick={handleReset}>
              Сбросить фильтры
            </IonButton>
          </div>
        ) : (
          <IonList lines="none" className="card-list">
            {visible.map((tour) => (
              <TourCard key={tour.id} tour={tour} isOwn={!!user && tour.userId === user.id} showOwnBadge={!!user && tour.userId === user.id} />
            ))}
          </IonList>
        )}
        <IonInfiniteScroll
          onIonInfinite={async (e) => {
            await loadTours(filters, offset);
            (e.target as HTMLIonInfiniteScrollElement).complete();
          }}
          disabled={loading || !hasMore}
        >
          <IonInfiniteScrollContent loadingText="Загрузка..." />
        </IonInfiniteScroll>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={addTour}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <ToursFilterModal
        isOpen={filterOpen}
        filters={filters}
        priceMax={priceMax}
        routePoints={routePoints}
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

export default Tours;
