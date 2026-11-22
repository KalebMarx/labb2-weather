import type { Place } from '../models/Weather';
import { parsePlace } from '../parsers/parsePlace';

// Development proxy only. Use the permitted geocoding API in the final app.
const searchUrl = 'https://maceo.sth.kth.se/weather/search';

export async function searchPlaces(query: string): Promise<Place[]> {
  const searchText = query.trim();
  if (searchText === '') return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${searchUrl}?location=${encodeURIComponent(searchText)}`, {
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
