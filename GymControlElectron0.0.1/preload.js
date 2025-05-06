// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchExercises: () => ipcRenderer.invoke('get-exercises'),
  postExercise: (body) => ipcRenderer.invoke('post-exercise', body),
  openDetail: (exercise) => ipcRenderer.send('open-detail', exercise),

  // Nuevo: permite al renderer registrarse para recibir el detalle
  onDetail: (callback) => {
    ipcRenderer.on('show-detail', (_, exercise) => {
      callback(exercise);
    });
  }
});
