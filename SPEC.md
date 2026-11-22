# SPEC.md - Weather app

## 1. AI meta-instructions

- Read `SPEC.md` and `STYLE.md` first. Explain conflicts with the student's request; the student decides, with lab constraints made explicit.
- Keep changes small and reuse existing code. Follow the hint ladder in `STYLE.md` for core logic.
- Write the component specification in Section 4 before coding.
- Never tick requirements or mark them complete unless the student has verified them and can explain them.
- Follow the starter template's restriction on writing tests/reflections pending instructor clarification (Section 5). Help explain and review tests instead.
- Never write test results, `LLM_PROCESS.md`, or personal reflections. The student fills the oral-exam map.
- Remind the student of the end-of-session ritual in Section 9 after each working session.

## 2. Project facts

| Course | Lab | Platform | Grade target |
| --- | --- | --- | --- |
| Student to confirm | B:2 | TypeScript / React Native / Expo | Student to fill |

- Development: Expo Go on a phone; KTH's SMHI-format proxy. Final app must use real SMHI.
- Geocoding API: not chosen. Code and documentation: English. No optional features planned.
- AI tool: Codex. Per the student's account, AI wrote the implementation; the student chose the architecture and reads the code. Prompts request an implementation explanation, minimal readable changes, and one self-review.

## 3. Requirements checklist

W IDs follow the main lab instructions. Notes describe code present, not completion or test results. The student owns the unchecked completion column and may tick it only after verification and explanation.

| ID | Requirement | Current implementation | Complete |
| --- | --- | --- | --- |
| W-01 | Place-name search using permitted geocoding. | Parser, proxy service, ViewModel search state, and Home search/selection exist; device verification and final geocoding source remain. | [ ] |
| W-02 | Coordinate input; validate finite numbers and coordinate ranges. | Shared search accepts decimal latitude, longitude pairs with validation; device verification remains. | [ ] |
| W-03 | Current conditions and scrollable seven-day temperature/condition summaries. | Daily low/high and codes exist; current conditions and live-data review remain. | [ ] |
| W-04 | Today's hourly detail; daily overview for remaining days. | Grouping and horizontal hours exist using historical proxy dates. | [ ] |
| W-05 | Selected-day details with temperature, condition, wind, and precipitation where available. | Home/Details navigation and entry list exist. | [ ] |
| W-06 | Favourites and dedicated quick access. | Persistent Place list, add/remove, and Home quick access exist; device verification remains. | [ ] |
| W-07 | Settings for refresh interval and another UI preference. | Saved interval/unit choices, display conversion, and active-app refresh exist; device verification remains. | [ ] |
| W-08 | Asynchronous requests; real API in final app. | Async service and timeout exist; proxy still used. | [ ] |
| W-09 | Separate parser mapping JSON into our own model. | Model and parser exist. | [ ] |
| W-10 | Persist parsed forecasts; show cached data and an offline message. | Last parsed forecast saves/restores with timestamp and saved/previous-data messages; device verification remains. | [ ] |
| W-11 | Loading/empty/error states without crashes or silent blank screens. | Basic handling exists; offline recovery remains. | [ ] |
| W-12 | Portrait and landscape support. | Still locked to portrait. | [ ] |
| W-13 | Runnable, passing tests in at least two of parsing, errors, and transformation. | Parser/grouping test files exist; student verification remains. | [ ] |
| W-14 | At least 20 interaction scenarios and device/official emulator testing. | Report template exists; observed results need recording. | [ ] |
| W-15 | Clear layers and a considered, consistent UI. | Layers and two screens exist; final review remains. | [ ] |
| W-16 | Maintained records; reflection with appendices A-D, submitted at least one day before presentation. | README, student records, reflection, and submission assembly remain. | [ ] |

## 4. Component specs

Existing descriptions are retrospective (2026-11-22). Add future components before implementation. Test ideas are not results.

