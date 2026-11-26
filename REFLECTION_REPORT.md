# Reflection report

---

## Reflection

The most difficult part to me is everything related to React, since it's very new to me and I'm used to Java programming which is very different. I know that useState() is used to re render the values on screen when function is called and save variables between renders, but it can still feel a bit confusing since it's a totally new way of handling updates that I'm not used to.

Something that surprised me was how good small detailed prompts help with avoiding bloating and overcomplications which LLMs tend to do.  

The part I'm most satisfied with is the view model, it handles the logic, I understand how and I don't think it's overcomplicated.

Working with AI in this lab strengthened my belief that it's very good technically when given correct context, but it has obvious flaws when it comes to design. Not only when it comes to the UI, but also in code. An example is how it had multiple names for the same thing, in this case "location" was sometimes named "place" while refering to the same thing. It also named both my current weatherModels weather, and weatherforecast weather, making it confusing.
In this lab I also used implemented everything in small steps reviewing everything before moving onto next step, I think that helps too since it leaves less room for the AI to make decisions which usually are questionable.

I don't think I would do much different if I started over today, I think my current workflow is good and works. If anything I would spread the work out over multiple days instead of sitting an entire day.

As of today I can explain the model and viewmodel in detail

---

## Appendix A — Test report

### Test report

This report contains unit tests, mutation checks, and phone interaction scenarios. Expected behaviour and recorded results are shown separately.

#### Environment

Interaction testing: iPhone 13, Expo Go.

#### Unit tests

Run `npm test` from `D:\Skola\Mobila\labb2-weather\mobile`. These tests cover JSON parsing and data transformation. Attach both test files to Appendix A.

| ID / requirement | File and test | Expected result | Actual result |
| --- | --- | --- | --- |
| UT-01 / W-09, W-13 | `mobile/tests/weatherParser.test.mjs`: maps SMHI parameters to the weather model | Preserves the place; produces a valid fetch timestamp; maps time, 7.6 C, code 6, wind 2.5 m/s, and precipitation 0.1 mm/h correctly. | pass |
| UT-02 / W-09, W-11, W-13 | `mobile/tests/weatherParser.test.mjs`: rejects a forecast with a missing temperature | Throws an error about missing valid temperature or weather code. | pass |
| UT-03 / W-03, W-04, W-13 | `mobile/tests/forecastGrouping.test.mjs`: sorts days and hours, calculates low/high, and keeps the input unchanged | Orders November 1 before November 2 and times chronologically; November 1 has low -2 C, high 7 C, and representative code 6. Original input remains unchanged. |  pass |

#### Mutation checks

Mutation procedure: run the correct code, apply one temporary fault, run `npm test`, restore the original code, and run again. Never change a test to accept a deliberate fault.

| ID / test | Temporary production-code change | Expected detection | Observed result | Correct code restored and rerun result |
| --- | --- | --- | --- | --- |
| MT-01 / UT-01 | In `parseWeather.ts`, change the returned `temperature,` to `temperature: temperature + 1,`. | UT-01 fails because the temperature no longer matches the input. | Failed | Passed |
| MT-02 / UT-02 | In `parseWeather.ts`, temporarily remove `temperature === null` and the OR operator immediately after it from the required-field check. | UT-02 fails because the missing temperature is no longer rejected. | Failed  | Passed|
| MT-03 / UT-03 | In `groupForecastByDay.ts`, change `minTemperature: Math.min(...temperatures)` to use `Math.max`. | UT-03 fails because the minimum becomes 7 instead of -2. | Failed | Passed |

#### Interaction scenarios

Interaction checks use the iPhone rather than a browser preview. Each row separates starting state, action, expected behaviour, and actual result.

For offline checks, keep the project open in Expo Go and disable both Wi-Fi and mobile data. These scenarios test behaviour while running; they do not verify offline startup or restoration from storage after closing the app. Those startup cases remain unverified with this setup.

