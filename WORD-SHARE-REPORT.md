# Quillix Notepad — Desktop Menu Fixes, Word Import, Mobile Share & Export Report

Date: 2026-10-13

## 1. Desktop menu fixes (File / Edit / View / Window)

**Root cause of "Import File not responding":** the menu sent an IPC message and the renderer
called `fileInput.click()`. A file chooser opened programmatically from an IPC message has **no
user activation**, so Chromium silently ignores it — the dialog never opened.

**Fix:** native dialogs now live in the Electron main process (`dialog.showOpenDialog`), which
reads the files and hands ready-to-import content to the renderer over IPC.

| Menu item | Now |
|---|---|
| File → Import File… (Ctrl+O) | Native multi-select dialog → `quillix:import-data` (txt/code/JSON, 25 MB cap, skips reported) |
| File → Open Word Document… | Native dialog → `quillix:word-data` bytes (see §2) |
| File → Backup Notes (JSON)… | Native **save** dialog via `quillix:save-backup` invoke |
| File → Insert Image… | Native dialog → `quillix:insert-image-data` bytes |
| Edit / View / Window | Verified wired (undo/redo/cut/copy/paste/find/replace, reload/zoom/fullscreen, window roles) |

Verified end-to-end in Electron (dialog boundary stubbed only): import created the topic,
image inserted into the open note, backup written (1.24 MB) through the native save dialog.

## 2. Open Word Document (.docx) — desktop + mobile

- **Desktop:** File → Open Word Document… (native picker, `docx`/`doc` filter).
- **Mobile/PWA:** Word button in the sidebar footer (mobile breakpoint < 760 px) opens the
  device picker (`accept=".doc,.docx"`).
- **Conversion:** vendored `mammoth` browser build (`outputs/vendor/mammoth.browser.min.js`,
  405 KB, lazily loaded only when a Word file is opened; precached by service worker v19).
- **Preserved:** headings (h1–h3), bold, italic, links, ordered/unordered lists, tables,
  embedded images (moved into the IndexedDB image store with `data-image-id` so they hydrate,
  export, and survive reload), Unicode (é, “quotes”, ✓).
- **Graceful errors:**
  - legacy `.doc` → "Legacy .doc not supported" with guidance to re-save as `.docx`
  - corrupted/invalid file → "Could not open document" with detail; no junk note created
  - empty document → "Document is empty"
  - > 25 MB → rejected with message
- **No silent overwrite:** if a note with the same title exists, a "Note already exists —
  Import as copy?" confirmation appears; the copy is suffixed ("copy 2"), original untouched.

## 3. Mobile PDF & HTML export fix

**Root cause:** inside the Android WebView (Capacitor) anchor-based blob downloads are a silent
no-op — the file was never saved. Also `exportPdf` checked a lowercase `pdfLib` global while the
vendored UMD build registers `PDFLib`, so real PDF generation never ran.

**Fix:**
- Real multi-page PDF generation via vendored `pdf-lib` (text, formatting, tables, embedded
  images, A4 pagination) — `%PDF-` bytes verified.
- On native platforms exported files go through the **system share sheet** (Save to Drive /
  Files / WhatsApp / email) instead of an anchor download; desktop Electron keeps the anchor
  download path.

## 4. Mobile Share button (replaces Export on mobile only)

- Sidebar footer swaps **Export → Share** at the < 760 px breakpoint; desktop Export unchanged.
- Share attaches the current note as a formatted **.html file** (content + inline images) via:
  1. **Native Capacitor Share plugin** (`@capacitor/share` 6 + `@capacitor/filesystem` 6 —
     writes to app cache, shares the file URI) — Android WebView has no `navigator.share`.
  2. Web Share API `navigator.share({ files })` (mobile browsers).
  3. Text share (`navigator.share({ text })` / native Share plugin).
  4. Clipboard copy fallback with a notice.

## 5. Test evidence

| Test | Where | Result |
|---|---|---|
| Word import (fixture .docx: heading/bold/italic/table/list/image/Unicode) | Chromium | ✅ all elements present, image hydrated with `data-image-id` |
| Word duplicate-name confirm → "Import as copy" | Chromium | ✅ "copy 2" created, original untouched |
| Corrupt .docx / legacy .doc error modals | Chromium | ✅ correct messages, no junk notes |
| PDF export bytes | Chromium | ✅ `%PDF-` header, `%%EOF`, `/Subtype /Image` embedded |
| HTML export | Chromium | ✅ doctype, h1/table/list/image data-URL/Unicode/footer |
| TXT export / text import regression | Chromium | ✅ |
| Mobile viewport swap (390 px) | Chromium | ✅ Export hidden, Share+Word shown, PDF/HTML kept |
| Share API fallbacks (files → text → clipboard) | Chromium (stubbed) | ✅ each path + special characters preserved |
| Word import over real IPC | Electron (real preload, dialog skipped) | ✅ topic + h1/table/li/img/Unicode |
| File-menu IPC paths (import/image/backup) | Electron E2E | ✅ (see §1) |
| Word import via **device picker** | Android Chrome + installed APK | ✅ full formatting rendered |
| Legacy .doc message | Android Chrome | ✅ |
| Share sheet (WhatsApp/Gmail/My Files…) | Android APK | ✅ "Array copy.html" shared |
| PDF share sheet | Android APK | ✅ "Array copy.pdf" |
| Duplicate confirm modal | Android APK | ✅ |
| Packaged artifacts | — | ✅ Portable EXE, NSIS Setup EXE, debug APK all rebuilt; asar contains Word menu + mammoth |

## 6. Artifacts rebuilt

- App version: 1.4 (versionCode 5)
- `desktop-build/QuillixNotepad-Portable.exe` (103.6 MB, 13:19)
- `desktop-build/QuillixNotepad-Setup.exe` (116.8 MB, 13:34)
- `android/app/build/outputs/apk/debug/app-debug.apk` (installed & tested on device)
- Service worker cache `quillix-notepad-v19` (mammoth added to precache)
- New deps: `@capacitor/share@6.0.4`, `@capacitor/filesystem@6.0.4` (native share sheet)
