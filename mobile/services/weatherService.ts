import type { Place, WeatherForecast } from '../models/Weather';
import { parseWeather } from '../parsers/parseWeather';

// Development proxy only. The final app must use SMHI directly.
const forecastUrl = 'https://maceo.sth.kth.se/weather/forecast';

export async function fetchWeather(place: Place): Promise<WeatherForecast> {
  const coordinates = `lon/${place.longitude}/lat/${place.latitude}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${forecastUrl}?lonLat=${coordinates}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Weather request failed (HTTP ${response.status}).`);
    }

    return parseWeather(await response.json(), place);
  } finally {
    clearTimeout(timeout);
  }
}
