import React, { useEffect, useState } from 'react';
import { HouseFilters, DEFAULT_FILTERS, PRICE_MAX } from '../data/houseFilters';
import { fetchHouseTypes } from '../lib/api';
import LocationFilterPicker from './LocationFilterPicker';
import FilterModal from './FilterModal';

interface Props {
  isOpen: boolean;
  filters: HouseFilters;
  priceMax: number;
  onClose: () => void;
  onApply: (filters: HouseFilters) => void;
}

const HousesFilterModal: React.FC<Props> = ({ isOpen, filters, priceMax, onClose, onApply }) => {
  const [houseTypes, setHouseTypes] = useState<string[]>(['Все']);

  useEffect(() => {
    fetchHouseTypes().then((types) => setHouseTypes(['Все', ...types]));
  }, []);

  return (
    <FilterModal isOpen={isOpen} filters={filters} defaultFilters={DEFAULT_FILTERS} onClose={onClose} onApply={onApply}>
      {(local, setLocal) => (
        <>
          <section className="filter-section">
            <h3 className="filter-section-title">Местоположение</h3>
            <LocationFilterPicker
              value={local.locationFilter}
              onChange={(loc) => setLocal((f) => ({ ...f, locationFilter: loc }))}
            />
          </section>

          <section className="filter-section">
            <h3 className="filter-section-title">Тип жилья</h3>
            <div className="filter-chips">
              {houseTypes.map((t) => (
                <button key={t} className={`filter-chip ${local.houseType === t ? 'active' : ''}`}
                  onClick={() => setLocal((f) => ({ ...f, houseType: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="filter-section">
            <h3 className="filter-section-title">Цена за ночь, ₽</h3>
            <div className="filter-number-row">
              <div className="filter-number-field">
                <label className="filter-number-label">От</label>
                <input type="number" min={0} className="filter-number-input" placeholder="0"
                  value={local.priceMin || ''}
                  onChange={(e) => setLocal((f) => ({ ...f, priceMin: e.target.value ? Number(e.target.value) : 0 }))} />
              </div>
              <div className="filter-number-field">
                <label className="filter-number-label">До</label>
                <input type="number" min={0} className="filter-number-input" placeholder="Любая"
                  value={local.priceMax >= PRICE_MAX ? '' : local.priceMax || ''}
                  onChange={(e) => setLocal((f) => ({ ...f, priceMax: e.target.value ? Number(e.target.value) : PRICE_MAX }))} />
              </div>
            </div>
          </section>

          <section className="filter-section">
            <div className="filter-number-row">
              <div className="filter-number-field">
                <label className="filter-number-label">Комнат</label>
                <input type="number" min={1} className="filter-number-input" placeholder="Не важно"
                  value={local.minRooms || ''}
                  onChange={(e) => setLocal((f) => ({ ...f, minRooms: e.target.value ? Number(e.target.value) : 0 }))} />
              </div>
              <div className="filter-number-field">
                <label className="filter-number-label">Гостей</label>
                <input type="number" min={1} className="filter-number-input" placeholder="Не важно"
                  value={local.minGuests || ''}
                  onChange={(e) => setLocal((f) => ({ ...f, minGuests: e.target.value ? Number(e.target.value) : 0 }))} />
              </div>
            </div>
          </section>

          <section className="filter-section">
            <h3 className="filter-section-title">Сортировка</h3>
            <div className="filter-chips">
              {([{ label: 'Новые', value: undefined }, { label: 'По цене ↑', value: 'price_asc' }, { label: 'По цене ↓', value: 'price_desc' }] as const).map(({ label, value }) => (
                <button key={label} className={`filter-chip ${local.sort === value ? 'active' : ''}`}
                  onClick={() => setLocal((f) => ({ ...f, sort: value }))}>
                  {label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </FilterModal>
  );
};

export default HousesFilterModal;
