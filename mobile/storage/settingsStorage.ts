import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSettings, refreshIntervals } from '../models/Settings';
import type { Settings } from '../models/Settings';
import { isObject } from '../parsers/parseWeather';

const settingsKey = 'weather.settings';

export async function loadSettings(): Promise<Settings> {
  const saved = await AsyncStorage.getItem(settingsKey);
  if (saved === null) return defaultSettings;

  const data: unknown = JSON.parse(saved);
  if (
    !isObject(data) ||
    typeof data.refreshIntervalMinutes !== 'number' ||
    !refreshIntervals.includes(data.refreshIntervalMinutes) ||
    (data.temperatureUnit !== 'C' && data.temperatureUnit !== 'F')
  ) {
    throw new Error('Saved settings are invalid.');
  }

  return { refreshIntervalMinutes: data.refreshIntervalMinutes, temperatureUnit: data.temperatureUnit };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(settingsKey, JSON.stringify(settings));
}
