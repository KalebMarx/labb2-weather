import { useState } from 'react';
import { Button, FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Place } from '../models/Weather';
import { forecastTimeZone } from '../utils/groupForecastByDay';
import { formatTemperature } from '../utils/formatTemperature';
import type { WeatherViewModel } from '../viewmodels/useWeatherViewModel';

type HomeScreenProps = {
  viewModel: WeatherViewModel;
  referenceDate: string;
  onSelectDay: (date: string) => void;
};

export function HomeScreen({ viewModel, referenceDate, onSelectDay }: HomeScreenProps) {
  const { weather, days, loading, error, loadWeather } = viewModel;
  const { usingSavedForecast, cacheError, restoringForecast } = viewModel;
  const { places, searching, searchError, searchPlaces } = viewModel;
  const { favourites, favouritesBusy, favouritesError, restoreFavourites, isFavourite, toggleFavourite } = viewModel;
  const [query, setQuery] = useState('');
  const temperatureUnit = viewModel.settings?.temperatureUnit ?? 'C';

  function handleSearch() {
    Keyboard.dismiss();
    searchPlaces(query);
  }

  function handlePlaceSelection(place: Place) {
    Keyboard.dismiss();
    loadWeather(place);
  }

  const favouritesSection = (
    <View style={styles.favouritesSection}>
      <Text style={styles.dayTitle}>Favourites</Text>
      {favouritesBusy && <Text>Updating favourites...</Text>}
      {favouritesError && <Text>{favouritesError}</Text>}
      {favourites === null && !favouritesBusy && (
        <Button title="Retry loading favourites" onPress={restoreFavourites} />
      )}
      {favourites?.length === 0 && <Text>No saved places yet.</Text>}
      {favourites && favourites.length > 0 && (
        <ScrollView horizontal contentContainerStyle={styles.hourlyList}>
          {favourites.map(place => (
            <View
              key={`${place.latitude}-${place.longitude}`}
              style={[styles.hourlyEntry, styles.favouriteCard]}
            >
              <Pressable
                onPress={() => handlePlaceSelection(place)}
                accessibilityRole="button"
                accessibilityLabel={`Load favourite ${place.name}, ${place.latitude}, ${place.longitude}`}
                style={styles.daySummary}
              >
                <Text>{place.name}</Text>
                <Text>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</Text>
              </Pressable>
              <Button title="Remove" onPress={() => toggleFavourite(place)} disabled={favouritesBusy} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Text>KTH proxy test data ({referenceDate})</Text>

      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Place name or latitude, longitude"
        accessibilityLabel="Place name or latitude, longitude"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <Button title="Search" onPress={handleSearch} disabled={query.trim() === ''} />

      {searching && <Text>Searching for places...</Text>}
      {searchError && <Text>{searchError}</Text>}
      {places?.length === 0 && <Text>No places found.</Text>}

      {places && places.length > 0 && (
        <FlatList
          style={styles.searchResults}
          data={places}
          keyboardShouldPersistTaps="handled"
          keyExtractor={place => `${place.name}-${place.latitude}-${place.longitude}`}
          renderItem={({ item: place }) => (
            <Pressable
              onPress={() => handlePlaceSelection(place)}
              accessibilityRole="button"
              accessibilityLabel={`Load weather for ${place.name}, ${place.latitude}, ${place.longitude}`}
              style={({ pressed }) => [styles.forecastEntry, pressed && styles.pressed]}
            >
              <Text>{place.name}</Text>
              <Text>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</Text>
            </Pressable>
          )}
        />
      )}

      {loading && <Text>Loading weather...</Text>}
      {error && <Text>{error}</Text>}
      {restoringForecast && !weather && <Text>Loading saved forecast...</Text>}
      {!restoringForecast && !weather && !loading && !error && (
        <Text>No saved forecast. Connect to the internet and search for a place.</Text>
      )}
      {!weather && cacheError && <Text>{cacheError}</Text>}

      {!weather && favouritesSection}

      {weather && (
        <>
          <Text>{weather.place.name}</Text>
          {!isFavourite(weather.place) && (
            <Button
              title="Add to favourites"
              onPress={() => toggleFavourite(weather.place)}
              disabled={favouritesBusy || favourites === null}
            />
          )}
          <FlatList
            style={styles.list}
            data={days}
            keyExtractor={day => day.date}
            ListHeaderComponent={
              <View style={styles.forecastHeader}>
                <Text>Fetched: {new Date(weather.fetchedAt).toLocaleString()}</Text>
                {usingSavedForecast && <Text>Showing the saved forecast for {weather.place.name}.</Text>}
                {error && !usingSavedForecast && <Text>Showing the previous forecast for {weather.place.name}.</Text>}
                {cacheError && <Text>{cacheError}</Text>}
                <Button
                  title="Refresh weather"
                  onPress={() => loadWeather(weather.place)}
                  disabled={loading}
                />
                {favouritesSection}
              </View>
            }
            ListEmptyComponent={<Text>No forecast available for these dates.</Text>}
            renderItem={({ item: day }) => (
              <View style={styles.forecastEntry}>
                <Pressable
                  onPress={() => onSelectDay(day.date)}
                  accessibilityRole="button"
                  accessibilityLabel={`View forecast for ${day.date}`}
                  style={({ pressed }) => [styles.daySummary, pressed && styles.pressed]}
                >
                  <Text style={styles.dayTitle}>{day.date}</Text>
                  <Text>Low: {formatTemperature(day.minTemperature, temperatureUnit)} / High: {formatTemperature(day.maxTemperature, temperatureUnit)}</Text>
                  <Text>Weather code: {day.weatherCode}</Text>
                  <Text style={styles.link}>View day details</Text>
                </Pressable>

                {day.date === referenceDate && (
                  <>
                    <Text style={styles.dayTitle}>Hourly forecast</Text>
                    <ScrollView horizontal contentContainerStyle={styles.hourlyList}>
                      {day.entries.map(entry => (
                        <View key={entry.time} style={styles.hourlyEntry}>
                          <Text>
                            {new Date(entry.time).toLocaleTimeString('en-GB', {
                              timeZone: forecastTimeZone,
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <Text>Code: {entry.weatherCode}</Text>
                          <Text style={styles.hourlyTemperature}>{formatTemperature(entry.temperature, temperatureUnit)}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
  },
  searchResults: {
    width: '100%',
    maxHeight: 160,
    flexGrow: 0,
  },
  favouritesSection: {
    width: '100%',
    gap: 8,
    paddingBottom: 16,
  },
  forecastHeader: {
    gap: 12,
  },
  favouriteCard: {
    width: 200,
  },
  forecastEntry: {
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  daySummary: {
    gap: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hourlyList: {
    gap: 12,
    paddingBottom: 12,
  },
  hourlyEntry: {
    width: 104,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef3f8',
    borderRadius: 12,
  },
  hourlyTemperature: {
    fontSize: 20,
  },
  link: {
    color: '#1756a9',
  },
  pressed: {
    opacity: 0.6,
  },
});
