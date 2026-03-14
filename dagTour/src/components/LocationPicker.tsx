import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonInput } from '@ionic/react';
import './LocationPicker.css';

// private readonly API_KEY = '87ebf81434b1dbdc853638288ea6693590ea3c97';
// private readonly BASE_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs';
const DADATA_TOKEN = '87ebf81434b1dbdc853638288ea6693590ea3c97';

const YANDEX_API_KEY = '57398362-80f4-4fe3-a697-4fbd3ceb320c';
const SCRIPT_ID = 'ymaps3-script';

interface DadataSuggestion {
  value: string;
  data: {
    geo_lat: string | null;
    geo_lon: string | null;
  };
}

export interface LocationPickerProps {
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  onChange: (loc: { address: string; lat: number; lng: number }) => void;
}

type Mode = 'search' | 'map';

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress,
  initialLat,
  initialLng,
  onChange,
}) => {
  const [mode, setMode] = useState<Mode>('search');
  const [selected, setSelected] = useState<{ address: string; lat: number; lng: number } | null>(
    initialAddress && initialLat != null && initialLng != null
      ? { address: initialAddress, lat: initialLat, lng: initialLng }
      : null
  );

  // Search mode state
  const [query, setQuery] = useState(initialAddress ?? '');
  const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map mode refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Map coords hint
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Token ${DADATA_TOKEN}`,
          },
          body: JSON.stringify({
            query: q,
            count: 7,
            to_bound: { value: 'house' },
            locations: [{ region: 'Дагестан' }],
          }),
        }
      );
      const json = await res.json();
      const filtered: DadataSuggestion[] = (json.suggestions ?? []).filter(
        (s: DadataSuggestion) => s.data.geo_lat && s.data.geo_lon
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSelectSuggestion = (s: DadataSuggestion) => {
    const lat = parseFloat(s.data.geo_lat!);
    const lng = parseFloat(s.data.geo_lon!);
    const loc = { address: s.value, lat, lng };
    setSelected(loc);
    setQuery(s.value);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(loc);
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Token ${DADATA_TOKEN}`,
          },
          body: JSON.stringify({ lat, lon: lng, count: 1 }),
        }
      );
      const json = await res.json();
      const first = json.suggestions?.[0];
      if (first?.value) return first.value as string;
    } catch {
      // fall through
    }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  useEffect(() => {
    if (mode !== 'map') return;

    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapMarker,
        YMapListener,
      } = ymaps3;

      const hasInitial = selected != null;
      const center: [number, number] = hasInitial
        ? [selected!.lng, selected!.lat]
        : [47.5, 42.5];
      const zoom = hasInitial ? 14 : 7;

      const map = new YMap(mapContainerRef.current, {
        location: { center, zoom },
      });

      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      // Show initial marker if location exists
      if (hasInitial) {
        const el = document.createElement('div');
        el.className = 'location-map-marker';
        const m = new YMapMarker({ coordinates: [selected!.lng, selected!.lat] }, el);
        map.addChild(m);
        markerRef.current = m;
      }

      const listener = new YMapListener({
        layer: 'any',
        onClick: (_: any, event: any) => {
          const [lng, lat] = event.coordinates as [number, number];

          // Remove old marker
          if (markerRef.current) {
            map.removeChild(markerRef.current);
            markerRef.current = null;
          }

          // Add new marker
          const el = document.createElement('div');
          el.className = 'location-map-marker';
          const m = new YMapMarker({ coordinates: [lng, lat] }, el);
          map.addChild(m);
          markerRef.current = m;

          setMapCoords({ lat, lng });

          // Reverse geocode and update
          reverseGeocode(lat, lng).then((address) => {
            if (cancelled) return;
            const loc = { address, lat, lng };
            setSelected(loc);
            onChange(loc);
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
      if (mapRef.current) {
        mapRef.current.destroy?.();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="location-picker">
      <IonSegment
        mode="md"
        value={mode}
        onIonChange={(e) => setMode(e.detail.value as Mode)}
      >
        <IonSegmentButton value="search">
          <IonLabel>Из списка</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="map">
          <IonLabel>На карте</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {mode === 'search' && (
        <div className="location-search">
          <IonInput
            placeholder="Введите адрес..."
            value={query}
            onIonChange={(e) => handleQueryChange(e.detail.value ?? '')}
            clearInput
          />
          {showSuggestions && (
            <div className="location-suggestions">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="location-suggestion-item"
                  onMouseDown={() => handleSelectSuggestion(s)}
                >
                  {s.value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'map' && (
        <div className="location-map-wrap">
          <div ref={mapContainerRef} className="location-map" />
          {mapCoords && (
            <div className="location-map-hint">
              {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="location-selected">✓ {selected.address}</div>
      )}
    </div>
  );
};

export default LocationPicker;
