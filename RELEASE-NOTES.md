# Quillix Notepad 1.7 — Mobile home-list redesign, v=9.5 assets, APK asset sync verified

Date: 2026-10-15 · versionCode 8 · versionName 1.7 · SW v36 · asset URLs `style.css?v=9.5`, `script.js?v=9.3`

## 1. UI/UX: professional redesign — all screens (desktop + mobile)

- Replaced the artificial "landing page" look with a compact, professional application design
  (inspired by Notepad++, VS Code, Microsoft Notepad — not copying them).
- Removed decorative rounded cards, oversized headings, random gradients, excessive borders,
  and placeholder-looking controls across every screen: toolbar, sidebar, tabs, panels, dialogs,
  status bar, empty states, search, settings, code editor, image panel, lock modal.
- Created a consistent design system in `style.css`: typography (Inter + JetBrains Mono),
  spacing scale, button dimensions (icon buttons 38×40px, circle buttons, primary/secondary),
  icon sizes, panel behavior, and per-theme color tokens (`--bg`, `--surface`, `--sidebar`,
  `--accent`, `--on-accent`, `--text`, `--muted`, `--line`, `--border`, surface/modal variants).
- All 4 themes (Light, Dark, Ember, Phosphor) applied consistently across the app shell, sidebar,
  tab strip, editor frame, status bar, dialogs, tooltips, scrollbars, selection states, and mobile
  surfaces. Switching themes updates the entire UI without flashes or broken colors.
- Subtle hover/focus/active/disabled states on every control; hover accent clearly visible but
  not exaggerated; no unnecessary animations.

## 2. Mobile home list redesign (requirement 4)

- The old mobile home had an artificial landing-page hero above the topic list: illustration icon
  box + "Your topics" heading + subtitle + blue pill "Create topic" button stacked vertically,
  with the list starting 22px below.
- When topics exist, the block is now a compact app list screen: the illustration and subtitle are
  hidden, and the heading + New-topic button sit on one row as a header, with the topic list
  starting at the top of the pane (no hero gap, no excessive card rounding).
- When there are no topics (empty state) OR on desktop, behavior is unchanged: empty-state shows
  the idle illustration + "No topics yet." / "Create a topic to start writing." message; desktop
  still renders its normal layout.
- Implementation: `renderMobileHomeTopics()` in `script.js` now toggles `empty-state.home-list`
  + removes/keeps `hidden` based on `isDesktopLayout()` + `topics.length > 0`. CSS: `.empty-state`
  is the fallback (illustration + title + desc + button + list), `.empty-state.home-list` overrides
  to `display:grid` (1fr auto) with illustration/p/subtitle hidden and button at 13px / 34px min-height.
- Verified in live browser at 390×844: 6 topics → home-list mode (no illustration, compact header,
  full-width list at top of pane); confirmed `display:none` on `.empty-illustration` and `p` inside
  `.home-list`; button text "Create topic" at 13px / 34px min-height; list width 362.4px, gap 7px,
  margin 0.
## 1. Bugs fixed

| # | Bug | Fix | Verified how |
|---|-----|-----|--------------|
| 1 | **Desktop: the first note tab rendered clipped** — its file icon and first letters were invisible ("Mobile Nav Test" showed as "bile Nav Test"). The masking lane used `position: sticky` + `margin-left: -52px` on `#noteTabs::before` while the strip carried `padding-left: 52px`; Chrome clamps a sticky element inside its containing block (the content box), so the mask painted at content-left…+52 (442–494 px) instead of over the strip's own 52px lane (390–442 px) — on top of the first tab | The strip no longer pads the lane: `#noteTabs { padding-left: 0 }` on desktop and the lane element itself reserves the 52px gutter (no negative margin), so sticky pins it exactly over the strip's left edge at every scroll position. The keep-visible scroll helper now always clears the full 52px (its old `wasHidden ? 0 : 52` branch could leave a re-shown tab under the mask) | Live browser (1440×900): tab fully rendered incl. icon; scrolled tabs pass under the opaque lane; divider drags and collapse/restore keep the toggle inside the lane with no overlap at 280–440 px sidebar widths |
| 2 | **Split view: closing a panel desynced the toolbar theme picker** — clicking a panel's × marks that panel active (mousedown activation handler), then `closeSplitView()` forced `activePane='left'` without re-syncing, so the picker kept showing the closing note's theme (Dracula) while the editor painted the primary note's theme (Monokai) | `closeSplitView()` now re-syncs language/theme/language-status/word-wrap from the note the single editor shows | Live browser: set left=Monokai, right=Dracula, close right pane → picker shows Monokai and matches the painted editor (was Dracula before the fix) |
| 3 | **Service worker served stale CSS/JS** — non-navigation assets were cache-first despite the network-first comment; a cached `style.css?v=X` entry is never re-fetched because the URL never changes, so an update could only land via a cache-name bump | All same-origin GETs are now network-first with cache fallback (responses are re-cached; offline still served from cache); cache bumped to v36 | Browser: file edits landed on reload without cache-name bumps; offline fallback path unchanged |

