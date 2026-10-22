/* Temporary: capture the Settings panel with the theme slider. */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2];

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: true,
    width: 1280,
    height: 820,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '..', 'electron', 'preload.js')
    }
  });
  await win.loadFile(path.join(__dirname, '..', 'outputs', 'index.html'));
  await new Promise((r) => setTimeout(r, 2500));
  await win.webContents.executeJavaScript(`(function () {
    document.getElementById('settingsButton').click();
    return true;
  })()`, true);
  await new Promise((r) => setTimeout(r, 1200));
  const img = await win.webContents.capturePage();
  fs.writeFileSync(OUT, img.toPNG());
  app.exit(0);
});

setTimeout(() => app.exit(1), 30000);
