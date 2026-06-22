import React from 'react';
import { CarFilters, CarType, DEFAULT_FILTERS, PRICE_MAX } from '../data/carFilters';
import LocationFilterPicker from './LocationFilterPicker';
import FilterModal from './FilterModal';

const TYPES: CarType[] = ['Все', 'Седан', 'Хэтчбек', 'Кроссовер', 'Внедорожник', 'Минивэн'];
const TRANSMISSIONS: Array<CarFilters['transmission']> = ['Все', 'механика', 'автомат', 'робот'];

interface Props {
  isOpen: boolean;
  filters: CarFilters;
  onClose: () => void;
  onApply: (filters: CarFilters) => void;
}

const CarsFilterModal: React.FC<Props> = ({ isOpen, filters, onClose, onApply }) => (
  <FilterModal isOpen={isOpen} filters={filters} defaultFilters={DEFAULT_FILTERS} onClose={onClose} onApply={onApply}>
    {(local, setLocal) => (
      <>
        <section className="filter-section">
          <h3 className="filter-section-title">Населённый пункт</h3>
          <LocationFilterPicker
            value={local.locationFilter}
            onChange={(loc) => setLocal((f) => ({ ...f, locationFilter: loc }))}
          />
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Тип автомобиля</h3>
          <div className="filter-chips">
            {TYPES.map((type) => (
              <button
                key={type}
                className={`filter-chip ${local.type === type ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, type }))}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Трансмиссия</h3>
          <div className="filter-chips">
            {TRANSMISSIONS.map((tr) => (
              <button
                key={tr}
                className={`filter-chip ${local.transmission === tr ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, transmission: tr }))}
              >
                {tr === 'Все' ? 'Любая' : tr.charAt(0).toUpperCase() + tr.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Количество мест</h3>
          <div className="filter-chips">
            {[{ label: 'Любое', value: 0 }, { label: '2+', value: 2 }, { label: '3+', value: 3 }, { label: '4+', value: 4 }, { label: '5+', value: 5 }].map(({ label, value }) => (
              <button
                key={value}
                className={`filter-chip ${local.seatsMin === value ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, seatsMin: value }))}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Цена за день, ₽</h3>
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

export default CarsFilterModal;
