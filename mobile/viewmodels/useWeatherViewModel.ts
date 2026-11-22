import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import type { Settings } from '../models/Settings';
import type { Place, WeatherForecast } from '../models/Weather';
import { parseCoordinates } from '../parsers/parseCoordinates';
import { searchPlaces as fetchPlaces } from '../services/placeService';
import { loadFavourites, saveFavourites } from '../storage/favouritesStorage';
import { loadCachedForecast, saveCachedForecast } from '../storage/forecastStorage';
import { loadSettings, saveSettings } from '../storage/settingsStorage';
import { groupForecastByDay } from '../utils/groupForecastByDay';

export function useWeatherViewModel(
  fetchForecast: (place: Place) => Promise<WeatherForecast>,
  referenceDate?: string,
) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);
  const weatherLoadingRef = useRef(false);
  const [usingSavedForecast, setUsingSavedForecast] = useState(false);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [restoringForecast, setRestoringForecast] = useState(true);
  const freshForecastLoaded = useRef(false);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const latestSearch = useRef(0);
  const [favourites, setFavourites] = useState<Place[] | null>(null);
  const [favouritesBusy, setFavouritesBusy] = useState(true);
  const [favouritesError, setFavouritesError] = useState<string | null>(null);
  // Lock immediately; state updates disable the buttons on the next render.
  const favouritesBusyRef = useRef(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsBusy, setSettingsBusy] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const settingsBusyRef = useRef(false);

  const restoreSettings = useCallback(async () => {
    if (settingsBusyRef.current) return;
    settingsBusyRef.current = true;
    setSettingsBusy(true);
    setSettingsError(null);

    try {
      setSettings(await loadSettings());
    } catch {
      setSettingsError('Could not load settings. Please try again.');
    } finally {
      settingsBusyRef.current = false;
      setSettingsBusy(false);
    }
  }, []);

  useEffect(() => {
    restoreSettings();
  }, [restoreSettings]);

  async function updateSettings(updated: Settings) {
    if (settings === null || settingsBusyRef.current) return;
    settingsBusyRef.current = true;
    setSettingsBusy(true);
    setSettingsError(null);

    try {
      await saveSettings(updated);
      setSettings(updated);
    } catch {
      setSettingsError('Could not save settings. Your changes were not saved.');
    } finally {
      settingsBusyRef.current = false;
      setSettingsBusy(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreForecast() {
      try {
        const saved = await loadCachedForecast();
        if (active && !freshForecastLoaded.current && saved) {
          setWeather(saved);
          setUsingSavedForecast(true);
        }
      } catch {
        if (active && !freshForecastLoaded.current) {
          setCacheError('Could not read the saved forecast. Load weather online to replace it.');
        }
      } finally {
        if (active) setRestoringForecast(false);
      }
    }

    restoreForecast();
    return () => { active = false; };
  }, []);

  // Stable so the startup effect does not rerun on every render.
  const restoreFavourites = useCallback(async () => {
    if (favouritesBusyRef.current) return;
    favouritesBusyRef.current = true;
    setFavouritesBusy(true);
    setFavouritesError(null);

    try {
      setFavourites(await loadFavourites());
    } catch {
      setFavouritesError('Could not load saved favourites. Please try again.');
    } finally {
      favouritesBusyRef.current = false;
      setFavouritesBusy(false);
    }
  }, []);

  useEffect(() => {
    restoreFavourites();
  }, [restoreFavourites]);

  function isFavourite(place: Place): boolean {
    return favourites?.some(favourite =>
      favourite.latitude === place.latitude && favourite.longitude === place.longitude
    ) ?? false;
  }

  async function toggleFavourite(place: Place) {
    if (favourites === null || favouritesBusyRef.current) return;

    const remaining = favourites.filter(favourite =>
      favourite.latitude !== place.latitude || favourite.longitude !== place.longitude
    );
    const updated = remaining.length === favourites.length ? [...favourites, place] : remaining;

    favouritesBusyRef.current = true;
    setFavouritesBusy(true);
    setFavouritesError(null);

    try {
      await saveFavourites(updated);
      setFavourites(updated);
    } catch {
      setFavouritesError('Could not save favourites. Your changes were not saved.');
    } finally {
      favouritesBusyRef.current = false;
      setFavouritesBusy(false);
    }
  }

  async function searchPlaces(query: string) {
    const requestId = ++latestSearch.current;
    setPlaces(null);
    setSearchError(null);

    if (query.trim() === '') {
      setSearching(false);
      setSearchError('Enter a place name or latitude, longitude.');
      return;
    }

    setSearching(true);

    try {
      const coordinatePlace = parseCoordinates(query);
      if (coordinatePlace) {
        await loadWeather(coordinatePlace);
        return;
      }

      const results = await fetchPlaces(query);

      if (requestId === latestSearch.current) {
        setPlaces(results);
      }
    } catch (searchFailure) {
      if (requestId === latestSearch.current) {
        setSearchError(searchFailure instanceof Error
          ? searchFailure.message
          : 'Could not search for places. Please try again.');
      }
    } finally {
      if (requestId === latestSearch.current) {
        setSearching(false);
      }
    }
  }

  const loadWeather = useCallback(async (place: Place) => {
    // Dismiss results and prevent a pending search from bringing them back.
    ++latestSearch.current;
    setPlaces(null);
    setSearching(false);
    setSearchError(null);

    const requestId = ++latestRequest.current;
    weatherLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const forecast = await fetchForecast(place);

      // Ignore results from older requests when another search has started.
      if (requestId === latestRequest.current) {
        freshForecastLoaded.current = true;
        setWeather(forecast);
        setUsingSavedForecast(false);
        setCacheError(null);

        try {
          await saveCachedForecast(forecast);
        } catch {
          if (requestId === latestRequest.current) {
            setCacheError('Weather loaded, but could not be saved for offline use.');
          }
        }
      }
    } catch (requestError) {
      if (requestId === latestRequest.current) {
        setError(requestError instanceof Error
          ? requestError.message
          : 'Could not load the weather. Please try again.');
      }
    } finally {
      if (requestId === latestRequest.current) {
        weatherLoadingRef.current = false;
        setLoading(false);
      }
    }
  }, [fetchForecast]);

  const refreshIntervalMinutes = settings?.refreshIntervalMinutes;

  useEffect(() => {
    if (!weather || refreshIntervalMinutes === undefined) return;

    const intervalMs = refreshIntervalMinutes * 60 * 1000;
    const place = weather.place;
    let nextAttempt = Date.parse(weather.fetchedAt) + intervalMs;
    let timer: ReturnType<typeof setInterval> | undefined;

    function refreshIfDue() {
      if (AppState.currentState !== 'active' || weatherLoadingRef.current || Date.now() < nextAttempt) return;
      // Wait a full interval before retrying a failed automatic refresh.
      nextAttempt = Date.now() + intervalMs;
      loadWeather(place);
    }

    function handleAppState(state: AppStateStatus) {
      if (timer !== undefined) clearInterval(timer);
      if (state === 'active') {
        refreshIfDue();
        timer = setInterval(refreshIfDue, 60 * 1000);
      }
    }

    if (AppState.currentState === 'active') handleAppState('active');
    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      if (timer !== undefined) clearInterval(timer);
      subscription.remove();
    };
  }, [weather, refreshIntervalMinutes, loadWeather]);

  const days = groupForecastByDay(weather?.entries ?? [], referenceDate);

  return {
    weather, days, loading, error, loadWeather,
    usingSavedForecast, cacheError, restoringForecast,
    places, searching, searchError, searchPlaces,
    favourites, favouritesBusy, favouritesError, restoreFavourites, isFavourite, toggleFavourite,
    settings, settingsBusy, settingsError, restoreSettings, updateSettings,
  };
}

export type WeatherViewModel = ReturnType<typeof useWeatherViewModel>;
