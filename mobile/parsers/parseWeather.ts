import type { Place, WeatherForecast } from '../models/weatherModels';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown): number | null {
  // SMHI uses 9999 when a measurement is unavailable.
  return typeof value === 'number' && Number.isFinite(value) && value !== 9999 ? value : null;
}

export function parseWeather(data: unknown, place: Place): WeatherForecast {
  if (!isObject(data) || !Array.isArray(data.timeSeries) || data.timeSeries.length === 0) {
    throw new Error('The response contains no forecast entries.');
  }

  const entries = data.timeSeries.map(entry => {
    if (
      !isObject(entry) ||
      typeof entry.time !== 'string' ||
      !Number.isFinite(Date.parse(entry.time)) ||
      !isObject(entry.data)
    ) {
      throw new Error('The response contains an invalid forecast entry.');
    }

    const temperature = readNumber(entry.data.air_temperature);
    const weatherCode = readNumber(entry.data.symbol_code);

    if (
      temperature === null || weatherCode === null ||
      !Number.isInteger(weatherCode) || weatherCode < 1 || weatherCode > 27
    ) {
      throw new Error('The response is missing a valid temperature or weather code.');
    }

    const windSpeed = readNumber(entry.data.wind_speed);
    const precipitationAmount = readNumber(entry.data.precipitation_amount_mean);
    const intervalHours = typeof entry.intervalParametersStartTime === 'string'
      ? (Date.parse(entry.time) - Date.parse(entry.intervalParametersStartTime)) / 3600000
      : NaN;
    let precipitation: number | null = null;
    if (precipitationAmount !== null && precipitationAmount >= 0 && Number.isFinite(intervalHours) && intervalHours > 0) {
      // An interval amount in kg/m² equals mm of water; convert it to mm/h.
      precipitation = precipitationAmount / intervalHours;
    }

    return {
      time: new Date(entry.time).toISOString(),
      temperature,
      weatherCode,
      windSpeed: windSpeed !== null && windSpeed >= 0 ? windSpeed : null,
      precipitation,
    };
  });

  return { place, fetchedAt: new Date().toISOString(), entries };
}
