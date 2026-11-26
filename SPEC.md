# Weather app — SPEC

## 1. Instructions for AI

- Read this file and `STYLE.md` before working.
- Keep code small and readable. Reuse existing functions. Explain changes.
- Build only what the student requests. If a request conflicts with these rules or the lab, explain the conflict; the student decides.
- Describe a new part in Section 4 before writing its code.
- Do not tick requirements or claim the student understands something.
- Do not write the student's test results, process log, or reflection.
- The student approved AI help with tests and oral-exam references after discussing the conflicting lab guidance. Keep changes focused; the student reviews and verifies them.
- At the end of a session, follow Section 8.

## 2. Project and AI use

- Lab: B:2. Goal: pass / E.
- Platform: TypeScript, React Native, Expo. Phone: iPhone 13 using Expo Go.
- Weather and place-name search use SMHI directly. The KTH proxy was used during development.
- Code and documents are in English. No optional features are planned.
- AI tool: Codex. The student reports that AI wrote the code, while the student chose the architecture and read the implementation.
- Usual prompts: ask how a feature could be implemented, then request implementation. The student asks Codex to read project instructions, avoid unnecessary code, reuse existing code, and review its work once.
- Detailed personal accounts and prompts belong in the student's `docs/LLM_PROCESS.md`.

## 3. Requirements

These are the lab requirements in shorter words. The student ticks a box only after checking the feature and being able to explain it. Actual test results belong in `docs/TEST_REPORT.md`.

| ID | Requirement | Complete |
| --- | --- | --- |
| W-01 | Search by place name and find its coordinates using a geocoding API. | [ YES ] |
| W-02 | Accept coordinates; reject invalid numbers and latitude/longitude outside valid ranges. | [  YES ] |
| W-03 | Show current weather information and a scrollable seven-day summary with temperature and condition. | [  YES ] |
| W-04 | Show today's available hourly entries and daily summaries for the other days. | [ YES  ] |
| W-05 | Open a selected day's details: temperature, condition, wind, and precipitation where available. | [ YES  ] |
| W-06 | Add/remove favourites, save them, and provide quick access. | [ YES  ] |
| W-07 | Settings let the user change refresh interval and another preference: Celsius/Fahrenheit. | [ YES  ] |
| W-08 | Use asynchronous requests and the real weather API in the final app. | [ YES  ] |
| W-09 | Use a separate parser to convert JSON into the app's own model. | [ YES  ] |
| W-10 | Save parsed forecasts and show saved data with a message when offline. | Implemented; offline restart unverified |
| W-11 | Show loading, empty, and error messages; failed requests must not crash or leave a silent blank screen. | [ YES  ] |
| W-12 | Work in portrait and landscape. | [ YES  ] |
| W-13 | Have runnable, passing tests covering at least two of parsing, error-state logic, and data transformation. | YES |
| W-14 | Document at least 20 interaction scenarios tested on a phone or official emulator. | [ YES  ] |
| W-15 | Keep code readable and the app usable; separate the main responsibilities. | [ YES  ] |


Current code includes these features. The test report contains three unit tests and 20 phone scenarios. This is not confirmation that every requirement is complete.

**Known testing limit:** offline requests were tested with the app open. Closing and reopening offline, including restoring the saved forecast, remains unverified because Expo Go could not reopen the project offline. Keeping data on screen does not prove storage restoration works.

## 4. Parts of the app (component specs)

This section describes each part's job, what it receives/returns, and what to check. Older descriptions were written after implementation. Checks below are ideas, not recorded results. Paths start inside `mobile/`.

### Models — W-03, W-05, W-09

`models/weatherModels.ts` defines Place, ForecastEntry, and WeatherForecast. `models/Settings.ts` defines settings. Check that services, storage, and screens use these same types. Missing optional measurements use null, not zero.

### Weather service and parser — W-08, W-09, W-11

`services/weatherService.ts` receives a Place, downloads SMHI JSON, and calls `parsers/parseWeather.ts`. The parser receives JSON and the Place, checks the fields, and returns a WeatherForecast.

Check valid data, missing temperature, failed requests, and timeout. SMHI's missing value 9999 is unavailable. Precipitation amounts are converted to mm/h using their interval length.

### Place search and coordinate input — W-01, W-02, W-11

`services/placeService.ts` receives search text and returns matching Places through `parsers/parsePlace.ts`. It uses SMHI's current autocomplete endpoint because the lab's old URL returns 404.

`parsers/parseCoordinates.ts` checks whether input is a coordinate pair. Valid coordinates go directly to weather loading; names go to place search. Enter latitude first, then longitude, separated by a comma, with dots for decimals.

