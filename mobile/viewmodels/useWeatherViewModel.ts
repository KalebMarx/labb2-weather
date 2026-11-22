import { useRef, useState } from 'react';
import type { Place, WeatherForecast } from '../models/Weather';
import { groupForecastByDay } from '../utils/groupForecastByDay';

export function useWeatherViewModel(
  fetchForecast: (place: Place) => Promise<WeatherForecast>,
  referenceDate?: string,
) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  async function loadWeather(place: Place) {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const forecast = await fetchForecast(place);

      // Ignore results from older requests when another search has started.
      if (requestId === latestRequest.current) {
        setWeather(forecast);
      }
    } catch {
      if (requestId === latestRequest.current) {
        setError('Could not load the weather. Please try again.');
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }

  const days = groupForecastByDay(weather?.entries ?? [], referenceDate);

  return { weather, days, loading, error, loadWeather };
}