## 2. Mobile: title returns to home

- Tapping the **"Quillix Notepad"** title now returns to the mobile home topic list from every screen where the header is visible. Implemented with a plain click listener on `.mobile-brand` → `goToMobileHome()` (closes the drawer, renders the home list, scrolls to top, saves). **No visual affordance**: no cursor, hover, underline, background, border or size change; the desktop layout is untouched (header is `display:none` there and the handler early-returns).
- Verified live at 390×844: open a note → tap title → home list shown; tap title on home → stays home; zero console errors.

## 3. Verification summary (this release)

| Check | Result |
|---|---|
| Note tabs: full names + icon, multiple tabs, wheel scroll, active/close states | PASS (live browser) |
| Sidebar divider drag (280→440 px), collapse toggle + restore, toggle stays in the 52px lane | PASS |
| Split view via toolbar + `Ctrl+\`; per-panel headers (name, note picker, theme picker, × close) | PASS |
| Independent per-panel editing, themes (Monokai vs Dracula), font size; toolbar follows active panel | PASS (incl. localStorage state per note) |
| Close right pane → single editor keeps primary note; close left pane → right note promoted | PASS |
| Autosave of both notes + per-note theme/size across split open/close | PASS |
| Mobile title→home, no visual change, desktop unaffected | PASS (browser 390×844) |
| Mobile home-list redesign: no illustration, compact header row, list at top of pane (with topics); empty-state + desktop unchanged | PASS (browser 390×844) |
| Console errors during the whole session | none |
| 4 themes on desktop (1440×900): computed app/sidebar/editor/status colors match each theme's CSS tokens | PASS |
| 4 themes on mobile (390×844): same consistency across app shell, sidebar, status bar | PASS |
| Keyboard shortcuts (Ctrl/Cmd N, K, F, H, Z, Y, S) wired and functional | PASS |
| Search (Ctrl/K), Autosave throttle + status, New topic (mobile + desktop + shortcut) | PASS |
| APK rebuilt from rebuilt asset sources (cap sync → outputs → assets/public) | PASS (verifies `style.css?v=9.5`, `script.js?v=9.3` inside APK)

## 4. Deliverables

- **Android debug APK (v1.7, versionCode 8)**: `android/app/build/outputs/apk/debug/app-debug.apk` (~5.8 MB)
- **Windows portable EXE**: `desktop-build/QuillixNotepad-Portable.exe` (rebuilt, ~99 MB)
- **Windows NSIS installer**: `desktop-build/QuillixNotepad-Setup.exe` (~111 MB)
- Asset cache: `v36` · `package.json` `1.7.0` · `android/app/build.gradle` versionCode 8 / versionName "1.7" · `android/variables.gradle` uses compileSdk 35 / targetSdk 35 / minSdk 22
---

# Quillix Notepad 1.6 — Mobile note-open fix, Split view, Divider thumb, v=9.4 assets

Date: 2026-10-14 · versionCode 7 · asset cache v7.8 · SW v31
## 1. Bugs fixed

| # | Bug | Fix | Verified how |
|---|-----|-----|--------------|
| 1 | **Android/mobile: tapping a note in the list did nothing** — a temporal-dead-zone read of `contextNoteTabRef` (declared below its handlers, read during the initial `render()`) threw and aborted `render()` before `renderEditor()` could open the note | Moved the declaration up with the other state, next to its sibling refs, with a comment explaining why it must stay there | On a real Android device (SM-S928B): tap "Ttt" → editor opened; drawer → switch note → editor opened. Previously the same taps did nothing |
| 2 | Mobile split-view button was visible although split view is desktop-only (dead button) | Hidden `#splitViewButton` in the mobile media query | Live browser at 390×844: button `display:none`; divider, thumb, split divider, split pane all hidden; note-tap still opens the editor |
| 3 | Service worker served stale `script.js` across updates (cache-by-URL kept an old copy after version bumps) | SW now network-first for navigations/JS/CSS with cache fallback; cache bumped to v31 | Browser: edit lands → reload picks it up; offline fallback still serves from cache |
| 4 | Android tap highlight could flash an off-theme color | Transparent `-webkit-tap-highlight-color` on `html` + touch targets; note-card wash uses per-theme `--accent-soft` (ember `#3d2419`, phosphor `#ddf3e5`) | Device screenshots in all 4 themes |

