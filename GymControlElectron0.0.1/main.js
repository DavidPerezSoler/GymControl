const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWin;

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 900, height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            sandbox: false
        }
    });
    mainWin.loadFile(path.join(__dirname, 'src/index.html'));
}
function createDetailWindow(exercise) {
    const detailWin = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),  
          contextIsolation: true,
          sandbox: false
        }
      });
    detailWin.loadFile(path.join(__dirname, 'src/detail.html'));
    detailWin.webContents.on('did-finish-load', () => {
        detailWin.webContents.send('show-detail', exercise);
    });
    detailWin.loadFile(path.join(__dirname, 'src/detail.html'));
    detailWin.webContents.on('did-finish-load', () => {
        detailWin.webContents.send('show-detail', exercise);
    });
}

ipcMain.handle('get-exercises', async () => {
    const res = await axios.get('http://localhost:50000/api/Exercises');
    return res.data;
});

ipcMain.handle('post-exercise', async (_, body) => {
    const res = await axios.post('http://localhost:50000/api/Exercises', body);
    return res.data;
});

ipcMain.on('open-detail', (_, exercise) => {
    createDetailWindow(exercise);
});

app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
