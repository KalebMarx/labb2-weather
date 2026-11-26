import { useState } from 'react';
import { Button, FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Place } from '../models/weatherModels';
import { forecastTimeZone } from '../utils/groupForecastByDay';
import { formatTemperature } from '../utils/formatTemperature';
import { formatWeatherCondition } from '../utils/formatWeatherCondition';
import type { WeatherViewModel } from '../viewmodels/useWeatherViewModel';

type HomeScreenProps = {
  viewModel: WeatherViewModel;
  referenceDate: string;
  onSelectDay: (date: string) => void;
};

export function HomeScreen({ viewModel, referenceDate, onSelectDay }: HomeScreenProps) {
  const { weather, days, currentWeather, loading, error, loadWeather } = viewModel;
  const { usingSavedForecast, cacheError, restoringForecast } = viewModel;
  const { places, searching, searchError, searchPlace } = viewModel;
  const { favourites, favouritesBusy, favouritesError, restoreFavourites, isFavourite, toggleFavourite } = viewModel;
  const [query, setQuery] = useState('');
  const { width, height } = useWindowDimensions();
  const temperatureUnit = viewModel.settings?.temperatureUnit ?? 'C';

  function handleSearch() {
    Keyboard.dismiss();
    searchPlace(query);
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
    <SafeAreaView
      style={[styles.container, { padding: width > height ? 12 : 24 }]}
      edges={['bottom', 'left', 'right']}
    >
      <FlatList
        style={styles.list}
        data={weather ? days : []}
        keyExtractor={day => day.date}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.header}>
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
              <ScrollView
                style={styles.searchResults}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {places.map(place => (
                  <Pressable
                    key={`${place.name}-${place.latitude}-${place.longitude}`}
                    onPress={() => handlePlaceSelection(place)}
                    accessibilityRole="button"
                    accessibilityLabel={`Load weather for ${place.name}, ${place.latitude}, ${place.longitude}`}
                    style={({ pressed }) => [styles.forecastEntry, pressed && styles.pressed]}
                  >
                    <Text>{place.name}</Text>
                    <Text>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {loading && <Text>Loading weather...</Text>}
            {error && <Text>{error}</Text>}
            {restoringForecast && !weather && <Text>Loading saved forecast...</Text>}
            {!restoringForecast && !weather && !loading && !error && (
              <Text>No saved forecast. Connect to the internet and search for a place.</Text>
            )}
            {!weather && cacheError && <Text>{cacheError}</Text>}

            {weather && (
              <>
                <Text style={styles.placeName} accessibilityRole="header">{weather.place.name}</Text>
                {currentWeather && (
                  <View style={styles.currentConditions}>
                    <Text style={styles.currentTemperature}>{formatTemperature(currentWeather.temperature, temperatureUnit)}</Text>
                    <Text>{formatWeatherCondition(currentWeather.weatherCode)}</Text>
                    <Text>
                      Forecast for {new Date(currentWeather.time).toLocaleString('en-GB', {
                        timeZone: forecastTimeZone,
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} (Swedish time)
                    </Text>
                  </View>
                )}
                {!isFavourite(weather.place) && (
                  <Button
                    title="Add to favourites"
                    onPress={() => toggleFavourite(weather.place)}
                    disabled={favouritesBusy || favourites === null}
                  />
                )}
                <View style={styles.forecastHeader}>
                  {usingSavedForecast && <Text>Showing the saved forecast for {weather.place.name}.</Text>}
                  {error && !usingSavedForecast && <Text>Showing the previous forecast for {weather.place.name}.</Text>}
                  {cacheError && <Text>{cacheError}</Text>}
                  <Button
                    title="Refresh weather"
                    onPress={() => loadWeather(weather.place)}
                    disabled={loading}
                  />
                </View>
              </>
            )}
            {favouritesSection}
          </View>
        }
        ListEmptyComponent={weather ? <Text>No forecast available for these dates.</Text> : undefined}
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
              <Text>{formatWeatherCondition(day.weatherCode)}</Text>
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
                      <Text>{formatWeatherCondition(entry.weatherCode)}</Text>
                      <Text style={styles.hourlyTemperature}>{formatTemperature(entry.temperature, temperatureUnit)}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  placeName: {
    width: '100%',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentConditions: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#eef3f8',
    borderRadius: 12,
  },
  currentTemperature: {
    fontSize: 40,
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
    width: '100%',
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
