const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

let loginWin = null;
let clientManagerWin = null;
const childWins = new Set();

// Para eliminar la barra de menú del sistema:
// Menu.setApplicationMenu(null);

// Reutilizable para todas las ventanas en fullscreen
const windowConfig = {
  fullscreen: true,         // ✅ Pantalla completa
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
  },
};

function createLoginWindow() {
  loginWin = new BrowserWindow(windowConfig);
  loginWin.loadFile(path.join(__dirname, "src/login.html"));
}

function createClientManagerWindow() {
  if (loginWin && !loginWin.isDestroyed()) {
    loginWin.close();
    loginWin = null;
  }
  clientManagerWin = new BrowserWindow(windowConfig);
  clientManagerWin.loadFile(path.join(__dirname, "src/clientManager.html"));

  clientManagerWin.on("closed", () => {
    for (const w of childWins) {
      if (!w.isDestroyed()) w.close();
    }
    childWins.clear();
    clientManagerWin = null;
  });
}

function createDetailWindow(exercise) {
  const w = new BrowserWindow(windowConfig);
  w.loadFile(path.join(__dirname, "src/detail.html"));
  w.webContents.on("did-finish-load", () => {
    w.webContents.send("show-detail", exercise);
  });
  childWins.add(w);
  w.on("closed", () => childWins.delete(w));
}

function createUserManagerWindow() {
  const w = new BrowserWindow(windowConfig);
  w.loadFile(path.join(__dirname, "src/userManager.html"));
  childWins.add(w);
  w.on("closed", () => childWins.delete(w));
}

function createCalendarWindow(uid) {
  const w = new BrowserWindow({
    ...windowConfig,
    webPreferences: {
      ...windowConfig.webPreferences,
      sandbox: false,
    }
  });
  w.loadFile(path.join(__dirname, "src/calendar.html"));
  w.webContents.on("did-finish-load", () => {
    w.webContents.send("load-client-calendar", uid);
  });
  childWins.add(w);
  w.on("closed", () => childWins.delete(w));
}

function createDayDetailWindow(clientUid, date) {
  const w = new BrowserWindow({
    ...windowConfig,
    webPreferences: {
      ...windowConfig.webPreferences,
      sandbox: false,
    }
  });
  w.loadFile(path.join(__dirname, "src/dayDetail.html"));
  w.webContents.on("did-finish-load", () => {
    w.webContents.send("load-day-detail", { clientUid, date });
  });
  childWins.add(w);
  w.on("closed", () => childWins.delete(w));
}

function createRegisterTrainerWindow() {
  const w = new BrowserWindow(windowConfig);
  w.loadFile(path.join(__dirname, "src/registerTrainer.html"));
  childWins.add(w);
  w.on("closed", () => childWins.delete(w));
}

ipcMain.on("open-client-manager", () => createClientManagerWindow());
ipcMain.on("open-detail", (_, ex) => createDetailWindow(ex));
ipcMain.on("open-user-manager", () => createUserManagerWindow());
ipcMain.on("open-client-calendar", (_, uid) => createCalendarWindow(uid));
ipcMain.on("open-day-detail", (_, p) => createDayDetailWindow(p.clientUid, p.date));
ipcMain.on("open-register-trainer", () => createRegisterTrainerWindow());

// LOGOUT completo
ipcMain.on("logout", () => {
  if (clientManagerWin && !clientManagerWin.isDestroyed()) {
    clientManagerWin.close();
    clientManagerWin = null;
  }
  for (const w of childWins) {
    if (!w.isDestroyed()) w.close();
  }
  childWins.clear();
  createLoginWindow();
});

app.whenReady().then(createLoginWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
