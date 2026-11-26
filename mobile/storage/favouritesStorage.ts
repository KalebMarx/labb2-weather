import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Place } from '../models/weatherModels';
import { isObject } from '../parsers/parseWeather';

const favouritesKey = 'weather.favourites';

export async function loadFavourites(): Promise<Place[]> {
  const saved = await AsyncStorage.getItem(favouritesKey);
  if (saved === null) return [];

  const data: unknown = JSON.parse(saved);
  if (!Array.isArray(data)) throw new Error('Saved favourites must be a list.');

  return data.map(place => {
    if (
      !isObject(place) ||
      typeof place.name !== 'string' || place.name.trim() === '' ||
      typeof place.latitude !== 'number' || !Number.isFinite(place.latitude) ||
      place.latitude < -90 || place.latitude > 90 ||
      typeof place.longitude !== 'number' || !Number.isFinite(place.longitude) ||
      place.longitude < -180 || place.longitude > 180
    ) {
      throw new Error('A saved favourite has invalid place data.');
    }

    return { name: place.name, latitude: place.latitude, longitude: place.longitude };
  });
}

export async function saveFavourites(places: Place[]): Promise<void> {
  await AsyncStorage.setItem(favouritesKey, JSON.stringify(places));
}
