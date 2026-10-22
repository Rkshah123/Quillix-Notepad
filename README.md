# Quillix Notepad

**A local-first notes and code editor for Windows, Android, and the web.**

Quillix Notepad is a note-taking and coding workspace designed for writing, organizing, editing, and exporting notes without requiring a cloud account. It combines a clean editor, topic-based organization, code-editing tools, backup and recovery features, and a consistent interface across desktop and mobile.

> **Current documented release:** 1.7  
> **Project approach:** Local-first. Cloud sync and AI features are not included.

## Features

### Notes and organization
- Create and organize topics and subtopics.
- Pin and favorite notes, and access recent notes.
- Automatic saving with a visible save status.
- Trash, archive, restore, and permanent-delete options.
- Document templates for journals, meetings, study notes, coding notes, checklists, and blank notes.
- Version history and recovery of edits after an unexpected reload or crash.

### Writing and code editing
- Rich-text editing with images placed at the cursor.
- Resize, align, replace, and remove inserted images.
- Code editing with syntax highlighting through locally bundled CodeMirror.
- Language modes documented for JavaScript, Java, C++, Python, HTML, CSS, TypeScript, Markdown, JSON, XML, SQL, YAML, and other supported modes.
- Code folding, line numbers, go-to-line, duplicate-line, comment toggling, find, and replace.
- Keyboard shortcuts for common actions.

### Import, export, and backup
- Import supported text, code, and JSON backup files.
- Open Word documents (`.docx`) with formatting such as headings, lists, tables, links, and embedded images.
- Export notes to HTML and PDF.
- Share notes from supported mobile environments.
- Create JSON backups, including stored images.
- Print notes or use the browser's print-to-PDF flow when applicable.

### Themes and interface
- Light, Dark, Ember, and Phosphor themes.
- Responsive layouts for desktop and mobile.
- Desktop split view with independently editable panes.
- Resizable and collapsible desktop sidebar.
- Recent-notes panel and settings-based theme selection.
- Progressive Web App support with service-worker caching for offline use.

### Data protection and recovery
- Local-first storage for notes and related data.
- Image blobs stored in IndexedDB rather than placing large image data in `localStorage`.
- Guarded storage reads, recovery prompts for unsaved edits, and visible storage-error feedback.
- Exportable backups so users can keep their own copies of their notes.

## Platforms

| Platform | Available form |
|---|---|
| Web | Browser/PWA |
| Android | APK built with Capacitor |
| Windows | Electron desktop app, portable executable, and Windows installer |

The supplied project report documents a rebuilt Android debug APK and Windows portable/installer builds for version 1.7. These are build artifacts; they are not required to understand or work on the source code.

## Technology

The supplied project reports document the following technologies and components:

- **HTML, CSS, and JavaScript** — application interface and behavior
- **CodeMirror 5.65.16** — code editor and language modes
- **Electron** — Windows desktop application shell
- **Capacitor** — Android application packaging
- **IndexedDB and localStorage** — local data storage
- **Service Worker and Web App Manifest** — PWA and offline caching
- **mammoth** — Word document import
- **pdf-lib** — PDF generation

Some dependencies are bundled locally in the project to avoid relying on runtime CDNs for those components.

## Project structure

The exact folder layout can vary between working copies. The project report identifies these important areas:

```text
Quillix Notepad/
├── outputs/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── sw.js
│   ├── manifest.webmanifest
│   └── vendor/
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── icon.ico
├── android/
│   └── app/
├── desktop-build/
├── scripts/
└── package.json
```

`outputs/` contains the web application's main source files in the documented project layout. Electron files provide the desktop shell, while the Android project packages the web assets for Android.

## Getting started

### 1. Get the source code

Clone the repository or download the source ZIP from GitHub, then open a terminal in the project folder.

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Replace the placeholders with your actual GitHub repository URL and folder name.

### 2. Install dependencies

Install a compatible Node.js and npm version, then run:

```bash
npm install
```

### 3. Run or build the application

The exact development and build commands are defined in `package.json`. Check the available scripts before running one:

```bash
npm run
```

Use the relevant script listed there to start the development server or build the desktop and Android versions. Android builds also require the Android/Gradle toolchain; Windows desktop packaging uses the project's Electron build configuration.

> Build scripts and prerequisites can differ between project copies. Check `package.json` and the project configuration files in your checkout for the commands supported by that version.

## Data and privacy

Quillix Notepad is designed as a local-first application. The supplied project report states that cloud synchronization and AI features were intentionally not added.

- Notes and settings are stored locally by the application.
- Data does not automatically sync between devices through a cloud service.
- Use the application's backup/export features to keep a separate copy of important notes.
- Uninstalling an application or clearing its site/app data may remove locally stored notes. Export a backup before doing so.

## Current limitations

The supplied project report documents these limitations:

- DOCX export is not implemented; HTML or PDF export can be used instead.
- PDF text generation uses standard PDF fonts, so some characters outside Latin-1 may be replaced with `?`.
- The Windows executable is unsigned, so Windows SmartScreen may display a warning on some systems.

## Version notes

The project report identifies version **1.7** as the release dated **October 15, 2026**. It includes the professional interface redesign, a compact mobile topic list, fixes for desktop note tabs and split-view theme synchronization, and a service-worker caching update. See the project's release notes and reports for more detailed development history.

## Contributing

Contributions, bug reports, and suggestions are welcome. When reporting a bug, include:

- Your platform and operating-system version
- Steps to reproduce the issue
- What you expected to happen
- What actually happened
- Relevant screenshots or console/build errors, if available

For changes that affect note storage, backups, image handling, or imports/exports, test that existing notes remain intact and can still be restored after reload.

## License

No license information was included in the supplied project material. Add a `LICENSE` file only after choosing a license for the project. Until then, do not assume that the repository is open-source licensed for reuse.

---

**Quillix Notepad**  
Developed by Khan
