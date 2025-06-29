const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openClientManager: () => ipcRenderer.send("open-client-manager"),
  openRegisterTrainer: () => ipcRenderer.send("open-register-trainer"),
  openDetail: (exercise) => ipcRenderer.send("open-detail", exercise),
  openUserManager: () => ipcRenderer.send("open-user-manager"),
  closeCurrentWindow: () => ipcRenderer.send("close-current-window"),
  openClientCalendar: (uid) => ipcRenderer.send('open-client-calendar', uid),
  onDetail: (cb) => {
    ipcRenderer.on('show-detail', (_, exercise) => cb(exercise));
  },
  openDetail: (exercise) => ipcRenderer.send('open-detail', exercise),
  onClientCalendar: (callback) => {
    ipcRenderer.on('load-client-calendar', (_, uid) => callback(uid));
  },
  openDayDetail: (clientUid, date) =>
    ipcRenderer.send('open-day-detail', { clientUid, date }),
  onDayDetailLoad: (cb) =>
    ipcRenderer.on('load-day-detail', (_, payload) => cb(payload)),
  openDetail: (exercise) => ipcRenderer.send('open-detail', exercise),
  logout: () => ipcRenderer.send("logout")
});

ipcRenderer.on("load-client-calendar", (_, uid) => {
  window.dispatchEvent(new CustomEvent("client-calendar-loaded", { detail: uid }));
});