Check unknown names, same-name places, invalid coordinates, and failed searches.

### ViewModel — W-01, W-03, W-04, W-07, W-10, W-11

`viewmodels/useWeatherViewModel.ts` takes no arguments. It stores React state and returns values/actions for the screens. It calls services, saves/restores data, groups days, and chooses the forecast entry nearest now.

Check loading/errors, fast searches, settings, and failed refreshes. Older request results must not replace newer ones. A failed request keeps the previous forecast under its original name.

### Screens and navigation — W-03, W-04, W-05, W-06, W-07, W-12

`App.tsx` calls the ViewModel hook once and shares it between three screens. Home receives values/actions; Details receives a selected day; Settings receives settings/actions.

`HomeScreen.tsx` shows search, weather, favourites, daily summaries, and sideways hours. `DayDetailsScreen.tsx` shows the selected day's entries. `SettingsScreen.tsx` shows preferences. These files are under `screens/`.

Check navigation, long names, empty data, scrolling, units, and rotation. Missing measurements should say Unavailable.

### Grouping and display helpers — W-03, W-04, W-05

`utils/groupForecastByDay.ts` receives forecast entries and a starting date. It returns ordered days with entries, low/high temperatures, and a condition code. It uses Swedish dates and does not invent missing days.

`utils/formatTemperature.ts` converts temperatures for display. `utils/formatWeatherCondition.ts` converts SMHI codes into readable text.

Check day/time ordering, midnight, Celsius/Fahrenheit, and readable conditions.

### Storage — W-06, W-07, W-10, W-11

The three files under `storage/` save and load favourites, settings, and the last parsed forecast using AsyncStorage. They check stored data before returning it.

Check restart persistence, missing/corrupt data, and failed saves. A save failure must not discard the current forecast or pretend a preference was saved.

### Tests — W-09, W-13

`tests/weatherParser.test.mjs` checks valid parsing and a missing temperature. `tests/forecastGrouping.test.mjs` checks grouping, sorting, and low/high values. There are three tests, covering parsing and transformation.

Run `npm test` from `mobile/`. This small suite does not check every edge case. The student's report holds results and mutation checks.

## 5. Main decisions

- Use MVVM. App owns one shared ViewModel; screens call its actions through props.
- Keep services, parsers, models, state, storage, and screens separate.
- Keep names consistent: fetchPlaces/fetchWeather in services; searchPlace/loadWeather in the ViewModel.
- Store temperatures in Celsius and convert only for display.
- Settings offer 15/30/60-minute refresh and Celsius/Fahrenheit. Defaults: 30 minutes and Celsius.
- Refresh while active and check freshness on return. No background downloads.
- Use today's Swedish date, not the proxy's historical date. Show forecast time and saved/previous-data warnings; omit the fetch-time display.
- Keep three focused unit tests at the student's request. Other edge cases have less automated coverage.

## 6. Oral-exam map

Use this to find code, not as prepared personal answers. AI drafted the references at the student's request. The student must understand them. Start with Q26.

All code paths below start in `mobile/`. Find the named function with editor search. UT-01/02/03 and UX/MT numbers refer to `docs/TEST_REPORT.md`.

