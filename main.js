const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

let mainWindow;
let optionsWindow;
let blockerEnabled = true;

function getSavedSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH));
  } catch {
    return { width: 1280, height: 720, fullscreen: false, blocker: true };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings));
}

function createOptionsWindow() {
  optionsWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  optionsWindow.loadFile('options.html');
}

function createMainWindow({ width, height, fullscreen }) {
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.loadURL('https://openfront.io');
}

app.whenReady().then(() => {
  const settings = getSavedSettings();
  blockerEnabled = settings.blocker;

  if (blockerEnabled) {
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      const blocked = [
        'doubleclick.net', 'ads.google.com', 'googlesyndication.com',
        'adservice.google.com', 'googletagmanager.com', 'googletagservices.com',
        'facebook.net', 'analytics.google.com'
      ];
      const shouldBlock = blocked.some(domain => details.url.includes(domain));
      callback({ cancel: shouldBlock });
    });
  }

  createOptionsWindow();
});

ipcMain.on('launch-game', (event, settings) => {
  if (optionsWindow) optionsWindow.close();
  saveSettings(settings);
  blockerEnabled = settings.blocker;
  createMainWindow(settings);
});

ipcMain.on('reload-game', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});
