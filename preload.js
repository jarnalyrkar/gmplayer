const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openDialog: () => {
    ipcRenderer.send('open-dialog')
  },
  on: (channel, callback) => {
    ipcRenderer.once(channel, (_, data) => callback(data))
  },
})

contextBridge.exposeInMainWorld('themes', {
  create: (name, order) => {return ipcRenderer.invoke('themes:create', name, order)},
  get: (id) => {return ipcRenderer.invoke('themes:get', id)},
  get_by_name: (name) => {return ipcRenderer.invoke('themes:get_by_name', name)},
  list: () => {return ipcRenderer.invoke('themes:list')},
  update: (id, name) => {return ipcRenderer.invoke('themes:update', id, name)},
  update_order: (id, order) => {return ipcRenderer.invoke('themes:update_order', id, order)},
  delete: (id) => {return ipcRenderer.invoke('themes:delete', id)},
})

contextBridge.exposeInMainWorld('presets', {
  create: (name, theme_id, order, current) => {return ipcRenderer.invoke('presets:create', name, theme_id, order, current)},
  get: (id) => {return ipcRenderer.invoke('presets:get', id)},
  get_by_theme: (theme_id) => {return ipcRenderer.invoke('presets:get_by_theme', theme_id)},
  get_settings_for_track: (preset_id, track_id) => {return ipcRenderer.invoke('presets:get_settings_for_track', preset_id, track_id)},
  set_track_volume: (preset_id, track_id, volume) => {return ipcRenderer.invoke('presets:set_track_volume', preset_id, track_id, volume)},
  set_track_play: (preset_id, track_id, playing) => {return ipcRenderer.invoke('presets:set_track_play', preset_id, track_id, playing)},
  update: (preset_id, new_name) => {return ipcRenderer.invoke('presets:update', preset_id, new_name)},
  get_active_in_theme: (theme_id) => {return ipcRenderer.invoke('presets:get_active_in_theme', preset_id, track_id, playing)},
  set_active_in_theme: (preset_id, theme_id) => {return ipcRenderer.invoke('presets:set_active_in_theme', preset_id, theme_id)},
  set_order_in_theme: (preset_id, theme_id, order) => {return ipcRenderer.invoke('presets:set_order_in_theme', preset_id, theme_id, order)},
  delete: (preset_id) => {return ipcRenderer.invoke('presets:delete', preset_id)},
  delete_by_theme: (theme_id) => {return ipcRenderer.invoke('presets:delete_by_theme', theme_id)},
})

contextBridge.exposeInMainWorld('tracks', {
  create: (name, theme_id, type_id, order, preset_id) => {return ipcRenderer.invoke('tracks:create', name, theme_id, type_id, order, preset_id)},
  get_preset: (track_id, preset_id) => {return ipcRenderer.invoke('tracks:get_preset', track_id, preset_id)},
  add_track_to_theme: (track_id, theme_id) => {return ipcRenderer.invoke('tracks:add_track_to_theme', track_id, theme_id)},
  add_track_to_preset: (track_id, preset_id) => {return ipcRenderer.invoke('tracks:add_track_to_preset', track_id, preset_id)},
  get: (track_id) => {return ipcRenderer.invoke('tracks:get', track_id)},
  get_music_by_theme: (theme_id) => {return ipcRenderer.invoke('tracks:get_music_by_theme', theme_id)},
  get_effects_by_theme: (theme_id) => {return ipcRenderer.invoke('tracks:get_effects_by_theme', theme_id)},
  set_track_name: (track_id, new_name) => {return ipcRenderer.invoke('tracks:set_track_name', track_id, new_name)},
  set_order: (track_id, theme_id, order) => {return ipcRenderer.invoke('tracks:set_order', track_id, theme_id, order)},
  delete: (track_id) => {return ipcRenderer.invoke('tracks:delete', track_id)},
  delete_by_preset: (preset_id) => {return ipcRenderer.invoke('tracks:delete_by_preset', preset_id)},
  delete_by_theme: (theme_id) => {return ipcRenderer.invoke('tracks:delete_by_theme', theme_id)},
})

contextBridge.exposeInMainWorld('files', {
  create: (filename, theme_id) => {return ipcRenderer.invoke('files:create', filename, theme_id)},
  get: (file_id) => {return ipcRenderer.invoke('files:get', file_id)},
  get_by_name: (name) => {return ipcRenderer.invoke('files:get_by_name', name)},
  get_by_fullname: (name) => {return ipcRenderer.invoke('files:get_by_fullname', name)},
  get_by_track: (track_id) => {return ipcRenderer.invoke('files:get_by_track', track_id)},
  get_except_track: (track_id) => {return ipcRenderer.invoke('files:get_except_track', track_id)},
  delete: (file_id) => {return ipcRenderer.invoke('files:delete', file_id)},
  delete_by_track: (track_id) => {return ipcRenderer.invoke('files:delete_by_track', track_id)},
  add_file_to_track: (file_id, track_id) => {return ipcRenderer.invoke('files:add_file_to_track', file_id, track_id)},
  random_in_track: (track_id) => {return ipcRenderer.invoke('files:random_in_track', track_id)},
})

contextBridge.exposeInMainWorld('settings', {
  get: (name) => {return ipcRenderer.invoke('settings:get', name)},
  update: (key, value) => {return ipcRenderer.invoke('settings:update', key, value)},
  reset_ui_colors: () => {return ipcRenderer.invoke('settings:reset_ui_colors')},
  get_active_theme: () => {return ipcRenderer.invoke('settings:get_active_theme')},
  set_active_theme: (id) => {return ipcRenderer.invoke('settings:set_active_theme', id)},
  get_last_effect_volume: () => {return ipcRenderer.invoke('settings:get_last_effect_volume')},
  set_last_effect_volume: (volume) => {return ipcRenderer.invoke('settings:set_last_effect_volume', volume)},
  get_background_image: () => {return ipcRenderer.invoke('settings:get_background_image')},
  set_background_image: (url) => {return ipcRenderer.invoke('settings:set_background_image', url)},
  get_font: () => {return ipcRenderer.invoke('settings:get_font')},
  set_font: (font) => {return ipcRenderer.invoke('settings:set_font', font)},
  get_primary_color: () => {return ipcRenderer.invoke('settings:get_primary_color')},
  get_accent_color: () => {return ipcRenderer.invoke('settings:get_accent_color')},
  get_text_color: () => {return ipcRenderer.invoke('settings:get_text_color')},
  set_text_color: (color) => {return ipcRenderer.invoke('settings:set_text_color', color)},
  set_accent_color: (color) => {return ipcRenderer.invoke('settings:set_accent_color', color)},
  set_primary_color: (color) => {return ipcRenderer.invoke('settings:set_primary_color', color)},
  get_shades: () => {return ipcRenderer.invoke('settings:get_shades')},
  HSLToRGB: () => {return ipcRenderer.invoke('settings:HSLToRGB')},
  set_dominant_colors: (url) => {return ipcRenderer.invoke('settings:set_dominant_colors', url)},
})