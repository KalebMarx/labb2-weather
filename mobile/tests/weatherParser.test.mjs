import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWeather } from '../parsers/parseWeather.ts';

const place = { name: 'Sigfridstorp', latitude: 60.383, longitude: 14.333 };

function response() {
  return {
    timeSeries: [{
      validTime: '2021-11-01T14:00:00Z',
      parameters: [
        { name: 't', values: [7.6] },
        { name: 'Wsymb2', values: [6] },
        { name: 'ws', values: [2.5] },
        { name: 'pmean', values: [0.1] },
      ],
    }],
  };
}

test('maps SMHI parameters to the weather model', () => {
  const forecast = parseWeather(response(), place);
  assert.deepEqual(forecast.place, place);
  assert.ok(Number.isFinite(Date.parse(forecast.fetchedAt)));
  assert.deepEqual(forecast.entries, [{
    time: '2021-11-01T14:00:00.000Z',
    temperature: 7.6,
    weatherCode: 6,
    windSpeed: 2.5,
    precipitation: 0.1,
  }]);
});

test('rejects missing, empty, or malformed forecast data', () => {
  for (const data of [null, {}, { timeSeries: [] }, { timeSeries: [null] }]) {
    assert.throws(() => parseWeather(data, place));
  }
});

test('rejects missing required parameters and invalid numeric values', () => {
  for (const name of ['t', 'Wsymb2']) {
    const data = response();
    data.timeSeries[0].parameters = data.timeSeries[0].parameters.filter(p => p.name !== name);
    assert.throws(() => parseWeather(data, place));
  }
  for (const value of [null, '7.6', Infinity, NaN]) {
    const data = response();
    data.timeSeries[0].parameters[0].values = [value];
    assert.throws(() => parseWeather(data, place));
  }
});

test('uses null for absent optional measurements and preserves zero temperature', () => {
  const data = response();
  data.timeSeries[0].parameters = [
    { name: 't', values: [0] },
    { name: 'Wsymb2', values: [1] },
  ];
  const entry = parseWeather(data, place).entries[0];
  assert.equal(entry.temperature, 0);
  assert.equal(entry.windSpeed, null);
  assert.equal(entry.precipitation, null);
});

test('rejects invalid timestamps and out-of-range weather codes', () => {
  const data = response();
  data.timeSeries[0].validTime = 'not a date';
  assert.throws(() => parseWeather(data, place));
  for (const value of [0, 28, 1.5]) {
    const data = response();
    data.timeSeries[0].parameters[1].values = [value];
    assert.throws(() => parseWeather(data, place));
  }
});