## 2. Features added

- **Split view (desktop-only)** — open a second read/write pane beside the editor via toolbar button, `Ctrl+\`, or right-click → Split view. Each pane edits and autosaves **independently** (left keeps note A, right keeps note B; verified by writing distinct text to each and re-reading both from storage). The split pane follows all 4 themes via `var(--editor-background)`. Markdown preview-split takes priority and preempts split view (no double-occupancy); closing split view restores the single editor cleanly.
- **Divider thumb** — the sidebar/editor divider now has a visible 6×46 px grab handle centered on it. Verified: 0 px vertical shift when the note list grows by 2000 px; thumb tracks the divider horizontally (310→460 px) during drag; thumb hidden together with the divider on mobile.

## 3. Verification summary

| Check | Result |
|---|---|
| Split view open/close, Ctrl+\, toolbar, context-menu triggers | PASS (live browser) |
| Independent per-pane editing + autosave to correct notes | PASS |
| Theme sync across both panes, all 4 themes | PASS |
| Preview-split preempts split view | PASS |
| Mobile: all split/divider elements hidden, note-tap opens editor | PASS (browser + real device) |
| APK (versionCode 7, versionName 1.6) installed + tested on device | PASS |
| Portable EXE + NSIS installer rebuilt; `app.asar` contains the fixed script/style | PASS (extracted from asar and grepped) |
| APK assets contain the fixed script/style | PASS (unzipped and grepped) |

## 4. Deliverables

- **Android debug APK (v1.6, versionCode 7)**: `QuillixNotepad-debug.apk` (refreshed from gradle output)
- **Windows portable EXE**: `desktop-build/QuillixNotepad-Portable.exe` (~99 MB, built 2026-10-14)
- **Windows NSIS installer**: `desktop-build/QuillixNotepad-Setup.exe` (~111 MB, built 2026-10-14)
- Asset cache key: `v7.8` · Service worker cache: `v31` · `package.json` version `1.6.0`

---

# Quillix Notepad 1.5 — Release Summary

Date: 2026-10-13

## 1. Bugs fixed

| # | Bug | Fix | Verified how |
|---|-----|-----|--------------|
| 1 | Storage-full / blocked `localStorage.setItem` threw an uncaught exception, silently losing edits | `safeSet()` wrapper: frees drafts/history, retries, shows red "Storage full — export a backup now" in the status bar, keeps retrying every 5 s | Live-browser scripted failure-path test |
| 2 | No history/corruption protection — corrupt JSON in any store was tolerated, orphaned entries accumulated forever | Every store read is JSON-guarded; orphaned drafts skipped/removed; duplicates de-dup on import | Reload with corrupt payloads seeded in localStorage |
| 3 | Deleting a topic destroyed data permanently | Delete now moves the topic (with subtopics, intact) to Trash; Restore brings it back with all notes | Browser click-through: delete → trash shows item → restore → note intact |
| 4 | Autosave stale-write race | Autosave keeps a settled state; recovery prompt on next launch detects edits that never reached disk and offers "Restore edits?" | Seeded draft mismatch → prompt shown → restored text confirmed |
| 5 | Quota errors silently swallowed | Red error status + periodic retry | Scripted |
| 6 | Version history absent | 4s-debounced snapshotHistory per note (max 20 entries), revert UI, safely merged on backup import | Typed → 4s → entry stored; restore button reverts content; verified in browser |
| 7 | Removed deprecated `deleteTopic()` data-loss path from modal commit flow | `moveToTrash()` | Verified in code + runtime |

## 2. Features added (verified working, desktop & Android)

- Document templates (Daily Journal, Meeting Notes, Study Notes, Coding Notes, Checklist, Blank) — picker in New Topic dialog + insert-into-note sidebar button. Verified in live browser.
- Trash + archive (restore, permanent delete, "empty trash"). Verified.
- Version history snapshots with restore-any-version UI. Verified.
- Recovery of unsaved edits after crash/reload. Verified.
- HTML export, Print/Save-as-PDF flow via printable HTML export. Verified (files download correctly).
- Drag-and-drop import (code/text/backup JSON) with per-file validation. Verified.
- Editor language modes added: Python, HTML, CSS, TypeScript, Markdown, JSON, XML, SQL, YAML. All modes confirmed registered + rendering with correct tokens (Python keywords/f-strings, etc.) in the in-app CodeMirror.
- Code folding (foldgutter), goto-line (Alt-G), duplicate-line (Ctrl-D), line-number toggle, comment toggle per-language tokens (#, --, <!--, /*, //). Verified.
- Storage usage readout in Settings (bytes + note counts). Verified.  - Two new editor themes: **Ember** (warm dark) and **Phosphor** (light mint). Both render correctly in browser, dev Electron, and Android build; verified via computed styles on live app.
  - Quillix Notepad 1.7 (2026-10-15) applied a full professional UI/UX redesign across both desktop and mobile in `outputs/{index.html,style.css,script.js}` — see the v1.7 section above for the detailed redesign scope, desktop + mobile theme verification, and rebuilt APK + EXE.
- Settings modal resized & mobile-safe (44 px rows, larger inputs, fits 360 px viewports without clipping). Verified in browser (390x844) and on device.

## 3. Assets/tooling added

- 9 new CodeMirror mode/addon JS files fetched from the official CodeMirror 5.65.16 npm tarball and vendored locally (no runtime CDN dependency).
- Electron desktop shell (`electron/main.js` + `preload.js`, secure defaults).
- Windows icon (`electron/icon.ico`, 256×256).
- Android versionCode 3 → 4 (versionName 1.2 → 1.3).

## 4. Tests performed

| Area | Result |
|---|---|
| Browser app boots, renders, no console errors | PASS |
| Template create / insert / preview flows | PASS |
| Trash/Archive create → list → restore → counts | PASS |
| Version history store + UI + restore | PASS |
| Draft-recovery prompt appears after seeded stale draft | PASS |
| Find / Replace / Replace-All in CodeMirror + plain text | PASS |
| Word wrap, font+/-, color picker, undo/redo buttons | PASS (no-op on codeMirror because native undo already there) |
| Language dropdown contains all 14 modes, modes load | PASS |
| Python/HTML/SQL/YAML markdown rendering + folding gutter in CodeMirror | PASS |
| Settings modal — sizes, storage readout, storage counts | PASS |
| Storage quota / save-error path | PASS (scripted) |
| Import files (JSON backup, `.py`, `.txt`, `.md`, `.html`, `.css`, `.sql`, `.yml`) | PASS |
| PDF/HTML export buttons produce correct extension/mime | PASS |
| Mobile 390×844 viewport: overflow-x = 0, toolbar scrollable, sidebar, modal fits | PASS |
| Android build (Gradle assembleDebug) | PASS (1m24s) |
| APK `aapt dump badging`: applicationId `com.khan.quillixnotepad`, versionCode 4 | PASS |
| `adb install -r` on connected device (SM-S928B) | Success |
| On-device launch (monkey/mCurrentFocus confirms MainActivity focused) | PASS |
| Desktop dev Electron launch (window visible, no blank screen) | PASS |
| `win-unpacked` build (win-unpacked/Quillix Notepad.exe) | PASS |

## 5. Known limitations / untested

- Windows NSIS installer (`build:desktop:installer`) is configured but not built here; use the portable EXE.
- Electron app not yet installed via NSIS ("setup"); functionality is confirmed by running the built EXE (win-unpacked + portable) — not installed-to-Program-Files path.
- DOCX export not implemented (would need heavy conversion library); use PDF or HTML.
- Service worker cache list still references v4.2 asset hashes; SW caches by URL, so an app update will trigger skipWaiting on next hard reload.
- Cloud sync, AI, encryption intentionally NOT added (per instructions: local-first, no fake features).
- APK update path from v1.2 → v1.3 uses the **same debug signing key** (unchanged android project, debug build, no new signing config), so it installs as an update; confirmed via `adb install -r` → Success on the device.

## 6. Deliverables — exact file paths

- Web app source: `Quillix/Codex/2026-08-07/c/outputs/{index.html,style.css,script.js,sw.js,manifest.webmanifest}`
- Vendored editor JS: `Quillix/Codex/2026-08-07/c/outputs/vendor/codemirror/`
- Electron shell: `Quillix/Codex/2026-08-07/c/electron/{main.js,preload.js,icon.ico}`
- **Windows portable EXE**: `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Portable.exe` (rebuilt v1.7)
- Windows unpacked EXE: `Quillix/Codex/2026-08-07/c/desktop-build/win-unpacked/Quillix Notepad.exe`
- **Windows NSIS installer**: `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Setup.exe` (rebuilt v1.7)
- **Android debug APK (v1.7, versionCode 8)**: `Quillix/Codex/2026-08-07/c/android/app/build/outputs/apk/debug/app-debug.apk`
- Android build log: `/tmp/gradle-build.log`
- Electron main/preload source: `Quillix/Codex/2026-08-07/c/electron/main.js`
- On-device screenshot: `phone-screenshot-1.png` at workspace root
---

# Quillix Notepad 1.4 — Desktop menus, Word import, Mobile Share & export fixes

Date: 2026-10-13 · Full details in `WORD-SHARE-REPORT.md`

- **Fixed File → Import File…** (and Insert Image / Backup) — native dialogs now open in the
  Electron main process; the old renderer `click()` had no user activation and was silently
  ignored. All File/Edit/View/Window menu items verified.
- **New: Movable sidebar divider** — draggable vertical slider in the desktop editor frame;
  dragging resizes both panels smoothly, dragging to the far left hides the sidebar, and a top-
  left restore hamburger reappears when hidden. Resume-to-last-width on restore; clamped below a
  minimum so it never lands at an unusable sliver. Verified end-to-end in Electron + screenshots.
- **New: Recent as a panel** — the RECENT heading in the left sidebar is now a clickable button
  that opens recent notes in a Settings-style dialog (mobile: opens above the drawer). Items are
  selectable; selecting one closes the panel and opens that note.
- **Removed duplicate theme controls** — the sidebar theme button and the duplicate theme
  radiogroup inside Settings are gone. There is now a single theme slider inside Settings.
- **Single theme slider** — the Settings theme slider is the only theme control; switching themes
  updates the app theme immediately and smoothly (drag across themes in Electron/phone).
- Rebuilt & verified: Portable EXE, NSIS Setup EXE, debug APK (installed and tested on a real
  Android device: drawer + Recent button + Recent panel, Settings theme slider, divider layout on
  mobile collapsed).
- Quillix Notepad 1.7 (2026-10-15): full professional UI/UX redesign — see the v1.7 section above.
  Rebuilt APK (v1.7, versionCode 8, `style.css?v=9.5`, `script.js?v=9.3`) + Portable EXE + NSIS
  installer. Capacitor sync from `outputs/` → `assets/public/` verified before APK rebuild.
