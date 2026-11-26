# Test report

This report contains unit tests, mutation checks, and phone interaction scenarios. Expected behaviour and recorded results are shown separately.

## Environment

Interaction testing: iPhone 13, Expo Go.

## Unit tests

Run `npm test` from `D:\Skola\Mobila\labb2-weather\mobile`. These tests cover JSON parsing and data transformation. Attach both test files to Appendix A.

| ID / requirement | File and test | Expected result | Actual result |
| --- | --- | --- | --- |
| UT-01 / W-09, W-13 | `mobile/tests/weatherParser.test.mjs`: maps SMHI parameters to the weather model | Preserves the place; produces a valid fetch timestamp; maps time, 7.6 C, code 6, wind 2.5 m/s, and precipitation 0.1 mm/h correctly. | pass |
| UT-02 / W-09, W-11, W-13 | `mobile/tests/weatherParser.test.mjs`: rejects a forecast with a missing temperature | Throws an error about missing valid temperature or weather code. | pass |
| UT-03 / W-03, W-04, W-13 | `mobile/tests/forecastGrouping.test.mjs`: sorts days and hours, calculates low/high, and keeps the input unchanged | Orders November 1 before November 2 and times chronologically; November 1 has low -2 C, high 7 C, and representative code 6. Original input remains unchanged. |  pass |

## Mutation checks

Mutation procedure: run the correct code, apply one temporary fault, run `npm test`, restore the original code, and run again. Never change a test to accept a deliberate fault.

| ID / test | Temporary production-code change | Expected detection | Observed result | Correct code restored and rerun result |
| --- | --- | --- | --- | --- |
| MT-01 / UT-01 | In `parseWeather.ts`, change the returned `temperature,` to `temperature: temperature + 1,`. | UT-01 fails because the temperature no longer matches the input. | Failed | Passed |
| MT-02 / UT-02 | In `parseWeather.ts`, temporarily remove `temperature === null` and the OR operator immediately after it from the required-field check. | UT-02 fails because the missing temperature is no longer rejected. | Failed  | Passed|
| MT-03 / UT-03 | In `groupForecastByDay.ts`, change `minTemperature: Math.min(...temperatures)` to use `Math.max`. | UT-03 fails because the minimum becomes 7 instead of -2. | Failed | Passed |

## Interaction scenarios

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
