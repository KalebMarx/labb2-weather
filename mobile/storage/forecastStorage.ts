import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherForecast } from '../models/Weather';
import { parsePlace } from '../parsers/parsePlace';
import { isObject } from '../parsers/parseWeather';

const forecastKey = 'weather.lastForecast';
let pendingWrite: Promise<void> = Promise.resolve();

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function loadCachedForecast(): Promise<WeatherForecast | null> {
  const saved = await AsyncStorage.getItem(forecastKey);
  if (saved === null) return null;

  const data: unknown = JSON.parse(saved);
  if (
    !isObject(data) || !isObject(data.place) ||
    typeof data.fetchedAt !== 'string' || !Number.isFinite(Date.parse(data.fetchedAt)) ||
    !Array.isArray(data.entries) || data.entries.length === 0
  ) {
    throw new Error('The saved forecast is invalid.');
  }

  // Reuse the place parser's name and coordinate validation.
  const place = parsePlace({
    place: data.place.name,
    lat: data.place.latitude,
    lon: data.place.longitude,
  });

  const entries = data.entries.map(entry => {
    if (
      !isObject(entry) ||
      typeof entry.time !== 'string' || !Number.isFinite(Date.parse(entry.time)) ||
      !isFiniteNumber(entry.temperature) ||
      !isFiniteNumber(entry.weatherCode) || !Number.isInteger(entry.weatherCode) ||
      entry.weatherCode < 1 || entry.weatherCode > 27 ||
      (entry.windSpeed !== null && !isFiniteNumber(entry.windSpeed)) ||
      (entry.precipitation !== null && !isFiniteNumber(entry.precipitation))
    ) {
      throw new Error('A saved forecast entry is invalid.');
    }

    return {
      time: entry.time,
      temperature: entry.temperature,
      weatherCode: entry.weatherCode,
      windSpeed: entry.windSpeed,
      precipitation: entry.precipitation,
    };
  });

  return { place, fetchedAt: data.fetchedAt, entries };
}

export function saveCachedForecast(forecast: WeatherForecast): Promise<void> {
  const saved = JSON.stringify(forecast);
  // Keep saves in order so an older write cannot replace a newer forecast.
  const previousWrite = pendingWrite.catch(() => undefined);
  pendingWrite = previousWrite.then(() => AsyncStorage.setItem(forecastKey, saved));
  return pendingWrite;
}
