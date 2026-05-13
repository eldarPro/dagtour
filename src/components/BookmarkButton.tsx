import React from 'react';
import { IonIcon } from '@ionic/react';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { useFavorites } from '../lib/favoritesContext';
import { FavoriteType } from '../lib/favorites';
import './BookmarkButton.css';

interface Props {
  type: FavoriteType;
  id: number;
}

const BookmarkButton: React.FC<Props> = ({ type, id }) => {
  const { isFavorited, toggle } = useFavorites();
  const active = isFavorited(type, id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(type, id);
  };

  return (
    <button
      className={`bookmark-btn${active ? ' bookmark-btn--active' : ''}`}
      onClick={handleClick}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <IonIcon icon={active ? bookmark : bookmarkOutline} />
    </button>
  );
};

export default BookmarkButton;
