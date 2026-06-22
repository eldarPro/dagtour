import React from 'react';
import { TourFilters, DEFAULT_FILTERS, PRICE_MAX, DurationFilter } from '../data/tourFilters';
import { formatDays } from '../lib/formatDays';
import { cities } from '../data/dagestanLocations';
import FilterModal from './FilterModal';

const DURATIONS: DurationFilter[] = ['Все', 1, 2, 3, '4+'];

function durationLabel(d: DurationFilter): string {
  if (d === 'Все') return 'Любая';
  if (d === '4+') return '4+ дней';
  return formatDays(d);
}

interface Props {
  isOpen: boolean;
  filters: TourFilters;
  onClose: () => void;
  onApply: (filters: TourFilters) => void;
}

const ToursFilterModal: React.FC<Props> = ({ isOpen, filters, onClose, onApply }) => (
  <FilterModal isOpen={isOpen} filters={filters} defaultFilters={DEFAULT_FILTERS} onClose={onClose} onApply={onApply}>
    {(local, setLocal) => (
      <>
        <section className="filter-section">
          <h3 className="filter-section-title">Длительность</h3>
          <div className="filter-chips">
            {DURATIONS.map((d) => (
              <button key={String(d)} className={`filter-chip ${local.duration === d ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, duration: d }))}>
                {durationLabel(d)}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Город выезда</h3>
          <div className="filter-chips">
            <button className={`filter-chip ${local.meetingPoint === 'Все' ? 'active' : ''}`}
              onClick={() => setLocal((f) => ({ ...f, meetingPoint: 'Все' }))}>
              Любой
            </button>
            {cities.map((city) => (
              <button key={city.name} className={`filter-chip ${local.meetingPoint === city.name ? 'active' : ''}`}
                onClick={() => setLocal((f) => ({ ...f, meetingPoint: city.name }))}>
                {city.name}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Цена, ₽</h3>
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

export default ToursFilterModal;
