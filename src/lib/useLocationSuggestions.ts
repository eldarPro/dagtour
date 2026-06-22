import { useState, useEffect, useRef } from 'react';
import { dadataService } from '../services/dadataService';
import { cities as localCities, districts as localDistricts } from '../data/dagestanLocations';

export interface LocationSuggestion {
  name: string;
  subLabel?: string;
  district?: string;
  type: 'city' | 'district';
  lat: number;
  lng: number;
}

export function useLocationSuggestions(query: string): { settlements: LocationSuggestion[]; loading: boolean } {
  const [settlements, setSettlements] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    const q = query.trim();
    if (q.length >= 2) {
      setLoading(true);
      timeout.current = setTimeout(async () => {
        const results: LocationSuggestion[] = [];
        const seen = new Set<string>();
        const add = (s: LocationSuggestion) => {
          const key = `${s.name}|${s.type}`;
          if (!seen.has(key)) { seen.add(key); results.push(s); }
        };

        const qLower = q.toLowerCase();

        // Local cities
        for (const c of localCities) {
          if (c.name.toLowerCase().includes(qLower)) {
            add({ name: c.name, type: 'city', lat: c.lat, lng: c.lng });
          }
        }

        // Local districts and their settlements
        for (const d of localDistricts) {
          const districtBase = d.name.replace(/\s+район$/i, '').toLowerCase();
          if (districtBase.includes(qLower) || d.name.toLowerCase().includes(qLower)) {
            const center = d.settlements[0];
            if (center) {
              add({ name: d.name, type: 'district', lat: center.lat, lng: center.lng });
            }
          }
          for (const s of d.settlements) {
            if (s.name.toLowerCase().includes(qLower)) {
              add({ name: s.name, subLabel: d.name, district: d.name, type: 'city', lat: s.lat, lng: s.lng });
            }
          }
        }

        // DaData supplements with results not in local data
        const dadataResults = await dadataService.suggestCity(q);
        for (const r of dadataResults) {
          if (!r.lat || !r.lng) continue;
          add({ name: r.city, subLabel: r.district, district: r.district, type: 'city', lat: r.lat, lng: r.lng });
        }

        setSettlements(results);
        setLoading(false);
      }, 300);
    } else {
      setSettlements([]);
      setLoading(false);
    }
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [query]);

  return { settlements, loading };
}