| Q | Topic | Where to look | Test/demo |
| --- | --- | --- | --- |
| 1 | API request and return value | `services/weatherService.ts`: fetchWeather; `services/placeService.ts`: fetchPlaces | UX-01, UX-03 |
| 2 | JSON into model | `parsers/parseWeather.ts`: parseWeather; `models/weatherModels.ts` | UT-01 |
| 3 | Used and ignored fields | `parsers/parseWeather.ts`: returned entry fields | UT-01; compare API JSON |
| 4 | Successful HTTP response with missing fields | parseWeather validation; ViewModel loadWeather catch | UT-02, MT-02 |
| 5 | Search to screen | HomeScreen handleSearch -> ViewModel searchPlace/loadWeather -> services | UX-01, UX-03 |
| 6 | Cache and refresh | `storage/forecastStorage.ts`; ViewModel restoreForecast/refreshIfDue | UX-14, UX-18; offline restart unverified |
| 7 | Where weather is stored | ViewModel weather useState; `App.tsx` shared hook | Trace setWeather |
| 8 | New-city search | ViewModel searchPlace/loadWeather; Home status messages | UX-01, UX-09, UX-18 |
| 9 | State updates the screen | ViewModel setWeather/return; App props; HomeScreen | Trace UX-01 |
| 10 | Leave and return | ViewModel AppState effects and restore functions; storage files | UX-11, UX-13; inspect return handler |
| 11 | Loading and old data | ViewModel loadWeather; Home loading/previous-data messages | UX-17, UX-18 |
| 12 | Fast searches | ViewModel latestSearch/latestRequest checks | UX-20 |
| 13 | Timeout | weatherService AbortController/timer; ViewModel catch; Home error | Proposed delayed-request demo; no timeout unit test |
| 14 | Network versus API error | Service response.ok checks and ViewModel catch | UX-18; HTTP errors are not unit-tested |
| 15 | First launch offline | loadCachedForecast; restoreForecast; Home no-saved-forecast message | Offline startup unverified |
| 16 | Offline with saved data | loadCachedForecast; restoreForecast; Home saved-data message | Offline restart unverified; UX-16/18 only use loaded data |
| 17 | Error state to screen | ViewModel error/searchError/cacheError and Home messages | UT-02; UX-02, UX-04, UX-17 to UX-19 |
| 18 | Hardest error case | Student chooses; possible example: ViewModel request handling | Explain your own choice |
| 19 | MVVM layers | Section 4; App, screens, ViewModel, models/services/parsers/storage | Trace UX-01 |
| 20 | Requests outside View | Home action -> ViewModel -> weatherService | Explain the separation |
| 21 | Logic tested without screens | parseWeather; groupForecastByDay; `tests/` | UT-01, UT-02, UT-03 |
| 22 | Navigation | `App.tsx`: stack screens and onSelectDay callback | UX-07, UX-12 |
| 23 | Requirement to code | W-09 -> parseWeather -> weatherParser.test.mjs | UT-01 |
| 24 | Adding hourly support | ForecastEntry; groupForecastByDay; Home hourly list | Already implemented; UX-06/07 |
| 25 | Explain AI-written function | Student chooses parseWeather or groupForecastByDay | Explain it line by line |
| 26 | AI rules and requirement trace | Section 1 -> W-09 -> parseWeather | Opening question; show UT-01 |
| 27 | Changed an AI suggestion | Home sideways hours/readable conditions; student's process log | Explain your own example and reason |
| 28 | Verify AI code | forecastGrouping.test.mjs; groupForecastByDay minTemperature | UT-03, MT-03 |
| 29 | Effective prompt | Student's `docs/LLM_PROCESS.md` | Choose and explain a real prompt |
| 30 | What to change next time | Student's `docs/REFLECTION.md` | Student's own answer |

## 7. Update log and next steps

This is a project change history, not the student's personal process log. Earlier notes were recorded retrospectively. Test results stay in the test report.

| Date | Project update |
| --- | --- |
| 2026-11-22 (retrospective) | Model, parser, proxy service, ViewModel, grouping, Home/Details, and sideways hours present. |
| 2026-11-22 | SPEC aligned to the starter template; implementation notes and retrospective specs retained; testing-rule conflict flagged. |
| 2026-11-22 | Added the place-service specification and implementation, reusing parsePlace. |
| 2026-11-22 | Connected place search to independent ViewModel state and Home input/results; selecting coordinates reuses loadWeather. |
| 2026-11-22 | Added AsyncStorage favourites, startup restore, guarded add/remove, and Home quick access using existing Place/loadWeather. |
| 2026-11-22 | Added one parsed-forecast cache, startup restoration, fetch-time display, and refresh while retaining previous data on failure. |
| 2026-11-22 | Added Settings navigation, saved interval/unit choices, shared temperature formatting, and foreground refresh with cleanup. |
| 2026-11-22 | Shared search now recognises decimal coordinate pairs, reuses place validation, and calls loadWeather without geocoding. |
| 2026-11-22 | Standardised service/action names and replaced the weather-function parameter with a direct import. |
| 2026-11-22 | Connected SNOW1gv1 forecasts, updated the parser and precipitation units, and replaced the historical override with the current Swedish date. |
| 2026-11-22 | Replaced KTH place search with SMHI’s current autocomplete endpoint, reusing the parser and search flow. |
| 2026-11-23 | Added Home’s nearest-time forecast summary and larger location heading, reusing the existing minute/foreground clock and temperature formatter. |


## 8. End of each session

1. Update the project changes and next step here.
2. Student explains the changed part before ticking a requirement.
3. Student records tests, personal process-log entries, and reflection notes themselves.

## 9. Before submission

- [x] Student has checked the requirements and can explain the code.
- [x] Test report contains unit tests, mutation checks, and 20 phone scenarios; limitations are stated.
- [x] Correct production code is restored after mutation checks.
- [x] App uses real APIs.
- [x] README, SPEC, test report/test files, process log, and personal reflection are ready.
- [x] One document contains reflection and appendices A–D; submit at least one day before presentation.
