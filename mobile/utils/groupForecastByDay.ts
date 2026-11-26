import type { ForecastEntry } from '../models/weatherModels';

export type ForecastDay = {
  date: string;
  entries: ForecastEntry[];
  minTemperature: number;
  maxTemperature: number;
  weatherCode: number;
};

export const forecastTimeZone = 'Europe/Stockholm';

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: forecastTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getForecastDate(time: string): string {
  return dateFormatter.format(new Date(time));
}

export function groupForecastByDay(entries: ForecastEntry[], referenceDate = getForecastDate(new Date().toISOString()),): ForecastDay[] 
{
  const endDate = new Date(`${referenceDate}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 7);
  const endDateString = endDate.toISOString().slice(0, 10);
  const groups: Record<string, ForecastEntry[]> = {};

  for (const entry of entries) {
    const date = getForecastDate(entry.time);
    if (date < referenceDate || date >= endDateString) continue;

    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
  }

  return Object.keys(groups).sort().map(date => {
    const dayEntries = groups[date].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    const temperatures = dayEntries.map(entry => entry.temperature);

    // Use the middle available time step to represent the day's condition.
    const representativeEntry = dayEntries[Math.floor(dayEntries.length / 2)];

    return {
      date,
      entries: dayEntries,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      weatherCode: representativeEntry.weatherCode,
    };
  });
}