| ID | Starting state | Action | Expected result | Actual result |
| --- | --- | --- | --- | --- |
| UX-01 | Home open; internet available | Search Stockholm and select the matching capital-city coordinates. | Search results appear; selection loads Stockholm's forecast and clears results. | Pass |
| UX-02 | Home open; online | Search `zzzxxyyqqq`. | A clear no-places-found message appears; app remains usable. | Pass  |
| UX-03 | Home open; online | Search `59.3293, 18.0686`. | Valid coordinates load a forecast directly, without requiring place-name selection. | Pass  |
| UX-04 | Home open | Search `91, 18`. | Latitude validation error appears; no forecast request is made for invalid coordinates. | Pass  |
| UX-05 | Valid live forecast loaded | Inspect the main weather summary and scroll through the daily list. | Summary shows temperature and condition with its forecast time; seven-day overview has ordered dates, low/high temperatures, and readable conditions. | Pass  |
| UX-06 | Today's forecast includes several time entries | Swipe today's hourly strip sideways. | Available times, temperatures, and conditions can be reached without blocking vertical scrolling. | Pass  |
| UX-07 | Daily list displayed | Open a later day's details, scroll to its final entry, then go back. | Correct date and available temperature/condition/wind/precipitation appear; Back preserves the loaded forecast. | Pass  |
| UX-08 | Loaded place is not a favourite | Add it to favourites. | One quick-access entry appears; repeated duplicate addition is prevented. |  Pass |
| UX-09 | At least one favourite exists; online | Load a different place, then select the favourite. | Favourite selection loads weather using its saved coordinates. | Pass  |
| UX-10 | At least two favourites exist | Remove one favourite. | Only the selected favourite disappears; the other remains. | Pass  |
| UX-11 | A favourite remains saved | Close and reopen the app. | Saved favourites return without adding them again. | Pass  |
| UX-12 | Weather loaded; Celsius selected | Change to Fahrenheit in Settings, inspect Home and Details, then switch back. | Both screens convert consistently using F = C * 9/5 + 32; switching back restores Celsius display. | Pass  |
| UX-13 | Settings open | Select a different refresh interval and unit; close and reopen the app. | Both saved preferences are restored. |  Pass |
| UX-14 | Forecast freshly loaded; 15-minute interval selected; online | Keep the app active until refresh is due. | Weather refreshes automatically without pressing Refresh or overlapping requests. |  Pass |
| UX-15 | Forecast loaded; iPhone rotation lock off | Rotate Home, Details, and Settings between portrait and landscape; scroll and use search with the keyboard. | Content and controls remain readable and reachable on all three screens. | Pass  |
| UX-16 | Forecast displayed in the open Expo Go project | Disable internet; open a day's Details, scroll, and return to Home without reloading. | Already-loaded forecast details remain accessible offline; navigation does not require another download. | Pass  |
| UX-17 | Forecast displayed; a different place is saved as a favourite | Disable internet and select that other favourite without reloading. | Failed download shows an error; the previously displayed forecast remains under its original place name. |  Pass |
| UX-18 | Forecast displayed | Disable internet and press Refresh; then search another name. | Failure messages appear; the previous forecast remains correctly labelled. | Pass  |
| UX-19 | A request failed while offline | Restore internet and retry search/Refresh. | Request succeeds and the app recovers without restarting. |  Pass |
| UX-20 | Home online | Quickly submit two different searches; then quickly select different places. | Latest search/forecast wins; an older response cannot replace it. | Pass  |

---

### Attached test file: mobile/tests/weatherParser.test.mjs

```javascript
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
```

---

### Attached test file: mobile/tests/forecastGrouping.test.mjs

```javascript
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupForecastByDay } from '../utils/groupForecastByDay.ts';

function entry(time, temperature = 5, weatherCode = 1) {
  return { time, temperature, weatherCode, windSpeed: null, precipitation: null };
}

test('sorts days and hours, calculates low/high, and keeps the input unchanged', () => {
  const entries = [
    entry('2021-11-02T10:00:00Z', 9),
    entry('2021-11-01T15:00:00Z', -2, 6),
    entry('2021-11-01T09:00:00Z', 7, 1),
  ];
  const original = [...entries];
  const days = groupForecastByDay(entries, '2021-11-01');

  assert.deepEqual(days.map(day => day.date), ['2021-11-01', '2021-11-02']);
  assert.equal(days[0].entries[0].time, '2021-11-01T09:00:00Z');
  assert.equal(days[0].minTemperature, -2);
  assert.equal(days[0].maxTemperature, 7);
  assert.equal(days[0].weatherCode, 6);
  assert.deepEqual(entries, original);
});
```

---

## Appendix B — README.md

The project uses MVVM Structure.

