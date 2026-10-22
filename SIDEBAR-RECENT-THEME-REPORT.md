# Quillix Notepad 1.5 — Sidebar divider, Recent panel, and theme-control changes

Date: 2026-10-13

## 1. Movable vertical divider (desktop)

Location: only the desktop `#editorFrame` region (`style.css` already scoped `.sidebar-divider` to
`@media (min-width: 760px)`), so mobile never shows a 6px grab handle in a narrow drawer.
Feature: new visible divider with a center hairline (`::before`), hover/active-jump to the right
and grow to a thicker accent highlight while dragging. Dragging resizes the sidebar live; the
editor frame reflows around it. Going past a 160 px minimum snaps the drag to 0 so the sidebar
never sits at a clipped sliver. A firm release on the far side collapses the sidebar; while the
divider live-snaps below min it collapses at min width.

Important detail: during a drag below the minimum, `setSidebarWidth(0, false)` is called each
move for live feedback, and `setSidebarCollapsed(true)` is called once on release to commit the
collapse state and add `body.sidebar-collapsed`. `setSidebarCollapsed` keeps the previous remembered
width (>=160 px) so the restore button returns the user to the width they had before the drag, not
a tiny sliver. `setSidebarWidth` during drag doesn't persist until final release.

Restore: a toggle button (`#sidebarCollapseToggle`) appears at top-left of the editor frame while
`body.sidebar-collapsed` is on desktop; clicking it restores the saved last width. Esc also closes
with the same restore path. Persistence: `developer-notes-sidebar-width` + `developer-notes-sidebar-collapsed`.

## 2. Recent panel (Settings-style dialog)

- `#recentPanelButton` is the clickable RECENT heading (now a button, not a static heading).
- Desktop: opens a Settings-style modal (`#recentLayer`). On mobile the drawer is programmatically
  closed first so the panel sits above it and is reachable.
- Items: last 12 recents, with subtopic parent shown under the item title when applicable.
- Selection: clicking an item opens that note **and** closes the panel.
- Close: Done button, close button, backdrop click, or Esc.

## 3. Theme controls — single, in Settings

Removed:
- The sidebar theme utility button (`#themeButton`) and its listener (`toggleAppTheme`).
- The duplicate Settings radiogroup (`.theme-options`/`[data-theme-option]`) and its listener.
- `currentAppTheme()`/`cycleAppTheme`/`toggleAppTheme` no longer used for UI (kept only where
  legacy or cross-cutting usage still reads it; the single slider drives them all).

Kept:
- `#themeSlider` inside Settings (r/w), with `<<`/`>>` wrap at min/max, plus tick dots in Settings.
- The `#themeSliderValue` readout updates on change.
- `applyAppTheme()` still writes `data-app-theme`, `color-scheme`, meta theme-color, and persists.
- Mobile: `document.body` still reflects dark scheme via `body.dark`.

## Verification summary

### Desktop Electron (screenshots + DOM)
- Divider block-level, col-resize cursor, 10px grab with 2px center hairline, hover-accent.
- Drag right +150 from 310 → inline 460, persisted in storage.
- Drag far left → 0 inline + `body.sidebar-collapsed` + restore button visible (top-left).
- Restore click → sidebar returns to 460 (the last remembered width), collapse class removed.
- Mid-drag clamp: moving below 160 snaps the drag to 0; continuing above 160 continues at 210.
- Recent panel opens from the RECENT button, item select closes + opens the note.
- Settings theme slider only; drag 2→3→2 updates `data-app-theme` and the readout live.
- `data-app-theme` and the slider no longer have the old radiogroup duplication.

### Mobile (browser viewport ≈390px)
- Divider and restore toggle both hidden (min-width 760px guard).
- Drawer (menu button) opens; RECENT button visible in the drawer.
- Recent button opens the Settings-style dialog above the drawer; Done / Esc / item select close it.
- No `#themeButton` and no sidebar theme slider in the drawer; Settings slider present and working.
- Export hidden, Share + Word visible in mobile footer (unchanged from previous run).

### On-device (Android APK v1.5, versionCode 6)
- Recent button opens Recent panel modal with the "Recent" title, hint, item list, Done.
- Theme slider inside Settings works (Ember, Dark, etc.) on the device.
- Visual confirmation: full app in Ember theme on the device, Recent panel overlay with both
  "Quarterly Report" and "Array copy", Done button.

## Artifacts (v1.5)
- `ios/app/build...` not touched here
- Portable EXE: `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Portable.exe`
- NSIS: `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Setup.exe`
- Android APK: `Quillix/Codex/2026-08-07/c/android/app/build/outputs/apk/debug/app-debug.apk`
- SW cache: `quillix-notepad-v20` (script.js?v=6.6, sw.js)
- Temp test scripts (not shipped): `scripts/sidebar-smoke.js`, `scripts/settings-shot.js`
