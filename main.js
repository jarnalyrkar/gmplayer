const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const DB = require('./DB')

const db = new DB()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('get_setting_by_name', (stuff, param) => db.get_setting_by_name(param))
  createWindow()
})