App.tsx calls useWeatherViewModel and passes its values and functions to the homescreen, letting the homescreen call functions in the viewmodel.

The ViewModel uses useState() to preserve values between renders. Its functions update those values through state setters, causing React to render the updated data.

The ViewModel calls service functions to fetch data and utility functions to group it. The services handle parsing through separate parser functions.

For place-name searches, the place service finds matching places and their coordinates. The weather service uses the selected coordinates to fetch a forecast. Each service calls a parser to convert its response into the app’s model.

The ViewModel uses groupForecastByDay() from utils to organise forecast entries into daily summaries.

#### Main files

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



---

## Appendix C — SPEC.md

### Weather app — SPEC

#### 1. Instructions for AI

- Read this file and `STYLE.md` before working.
- Keep code small and readable. Reuse existing functions. Explain changes.
- Build only what the student requests. If a request conflicts with these rules or the lab, explain the conflict; the student decides.
- Describe a new part in Section 4 before writing its code.
- Do not tick requirements or claim the student understands something.
- Do not write the student's test results, process log, or reflection.
- The student approved AI help with tests and oral-exam references after discussing the conflicting lab guidance. Keep changes focused; the student reviews and verifies them.
- At the end of a session, follow Section 8.

#### 2. Project and AI use

- Lab: B:2. Goal: pass / E.
- Platform: TypeScript, React Native, Expo. Phone: iPhone 13 using Expo Go.
- Weather and place-name search use SMHI directly. The KTH proxy was used during development.
- Code and documents are in English. No optional features are planned.
- AI tool: Codex. The student reports that AI wrote the code, while the student chose the architecture and read the implementation.
- Usual prompts: ask how a feature could be implemented, then request implementation. The student asks Codex to read project instructions, avoid unnecessary code, reuse existing code, and review its work once.
- Detailed personal accounts and prompts belong in the student's `docs/LLM_PROCESS.md`.

#### 3. Requirements

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

#### 4. Parts of the app (component specs)

This section describes each part's job, what it receives/returns, and what to check. Older descriptions were written after implementation. Checks below are ideas, not recorded results. Paths start inside `mobile/`.

##### Models — W-03, W-05, W-09

`models/weatherModels.ts` defines Place, ForecastEntry, and WeatherForecast. `models/Settings.ts` defines settings. Check that services, storage, and screens use these same types. Missing optional measurements use null, not zero.

##### Weather service and parser — W-08, W-09, W-11

`services/weatherService.ts` receives a Place, downloads SMHI JSON, and calls `parsers/parseWeather.ts`. The parser receives JSON and the Place, checks the fields, and returns a WeatherForecast.

Check valid data, missing temperature, failed requests, and timeout. SMHI's missing value 9999 is unavailable. Precipitation amounts are converted to mm/h using their interval length.

##### Place search and coordinate input — W-01, W-02, W-11

`services/placeService.ts` receives search text and returns matching Places through `parsers/parsePlace.ts`. It uses SMHI's current autocomplete endpoint because the lab's old URL returns 404.

`parsers/parseCoordinates.ts` checks whether input is a coordinate pair. Valid coordinates go directly to weather loading; names go to place search. Enter latitude first, then longitude, separated by a comma, with dots for decimals.

Check unknown names, same-name places, invalid coordinates, and failed searches.

##### ViewModel — W-01, W-03, W-04, W-07, W-10, W-11

`viewmodels/useWeatherViewModel.ts` takes no arguments. It stores React state and returns values/actions for the screens. It calls services, saves/restores data, groups days, and chooses the forecast entry nearest now.

Check loading/errors, fast searches, settings, and failed refreshes. Older request results must not replace newer ones. A failed request keeps the previous forecast under its original name.

##### Screens and navigation — W-03, W-04, W-05, W-06, W-07, W-12

`App.tsx` calls the ViewModel hook once and shares it between three screens. Home receives values/actions; Details receives a selected day; Settings receives settings/actions.

`HomeScreen.tsx` shows search, weather, favourites, daily summaries, and sideways hours. `DayDetailsScreen.tsx` shows the selected day's entries. `SettingsScreen.tsx` shows preferences. These files are under `screens/`.

Check navigation, long names, empty data, scrolling, units, and rotation. Missing measurements should say Unavailable.

##### Grouping and display helpers — W-03, W-04, W-05

