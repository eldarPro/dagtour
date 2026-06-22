import React from 'react';
import { useHistory } from 'react-router-dom';
import YandexMap, { MapItem, UserLocation } from './YandexMap';
import './HousesMap.css';

export interface MapHouseItem extends MapItem {
  pricePerNight: number;
  location?: string;
  rooms?: number;
  guests?: number;
}

interface Props {
  houses: MapHouseItem[];
  userLocation?: UserLocation;
}

const HousesMap: React.FC<Props> = ({ houses, userLocation }) => {
  const history = useHistory();
  return (
    <YandexMap
      items={houses}
      userLocation={userLocation}
      getItemPrice={(h) => h.pricePerNight}
      markerClassName="house-map-marker"
      clusterClassName="house-map-cluster"
      containerClassName="houses-map-container"
      renderPanel={(house, onClose) => (
        <div className="map-top-panel">
          <button className="map-top-panel__close" onClick={onClose}>×</button>
          {house.photo && <img className="map-top-panel__photo" src={house.photo} alt={house.name} />}
          <div className="map-top-panel__body">
            <div className="map-top-panel__title">{house.name}</div>
            {house.location && <div className="map-top-panel__location">📍 {house.location}</div>}
            <div className="map-top-panel__chips">
              {house.rooms != null && <span className="map-top-panel__chip">🛏 {house.rooms} комн.</span>}
              {house.guests != null && <span className="map-top-panel__chip">👤 {house.guests} гостей</span>}
            </div>
            <div className="map-top-panel__footer">
              <div>
                <span className="map-top-panel__price">{house.pricePerNight.toLocaleString('ru-RU')} ₽</span>
                <span className="map-top-panel__per"> / ночь</span>
              </div>
              <button className="map-top-panel__open" onClick={() => history.push(`/houses/${house.id}`)}>
                Открыть
              </button>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default HousesMap;
