export type Place = {
  name: string;
  latitude: number;
  longitude: number;
};

export type ForecastEntry = {
  time: string; // ISO 8601 timestamp, including timezone.
  temperature: number; // Celsius.
  weatherCode: number;
  windSpeed: number | null; // Metres per second; null means unavailable.
  precipitation: number | null; // Millimetres per hour; null means unavailable.
};

export type WeatherForecast = {
  place: Place;
  fetchedAt: string; // When the app fetched this forecast (ISO 8601).
  entries: ForecastEntry[];
};
