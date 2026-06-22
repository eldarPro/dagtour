import React, { useState, useRef, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { useLocationSuggestions } from '../lib/useLocationSuggestions';
import { cities, districts as allDistricts } from '../data/dagestanLocations';
import { dadataService } from '../services/dadataService';
import './LocationFilterPicker.css';

export interface LocationFilter {
  displayName: string;
  city?: string;
  district?: string;
  citiesInDistrict?: string[];
  lat?: number;
  lng?: number;
}

export const EMPTY_LOCATION_FILTER: LocationFilter = { displayName: '' };

interface Props {
  value: LocationFilter;
  onChange: (location: LocationFilter) => void;
}

const LocationFilterPicker: React.FC<Props> = ({ value, onChange }) => {
  const [locQ, setLocQ] = useState('');
  const [locOpen, setLocOpen] = useState(false);
  const [chipLoading, setChipLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settlements, loading } = useLocationSuggestions(locQ);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLocOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (s: ReturnType<typeof useLocationSuggestions>['settlements'][0]) => {
    let filter: LocationFilter;
    if (s.type === 'district') {
      const districtData = allDistricts.find((d) => d.name === s.name);
      filter = {
        displayName: s.name,
        district: s.name,
        citiesInDistrict: districtData?.settlements.map((st) => st.name),
        lat: s.lat,
        lng: s.lng,
      };
    } else {
      filter = { displayName: s.name, city: s.name, district: s.district, lat: s.lat, lng: s.lng };
    }
    onChange(filter);
    setLocOpen(false);
    setLocQ('');
  };

  const handleCityChip = async (city: typeof cities[0]) => {
    setChipLoading(city.name);
    try {
      const results = await dadataService.suggestCity(city.name);
      const match = results.find(r => r.lat && r.lng);
      onChange({
        displayName: city.name,
        city: city.name,
        lat: match?.lat ?? city.lat,
        lng: match?.lng ?? city.lng,
      });
    } catch {
      onChange({ displayName: city.name, city: city.name, lat: city.lat, lng: city.lng });
    } finally {
      setChipLoading(null);
    }
    setLocOpen(false);
    setLocQ('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(EMPTY_LOCATION_FILTER);
  };

  const isSelected = !!value.displayName;

  return (
    <div ref={containerRef} className="lf-root">
      {isSelected && !locOpen ? (
        <div className="lf-chip">
          <IonIcon icon={locationOutline} className="lf-chip-icon" />
          <span
            className="lf-chip-text"
            onClick={() => { setLocQ(''); setLocOpen(true); }}
          >
            {value.displayName}
          </span>
          <button type="button" className="lf-chip-x" onClick={handleClear}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="lf-input-wrap">
          <div
            className={`lf-search-row ${locOpen && locQ.length >= 2 ? 'lf-search-row--open' : ''}`}
            style={{ borderRadius: locOpen && locQ.length >= 2 ? '10px 10px 0 0' : 10 }}
          >
            <IonIcon icon={locationOutline} className="lf-search-icon" />
            <input
              type="text"
              placeholder="Населённый пункт или район..."
              value={locQ}
              onChange={(e) => { setLocQ(e.target.value); setLocOpen(true); }}
              onFocus={() => setLocOpen(true)}
              className="lf-search-input"
            />
            {locQ ? (
              <button type="button" className="lf-clear-btn" onClick={() => setLocQ('')}>×</button>
            ) : null}
          </div>
          {locOpen && (
            <div className="lf-dropdown">
              <div className="lf-list">
                {loading ? (
                  <div className="lf-spinner-row"><IonSpinner name="crescent" /></div>
                ) : locQ.trim().length < 2 ? (
                  <div className="lf-empty">Начните вводить название</div>
                ) : settlements.length === 0 ? (
                  <div className="lf-empty">Ничего не найдено</div>
                ) : (
                  settlements.map((s, i) => (
                    <button
                      key={`${s.name}-${s.type}-${i}`}
                      type="button"
                      className="lf-row"
                      style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                      onClick={() => handleSelect(s)}
                    >
                      <span>{s.name}</span>
                      {s.type === 'district' ? (
                        <span className="lf-sub lf-district-badge">район</span>
                      ) : s.subLabel ? (
                        <span className="lf-sub">{s.subLabel}</span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="lf-city-chips">
        {cities.map((city) => (
          <button
            key={city.name}
            type="button"
            className={`lf-city-chip${value.city === city.name ? ' lf-city-chip--active' : ''}`}
            onClick={() => handleCityChip(city)}
            disabled={chipLoading !== null}
          >
            {chipLoading === city.name ? <IonSpinner name="crescent" style={{ width: 14, height: 14 }} /> : city.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationFilterPicker;
