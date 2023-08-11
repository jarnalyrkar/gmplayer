const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron')
const ejse = require('ejs-electron')
const path = require('path')
const DB = require('./db/DB')
const db = new DB();

let mainWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadURL('file://' + __dirname + '/views/index.ejs')

  const protocolName = 'load-audio'

  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    }
    catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })
})


// Initial data for templates
const init_theme = db.settings.get_active_theme()
ejse.data('font', db.settings.get_font())
ejse.data('init_themes', db.themes.list())
ejse.data('init_theme', init_theme)
ejse.data('init_presets', db.presets.get_by_theme(init_theme))
ejse.data('init_preset', db.presets.get_active_in_theme(init_theme))
ejse.data('init_music', db.tracks.get_music_by_theme(init_theme))
ejse.data('init_effects', db.tracks.get_effects_by_theme(init_theme))

// IPC handlers
ipcMain.on('open-dialog', (event) => {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Audio', extensions: ['mp3', 'ogg']}
      ]
    })
    .then(({ filePaths }) => {
      if (filePaths.length) {
        const returnArr = []
        filePaths.forEach(fullpath => {
          const existingFile = db.files.get_by_fullpath(fullpath)
          const splitString = fullpath.split('.')
          const filepathArr = splitString[0].split('/')
          const filetype = splitString[1]
          const filename = filepathArr[filepathArr.length - 1]
          let file = null
          if (!existingFile) {
            file = db.files.create(fullpath, filename, filetype)
          } else {
            file = existingFile
          }
          returnArr.push({'id': file.file_id, 'fullpath': fullpath, 'filename': filename, 'filetype': filetype})
        })
        event.reply('on-file-select', returnArr);
      }
    })
})

// Themes
ipcMain.handle('themes:create', (event, name, order) => {return db.themes.create(name, order)});
ipcMain.handle('themes:get', (event, id) => {return db.themes.get(id)});
ipcMain.handle('themes:get_by_name', (event, name) => {return db.themes.get_by_name(name)});
ipcMain.handle('themes:list', (event) => {return db.themes.list()});
ipcMain.handle('themes:update', (event, id, name) => {return db.themes.update(id, name)});
ipcMain.handle('themes:update_order', (event, id, order) => {return db.themes.update(id, order)});
ipcMain.handle('themes:delete', (event, id) => {return db.themes.delete(id)});

// Presets
ipcMain.handle('presets:create', (event, name, theme_id, order, current) => {return db.presets.create(name, theme_id, order, current)});
ipcMain.handle('presets:get', (event, id) => {return db.presets.get(id)});
ipcMain.handle('presets:get_by_theme', (event, theme_id) => {return db.presets.get_by_theme(theme_id)});
ipcMain.handle('presets:get_settings_for_track', (event, preset_id, track_id) => {return db.presets.get_settings_for_track(preset_id, track_id)});
ipcMain.handle('presets:set_track_volume', (event, preset_id, track_id, volume) => {return db.presets.set_track_volume(preset_id, track_id, volume)});
ipcMain.handle('presets:set_track_play', (event, preset_id, track_id, playing) => {return db.presets.set_track_play(preset_id, track_id, playing)});
ipcMain.handle('presets:get_active_in_theme', (event, theme_id) => {return db.presets.get_active_in_theme(theme_id)});
ipcMain.handle('presets:update', (event, preset_id, new_name) => {return db.presets.update(preset_id, new_name)});
ipcMain.handle('presets:set_active_in_theme', (event, preset_id, theme_id) => {return db.presets.set_active_in_theme(preset_id, theme_id)});
ipcMain.handle('presets:set_order_in_theme', (event, preset_id, theme_id, order) => {return db.presets.set_order_in_theme(preset_id, theme_id, order)});
ipcMain.handle('presets:delete', (event, preset_id) => {return db.presets.delete(preset_id)});
ipcMain.handle('presets:delete_by_theme', (event, theme_id) => {return db.presets.delete_by_theme(theme_id)});

