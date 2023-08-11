const Track = require("./Track")

class Preset {

  constructor(db) {
    this.db = db
    this.tracks = new Track(db)
  }

  create(name, theme_id, order, current = 0) {
    // Create preset
    let stmt = this.db.prepare(`INSERT INTO preset(name) VALUES(?)`)
    const preset = stmt.run(name)
    const preset_id = preset.lastInsertRowid
    // Add new preset to theme
    stmt = this.db.prepare(`INSERT INTO theme_preset(theme_id, preset_id, current, \"order\") VALUES(?, ?, ?, ?)`)
    stmt.run(theme_id, preset_id, order, current)
    return this.get(preset_id)
  }

  get(preset_id) {
    const stmt = this.db.prepare(`SELECT * FROM preset WHERE preset_id=?`)
    const preset = stmt.get(preset_id)
    return preset
  }

  get_by_theme(theme_id) {
    const stmt = this.db.prepare(`SELECT preset_id, name, current FROM theme_preset INNER JOIN preset USING(preset_id) WHERE theme_id=? ORDER BY \"order\"`)
    const presets = stmt.all(theme_id)
    return presets
  }

  get_settings_for_track(preset_id, track_id) {
    const stmt = this.db.prepare(`SELECT * FROM preset_track WHERE track_id=? AND preset_id=?`)
    const preset = stmt.get(track_id, preset_id)
    return preset
  }

  set_track_volume(preset_id, track_id, volume) {
    const stmt = this.db.prepare(`UPDATE preset_track SET volume=? WHERE preset_id=? AND track_id=?`)
    const info = stmt.run(volume, preset_id, track_id)
    return info
  }

  set_track_play(preset_id, track_id, playing) {
    const stmt = this.db.prepare(`UPDATE preset_track SET playing=? WHERE preset_id=? AND track_id=?`)
    const info = stmt.run(playing, preset_id, track_id)
    return info
  }

  get_active_in_theme(theme_id) {
    const stmt = this.db.prepare(`SELECT preset_id FROM theme_preset WHERE theme_id=? AND current=1`)
    const preset = stmt.get(theme_id)
    return preset.preset_id
  }

  update(preset_id, new_name) {
    const stmt = this.db.prepare(`UPDATE preset SET name=? WHERE preset_id=?`)
    const info = stmt.run(new_name, preset_id)
    return info.changes
  }

  set_active_in_theme(preset_id, theme_id) {
    // Find current,and set to 0
    const old_preset = this.get_active_in_theme(theme_id)
    let stmt = this.db.prepare(`UPDATE theme_preset SET current=0 WHERE preset_id=? AND theme_id=?`)
    stmt.run(old_preset.preset_id, theme_id)

    // set new current in theme_preset
    stmt = this.db.prepare(`UPDATE theme_preset SET current=1 WHERE preset_id=? AND theme_id=?`)
    const preset = stmt.run(preset_id, theme_id)
    return preset
  }

  set_order_in_theme(preset_id, theme_id, order) {
    const stmt = `UPDATE theme_preset SET \"order\"=? WHERE preset_id=? AND theme_id=?`
    const info = stmt.run(order, preset_id, theme_id)
    return info.changes
  }

  delete(preset_id) {
    let stmt = this.db.prepare(`SELECT * FROM theme_preset WHERE preset_id!=?`)
    const presets = stmt.get(preset_id)
    if (typeof presets === "undefined") {
      // if last preset in theme, delete effect tracks too
      stmt = this.db.prepare(`SELECT * FROM theme_preset WHERE preset_id=?`)
      const theme = stmt.run(preset_id)
      this.delete_by_theme(theme.theme_id)
    }
    stmt = this.db.prepare(`DELETE FROM theme_preset WHERE preset_id=?`)
    const preset = stmt.run(preset_id)
    // delete files
    this.tracks.delete_by_preset(preset_id)
    // delete theme_presets where preset_id
    // delete preset
    stmt = this.db.prepare(`DELETE FROM preset WHERE preset_id=?`)
    stmt.run(preset_id)
  }

  delete_by_theme(theme_id) {
    const presets = this.get_by_theme(theme_id)
    presets.forEach(preset => this.delete(preset.preset_id))
  }
}

module.exports = Preset