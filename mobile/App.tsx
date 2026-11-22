import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import type { Place } from './models/Weather';
import { fetchWeather } from './services/weatherService';
import { useWeatherViewModel } from './viewmodels/useWeatherViewModel';
import { forecastTimeZone } from './utils/groupForecastByDay';

const place: Place = {
  name: 'Sigfridstorp',
  latitude: 60.383,
  longitude: 14.333,
};

// The proxy returns historical data. Remove this override when using live SMHI.
const referenceDate = '2021-11-01';

export default function App() {
  const { weather, days, loading, error, loadWeather } =
    useWeatherViewModel(fetchWeather, referenceDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather</Text>
      <Text>KTH proxy test data ({referenceDate})</Text>

      <Button
        title="Load weather"
        onPress={() => loadWeather(place)}
        disabled={loading}
      />

      {loading && <Text>Loading weather...</Text>}
      {error && <Text>{error}</Text>}

      {weather && (
        <>
          <Text>{weather.place.name}</Text>
          <FlatList
            style={styles.list}
            data={days}
            keyExtractor={day => day.date}
            ListEmptyComponent={<Text>No forecast available for these dates.</Text>}
            renderItem={({ item: day }) => (
              <View style={styles.forecastEntry}>
                <Text style={styles.dayTitle}>{day.date}</Text>
                <Text>Low: {day.minTemperature} °C / High: {day.maxTemperature} °C</Text>
                <Text>Weather code: {day.weatherCode}</Text>

                {day.date === referenceDate && (
                  <>
                    <Text style={styles.dayTitle}>Hourly forecast</Text>
                    {day.entries.map(entry => (
                      <View key={entry.time} style={styles.hourlyEntry}>
                        <Text>
                          {new Date(entry.time).toLocaleTimeString('en-GB', {
                            timeZone: forecastTimeZone,
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text>{entry.temperature} °C — Weather code: {entry.weatherCode}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}
          />
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  forecastEntry: {
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hourlyEntry: {
    paddingVertical: 8,
    gap: 4,
  },
});
