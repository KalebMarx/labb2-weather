# Weather app specification

## AI instructions

- Read this file and `STYLE.md` before making changes.
- Explain the next small step before implementing it. Follow the help ladder in `STYLE.md`.
- Do not mark a requirement complete unless it is verified and the student can explain it.
- Never invent test results or write the student's reflection or AI process log.
- End each session by reminding the student to update the session log and relevant documentation.

## Scope

- Platform: proposed TypeScript + React Native + Expo; student to confirm.
- Weather API: KTH's SMHI-format proxy during development; real SMHI API required for submission. Geocoding API: not yet chosen.
- Goal: meet the lab requirements with code we can explain. No optional features yet.
- Code, comments, and documentation: English.

## Requirements

All requirements start as planned. Track implementation, verification, and understanding separately.

| ID | Requirement | Implemented | Verified | Can explain |
| --- | --- | --- | --- | --- |
| W-01 | Search by place name using a permitted geocoding API. | No | No | No |
| W-02 | Accept coordinate input; validate finite numbers and latitude/longitude ranges. | No | No | No |
| W-03 | Show current conditions and a scrollable seven-day forecast with temperature and weather condition. | No | No | No |
| W-04 | Show today's hourly forecast and daily summaries for the remaining days. | No | No | No |
| W-05 | Open a selected day's details, including temperature, condition, wind, and precipitation where available. | No | No | No |
| W-06 | Save favourite places and provide a dedicated quick-access view. | No | No | No |
| W-07 | Provide settings for refresh interval and a UI preference. | No | No | No |
| W-08 | Fetch from Open-Meteo or SMHI asynchronously without blocking the UI. Use the real API in the final app. | No | No | No |
| W-09 | Parse API responses into our own model in a separate parser module. | No | No | No |
| W-10 | Persist parsed forecasts; show cached data and a meaningful message when offline. | No | No | No |
| W-11 | Handle loading, empty results, invalid responses, and request failures without crashes or silent blank screens. | No | No | No |
| W-12 | Remain usable in portrait and landscape. | No | No | No |
| W-13 | Have runnable, passing tests for at least two of parsing, error-state logic, and data transformation. | No | No | No |
| W-14 | Document at least 20 interaction scenarios and actual device/emulator testing. | No | No | No |
| W-15 | Keep networking, transformation, state, and UI responsibilities clear; use consistent UI spacing and states. | No | No | No |
| W-16 | Maintain the spec and AI log; submit a reflection with appendices A-D at least one day before presentation. | No | No | No |

## Implementation order

Work through one row at a time. Manual checks use a physical device or official emulator. After logic changes, rerun the relevant automated tests. Move on only when the checks pass and the student can explain the change.

