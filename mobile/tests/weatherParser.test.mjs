import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWeather } from '../parsers/parseWeather.ts';

const place = { name: 'Sigfridstorp', latitude: 60.383, longitude: 14.333 };

function response() {
  return {
    timeSeries: [{
      time: '2021-11-01T14:00:00Z',
      intervalParametersStartTime: '2021-11-01T13:00:00Z',
      data: {
        air_temperature: 7.6,
        symbol_code: 6,
        wind_speed: 2.5,
        precipitation_amount_mean: 0.1,
      },
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

test('rejects a forecast with a missing temperature', () => {
  const data = response();
  delete data.timeSeries[0].data.air_temperature;
  assert.throws(() => parseWeather(data, place), /valid temperature or weather code/);
});
