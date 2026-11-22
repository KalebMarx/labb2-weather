import type { Place, WeatherForecast } from '../models/Weather';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readParameter(parameters: unknown[], name: string): number | null {
  const parameter = parameters.find(item => isObject(item) && item.name === name);
  const value = isObject(parameter) && Array.isArray(parameter.values)
    ? parameter.values[0]
    : null;

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parseWeather(data: unknown, place: Place): WeatherForecast {
  if (!isObject(data) || !Array.isArray(data.timeSeries) || data.timeSeries.length === 0) {
    throw new Error('The response contains no forecast entries.');
  }

  const entries = data.timeSeries.map(entry => {
    if (
      !isObject(entry) ||
      typeof entry.validTime !== 'string' ||
      !Number.isFinite(Date.parse(entry.validTime)) ||
      !Array.isArray(entry.parameters)
    ) {
      throw new Error('The response contains an invalid forecast entry.');
    }

    const temperature = readParameter(entry.parameters, 't');
    const weatherCode = readParameter(entry.parameters, 'Wsymb2');

    if (
      temperature === null || weatherCode === null ||
      !Number.isInteger(weatherCode) || weatherCode < 1 || weatherCode > 27
    ) {
      throw new Error('The response is missing a valid temperature or weather code.');
    }

    return {
      time: new Date(entry.validTime).toISOString(),
      temperature,
      weatherCode,
      windSpeed: readParameter(entry.parameters, 'ws'),
      precipitation: readParameter(entry.parameters, 'pmean'),
    };
  });

  return { place, fetchedAt: new Date().toISOString(), entries };
}
