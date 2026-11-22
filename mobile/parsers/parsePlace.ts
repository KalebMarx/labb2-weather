import type { Place } from '../models/Weather';
import { isObject } from './parseWeather';

export function parsePlace(data: unknown): Place {
  if (!isObject(data)) {
    throw new Error('Search result must be an object.');
  }

  if (typeof data.place !== 'string' || data.place.trim() === '') {
    throw new Error('Search result must have a place name.');
  }

  if (
    typeof data.lat !== 'number' || !Number.isFinite(data.lat) ||
    data.lat < -90 || data.lat > 90
  ) {
    throw new Error('Latitude must be a number between -90 and 90.');
  }

  if (
    typeof data.lon !== 'number' || !Number.isFinite(data.lon) ||
    data.lon < -180 || data.lon > 180
  ) {
    throw new Error('Longitude must be a number between -180 and 180.');
  }

  return {
    name: data.place.trim(),
    latitude: data.lat,
    longitude: data.lon,
  };
}
