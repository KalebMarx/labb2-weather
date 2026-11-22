import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { refreshIntervals, temperatureUnits } from '../models/Settings';
import type { WeatherViewModel } from '../viewmodels/useWeatherViewModel';

type SettingsScreenProps = {
  viewModel: WeatherViewModel;
};

export function SettingsScreen({ viewModel }: SettingsScreenProps) {
  const { settings, settingsBusy, settingsError, restoreSettings, updateSettings } = viewModel;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {settingsBusy && <Text>Loading or saving settings...</Text>}
        {settingsError && <Text>{settingsError}</Text>}
        {!settings && !settingsBusy && <Button title="Retry loading settings" onPress={restoreSettings} />}

        {settings && (
          <>
            <Text style={styles.heading}>Refresh interval</Text>
            <Text>Refresh weather while the app is active.</Text>
            <View style={styles.options}>
              {refreshIntervals.map(minutes => (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings.refreshIntervalMinutes === minutes, disabled: settingsBusy }}
                  disabled={settingsBusy}
                  onPress={() => updateSettings({ ...settings, refreshIntervalMinutes: minutes })}
                  style={[styles.option, settings.refreshIntervalMinutes === minutes && styles.selected]}
                >
                  <Text>{minutes} minutes</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.heading}>Temperature unit</Text>
            <View style={styles.options}>
              {temperatureUnits.map(unit => (
                <Pressable
                  key={unit}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings.temperatureUnit === unit, disabled: settingsBusy }}
                  disabled={settingsBusy}
                  onPress={() => updateSettings({ ...settings, temperatureUnit: unit })}
                  style={[styles.option, settings.temperatureUnit === unit && styles.selected]}
                >
                  <Text>{unit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, gap: 16 },
  heading: { fontSize: 18, fontWeight: 'bold' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: { padding: 12, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  selected: { borderColor: '#1756a9', backgroundColor: '#e2ecfa' },
});
