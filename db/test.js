// TESTING CASES
// delete existing data
const statements = [
  'DELETE FROM track_file',
  'DELETE FROM theme_track',
  'DELETE FROM theme_preset',
  'DELETE FROM preset_track',
  'DELETE FROM file',
  'DELETE FROM track',
  'DELETE FROM preset',
  'DELETE FROM theme',
].map(sql => db.db.prepare(sql), db)

const deletion = db.db.transaction(() => {
  for (const stmt of statements) {
    stmt.run();
  }
})

deletion();

// Create theme
let theme_id = db.themes.create('A New Beginning', 1).theme_id // Works!
// Update theme name
db.themes.update(theme_id, 'Thunder and Lighting')
// Create presets
let preset_id = db.presets.create("Default", theme_id, 1, 1).preset_id
db.presets.create("Battle", theme_id, 1, 1)
// Update track-name
db.presets.update(preset_id, 'Tavern')
// Create track(music)
let track_id = db.tracks.create("Music", theme_id, db.MUSIC, 1, preset_id).track_id
// Add files to track
let file_id = db.files.create("tavern_music1.mp3", track_id).file_id
db.files.create("tavern_music2.mp3", track_id)
db.files.create("tavern_music3.mp3", track_id)
// Create track(effect)
let effect_id = db.tracks.create("Fireball", theme_id, db.EFFECT, 1).track_id
// Add files to track
db.files.create("fireball.mp3", effect_id)
// Update order
db.tracks.set_order(track_id, theme_id, 5)
// Set track volume
db.presets.set_track_volume(preset_id, track_id, 50)
// Set track play status
db.presets.set_track_play(preset_id, track_id, 1)
// Delete single file
db.files.delete(file_id)
// Delete single track(with all files connected, except if in use other places)
db.tracks.delete(track_id)
// Delete single preset(with all tracks, with all files)
db.presets.delete(preset_id)
// Delete single theme(with all presets, tracks and files)
db.themes.delete(theme_id)