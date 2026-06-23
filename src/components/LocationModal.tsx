import React, { useState, useEffect, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonFooter,
  IonAlert,
  IonSpinner,
} from '@ionic/react';
import { closeOutline, searchOutline, locateOutline } from 'ionicons/icons';
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

const LocationModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapAddress, setMapAddress] = useState<string | null>(null);
  const [mapCity, setMapCity] = useState<string | null>(null);
  const [mapDistrict, setMapDistrict] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<string | null>(null);
  const [outsideAlert, setOutsideAlert] = useState(false);
  const [mapPresented, setMapPresented] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const markerLabelRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setIsSearching(false);
      setShowSuggestions(false);
      setMapCoords(null);
      setMapAddress(null);
      setMapCity(null);
      setMapDistrict(null);
      setMapRegion(null);
      setOutsideAlert(false);
    } else {
      setMapPresented(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length >= 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await dadataService.suggestAddress(query.trim());
        setSuggestions(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSuggestions([]);
      setIsSearching(false);
      if (query.trim().length === 0) setShowSuggestions(false);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  useEffect(() => {
    if (!mapPresented) return;

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

          const wrapper = document.createElement('div');
          wrapper.className = 'location-marker-wrapper';
          const label = document.createElement('div');
          label.className = 'location-marker-label loading';
          label.textContent = '...';
          const pin = document.createElement('div');
          pin.className = 'location-map-marker';
          wrapper.appendChild(label);
          wrapper.appendChild(pin);

          const marker = new YMapMarker({ coordinates: [lng, lat] }, wrapper);
          map.addChild(marker);
          markerRef.current = marker;
          (markerLabelRef as any).current = label;

          setMapCoords({ lat, lng });
          setMapAddress('Загрузка адреса...');
          setMapCity(null);
          setMapDistrict(null);
          setMapRegion(null);
          setShowSuggestions(false);
          reverseGeocode(lat, lng).then(({ address, city, district, region }) => {
            if (!cancelled) {
              label.textContent = address;
              label.classList.remove('loading');
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
  }, [mapPresented]);

  const placeMarkerOnMap = (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    const ymaps3 = (window as any).ymaps3;
    if (!ymaps3) return;
    const { YMapMarker } = ymaps3;
    if (markerRef.current) map.removeChild(markerRef.current);
    const el = document.createElement('div');
    el.className = 'location-map-marker';
    const marker = new YMapMarker({ coordinates: [lng, lat] }, el);
    map.addChild(marker);
    markerRef.current = marker;
    map.update({ location: { center: [lng, lat], zoom: 14, duration: 400 } });
  };

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

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setGeoLoading(false);
        if (!isInDagestan(lat, lng)) {
          setOutsideAlert(true);
          return;
        }
        const map = mapRef.current;
        if (!map) return;
        const ymaps3 = (window as any).ymaps3;
        if (!ymaps3) return;
        const { YMapMarker } = ymaps3;
        if (markerRef.current) map.removeChild(markerRef.current);

        const wrapper = document.createElement('div');
        wrapper.className = 'location-marker-wrapper';
        const label = document.createElement('div');
        label.className = 'location-marker-label loading';
        label.textContent = '...';
        const pin = document.createElement('div');
        pin.className = 'location-map-marker';
        wrapper.appendChild(label);
        wrapper.appendChild(pin);

        const marker = new YMapMarker({ coordinates: [lng, lat] }, wrapper);
        map.addChild(marker);
        markerRef.current = marker;
        map.update({ location: { center: [lng, lat], zoom: 14, duration: 400 } });

        setMapCoords({ lat, lng });
        setMapAddress('Загрузка адреса...');
        setMapCity(null);
        setMapDistrict(null);
        setMapRegion(null);

        reverseGeocode(lat, lng).then(({ address, city, district, region }) => {
          label.textContent = address;
          label.classList.remove('loading');
          setMapAddress(address);
          setMapCity(city);
          setMapDistrict(district);
          setMapRegion(region);
        });
      },
      () => {
        setGeoLoading(false);
        setGeoError(true);
      },
      { timeout: 8000 }
    );
  };

  const isAddressLoading = mapAddress === 'Загрузка адреса...';

  return (
    <IonModal
      isOpen={isOpen}
      onDidPresent={() => setMapPresented(true)}
      onDidDismiss={onClose}
      style={{ '--height': '100%', '--width': '100%', '--border-radius': '0' }}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Местоположение</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={false}>
        <div className="location-layout">
          <div className="location-search-area">
            <label htmlFor="location-search-input" className="location-search-label">
              Введите адрес и выберите из списка или укажите точку на карте
            </label>
            <div className="location-search-field-wrapper">
              <div className="location-search-box">
                <IonIcon icon={searchOutline} className="location-search-icon" />
                <input
                  ref={inputRef}
                  id="location-search-input"
                  className="location-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (query.trim().length >= 2) setShowSuggestions(true); }}
                  placeholder="Поиск по адресу или населённому пункту"
                />
                {query.length > 0 && (
                  <button className="location-search-clear" onClick={() => { setQuery(''); setShowSuggestions(false); }}>✕</button>
                )}
              </div>

            {showSuggestions && (
              <div className="location-suggestions">
                <IonList lines="inset">
                  {isSearching ? (
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
              </div>
            )}
            </div>
          </div>

          <div className="location-map-wrapper" onClick={() => setShowSuggestions(false)}>
            <div ref={mapContainerRef} className="location-modal-map" />
            {!mapCoords && (
              <div className="location-map-hint">Нажмите на карту, чтобы выбрать точку</div>
            )}
            <button className="location-geo-btn" onClick={(e) => { e.stopPropagation(); handleGeolocate(); }} disabled={geoLoading}>
              {geoLoading
                ? <IonSpinner name="crescent" className="location-geo-spinner" />
                : <IonIcon icon={locateOutline} />
              }
            </button>
          </div>
        </div>

        <IonAlert
          isOpen={outsideAlert}
          onDidDismiss={() => setOutsideAlert(false)}
          header="Вне зоны"
          message="Пожалуйста, выберите точку на территории Дагестана."
          buttons={['OK']}
        />
        <IonAlert
          isOpen={geoError}
          onDidDismiss={() => setGeoError(false)}
          header="Нет доступа"
          message="Не удалось определить местоположение. Проверьте, разрешён ли доступ к геолокации."
          buttons={['OK']}
        />
      </IonContent>

      {mapCoords && (
        <IonFooter>
          <div className="location-footer">
            <IonButton
              expand="block"
              className="location-confirm-btn"
              disabled={!mapAddress || isAddressLoading}
              onClick={handleConfirmMap}
            >
              Применить
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonModal>
  );
};

export default LocationModal;
