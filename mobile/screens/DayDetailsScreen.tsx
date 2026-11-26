import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forecastTimeZone } from '../utils/groupForecastByDay';
import type { ForecastDay } from '../utils/groupForecastByDay';
import type { TemperatureUnit } from '../models/Settings';
import { formatTemperature } from '../utils/formatTemperature';
import { formatWeatherCondition } from '../utils/formatWeatherCondition';

type DayDetailsScreenProps = {
  day: ForecastDay | undefined;
  placeName: string;
  temperatureUnit: TemperatureUnit;
};

export function DayDetailsScreen({ day, placeName, temperatureUnit }: DayDetailsScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {day ? (
        <>
          <Text style={styles.title}>{placeName}</Text>
          <Text>{day.date}</Text>
          <FlatList
            data={day.entries}
            keyExtractor={entry => entry.time}
            renderItem={({ item: entry }) => (
              <View style={styles.entry}>
                <Text style={styles.time}>
                  {new Date(entry.time).toLocaleTimeString('en-GB', {
                    timeZone: forecastTimeZone,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text>Temperature: {formatTemperature(entry.temperature, temperatureUnit)}</Text>
                <Text>{formatWeatherCondition(entry.weatherCode)}</Text>
                <Text>
                  Wind: {entry.windSpeed === null ? 'Unavailable' : `${entry.windSpeed} m/s`}
                </Text>
                <Text>
                  Precipitation: {entry.precipitation === null ? 'Unavailable' : `${entry.precipitation} mm/h`}
                </Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text>No forecast available for this day.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  entry: {
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
