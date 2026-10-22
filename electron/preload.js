const { contextBridge, ipcRenderer } = require('electron');

/* Channel names are fixed above; payloads are validated before use because
   anything crossing the context bridge must be treated as untrusted. */
contextBridge.exposeInMainWorld('quillixDesktop', {
  isDesktop: true,
  on: (channel, listener) => {
    const allowed = ['quillix:new-topic', 'quillix:backup', 'quillix:find', 'quillix:replace', 'quillix:insert-image-error', 'quillix:import-data', 'quillix:import-skipped', 'quillix:insert-image-data', 'quillix:word-data', 'quillix:word-error'];
    if (!allowed.includes(channel)) return;
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  saveBackup: (text) => ipcRenderer.invoke('quillix:save-backup', text)
});
