import React, { useEffect, useRef, useState } from 'react';

const YANDEX_API_KEY = '57398362-80f4-4fe3-a697-4fbd3ceb320c';
const SCRIPT_ID = 'ymaps3-script';

export interface MapItem {
  id: string | number;
  name?: string;
  photo?: string;
  lat: number;
  lng: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

interface YandexMapProps<T extends MapItem> {
  items: T[];
  userLocation?: UserLocation;
  getItemPrice: (item: T) => number;
  getItemId?: (item: T) => string;
  markerClassName: string;
  clusterClassName: string;
  containerClassName: string;
  renderPanel: (item: T, onClose: () => void) => React.ReactNode;
}

function YandexMap<T extends MapItem>({
  items,
  userLocation,
  getItemPrice,
  getItemId,
  markerClassName,
  clusterClassName,
  containerClassName,
  renderPanel,
}: YandexMapProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
      const { YMapClusterer, clusterByGrid } = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');

      const center: [number, number] = userLocation ? [userLocation.lng, userLocation.lat] : [47.5, 42.5];
      const zoom = userLocation?.zoom ?? 7;
      const map = new YMap(containerRef.current, { location: { center, zoom } });

      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      const features = items.map((item) => ({
        type: 'Feature',
        id: getItemId ? getItemId(item) : String(item.id),
        geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
        properties: item,
      }));

      const clusterer = new YMapClusterer({
        method: clusterByGrid({ gridSize: 64 }),
        features,
        marker(feature: any) {
          const item: T = feature.properties;
          const el = document.createElement('div');
          el.className = markerClassName;
          el.innerHTML = `
            ${item.name ? `<div class="marker-name">${item.name}</div>` : ''}
            <div class="marker-price">₽${getItemPrice(item).toLocaleString('ru-RU')}</div>
          `;
          el.addEventListener('click', () => setSelectedItem(item));
          return new YMapMarker({ coordinates: feature.geometry.coordinates }, el);
        },
        cluster(coordinates: [number, number], clusterFeatures: any[]) {
          const el = document.createElement('div');
          el.className = clusterClassName;
          el.textContent = String(clusterFeatures.length);
          el.addEventListener('click', () => {
            const lngs = clusterFeatures.map((f: any) => f.geometry.coordinates[0]);
            const lats = clusterFeatures.map((f: any) => f.geometry.coordinates[1]);
            const bounds: [[number, number], [number, number]] = [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)],
            ];
            map.setLocation({ bounds, duration: 300 });
          });
          return new YMapMarker({ coordinates }, el);
        },
      });

      map.addChild(clusterer);
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
    };
  }, [items, userLocation]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} className={containerClassName} />
      {selectedItem && renderPanel(selectedItem, () => setSelectedItem(null))}
    </div>
  );
}

export default YandexMap;