`utils/groupForecastByDay.ts` receives forecast entries and a starting date. It returns ordered days with entries, low/high temperatures, and a condition code. It uses Swedish dates and does not invent missing days.

`utils/formatTemperature.ts` converts temperatures for display. `utils/formatWeatherCondition.ts` converts SMHI codes into readable text.

Check day/time ordering, midnight, Celsius/Fahrenheit, and readable conditions.

##### Storage — W-06, W-07, W-10, W-11

The three files under `storage/` save and load favourites, settings, and the last parsed forecast using AsyncStorage. They check stored data before returning it.

Check restart persistence, missing/corrupt data, and failed saves. A save failure must not discard the current forecast or pretend a preference was saved.

##### Tests — W-09, W-13

`tests/weatherParser.test.mjs` checks valid parsing and a missing temperature. `tests/forecastGrouping.test.mjs` checks grouping, sorting, and low/high values. There are three tests, covering parsing and transformation.

Run `npm test` from `mobile/`. This small suite does not check every edge case. The student's report holds results and mutation checks.

#### 5. Main decisions

- Use MVVM. App owns one shared ViewModel; screens call its actions through props.
- Keep services, parsers, models, state, storage, and screens separate.
- Keep names consistent: fetchPlaces/fetchWeather in services; searchPlace/loadWeather in the ViewModel.
- Store temperatures in Celsius and convert only for display.
- Settings offer 15/30/60-minute refresh and Celsius/Fahrenheit. Defaults: 30 minutes and Celsius.
- Refresh while active and check freshness on return. No background downloads.
- Use today's Swedish date, not the proxy's historical date. Show forecast time and saved/previous-data warnings; omit the fetch-time display.
- Keep three focused unit tests at the student's request. Other edge cases have less automated coverage.

#### 6. Oral-exam map



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

#### 7. Update log



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


---

## Appendix D — LLM_PROCESS.md

All code has been written by AI. I decided on the architecture and read through each line AI implemented.

The only AI I use is Codex.
    
All context files were used for both sessions   


#### Who wrote what   

| Part | Who wrote it | Student's contribution |
| --- | --- | --- |
| Architecture | Me | Proposed MVVM and discussed the structure before implementation. |
| Models, parsers, and services | Codex | Requested small steps and reviewed the generated code. |
| ViewModel and storage | Codex | Chose the approach, asked for explanations, and reviewed the implementation. |
| Screens, navigation, and layout | Codex | Requested UI changes, including sideways hours, a larger place name, and simpler text. |
| Grouping and display helpers | Codex | Asked how the grouping works and requested consistent naming. |


#### Prompts and sessions

Before asking AI to implement something, I start by asking it "how would you implement this"

I also end all my prompts with: 

"Make  sure to check the .md files and lab instructions

Use readable code, avoid bloating and overcomplications. Don't add something I did not ask for.
When you're done, Id like you to re read it and ask if its readable and overcomplicated, if it is then fix that (once)"

This was chosen because I often find LLMS to overcomplicate stuff and add things not asked for.

Other representative prompts were:

“Viewmodel has export function UseViewModel() that returns functions inside it, Viewmodel can call service and includes a model. This is what I had planned, is it good idea?” 

This was chosen because I wanted to plan the architecture instead of just letting ai make all decisions

And:
"Start by writing the model for me. Use readable code, avoid bloating and overcomplications. Don't add something I did not ask for."
This was chosen because it represents how I used AI to implement things in small step so I could understand it and avoid overcomplicated things.



Sesson 1: 2026-11-22 14-18 (with some breaks)

Implemented View for home screen and day details, showing hourly forecast per day. Also implemented parser, weatherService using kth proxy, viewmodel and helped groupForecastByDay.ts
AI implemented everything fast but it took some around 15 minutes to understand everything in parser and weatherService


The only mistake AI has made as of now is a design mistake in homescreen, making the user have to scroll down all hourly forecasts for the day before the user can view other days, changed it so todays hourly forecasts instead show in a scrollbar.


Sesson 2: 2026-11-22 20-00

Implemented favourites, storage for favourites and last viewed location. 
Also implemented landscape support, home details and lastly I changed to SMHI instead of KTH proxy server.

While AI didnt make any technical mistakes it made design mistakes (according to myself), it made added unnecessary text, aswell as making the name of the location shown very small. 

In the code it also mixed up names, like place and location being the same thing but having different names in different function made it confusing.
