export type TemperatureUnit = 'C' | 'F';

export type Settings = {
  refreshIntervalMinutes: number;
  temperatureUnit: TemperatureUnit;
};

export const refreshIntervals = [15, 30, 60];
export const temperatureUnits: TemperatureUnit[] = ['C', 'F'];
export const defaultSettings: Settings = {
  refreshIntervalMinutes: 30,
  temperatureUnit: 'C',
};
