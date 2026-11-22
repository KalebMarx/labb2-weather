import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getForecastDate, groupForecastByDay } from '../utils/groupForecastByDay.ts';

function entry(time, temperature = 5, weatherCode = 1) {
  return { time, temperature, weatherCode, windSpeed: null, precipitation: null };
}

test('groups by Swedish dates, including entries across local midnight', () => {
  const days = groupForecastByDay([
    entry('2021-11-01T22:00:00Z'),
    entry('2021-11-01T23:00:00Z'),
    entry('2021-11-02T00:00:00Z'),
  ], '2021-11-01');

  assert.deepEqual(days.map(day => day.date), ['2021-11-01', '2021-11-02']);
  assert.equal(days[0].entries.length, 1);
  assert.equal(days[1].entries.length, 2);
});

test('sorts days and hours, calculates low/high, and keeps the input unchanged', () => {
  const entries = [
    entry('2021-11-02T10:00:00Z', 9),
    entry('2021-11-01T15:00:00Z', -2, 6),
    entry('2021-11-01T09:00:00Z', 7, 1),
  ];
  const original = [...entries];
  const days = groupForecastByDay(entries, '2021-11-01');

  assert.equal(days[0].date, '2021-11-01');
  assert.equal(days[0].entries[0].time, '2021-11-01T09:00:00Z');
  assert.equal(days[0].minTemperature, -2);
  assert.equal(days[0].maxTemperature, 7);
  assert.equal(days[0].weatherCode, 6);
  assert.deepEqual(entries, original);
});

test('includes only the reference day and following six days across a month boundary', () => {
  const days = groupForecastByDay([
    entry('2021-11-27T12:00:00Z'),
    entry('2021-11-28T12:00:00Z'),
    entry('2021-12-04T12:00:00Z'),
    entry('2021-12-05T12:00:00Z'),
  ], '2021-11-28');

  assert.deepEqual(days.map(day => day.date), ['2021-11-28', '2021-12-04']);
});

test('handles empty input and does not invent missing days', () => {
  assert.deepEqual(groupForecastByDay([], '2021-11-01'), []);
  assert.equal(groupForecastByDay([entry('2021-11-03T12:00:00Z')], '2021-11-01').length, 1);
});

test('uses Swedish summer time and defaults to the actual current date', () => {
  assert.equal(getForecastDate('2021-07-01T22:30:00Z'), '2021-07-02');
  const now = new Date().toISOString();
  const days = groupForecastByDay([entry(now)]);
  assert.equal(days[0].date, getForecastDate(now));
});
