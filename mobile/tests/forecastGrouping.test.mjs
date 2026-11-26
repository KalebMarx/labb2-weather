import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupForecastByDay } from '../utils/groupForecastByDay.ts';

function entry(time, temperature = 5, weatherCode = 1) {
  return { time, temperature, weatherCode, windSpeed: null, precipitation: null };
}

test('sorts days and hours, calculates low/high, and keeps the input unchanged', () => {
  const entries = [
    entry('2021-11-02T10:00:00Z', 9),
    entry('2021-11-01T15:00:00Z', -2, 6),
    entry('2021-11-01T09:00:00Z', 7, 1),
  ];
  const original = [...entries];
  const days = groupForecastByDay(entries, '2021-11-01');

  assert.deepEqual(days.map(day => day.date), ['2021-11-01', '2021-11-02']);
  assert.equal(days[0].entries[0].time, '2021-11-01T09:00:00Z');
  assert.equal(days[0].minTemperature, -2);
  assert.equal(days[0].maxTemperature, 7);
  assert.equal(days[0].weatherCode, 6);
  assert.deepEqual(entries, original);
});
