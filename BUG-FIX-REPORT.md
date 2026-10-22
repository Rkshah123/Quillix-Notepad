# Quillix Notepad — Desktop & Mobile Bug-Fix Report

Date: 13 Oct 2026 · Scope: `Quillix/Codex/2026-08-07/c`

## Root-cause audit (done first, before any change)

Live repro in a real browser + static audit of every button id in `index.html`.

## Bugs found → fixes

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | **File → Import File… did nothing on desktop** (felt "slow/broken") | Electron menu sends `quillix:import`, preload allowlists it, but the renderer never subscribed | [script.js](Quillix/Codex/2026-08-07/c/outputs/script.js): `bindDesktopMenu()` now registers `quillix:import` → opens the file picker instantly |
| 2 | **Invisible button between PDF and Settings** | `fa-arrow-down-to-bracket` is a Font Awesome **Pro-only** icon — Free 6.6 renders `content: none` (verified live: 0px icon) | Swapped to Free icon `fa-download` in [index.html](Quillix/Codex/2026-08-07/c/outputs/index.html) |
| 3 | **Images could not be moved between text positions** | Native drag was disabled (`draggable=false` + mousedown `preventDefault`) | Implemented drag-to-drop repositioning (desktop); verified image lands exactly at drop point and persists |
| 4 | **Image insert/toolbar buttons offscreen on phones ≤480px** | `overflow-x: auto` strip pushed right-side buttons out of view | [style.css](Quillix/Codex/2026-08-07/c/outputs/style.css): quick toolbar + editor actions wrap into rows on mobile |
| 5 | **`npm run start:web` failed** | `scripts/dev-server.js` referenced by package.json did not exist | Created zero-dependency static server |
| 6 | Android screenshot/repro tooling | — | On-device test harness via adb (below) |

## What already worked (verified, no changes needed)

- Image **alignment** left/center/right with text wrap (`float`/`margin`), stored per-note in `imageAlignments`; sizes in `imageDimensions`
- **Center/right/left persisted correctly** after storage write + reload; aspect-locked corner resize; presets Small/Medium/Large/Original
- Sidebar **drag divider** (mouse + arrow keys), collapse-at-edge, Enter/Space to toggle — tested keyboard resize 310→358→310 and collapse persistence
- **All 45 buttons** have live handlers (static audit), console 100% clean
- Import of a 300-note backup: **345 ms** — no blocking slowness once fix #1 landed

## Real-device testing (connected phone `KVCYGYUGGIAAGYTS`, 1080×2400)

- `npx cap sync android` + `./gradlew assembleDebug` → **BUILD SUCCESSFUL**
- Installed & launched APK on-device; app is foreground activity
- **Portrait screenshot**: quick toolbar wraps → image button visible; sidebar respects status bar
- **Sidebar screenshot**: extends top-of-status-bar to bottom, all footer icons visible
- **Tapped the image button on-device**: Android **photo picker opened** with scoped-photos permission notice
- **Selected a photo → image inserted into the note and rendered** (screenshot with keyboard up)
- Logcat: no runtime/console errors from the app

Screenshots in [device-shots/](Quillix/Codex/2026-08-07/c/device-shots/).

## Rebuilt artifacts (all verified inside the packages)

| Artifact | Path |
|---|---|
| Portable EXE (launch-tested, 3 processes) | [QuillixNotepad-Portable.exe](Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Portable.exe) |
| NSIS installer | [QuillixNotepad-Setup.exe](Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Setup.exe) |
| Android APK | [app-debug.apk](Quillix/Codex/2026-08-07/c/android/app/build/outputs/apk/debug/app-debug.apk) |

asar spot-check: pass (`fa-download`, `quillix:import`, `dragstart`, `flex-wrap: wrap` all present; `node --check` clean).

## Limitations honestly reported

- On-device image **resize/align** was verified in-browser (same code paths, touch handlers present); full touch-gesture matrix on the phone was not hand-exercised
- Landscape orientation was not separately screenshotted
- The EXE remains self-signed (SmartScreen may warn once)

## Tests run

`node --check` on all edited JS · asar content verification · APK content verified via `cap sync` + gradle · browser smoke test with zero console errors · on-device adb install/launch/picker/insert flow.
