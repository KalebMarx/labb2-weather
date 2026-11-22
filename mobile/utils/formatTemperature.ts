import type { TemperatureUnit } from '../models/Settings';

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const temperature = unit === 'F' ? celsius * 9 / 5 + 32 : celsius;
  return `${Math.round(temperature * 10) / 10} °${unit}`;
}
