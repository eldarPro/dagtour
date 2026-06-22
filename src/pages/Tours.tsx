import React, { useState, useCallback } from 'react';
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
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import { optionsOutline, addOutline } from 'ionicons/icons';
import TourCard from '../components/TourCard';
import { TourCardSkeleton } from '../components/CardSkeletons';
import ToursFilterModal from '../components/ToursFilterModal';
import { getToursFiltered, getMaxPrice, updateTour, deleteTour, Tour } from '../lib/api';
import { TourFilters, DEFAULT_FILTERS, isFiltersActive, durationToParams } from '../data/tourFilters';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useAuth } from '../lib/auth';
import './Tours.css';

const PAGE_SIZE = 10;

const Tours: React.FC = () => {
  const { navigate: addTour, showAlert, setShowAlert, goToLogin } = useAuthGuard('/add-tour');
  const { user } = useAuth();
  const [filters, setFilters] = useState<TourFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(0);

  const loadTours = useCallback(async (currentFilters: TourFilters, currentOffset: number) => {
    const lf = currentFilters.locationFilter;
    const { data, hasMore: more } = await getToursFiltered(
      {
        city: lf.city,
        district: !lf.city ? lf.district : undefined,
        citiesInDistrict: !lf.city ? lf.citiesInDistrict : undefined,
        ...durationToParams(currentFilters.duration),
        meetingPoint: currentFilters.meetingPoint,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        sort: currentFilters.sort,
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

  useIonViewWillEnter(() => {
    setLoading(true);
    Promise.all([
      getMaxPrice('tours_max_price'),
      loadTours(DEFAULT_FILTERS, 0),
    ])
      .then(([max]) => {
        setPriceMax(max);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const handleApplyFilters = (newFilters: TourFilters) => {
    setFilters(newFilters);
    setOffset(0);
    loadTours(newFilters, 0).catch(console.error);
  };

  const handleReset = () => {
    handleApplyFilters(DEFAULT_FILTERS);
  };

  const handleRefresh = async (e: CustomEvent) => {
    setOffset(0);
    await Promise.all([
      getMaxPrice('tours_max_price').then(setPriceMax),
      loadTours(filters, 0),
    ]).catch(console.error);
    (e.target as HTMLIonRefresherElement).complete();
  };

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
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
          {loading ? (
            <IonList lines="none" className="card-list">
              {Array.from({ length: 4 }).map((_, i) => <TourCardSkeleton key={i} />)}
            </IonList>
          ) : tours.length === 0 ? (
            <div className="no-results">
              <p>Ничего не найдено</p>
              <IonButton fill="clear" onClick={handleReset}>
                Сбросить фильтры
              </IonButton>
            </div>
          ) : (
            <IonList lines="none" className="card-list">
              {tours.map((tour) => {
                const isOwn = !!user && tour.userId === user.id;
                const handleToggleActive = isOwn ? async () => {
                  const id = tour.id; const next = !tour.active;
                  setTours(prev => prev.map(t => t.id === id ? { ...t, active: next } : t));
                  try { await updateTour(id, { active: next }); } catch (err) { console.error(err); }
                } : undefined;
                const handleDelete = isOwn ? async () => {
                  const id = tour.id;
                  setTours(prev => prev.filter(t => t.id !== id));
                  try { await deleteTour(id); } catch (err) { console.error(err); }
                } : undefined;
                return (
                  <TourCard
                    key={tour.id}
                    tour={tour}
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
