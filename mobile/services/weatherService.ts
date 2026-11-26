import type { Place, WeatherForecast } from '../models/weatherModels';
import { parseWeather } from '../parsers/parseWeather';

const forecastUrl = 'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point';

export async function fetchWeather(place: Place): Promise<WeatherForecast> {
  const coordinates = `lon/${Number(place.longitude.toFixed(6))}/lat/${Number(place.latitude.toFixed(6))}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${forecastUrl}/${coordinates}/data.json`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('SMHI has no forecast for this location. Please select a place within its forecast area.');
      }
      throw new Error(`Weather request failed (HTTP ${response.status}).`);
    }

    const data: unknown = await response.json();

    return parseWeather(data, place);
  } finally {
    clearTimeout(timeout);
  }
}
