const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  launchGame: (settings) => ipcRenderer.send('launch-game', settings),
  reloadGame: () => ipcRenderer.send('reload-game')
});
