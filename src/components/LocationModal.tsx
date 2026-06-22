import React, { useState, useEffect, useRef } from 'react';
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
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonFooter,
  IonAlert,
  IonSpinner,
} from '@ionic/react';
import { closeOutline, mapOutline, arrowBackOutline } from 'ionicons/icons';
import { dadataService, formatShortAddress } from '../services/dadataService';
import type { AddressData } from '../services/dadataService';
import type { LocationValue } from './LocationPicker';
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

interface ReverseResult {
  address: string;
  city: string | null;
  district: string | null;
  region: string | null;
}

const reverseGeocode = async (lat: number, lng: number): Promise<ReverseResult> => {
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
    const province = get('province');
    const cityName = locality || area || null;
    const parts: string[] = [];
    if (locality) parts.push(locality);
    else if (area) parts.push(area);
    if (streetFormatted && house) parts.push(`${streetFormatted}, ${house}`);
    else if (streetFormatted) parts.push(streetFormatted);
    if (parts.length > 0) return { address: parts.join(', '), city: cityName, district: area || null, region: province || null };
    const text = geoObject?.metaDataProperty?.GeocoderMetaData?.text;
    const cleaned = text
      ?.replace(/^Россия,\s*/i, '')
      .replace(/^Республика Дагестан,\s*/i, '')
      .trim();
    return { address: cleaned ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: cityName, district: area || null, region: province || null };
  } catch {
    return { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: null, district: null, region: null };
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (loc: LocationValue) => void;
}

type Mode = 'list' | 'map';

const LocationModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [mode, setMode] = useState<Mode>('list');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapAddress, setMapAddress] = useState<string | null>(null);
  const [mapCity, setMapCity] = useState<string | null>(null);
  const [mapDistrict, setMapDistrict] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<string | null>(null);
  const [outsideAlert, setOutsideAlert] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setQuery('');
      setSuggestions([]);
      setIsSearching(false);
      setMapCoords(null);
      setMapAddress(null);
      setMapCity(null);
      setMapDistrict(null);
      setMapRegion(null);
      setOutsideAlert(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length >= 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await dadataService.suggestAddress(query.trim());
        setSuggestions(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

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

          if (markerRef.current) map.removeChild(markerRef.current);
          const el = document.createElement('div');
          el.className = 'location-map-marker';
          const marker = new YMapMarker({ coordinates: [lng, lat] }, el);
          map.addChild(marker);
          markerRef.current = marker;

          setMapCoords({ lat, lng });
          setMapAddress('Загрузка адреса...');
          setMapCity(null);
          setMapDistrict(null);
          setMapRegion(null);
          reverseGeocode(lat, lng).then(({ address, city, district, region }) => {
            if (!cancelled) {
              setMapAddress(address);
              setMapCity(city);
              setMapDistrict(district);
              setMapRegion(region);
            }
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

  const handleSelectSuggestion = (s: AddressData) => {
    if (!s.lat || !s.lng) return;
    onSelect({
      address: formatShortAddress(s) || s.city,
      city: s.city,
      district: s.district,
      region: s.region || undefined,
      lat: s.lat,
      lng: s.lng,
    });
  };

  const handleConfirmMap = () => {
    if (!mapCoords || !mapAddress || mapAddress === 'Загрузка адреса...') return;
    onSelect({
      address: mapAddress,
      city: mapCity || undefined,
      district: mapDistrict || undefined,
      region: mapRegion || undefined,
      lat: mapCoords.lat,
      lng: mapCoords.lng,
    });
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
              placeholder="Введите адрес или населённый пункт..."
              debounce={0}
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
        ) : (
          <IonList lines="inset">
            {query.trim().length < 2 ? (
              <IonItem>
                <IonLabel color="medium" style={{ fontSize: 14 }}>
                  Введите не менее 2 символов для поиска
                </IonLabel>
              </IonItem>
            ) : isSearching ? (
              <IonItem>
                <IonSpinner name="crescent" slot="start" />
                <IonLabel color="medium">Поиск...</IonLabel>
              </IonItem>
            ) : suggestions.length === 0 ? (
              <IonItem>
                <IonLabel color="medium">Ничего не найдено</IonLabel>
              </IonItem>
            ) : (
              suggestions.map((s, i) => (
                <IonItem
                  button
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  disabled={!s.lat || !s.lng}
                >
                  <IonLabel>{formatShortAddress(s) || s.city}</IonLabel>
                  {s.district && (
                    <IonNote slot="end" className="location-district-note">
                      {s.district}
                    </IonNote>
                  )}
                </IonItem>
              ))
            )}
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
