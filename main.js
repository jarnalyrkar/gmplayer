const { app, BrowserWindow } = require('electron')
const ejse = require('ejs-electron')

let mainWindow

ejse.data('last_active_theme', 1)
ejse.data('last_active_preset', 2)

app.on('ready', () => {
  mainWindow = new BrowserWindow()
  mainWindow.loadURL('file://' + __dirname + '/views/index.ejs')
})