import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DayDetailsScreen } from './screens/DayDetailsScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { fetchWeather } from './services/weatherService';
import { useWeatherViewModel } from './viewmodels/useWeatherViewModel';

type ScreenParams = {
  Home: undefined;
  DayDetails: { date: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ScreenParams>();

// The proxy returns historical data. Remove this override when using live SMHI.
const referenceDate = '2021-11-01';

export default function App() {
  const viewModel = useWeatherViewModel(fetchWeather, referenceDate);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            options={({ navigation }) => ({
              title: 'Weather',
              headerRight: () => <Button title="Settings" onPress={() => navigation.navigate('Settings')} />,
            })}
          >
            {({ navigation }) => (
              <HomeScreen
                viewModel={viewModel}
                referenceDate={referenceDate}
                onSelectDay={date => navigation.navigate('DayDetails', { date })}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="DayDetails" options={{ title: 'Day details' }}>
            {({ route }) => (
              <DayDetailsScreen
                day={viewModel.days.find(day => day.date === route.params.date)}
                placeName={viewModel.weather?.place.name ?? ''}
                temperatureUnit={viewModel.settings?.temperatureUnit ?? 'C'}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {() => <SettingsScreen viewModel={viewModel} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
