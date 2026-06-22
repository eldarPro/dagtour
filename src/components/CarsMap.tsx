import React from 'react';
import { useHistory } from 'react-router-dom';
import { transmissionLabel } from '../data/carFilters';
import YandexMap, { MapItem, UserLocation } from './YandexMap';
import './CarsMap.css';

export interface MapCarItem extends MapItem {
  pricePerDay: number;
  location?: string;
  seats?: number;
  transmission?: string;
  year?: number;
}

interface Props {
  cars: MapCarItem[];
  userLocation?: UserLocation;
}

const CarsMap: React.FC<Props> = ({ cars, userLocation }) => {
  const history = useHistory();
  return (
    <YandexMap
      items={cars}
      userLocation={userLocation}
      getItemPrice={(c) => c.pricePerDay}
      markerClassName="car-map-marker"
      clusterClassName="car-map-cluster"
      containerClassName="cars-map-container"
      renderPanel={(car, onClose) => (
        <div className="map-top-panel">
          <button className="map-top-panel__close" onClick={onClose}>×</button>
          {car.photo && <img className="map-top-panel__photo" src={car.photo} alt={car.name} />}
          <div className="map-top-panel__body">
            <div className="map-top-panel__title">{car.name}</div>
            {car.location && <div className="map-top-panel__location">📍 {car.location}</div>}
            <div className="map-top-panel__chips">
              {car.seats != null && <span className="map-top-panel__chip">👤 {car.seats} мест</span>}
              {car.transmission && <span className="map-top-panel__chip">⚙ {transmissionLabel(car.transmission)}</span>}
              {car.year && !car.seats && <span className="map-top-panel__chip">{car.year} г.</span>}
            </div>
            <div className="map-top-panel__footer">
              <div>
                <span className="map-top-panel__price">{car.pricePerDay.toLocaleString('ru-RU')} ₽</span>
                <span className="map-top-panel__per"> / день</span>
              </div>
              <button className="map-top-panel__open" onClick={() => history.push(`/cars/${car.id}`)}>
                Открыть
              </button>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default CarsMap;
