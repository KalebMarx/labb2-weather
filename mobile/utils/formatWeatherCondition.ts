const conditions: Record<number, string> = {
  1: 'Clear sky',
  2: 'Mostly clear',
  3: 'Variable cloudiness',
  4: 'Partly cloudy',
  5: 'Mostly cloudy',
  6: 'Overcast',
  7: 'Fog',
  8: 'Light rain showers',
  9: 'Moderate rain showers',
  10: 'Heavy rain showers',
  11: 'Thunder showers',
  12: 'Light sleet showers',
  13: 'Moderate sleet showers',
  14: 'Heavy sleet showers',
  15: 'Light snow showers',
  16: 'Moderate snow showers',
  17: 'Heavy snow showers',
  18: 'Light rain',
  19: 'Moderate rain',
  20: 'Heavy rain',
  21: 'Thunder',
  22: 'Light sleet',
  23: 'Moderate sleet',
  24: 'Heavy sleet',
  25: 'Light snow',
  26: 'Moderate snow',
  27: 'Heavy snow',
};

export function formatWeatherCondition(code: number): string {
  return conditions[code] ?? 'Unavailable';
}
