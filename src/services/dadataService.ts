const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    region: string;
    region_type_full: string;
    area: string;
    area_type_full: string;
    city: string;
    city_type_full: string;
    settlement: string;
    settlement_type_full: string;
    street: string;
    street_type: string;
    street_type_full: string;
    house: string;
    house_type_full: string;
    geo_lat: string;
    geo_lon: string;
  };
}

interface DaDataResponse {
  suggestions: DaDataSuggestion[];
}

export interface AddressData {
  region: string;
  district?: string;
  city: string;
  street?: string;
  streetType?: string;
  house?: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
}

export function formatShortAddress(data: AddressData): string {
  const parts: string[] = [];
  if (data.city) parts.push(data.city);
  if (data.street) {
    parts.push(data.streetType ? `${data.streetType}. ${data.street}` : data.street);
  }
  if (data.house) parts.push(data.house);
  return parts.join(', ');
}

class DaDataService {
  private mapSuggestion(s: DaDataSuggestion): AddressData {
    const area = s.data.area
      ? `${s.data.area} ${s.data.area_type_full}`.trim()
      : undefined;
    return {
      region: s.data.region || '',
      district: area || undefined,
      city: s.data.city || s.data.settlement || s.data.region || '',
      street: s.data.street || undefined,
      streetType: s.data.street_type || undefined,
      house: s.data.house || undefined,
      fullAddress: s.unrestricted_value,
      lat: s.data.geo_lat ? parseFloat(s.data.geo_lat) : undefined,
      lng: s.data.geo_lon ? parseFloat(s.data.geo_lon) : undefined,
    };
  }

  private async backendPost(path: string, body: Record<string, unknown>): Promise<DaDataResponse> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }

  private suggest(type: string, query: string): Promise<DaDataResponse> {
    return this.backendPost('/address/suggest', { type, query });
  }

  async suggestAddress(query: string): Promise<AddressData[]> {
    try {
      const data = await this.suggest('address', query);
      return data.suggestions.map(s => this.mapSuggestion(s));
    } catch {
      return [];
    }
  }

  async suggestCity(query: string): Promise<AddressData[]> {
    try {
      const data = await this.suggest('city', query);
      return data.suggestions
        .filter(s => s.data.city || s.data.settlement)
        .map(s => this.mapSuggestion(s));
    } catch {
      return [];
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<AddressData | null> {
    try {
      const data = await this.backendPost('/address/reverse', { lat, lon: lng });
      if (!data.suggestions?.length) return null;
      return this.mapSuggestion(data.suggestions[0]);
    } catch {
      return null;
    }
  }
}

export const dadataService = new DaDataService();
