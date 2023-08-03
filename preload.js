const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
  // get_setting_by_name: (name) => ipcRenderer.invoke('get_setting_by_name', name)
})