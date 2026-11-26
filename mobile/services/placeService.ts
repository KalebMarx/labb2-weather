import type { Place } from '../models/weatherModels';
import { parsePlace } from '../parsers/parsePlace';

const searchUrl = 'https://wpt-a.smhi.se/backend-weatherpage/geo/autocomplete/places';

export async function fetchPlaces(query: string): Promise<Place[]> {
  const searchText = query.trim();
  if (searchText === '') return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${searchUrl}/${encodeURIComponent(searchText)}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Place search failed (HTTP ${response.status}).`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Expected a list of places.');
    }

    return data.map(parsePlace);
  } finally {
    clearTimeout(timeout);
  }
}