| Component | Purpose; inputs -> outputs | Edge cases | Test ideas | IDs |
| --- | --- | --- | --- | --- |
| `models/Weather.ts` | Define Place, ForecastEntry, WeatherForecast. | Unloaded state; null optional measurements. | Compare model with parser/UI fields. | W-03, W-05, W-09 |
| `parsers/parseWeather.ts` | JSON + Place -> validated forecast. | Malformed/missing fields, invalid dates/codes, valid zero, absent optional values. | Mapping and rejection cases. | W-09, W-11, W-13 |
| `services/weatherService.ts` | Place -> downloaded and parsed forecast. | HTTP/network failures, invalid JSON, timeout cleanup. | Successful request and each failure path. | W-08, W-11 |
| `viewmodels/useWeatherViewModel.ts` | Fetch function + reference date -> weather/search state, grouped days, load/search actions. | Initial null, blank/no-match search, failure, overlapping requests; search preserves weather. | Independent loading/errors; newest search and forecast requests win. | W-01, W-03, W-04, W-11, W-15 |
| `utils/groupForecastByDay.ts` | Entries + reference date -> ordered days, low/high, condition code. | Midnight, summer time, month boundary, empty/missing days. | Grouping, ordering, seven-day window, unchanged input. | W-03, W-04, W-13 |
| `screens/HomeScreen.tsx` | ViewModel + local search text + reference date + callback -> search/results and forecast UI. | Blank input, no matches, failure, same-name places; bounded results list. | Search/select/retry; distinguish coordinates; swipe hours, scroll days, open Details. | W-01, W-03, W-04, W-05, W-11 |
| `screens/DayDetailsScreen.tsx` | Selected day + place name -> available time entries and measurements. | Missing day; null versus zero measurements. | Different dates, units/Unavailable, final entry. | W-05, W-11 |
| `App.tsx` | Shared ViewModel + selected date -> Home/Details navigation. | Back preserves state; unmatched date. | Home -> Details -> Back without refetching. | W-05, W-15 |

### Place parser (W-01)

`parsers/parsePlace.ts`: one unknown search result -> Place. Reuse `isObject`; reject missing/blank names, non-finite coordinates, and out-of-range latitude/longitude. Check valid conversion, invalid fields, zero coordinates, and range boundaries.

### Place service (W-01, W-11)

`services/placeService.ts`: search text -> Promise of Place[]. Trim/encode the query; return [] for blank input. Request the KTH search proxy with a 15-second timeout, check HTTP status and the response array, then reuse `parsePlace`. Check blank/no matches, multiple results, special characters, failed requests, and malformed data. Called by the ViewModel's search action.

### Search integration (W-01, W-11)

Home owns the input text; the ViewModel calls `placeService.searchPlaces` and owns results, searching, and search error. Null results mean no completed search; [] means no matches. Keep search and forecast requests independent, with separate request counters. Selecting a result calls the existing loadWeather using its coordinates; preserve previous forecast on failure without relabelling it. Check blank/unknown/offline searches, duplicate names, rapid searches, and selection of different results.

Selecting a place clears search results and invalidates pending search responses. Recognise the proxy's HTTP-200 out-of-bounds response and display a clear error; never substitute another location's forecast.

### Favourites (W-06, W-11)

`storage/favouritesStorage.ts` loads/saves Place[] under `weather.favourites` using AsyncStorage and checks stored fields. The ViewModel restores once, exposes favourites and a toggle action, and saves before changing state. Match by coordinates; block edits until loaded and while saving to prevent overwrites. On read failure, show a retry; on write failure, keep the previous list. Home shows quick access even without weather and an Add button for an unsaved weather.place; removal is available only in the Favourites section. Selecting a favourite reuses loadWeather; forecasts are not cached by this feature. Check add/remove, same-name places, restart persistence, offline selection, malformed storage, and failed writes.

### Last forecast cache (W-10, W-11)

