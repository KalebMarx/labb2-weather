The project uses MVVM Structure.

App.tsx calls useWeatherViewModel and passes its values and functions to the homescreen, letting the homescreen call functions in the viewmodel.

The ViewModel uses useState() to preserve values between renders. Its functions update those values through state setters, causing React to render the updated data.

The ViewModel calls service functions to fetch data and utility functions to group it. The services handle parsing through separate parser functions.

For place-name searches, the place service finds matching places and their coordinates. The weather service uses the selected coordinates to fetch a forecast. Each service calls a parser to convert its response into the app’s model.

The ViewModel uses groupForecastByDay() from utils to organise forecast entries into daily summaries.

## Main files

All app paths below start in `mobile/`.

| File or folder | Responsibility |
| --- | --- |
| `App.tsx` | Creates one shared ViewModel and handles navigation between Home, Details, and Settings. |
| `screens/` | Displays weather, search, favourites, and settings; calls ViewModel actions. |
| `viewmodels/useWeatherViewModel.ts` | Holds React state and coordinates search, downloads, storage, and refresh. |
| `models/weatherModels.ts` | Defines Place, ForecastEntry, and WeatherForecast. |
| `models/Settings.ts` | Defines refresh intervals, temperature units, and defaults. |
| `services/` | Makes SMHI place-search and forecast requests, then calls the parsers. |
| `parsers/` | Checks API responses and coordinate input and converts them to the app's model. |
| `storage/` | Saves and restores favourites, settings, and the last parsed forecast using AsyncStorage. |
| `utils/` | Groups entries by Swedish date and formats temperatures and weather conditions. |
| `tests/` | Contains three unit tests for parsing and grouping. |

## Run

From `mobile/`, run `npm install`, then `npx expo start`. Scan the QR code with the iPhone Camera app to open the project in Expo Go. Run unit tests with `npm test` from the same folder.
