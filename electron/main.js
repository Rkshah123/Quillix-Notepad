const { app, BrowserWindow, Menu, dialog, shell, nativeTheme, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 460,
    minHeight: 420,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0c1220' : '#f4f7fb',
    autoHideMenuBar: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'outputs', 'index.html'));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

/* Native dialogs live in the main process on purpose: a file chooser opened
   from an IPC-triggered renderer click() has no user activation and Chromium
   silently ignores it — that is why File → Import File… felt unresponsive.
   Reading the files here guarantees the dialog opens instantly and the
   renderer receives ready-to-import content. */
const IMPORT_EXTENSIONS = ['json', 'txt', 'md', 'markdown', 'js', 'mjs', 'ts', 'tsx', 'py', 'java', 'c', 'h', 'cpp', 'cc', 'cxx', 'css', 'html', 'htm', 'xml', 'sql', 'yml', 'yaml'];
const IMAGE_MIME_BY_EXT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml' };
const MAX_FILE_BYTES = 25 * 1024 * 1024;

async function pickAndSendFiles() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import files',
    buttonLabel: 'Import',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Notes, backups & code', extensions: IMPORT_EXTENSIONS }]
  });
  if (result.canceled || !result.filePaths.length) return;
  const items = [];
  const skipped = [];
  for (const filePath of result.filePaths.slice(0, 50)) {
    const name = path.basename(filePath);
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.size > MAX_FILE_BYTES) { skipped.push(name); continue; }
      const text = await fs.promises.readFile(filePath, 'utf8');
      items.push({ name, text, size: stats.size });
    } catch (_) {
      skipped.push(name);
    }
  }
  if (items.length) send('quillix:import-data', items);
  if (skipped.length) send('quillix:import-skipped', skipped.slice(0, 5));
}

async function pickAndSendWord() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Word document',
    buttonLabel: 'Open',
    properties: ['openFile'],
    filters: [{ name: 'Word documents', extensions: ['docx', 'doc'] }]
  });
  if (result.canceled || !result.filePaths.length) return;
  const filePath = result.filePaths[0];
  const name = path.basename(filePath);
  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.size > MAX_FILE_BYTES) { send('quillix:word-error', `${name} is larger than 25 MB.`); return; }
    const data = await fs.promises.readFile(filePath);
    send('quillix:word-data', { name, data });
  } catch (_) {
    send('quillix:word-error', `${name} could not be read.`);
  }
}

async function pickAndSendImage() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Insert image',
    buttonLabel: 'Insert',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: Object.keys(IMAGE_MIME_BY_EXT) }]
  });
  if (result.canceled || !result.filePaths.length) return;
  const filePath = result.filePaths[0];
  const name = path.basename(filePath);
  try {
    const data = await fs.promises.readFile(filePath);
    const ext = (name.split('.').pop() || '').toLowerCase();
    const type = IMAGE_MIME_BY_EXT[ext];
    if (!type) throw new Error('Unsupported image');
    send('quillix:insert-image-data', { name, type, data });
  } catch (_) {
    send('quillix:insert-image-error');
  }
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Topic', accelerator: 'CmdOrCtrl+N', click: () => send('quillix:new-topic') },
        { label: 'Import File…', accelerator: 'CmdOrCtrl+O', click: () => { pickAndSendFiles(); } },
        { type: 'separator' },
        { label: 'Backup Notes (JSON)…', click: () => send('quillix:backup') },
        { type: 'separator' },
        { label: 'Open Word Document…', click: () => { pickAndSendWord(); } },
        { type: 'separator' },
        { label: 'Insert Image…', click: () => { pickAndSendImage(); } },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      { type: 'separator' },
      { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => send('quillix:find') },
      { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => send('quillix:replace') }
    ] },
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ] },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function send(channel, ...args) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, ...args);
}

function registerIpc() {
  /* Backup writes through a native save dialog from the main process —
     blob-based downloads are unreliable without a renderer user gesture. */
  ipcMain.handle('quillix:save-backup', async (event, text) => {
    if (!mainWindow || mainWindow.isDestroyed() || typeof text !== 'string') return null;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Backup notes',
      buttonLabel: 'Save backup',
      defaultPath: 'quillix-notepad-backup.json',
      filters: [{ name: 'JSON backup', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return null;
    await fs.promises.writeFile(result.filePath, text, 'utf8');
    return result.filePath;
  });
}

/* Single-instance: relaunching focuses the existing window so notes are never
   edited from two processes at once. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(() => {
    registerIpc();
    createWindow();
    buildMenu();
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
}