`storage/forecastStorage.ts` saves/loads one parsed WeatherForecast under `weather.lastForecast`, validating stored place, fetch time, and entries. Restore on startup without replacing a newer network result. Save only accepted successful forecasts, in write order; a cache-write failure must not hide downloaded data. Home shows fetchedAt, restored/previous-data messages, and Refresh for the displayed place. Missing cache is normal; corrupt/read failures show a message. Check online load -> close -> offline reopen, first launch offline, failed refresh, malformed cache, failed writes, and startup/request races.

### Settings (W-07, W-11)

`models/Settings.ts` defines a 15/30/60-minute interval and C/F preference, defaulting to 30 minutes/Celsius. `storage/settingsStorage.ts` validates and persists settings in AsyncStorage. The shared ViewModel restores them, saves before applying changes, and exposes saving/error/retry state. `screens/SettingsScreen.tsx` is reachable from Home. A shared formatter converts Celsius only for display in Home/Details. Auto-refresh reuses loadWeather for the displayed place when due, stops its timer in background, and checks freshness on return; no overlapping refreshes. Check restart persistence, invalid storage, failed save, 0 C -> 32 F, both screens, changed intervals, background/return, and failed refresh preserving weather.

### Shared place/coordinate input (W-01, W-02, W-11)

`parsers/parseCoordinates.ts`: text -> Place for a valid decimal latitude/longitude pair, null for a place name, or a validation error for malformed coordinate input. Comma separates latitude first and longitude second; decimals use a dot. Numeric-only input or a comma-separated input with a numeric-looking part is treated as coordinates (including NaN/Infinity). Reuse parsePlace for finite/range checks. The ViewModel sends valid pairs directly to loadWeather and names to geocoding. Check names with commas, signs/decimals/zero, blank or missing parts, mixed numeric text, boundaries, and out-of-range values; invalid pairs must not request data.

## 5. Open questions


- The starter template says AI must not write tests; the earlier appendix permits AI drafts of support/unit-test code. Ask the instructor which applies. Existing AI-written tests must retain honest attribution.
- Clarify SDK-only/single-file advice versus recommended Expo packages and separate layers.
- Clarify Expo test coverage: general instructions accept a device/emulator; hints mention both iOS and Android simulators.
- Oral Q24 suggests adding hourly support, although hourly detail is explicitly required. Follow the functional requirement meanwhile.

## 6. Decision log

- One ViewModel in `App.tsx`, shared by Home and Details. Navigation passes a date; Details reuses loaded data.
- Keep HTTP, parsing, transformation, state, and UI separate. Use built-in tools and local React state.
- Group by Swedish dates (`Europe/Stockholm`) within seven calendar days. Use available temperatures for low/high and the middle entry's condition code; do not invent missing days.
- Proxy reference date: 2021-11-01. Remove the override for live data. Today's hours scroll sideways; every daily summary opens Details.
- Settings default to 30 minutes/Celsius. Store forecasts in Celsius; format both screens in the chosen unit to one decimal place. Check freshness once a minute while active and on return; failed auto-refresh waits the chosen interval before retry. No background fetch.

## 7. Oral exam map

Student fills code locations and test names/demonstrations. Start with Q26. Blank cells are not understanding confirmations.

