const File = require("./File")

class Track {

  constructor(db) {
    this.db = db
    this.type = {
      music: 1,
      effect: 2
    }
    this.files = new File(db)
  }

  create(name, theme_id, type_id, order, preset_id = null) {
    const stmt = this.db.prepare(`INSERT INTO track(name, type_id) VALUES(?, ?)`)
    const track = stmt.run(name, type_id)
    this.add_track_to_theme(track.lastInsertRowid, theme_id, order)
    if (type_id === this.type.music) {
      this.add_track_to_preset(track.lastInsertRowid, preset_id)
    }
    return this.get(track.lastInsertRowid)
  }

  get_preset(track_id, preset_id) {
    const stmt = this.db.prepare(`SELECT playing, volume FROM preset_track WHERE track_id=? AND preset_id=?`)
    const settings = stmt.get(track_id, preset_id)
    return settings
  }

  add_track_to_theme(track_id, theme_id, order) {
    const stmt = this.db.prepare(`INSERT INTO theme_track(theme_id, track_id, 'order') VALUES(?, ?, ?)`)
    const info = stmt.run(theme_id, track_id, order)
    return info
  }

  add_track_to_preset(track_id, preset_id) {
    const stmt = this.db.prepare(`INSERT INTO preset_track(track_id, preset_id, playing, volume) VALUES(?, ?, 0, 75)`)
    const info = stmt.run(track_id, preset_id)
    return info
  }

  get(track_id) {
    const stmt = this.db.prepare(`SELECT * FROM track WHERE track_id=?`)
    const track = stmt.get(track_id)
    return track
  }

  get_by_theme(theme_id, type_id) {
    const stmt = this.db.prepare(`SELECT * FROM theme_track INNER JOIN track USING (track_id) WHERE theme_id=? AND type_id=? ORDER BY \"order\"`)
    const tracks = stmt.all(theme_id, type_id)
    return tracks
  }

  get_music_by_theme(theme_id) {
    return this.get_by_theme(theme_id, this.type.music)
  }

  get_effects_by_theme(theme_id) {
    return this.get_by_theme(theme_id, this.type.effect)
  }

  set_track_name(track_id, new_name) {
    const stmt = this.db.prepare(`UPDATE track SET name=? WHERE track_id=?`)
    const info = stmt.run(new_name, track_id)
    return info
  }

  set_order(track_id, theme_id, order) {
    const stmt = this.db.prepare(`UPDATE theme_track SET \"order\"=? WHERE track_id=? AND theme_id=?`)
    const info = stmt.run(order, track_id, theme_id)
    return info
  }

  delete(track_id) {
    const statements = [
      'DELETE FROM theme_track WHERE track_id = :track_id',
      'DELETE FROM preset_track WHERE track_id = :track_id',
    ].map(sql => this.db.prepare(sql), this.db)

    const deletion = this.db.transaction((data) => {
      for (const stmt of statements) {
        stmt.run(data);
      }
    })

    deletion({ track_id: track_id});
    this.files.delete_by_track(track_id)

    let stmt = this.db.prepare(`DELETE FROM track_file WHERE track_id=?`)
    stmt.run(track_id)
    stmt = this.db.prepare(`DELETE FROM track WHERE track_id=?`)
    stmt.run(track_id)
    return stmt.changes
  }

  delete_by_preset(preset_id) {
    // delete all tracks in a preset
    const stmt = this.db.prepare(`SELECT * FROM preset_track WHERE preset_id = ?`)
    let delete_these = []
    for (const track of stmt.iterate(preset_id)) {
      delete_these.push(track.track_id)
    }
    delete_these.forEach(id => this.delete(id))
  }

  delete_by_theme(theme_id) {
    const effects = this.get_effects_by_theme(theme_id)
    effects.forEach(effect => this.delete(effect.track_id))
  }

}

module.exports = Track