// Tracks
ipcMain.handle('tracks:create', (event, name, theme_id, type_id, order, preset_id = null) => {return db.tracks.create(name, theme_id, type_id, order, preset_id)});
ipcMain.handle('tracks:get_preset', (event, track_id, preset_id) => {return db.tracks.get_preset(track_id, preset_id)});
ipcMain.handle('tracks:add_track_to_theme', (event, track_id, theme_id, order) => {return db.tracks.add_track_to_theme(track_id, theme_id, order)});
ipcMain.handle('tracks:add_track_to_preset', (event, track_id, preset_id) => {return db.tracks.add_track_to_preset(track_id, preset_id)});
ipcMain.handle('tracks:get', (event, track_id) => {return db.tracks.get(track_id)});
ipcMain.handle('tracks:get_music_by_theme', (event, theme_id) => {return db.tracks.get_music_by_theme(theme_id)});
ipcMain.handle('tracks:get_effects_by_theme', (event, theme_id) => {return db.tracks.get_effects_by_theme(theme_id)});
ipcMain.handle('tracks:set_track_name', (event, track_id, new_name) => {return db.tracks.set_track_name(track_id, new_name)});
ipcMain.handle('tracks:set_order', (event, track_id, theme_id, order) => {return db.tracks.set_order(track_id, theme_id, order)});
ipcMain.handle('tracks:delete', (event, track_id) => {return db.tracks.delete(track_id)});
ipcMain.handle('tracks:delete_by_preset', (event, preset_id) => {return db.tracks.delete_by_preset(preset_id)});
ipcMain.handle('tracks:delete_by_theme', (event, theme_id) => {return db.tracks.delete_by_theme(theme_id)});

// Files
ipcMain.handle('files:create', (event, filename) => {return db.files.create(filename)});
ipcMain.handle('files:get', (event, file_id) => {return db.files.get(file_id)});
ipcMain.handle('files:get_by_name', (event, name) => {return db.files.get_by_name(name)});
ipcMain.handle('files:get_by_fullname', (event, name) => {return db.files.get_by_name(name)});
ipcMain.handle('files:get_by_track', (event, track_id) => {return db.files.get_by_track(track_id)});
ipcMain.handle('files:get_except_track', (event, track_id) => {return db.files.get_except_track(track_id)});
ipcMain.handle('files:delete', (event, file_id) => {return db.files.delete(file_id)});
ipcMain.handle('files:delete_by_track', (event, track_id) => {return db.files.delete_by_track(track_id)});
ipcMain.handle('files:add_file_to_track', (event, file_id, track_id) => {return db.files.add_file_to_track(file_id, track_id)});
ipcMain.handle('files:random_in_track', (event, track_id) => {return db.files.random_in_track(track_id)});

// Settings
ipcMain.handle('settings:get', (event, name) => {return db.settings.get(name)});
ipcMain.handle('settings:update', (event, key, value) => {return db.settings.update(key, value)});
ipcMain.handle('settings:reset_ui_colors', (event) => {return db.settings.reset_ui_colors()});
ipcMain.handle('settings:get_active_theme', (event) => {return db.settings.get_active_theme()});
ipcMain.handle('settings:set_active_theme', (event, id) => {return db.settings.set_active_theme(id)});
ipcMain.handle('settings:get_last_effect_volume', (event) => {return db.settings.get_last_effect_volume()});
ipcMain.handle('settings:set_last_effect_volume', (event, volume) => {return db.settings.set_last_effect_volume(volume)});
ipcMain.handle('settings:get_background_image', (event) => {return db.settings.get_background_image()});
ipcMain.handle('settings:set_background_image', (event, url) => {return db.settings.set_background_image(url)});
ipcMain.handle('settings:get_font', (event) => {return db.settings.get_font()});
ipcMain.handle('settings:set_font', (event, font) => {return db.settings.set_font(font)});
ipcMain.handle('settings:get_primary_color', (event) => {return db.settings.get_primary_color()});
ipcMain.handle('settings:get_accent_color', (event) => {return db.settings.get_accent_color()});
ipcMain.handle('settings:get_text_color', (event) => {return db.settings.get_text_color()});
ipcMain.handle('settings:set_primary_color', (event, color) => {return db.settings.set_primary_color(color)});
ipcMain.handle('settings:set_accent_color', (event, color) => {return db.settings.set_accent_color(color)});
ipcMain.handle('settings:set_text_color', (event, color) => {return db.settings.set_text_color(color)});
ipcMain.handle('settings:get_shades', (event, color) => {return db.settings.get_shades()});