| Q | Topic | IDs | Code location | Test/demo |
| --- | --- | --- | --- | --- |
| 1 | Request function and return value | W-08 | | |
| 2 | JSON parsing into model | W-09 | | |
| 3 | Used/ignored API fields | W-03, W-05, W-09 | | |
| 4 | HTTP 200 with missing fields | W-09, W-11 | | |
| 5 | Search-to-screen flow | W-01, W-08, W-09 | | |
| 6 | Cache and refresh | W-07, W-10 | | |
| 7 | Where fetched data lives | W-15 | | |
| 8 | State on new-city search | W-01, W-11 | | |
| 9 | How state updates UI | W-15 | | |
| 10 | State after leaving/returning | W-07, W-10 | | |
| 11 | Loading and stale data | W-11 | | |
| 12 | Rapid searches/races | W-01, W-11 | | |
| 13 | Timeout display | W-11 | | |
| 14 | Network versus HTTP/API errors | W-08, W-11 | | |
| 15 | First launch offline | W-10, W-11 | | |
| 16 | Offline with cached data | W-10, W-11 | | |
| 17 | Error state and UI flow | W-11 | | |
| 18 | Hardest error case | W-11 | | |
| 19 | MVVM responsibilities | W-15 | | |
| 20 | Why requests are outside View | W-08, W-15 | | |
| 21 | Testable logic outside UI | W-13, W-15 | | |
| 22 | Navigation outside ViewModel | W-05, W-15 | | |
| 23 | Requirement-to-code trace | W-16 | | |
| 24 | Changes for hourly support | W-04, W-15 | | |
| 25 | Explain AI-assisted code | W-16 | | |
| 26 | AI instructions and requirement trace | W-16 | | |
| 27 | Challenged/changed AI suggestion | W-16 | | |
| 28 | Verify AI code with a test | W-13, W-16 | | |
| 29 | Effective prompt and why | W-16 | | |
| 30 | What to change next time | W-16 | | |

## 8. Plan and status

Next: landscape/UI -> live API and submission. Specify one component at a time in Section 4; verify and explain existing work before marking it complete.

Project updates only; personal session accounts belong in the student's process log.

| Date | Update | Next action |
| --- | --- | --- |
| 2026-11-22 (retrospective) | Model, parser, proxy service, ViewModel, grouping, Home/Details, and sideways hours present. | Student verifies/explains features and completes personal records. |
| 2026-11-22 | SPEC aligned to the starter template; implementation notes and retrospective specs retained; testing-rule conflict flagged. | Student completes oral map; clarify open questions. |
| 2026-11-22 | Added the place-service specification and implementation, reusing parsePlace. | Connect search to ViewModel/Home after reviewing the service. |
| 2026-11-22 | Connected place search to independent ViewModel state and Home input/results; selecting coordinates reuses loadWeather. | Student checks search, errors, selection, and navigation on the phone and explains the flow. |
| 2026-11-22 | Added AsyncStorage favourites, startup restore, guarded add/remove, and Home quick access using existing Place/loadWeather. | Student checks persistence, duplicate names, removal, and offline selection on the phone. |
| 2026-11-22 | Added one parsed-forecast cache, startup restoration, fetch-time display, and refresh while retaining previous data on failure. | Student checks offline reopen, no-cache startup, failed refresh, and explains storage versus React state. |
| 2026-11-22 | Added Settings navigation, saved interval/unit choices, shared temperature formatting, and foreground refresh with cleanup. | Student verifies preferences after restart, both screens, interval changes, and background/return behaviour. |
| 2026-11-22 | Shared search now recognises decimal coordinate pairs, reuses place validation, and calls loadWeather without geocoding. | Student checks names, valid pairs, malformed/range errors, and explains the decision flow. |

## 9. End-of-session ritual

1. Summarise actual work; update implementation notes, decisions, and the next step here.
2. Student explains a changed component's input/output, state changes, and one failure case before any completion tick.
3. Student records actual tests in `docs/TEST_REPORT.md` and updates the oral map.
4. Student writes their own `docs/LLM_PROCESS.md` entry: date, duration, tools/context, task/output, decisions, observations.
5. Student keeps their own reflection notes. AI reminds; it does not write these records.

## 10. Done

Student completion checks:

- [ ] All requirements implemented, verified, and explainable.
- [ ] Required logic tests and at least 20 device/emulator scenarios documented with actual results.
- [ ] Key tests detect temporary deliberate faults; correct code restored.
- [ ] Real weather API enabled; historical reference-date override removed.
- [ ] README, SPEC, process log, test files/report, and personal reflection ready.
- [ ] Reflection and appendices A-D assembled; submitted at least one day before presentation.
