import React from 'react';
import { useHistory } from 'react-router-dom';
import { FavoritePin } from '../lib/api';
import { transmissionLabel } from '../data/carFilters';
import { formatDays } from '../lib/formatDays';
import YandexMap from './YandexMap';
import './FavoritesMap.css';

const TYPE_ROUTE: Record<string, string> = { car: 'cars', house: 'houses', tour: 'tours' };
const TYPE_PRICE_LABEL: Record<string, string> = { car: 'день', house: 'ночь', tour: 'чел.' };

interface Props {
  pins: FavoritePin[];
}

const FavoritesMap: React.FC<Props> = ({ pins }) => {
  const history = useHistory();
  return (
    <YandexMap
      items={pins}
      getItemPrice={(p) => p.price}
      getItemId={(p) => String(p.id) + p.type}
      markerClassName="fav-map-marker"
      clusterClassName="fav-map-cluster"
      containerClassName="favorites-map-container"
      renderPanel={(pin, onClose) => {
        const route = `/${TYPE_ROUTE[pin.type] ?? pin.type + 's'}/${pin.id}`;
        const priceLabel = TYPE_PRICE_LABEL[pin.type] ?? '';
        return (
          <div className="map-top-panel">
            <button className="map-top-panel__close" onClick={onClose}>×</button>
            {pin.photo && <img className="map-top-panel__photo" src={pin.photo} alt={pin.name} />}
            <div className="map-top-panel__body">
              <div className="map-top-panel__title">{pin.name}</div>
              {pin.location && <div className="map-top-panel__location">📍 {pin.location}</div>}
              {pin.description && pin.type === 'tour' && (
                <div className="map-top-panel__desc">{pin.description}</div>
              )}
              <div className="map-top-panel__chips">
                {pin.type === 'house' && pin.rooms != null && <span className="map-top-panel__chip">🛏 {pin.rooms} комн.</span>}
                {pin.type === 'house' && pin.guests != null && <span className="map-top-panel__chip">👤 {pin.guests} гостей</span>}
                {pin.type === 'car' && pin.seats != null && <span className="map-top-panel__chip">👤 {pin.seats} мест</span>}
                {pin.type === 'car' && pin.transmission && <span className="map-top-panel__chip">⚙ {transmissionLabel(pin.transmission)}</span>}
                {pin.type === 'tour' && pin.duration != null && <span className="map-top-panel__chip">⏱ {formatDays(pin.duration)}</span>}
                {pin.type === 'tour' && pin.meetingPoint && <span className="map-top-panel__chip">📍 Выезд: {pin.meetingPoint}</span>}
              </div>
              <div className="map-top-panel__footer">
                <div>
                  <span className="map-top-panel__price">{pin.price.toLocaleString('ru-RU')} ₽</span>
                  {priceLabel && <span className="map-top-panel__per"> / {priceLabel}</span>}
                </div>
                <button className="map-top-panel__open" onClick={() => history.push(route)}>Открыть</button>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
};

export default FavoritesMap;
