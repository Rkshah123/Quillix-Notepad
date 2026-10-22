# Quillix Notepad — Word-Style Image Feature: Final Report

Implements `Quillix Notepad.txt` (§1–§12). Date: 2026-10-12.

## What was built

### Images in the editor (§3–§7)
- **Insert at caret**: `insertImage` places the image exactly where the cursor
  is in the rich-text editor (not appended at the end). Triggered from the
  toolbar Image button, the Insert menu, or the Electron `Insert Image…`
  menu (`quillix:insert-image`).
- **Mixed text + images** (§4): images are inline elements in the same
  contenteditable flow; typing before/after them works. Verified order:
  text → image → text survives save/reload.
- **Word-style resizing** (§5): four corner drag handles (mouse + touch) on
  the selected image; aspect ratio preserved by default, Shift = free resize.
  Context panel offers Small/Medium/Large/Original presets.
- **Alignment** (§6): float left / center / right with wrap-around margins.
- **Selection & editing** (§7): click to select (outline + handles + panel),
  Escape or click-away to deselect, Replace image, Delete image, Restore
  original size.

### Persistence (§8)
- Image blobs live in **IndexedDB** (`quillix-images`/`images`), not
  localStorage — large images don't blow the quota.
- Per-image sizes and alignments are stored on the note
  (`imageDimensions`, `imageAlignments`) and survive `normalizeTopic`.
- On load, `hydrateImageElements` re-binds stored blobs into the saved `<img>`
  slots in place; stale `blob:` URLs from a previous session are stripped
  first so nothing is lost or duplicated.
- Deleting an image only removes the blob if no other note references the
  same image id.

### Export (§8, §12)
- **PDF**: real multi-page PDF via vendored `pdf-lib`
  (`outputs/vendor/pdf-lib.min.js`), text + both images embedded, images
  drawn at their in-note position/size, scaled to fit the page. Falls back
  to the browser print dialog if generation fails.
- **HTML**: exported file inlines every image as a data URL (no external
  files, no dead blob links), keeps alignment classes and pixel widths.
- **Backup JSON**: includes image blobs (base64) for full portability.

### Desktop & mobile (§9)
- Electron menu gains `Insert Image…` (Ctrl+Shift+I channel wired through
  preload allowlist).
- PWA service worker caches the app + pdf-lib (cache `quillix-notepad-v17`).
- Android (Capacitor) assets synced; same editor code path.

### Themes & layout (§10)
- Image UI tokens (`--image-border`, `--image-handle*`, etc.) are declared on
  `body` so each theme's `--accent`/`--surface-solid` flows into selection
  outlines and resize handles. All 4 themes verified: Light `#5667f5`,
  Dark `#8f96ff`, Ember `#ffab70`, Phosphor `#1e9e5a`.
- Sidebar collapse, width, divider drag, and keyboard resize (arrow keys,
  Shift+arrows = 48px steps) all persist across reloads.

## Bugs found and fixed during verification

1. **Duplicate declarations** in `script.js` (`importFiles`, `saveNow`) —
   second declarations silently won; removed the dead copies.
2. **Dead `attachImagesToEditor`** — appended images at the end of the note,
   causing the reported duplication; removed.
3. **TDZ crash on load** — `resizeHandleEventsBound` was a `let` declared
   after `initImageInteraction()` ran during init; the ReferenceError aborted
   note loading (empty editor on startup). Hoisted to `var`.
4. **TDZ crash on load** — `selectedImage`/`resizeState`/`imageContextWasOpen`
   same pattern (`positionImageContextPanel` read them during init). Hoisted.
5. **TDZ / wrong-DB crash** — `IMAGE_DB_NAME`, `IMAGE_STORE`, `imageDbPromise`
   were declared *after* the synchronous `initialize()` call, so the first
   `getImage()` either threw or opened IndexedDB under the wrong name; the
   first image of every note hydrated as "[missing image]". Moved the
   assignments above `initialize()`.
6. **PDF export never produced PDFs** — `ensurePdfLib()` checked
   `window.pdfLib`, but the vendored UMD build registers `window.PDFLib`.
   Export always fell back to the print dialog. Now checks both.
7. **PDF images were garbled/dropped** — the base64 sniff regex
   `/;base64,/` tested the header *before* the comma, so it never matched;
   base64 bytes were text-encoded and `embedPng` rejected them
   ("The input is not a PNG file!"). Fixed to `/;base64/`.
8. **Failed-request noise on every load** — saved note HTML still contained
   the previous session's dead `blob:` srcs, producing console errors before
   hydration replaced them. Stale srcs are now stripped at load.
9. **Escape left a dangling selection outline** — deselect now fully clears
   outline, handles, and panel.
10. **Replace image could corrupt other notes** — replacement now mints a
    fresh image id so notes sharing the old id keep their copy.
11. **HTML export duplicated images** — removed the prepend-a-list approach;
    srcs are rewritten in place instead.
12. **`imageDimensions`/`imageAlignments` dropped on load** — preserved
    through `normalizeTopic`.

## Verification (§12) — all passed in a real browser

| Scenario | Result |
|---|---|
| Insert 2 images + text via real file input | pass — caret position, order text→img→text |
| Corner drag resize 400×300 → 300×225 | pass — ratio locked (1.333) |
| Align left / center; panel + handles appear | pass — floats + saved alignments |
| Autosave → reload | pass — both images rehydrate from IndexedDB at saved 300×225 / 640×480, floats kept |
| PDF export | pass — valid `%PDF-`…`%%EOF`, 2 embedded image XObjects (400×300, 640×480) drawn via `Do` operators, all text present in order, multi-page pagination |
| HTML export | pass — 2 imgs as data URLs, no blob/missing leftovers, `qlx-image-left` + widths kept |
| 4 themes | pass — per-theme handle/border colors adapt |
| Sidebar collapse + width + keyboard resize | pass — persisted across reload |
| Console | clean — 0 errors on fresh load |
| Syntax | `node --check` passes for `script.js`, `electron/main.js` |

## Build artifacts (rebuilt with all fixes)

| Artifact | Path | Size |
|---|---|---|
| Portable EXE | `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Portable.exe` | 98.7 MB |
| NSIS installer | `Quillix/Codex/2026-08-07/c/desktop-build/QuillixNotepad-Setup.exe` | 111 MB |
| Android debug APK | `Quillix/Codex/2026-08-07/c/android/app/build/outputs/apk/debug/app-debug.apk` | 5.7 MB |

- Desktop: launches successfully (verified process start); packaged asar
  inspected — all 8 critical fixes present.
- Android: `cap sync` copied the updated `outputs/` (script.js, sw.js v17,
  vendor/pdf-lib.min.js confirmed inside the APK).
- Source of truth: `Quillix/Codex/2026-08-07/c/outputs/`
  (`script.js`, `style.css`, `index.html`, `sw.js`, `vendor/pdf-lib.min.js`)
  plus `electron/main.js`, `electron/preload.js`.

## Notes / limits

- PDF text uses the 14 standard PDF fonts (Helvetica/Courier) — non-Latin-1
  characters are replaced with `?` (documented sanitizer); images are full
  color PNG/JPEG, other formats are rasterized through a canvas first.
- Image size cap 25 MB / 4096 px per side (downscaled on insert).
- Desktop EXE is unsigned (electron-builder self-signed for local use);
  SmartScreen may warn on first run on other machines.
