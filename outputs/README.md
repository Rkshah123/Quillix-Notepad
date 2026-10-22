# Quillix Notepad

A fast, local-first Notepad++-style notes app with a lightweight code editor.
Runs as a static web app / PWA, as a **Windows desktop app (Electron)**, and as a
standalone **Android app (Capacitor)**. Notes never leave your device.

---

## What's new in version 1.3 (this release)

### Fixed bugs
- **Storage quota errors** are handled gracefully: a retry-with-trim saves your
  notes when localStorage fills up, and the status bar shows a red *"Storage
  full"* warning instead of failing silently.
- **Version history** — every note keeps up to 20 automatic snapshots (taken 4 s
  after you stop typing). Restore any version from the clock button in the
  toolbar. History lives in its own localStorage key (`developer-notes-history`),
  and old backups merge cleanly.
- **Crash-safe rendering** of corrupt/orphaned history entries (they are skipped,
  never thrown).
- **Deleted notes are succeeded by Trash** — deleting a topic now moves it to
  Trash (restorable) instead of erasing it permanently.
- **Duplicate-ID protection** on import was already present and still applies to
  every new store (trash/archive/history).
- **Preview button** no longer has a save side-effect after startup.
- **Modal select z-index/overlap** fixed; template select is properly hidden for
  rename/delete flows.

### New features
- **Document templates** — pick a template (Daily Journal, Meeting Notes,
  Study Notes, Coding Notes, Checklist, Blank) from the New Topic dialog, or
  insert one into the current note from the sidebar 📥 button.
- **Trash with restore / delete-forever** — sidebar 🗑 button.
- **Archive** — sidebar box button; archived notes come back via "Move back to
  notes".
- **Recovery of unsaved work** — on startup the app detects edits that never
  reached localStorage and offers *"Restore edits?"*.
- **HTML export** and **Print / Save as PDF** of the current note (File menu on
  desktop too). Basic markdown (headings, bold/italic, code, links,
  blockquotes) is rendered in the export.
- Drag-and-drop import: drop `.txt/…/.json` backup or code files anywhere to import.
- **Editor language modes** added: Python, HTML, CSS, TypeScript, Markdown,
  JSON, XML, SQL, YAML (in addition to JavaScript, Java, C, C++, Plain Text).
- **Code folding** (click the fold arrows in the gutter), **goto line** (Alt-G),
  duplicate line (Ctrl-D).
- **Line-number toggle** in Settings.
- **Storage usage readout** in Settings (bytes + note counts).
- **Two new editor themes: Ember (warm dark) and Phosphor (fresh light mint)**,
  both fully supported on desktop, mobile browser, and in the Android app.

---

## Run the web app (PWA)

No build step needed. From the `outputs/` folder:

```bash
python -m http.server 8080
# or: npx http-server -p 8080
```

Open http://localhost:8080. Works fully offline once visited; installable via
the browser's "Install app" icon.

You can also just double-click `outputs/index.html` (PWA install & service
worker need a server; everything else works).

---

## Desktop app (Electron)

Build the portable EXE (no installer needed):

```bash
npm install          # installs electron + electron-builder + capacitor
npm run build:desktop
```

Artifacts land in `desktop-build/`:

- `desktop-build/QuillixNotepad-Portable.exe` — single-file portable app, just run it.
- `desktop-build/win-unpacked/Quillix Notepad.exe` — unpacked variant of the same app.

Build the NSIS installer instead (`desktop-build/QuillixNotepad-Setup.exe`):

```bash
npm run build:desktop:installer
```

Dev-run from source (no packaging): `npm start:desktop` (or
`node_modules\electron\dist\electron.exe .`) — the packaged EXE is the real
deliverable.

Packaging notes:
- Secure defaults: context isolation ON, node integration OFF, sandbox ON,
  limited preload bridge (menu channels only), external links open in the
  default browser, single-instance lock so notes can't be edited from two
  processes at once.
- Native menus: File (New Topic, Import, Backup, Quit), Edit (undo/redo/
  cut/copy/paste/find/replace), View (reload, zoom, fullscreen).
- Notes are stored in Electron's localStorage for
  `file://…/outputs/index.html`; they persist across restarts.

---

## Android (APK)

Rebuild after changing `outputs/`:

```bash
npx cap sync android
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

This repo also keeps a copy at the project root:

- `QuillixNotepad-debug.apk` — latest build (versionCode 4, versionName 1.3).
- `apk-backup/QuillixNotepad-debug-v1.2-code3-OLD.apk` — previous release, kept
  as backup before replacement.

Install:
1. Copy `QuillixNotepad-debug.apk` to your phone and tap it, **or** with USB
   debugging on: `adb install -r QuillixNotepad-debug.apk`.
2. Because versionCode increased (3 → 4) and the signing key is unchanged
   (debug key), it installs **as an update over the previous version** without
   uninstalling — your existing notes remain.

---

## Data storage & safety

Everything lives in `localStorage` under `developer-notes-*` keys:

| Key | Contents |
|---|---|
| `…-topics` | topics + subtopics + notes |
| `…-trash` | deleted topics (restorable) |
| `…-archive` | archived topics |
| `…-history` | per-note version snapshots |
| `…-drafts` | unsaved-edit recovery buffer |
| `…-tags` | per-note tag map |
| `…-settings`, `…-theme`, `…-editor-theme` | preferences |
| `…-selected`, `…-recents`, `…-expanded` | UI state |

Quota errors are caught: the app trims drafts/history and retries, and shows a
red status message if saving still fails. Use 🗲 Export backup (JSON) before
clearing browser data. Import validates every record and dedupes IDs.

---

## Project layout

```
outputs/               Web app (index.html, style.css, script.js, sw.js,
                       manifest, vendor/codemirror/*)
electron/              Electron main process (secure config) + preload + icon
desktop-build/         Packaged Windows build output
android/               Capacitor Android project
QuillixNotepad-debug.apk       Latest debug APK (v1.3, versionCode 4)
apk-backup/            Previous APK versions
scripts/dev-server.js  Tiny static server for npm run start:web
```

## Browser support

Modern Chromium, Firefox, Safari, Edge. On Android the app runs full-screen via
Capacitor with correct status-bar / keyboard spacing.