| Step | Implement | Test before moving on |
| --- | --- | --- |
| 1. Setup | Confirm platform and APIs; run the minimal app. | Launch on device/emulator; edit visible text and confirm the update; restart successfully. |
| 2. Model and sample data (W-03, W-04) | Inspect one real response; define place/current/day/hour types and a small sample forecast. | Manually trace one date, temperature, condition, and unit from the response into the model. Decide how forecast-local dates are handled. |
| 3. Home view (W-03, W-04) | Render current conditions, seven daily rows, and today's hourly list from sample data. | Count seven distinct dates; compare displayed values with the sample; scroll to the last hour/day; rotate without losing access to content. |
| 4. Day details (W-05) | Pass the selected day's data to a detail screen; reuse the same model. | Open two different days and verify each date/temperature/wind/precipitation; go back and confirm the home forecast remains. |
| 5. Parser (W-09, W-13) | In a separate module, map saved API JSON to the model. Define required fields and optional missing values. | Automated parsing/transformation tests: valid response maps correctly; missing required data is rejected; absent optional data displays as unavailable; hours group by forecast-local date, including midnight. |
| 6. Live loading (W-08, W-11, W-13) | Add a weather service for fixed coordinates and state for loading/success/error. Keep fetch out of screens. | Device: loading then forecast; HTTP failure, offline failure, malformed JSON, and retry. Automated error-state tests: loading becomes success or error; failure never leaves loading stuck. |
| 7. Search (W-01, W-02, W-11) | Add a geocoding service, result selection, and coordinate validation. Reuse weather loading. Prevent older requests from overwriting newer searches. | Known and unknown place; choose between matching places; valid coordinates; blank/non-numeric/non-finite input; latitude beyond +/-90 and longitude beyond +/-180; two rapid searches finishing in reverse order. A failed new search must not relabel an old forecast. |
| 8. Offline cache (W-10, W-11) | Save successful parsed data with place and fetch time; restore it on startup; label cached data and failed updates clearly. | Load online, close, disable network, reopen: correct cached place/data/time appear. Fresh install offline: clear empty/error state. Corrupt cache: no crash. Failed refresh: keep prior forecast. Never show one place's cache as another's weather. |
| 9. Favourites (W-06) | Save place identity and coordinates; add/remove places and show a quick-access view. Reuse search's forecast-loading flow. | Add a place; add it again without duplication; restart and reopen it; remove it; check the empty view. |
| 10. Settings and refresh (W-07) | Persist a refresh interval and one UI preference. Initially propose refresh only while the app is active, with a freshness check on return; confirm this interpretation. | Preference survives restart and changes the UI; a shortened development interval triggers refresh; changing intervals does not create duplicate timers; switching places refreshes the current place; failed refresh preserves data; leaving/returning does not duplicate timers. Restore normal intervals afterward. |
| 11. UI review (W-12, W-15) | Use consistent spacing, labels, and loading/error/empty states across existing views. | Rotate every view; open the keyboard; check long names, scrolling, units, contrast, readable messages, and reachable controls. |
| 12. Submission and rehearsal (W-13, W-14, W-16) | Complete README and actual-code mappings; student completes process log, results, and reflection; assemble appendices A-D with test files. | Run the full logic suite and at least 20 documented interaction scenarios. Check key tests catch temporary faults, then restore code and rerun. Confirm real API configuration, submission deadline, and explain search-to-screen flow plus oral question 26. |

Automated test scope starts with parsing/transformation (step 5) and error-state logic (step 6). Add cases only for concrete risks or observed bugs. The manual checks above supply the interaction scenarios; record their starting states, actions, expected outcomes, and observed results in `docs/TEST_REPORT.md` as they are run.

Before each component, briefly describe its purpose, inputs/outputs, edge cases, and linked requirement IDs here. Add only the next component's plan.

### Forecast service and parser (W-08, W-09, W-11)

`fetchWeather(place)` requests proxy JSON with a 15-second timeout; `parseWeather(data, place)` validates and converts it to `WeatherForecast`. Missing required data throws; absent optional measurements become null. The existing ViewModel handles failures. Parser tests cover mapping, missing fields, invalid values, and timestamps. The proxy's example response is historical test data, not current weather.

## Decisions and open questions

- Forecast grouping (W-03, W-04): `groupForecastByDay` takes parsed entries and an optional reference date; returns Swedish-local day groups within seven calendar days, sorted entries, low/high temperatures, and the middle available entry's weather code. Missing days are not invented. Tests cover midnight, summer time, sorting, summaries, and date-window boundaries. Home explicitly overrides the reference date to 2021-11-01 for the historical proxy; remove the override for live data.

- Confirm the instructor's library restrictions: the appendix's SDK-only/single-file advice conflicts with the Expo hints and separated layers.
- Confirm required platform coverage for Expo testing. Browser testing alone does not count.
- The appendix contains unrelated game examples; use the weather requirements above.

## Code and oral-exam map

Add entries as code exists: requirement ID | code location | test | relevant oral question.
Prepare question 26 first: show AI instructions and trace one requirement to its implementation.

## Session updates

At session end: record progress and unresolved questions below; update decisions and mappings; personally add AI-process notes and observed test results. Tick requirements only after verification and teach-back.

Format: date | work completed | verification | understanding gaps | next step.
