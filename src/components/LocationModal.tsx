import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonFooter,
  IonAlert,
} from '@ionic/react';
import { closeOutline, mapOutline, arrowBackOutline } from 'ionicons/icons';
import { cities, districts, Place } from '../data/dagestanLocations';
import './LocationModal.css';

const YANDEX_API_KEY = '57398362-80f4-4fe3-a697-4fbd3ceb320c';
const SCRIPT_ID = 'ymaps3-script';

const DAGESTAN_BOUNDS = {
  minLat: 41.2, maxLat: 44.9,
  minLng: 45.8, maxLng: 48.6,
};

const isInDagestan = (lat: number, lng: number) =>
  lat >= DAGESTAN_BOUNDS.minLat && lat <= DAGESTAN_BOUNDS.maxLat &&
  lng >= DAGESTAN_BOUNDS.minLng && lng <= DAGESTAN_BOUNDS.maxLng;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (loc: { address: string; lat: number; lng: number }) => void;
}

type Mode = 'list' | 'map';

interface SearchResult extends Place {
  district?: string;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${lng},${lat}&format=json&results=1&lang=ru_RU`;
    const res = await fetch(url);
    const json = await res.json();
    const geoObject = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    const components: Array<{ kind: string; name: string }> =
      geoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components ?? [];
    const get = (kind: string) => components.find(c => c.kind === kind)?.name;
    const abbreviateStreet = (s: string) => s
      .replace(/^улица\s+/i, 'ул. ')
      .replace(/^переулок\s+/i, 'пер. ')
      .replace(/^проспект\s+/i, 'пр-т ')
      .replace(/^бульвар\s+/i, 'бул. ')
      .replace(/^площадь\s+/i, 'пл. ')
      .replace(/^шоссе\s+/i, 'ш. ')
      .replace(/^набережная\s+/i, 'наб. ')
      .replace(/^проезд\s+/i, 'пр-д ');
    const house = get('house');
    const street = get('street')?.replace(/\s*улица$/i, '').trimEnd();
    const streetFormatted = street ? abbreviateStreet(street) : undefined;
    const locality = get('locality');
    const area = get('area');
    const parts: string[] = [];
    if (locality) parts.push(locality);
    else if (area) parts.push(area);
    if (streetFormatted && house) parts.push(`${streetFormatted}, ${house}`);
    else if (streetFormatted) parts.push(streetFormatted);
    if (parts.length > 0) return parts.join(', ');
    const text = geoObject?.metaDataProperty?.GeocoderMetaData?.text;
    const cleaned = text
      ?.replace(/^Россия,\s*/i, '')
      .replace(/^Республика Дагестан,\s*/i, '')
      .trim();
    return cleaned ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

const LocationModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [mode, setMode] = useState<Mode>('list');
  const [query, setQuery] = useState('');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapAddress, setMapAddress] = useState<string | null>(null);

  const [outsideAlert, setOutsideAlert] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setQuery('');
      setMapCoords(null);
      setMapAddress(null);
      setOutsideAlert(false);
    }
  }, [isOpen]);

  // Инициализация карты
  useEffect(() => {
    if (!isOpen || mode !== 'map') return;

    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener } = ymaps3;

      const map = new YMap(mapContainerRef.current, {
        location: { center: [47.5, 42.5], zoom: 7 },
        minZoom: 6,
        maxZoom: 17,
      });
      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      const listener = new YMapListener({
        layer: 'any',
        onClick: (_: any, event: any) => {
          const [lng, lat] = event.coordinates as [number, number];

          if (!isInDagestan(lat, lng)) {
            if (!cancelled) setOutsideAlert(true);
            return;
          }

          if (markerRef.current) {
            map.removeChild(markerRef.current);
          }
          const el = document.createElement('div');
          el.className = 'location-map-marker';
          const marker = new YMapMarker({ coordinates: [lng, lat] }, el);
          map.addChild(marker);
          markerRef.current = marker;

          setMapCoords({ lat, lng });
          setMapAddress('Загрузка адреса...');
          reverseGeocode(lat, lng).then((address) => {
            if (!cancelled) setMapAddress(address);
          });
        },
      });
      map.addChild(listener);
      mapRef.current = map;
    };

    const loadAndInit = () => {
      if ((window as any).ymaps3) {
        initMap();
      } else if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `https://api-maps.yandex.ru/v3/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        document.getElementById(SCRIPT_ID)!.addEventListener('load', initMap);
      }
    };

    loadAndInit();

    return () => {
      cancelled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen, mode]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const city of cities) {
      if (city.name.toLowerCase().includes(q)) results.push(city);
    }
    for (const d of districts) {
      for (const s of d.settlements) {
        if (s.name.toLowerCase().includes(q)) {
          results.push({ ...s, district: d.name });
        }
      }
    }
    return results;
  }, [query]);

  const handleSelectPlace = (place: Place) => {
    onSelect({ address: place.name, lat: place.lat, lng: place.lng });
  };

  const handleConfirmMap = () => {
    if (!mapCoords || !mapAddress || mapAddress === 'Загрузка адреса...') return;
    onSelect({ address: mapAddress, lat: mapCoords.lat, lng: mapCoords.lng });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {mode === 'map' ? (
              <IonButton onClick={() => setMode('list')}>
                <IonIcon slot="icon-only" icon={arrowBackOutline} />
              </IonButton>
            ) : (
              <IonButton onClick={onClose}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            )}
          </IonButtons>
          <IonTitle>{mode === 'map' ? 'Выбор на карте' : 'Местоположение'}</IonTitle>
        </IonToolbar>
        {mode === 'list' && (
          <IonToolbar>
            <IonSearchbar
              value={query}
              onIonInput={(e) => setQuery((e.detail.value as string) ?? '')}
              placeholder="Поиск населённого пункта..."
              debounce={150}
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent>
        {mode === 'map' ? (
          <>
            <div ref={mapContainerRef} className="location-modal-map" />
            <IonAlert
              isOpen={outsideAlert}
              onDidDismiss={() => setOutsideAlert(false)}
              header="Вне зоны"
              message="Пожалуйста, выберите точку на территории Дагестана."
              buttons={['OK']}
            />
            {mapAddress && (
              <div className="location-modal-coords">{mapAddress}</div>
            )}
          </>
        ) : query.trim() ? (
          <IonList lines="inset">
            {searchResults.length === 0 ? (
              <IonItem>
                <IonLabel color="medium">Ничего не найдено</IonLabel>
              </IonItem>
            ) : (
              searchResults.map((place) => (
                <IonItem
                  button
                  key={`${place.name}-${place.lat}`}
                  onClick={() => handleSelectPlace(place)}
                >
                  <IonLabel>{place.name}</IonLabel>
                  {place.district && (
                    <IonNote slot="end" className="location-district-note">
                      {place.district.replace(' район', ' р-н')}
                    </IonNote>
                  )}
                </IonItem>
              ))
            )}
          </IonList>
        ) : (
          <IonList lines="inset">
            <IonListHeader className="location-list-header">Города</IonListHeader>
            {cities.map((city) => (
              <IonItem button key={city.name} onClick={() => handleSelectPlace(city)}>
                <IonLabel>{city.name}</IonLabel>
              </IonItem>
            ))}
            {districts.map((d) => (
              <React.Fragment key={d.name}>
                <IonListHeader className="location-list-header">{d.name}</IonListHeader>
                {d.settlements.map((s) => (
                  <IonItem button key={`${d.name}-${s.name}`} onClick={() => handleSelectPlace(s)}>
                    <IonLabel>{s.name}</IonLabel>
                  </IonItem>
                ))}
              </React.Fragment>
            ))}
          </IonList>
        )}
      </IonContent>

      <IonFooter>
        <div className="location-footer">
          {mode === 'map' ? (
            <IonButton
              expand="block"
              className="location-confirm-btn"
              disabled={!mapCoords || !mapAddress || mapAddress === 'Загрузка адреса...'}
              onClick={handleConfirmMap}
            >
              Применить
            </IonButton>
          ) : (
            <div className="location-map-suggestion">
              <p>Если нужен точный адрес до улицы или дома — выберите точку на карте</p>
              <IonButton expand="block" fill="outline" onClick={() => setMode('map')}>
                <IonIcon slot="start" icon={mapOutline} />
                Выбрать на карте
              </IonButton>
            </div>
          )}
        </div>
      </IonFooter>
    </IonModal>
  );
};

export default LocationModal;
