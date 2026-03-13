import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Car } from '../data/mockData';
import './CarsMap.css';

const YANDEX_API_KEY = '57398362-80f4-4fe3-a697-4fbd3ceb320c';
const SCRIPT_ID = 'ymaps3-script';

interface Props {
  cars: Car[];
}

const CarsMap: React.FC<Props> = ({ cars }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const history = useHistory();

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = (window as any).ymaps3;
      await ymaps3.ready;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapMarker,
      } = ymaps3;

      const map = new YMap(containerRef.current, {
        location: {
          center: [47.5, 42.5],
          zoom: 7,
        },
      });

      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      cars.forEach((car) => {
        const el = document.createElement('div');
        el.className = 'car-map-marker';
        el.innerHTML = `<span>₽${car.pricePerDay.toLocaleString('ru-RU')}</span>`;
        el.addEventListener('click', () => history.push(`/cars/${car.id}`));

        const marker = new YMapMarker(
          { coordinates: [car.lng, car.lat] },
          el
        );
        map.addChild(marker);
      });

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
  }, [cars, history]);

  return <div ref={containerRef} className="cars-map-container" />;
};

export default CarsMap;

