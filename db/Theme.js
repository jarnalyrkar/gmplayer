const Preset = require("./Preset")
const Track = require('./Track')

class Theme {

  constructor(db) {
    this.db = db
    this.presets = new Preset(db)
    this.tracks = new Track(db)
  }

  create(name, order) {
    if (typeof this.get_by_name(name) !== "undefined") {
      throw new Error("Name is not unique; not created")
    }

    const stmt = this.db.prepare(`INSERT INTO theme (name, \"order\") VALUES(?, ?)`)
    const info = stmt.run(name, order)
    const theme = this.get(info.lastInsertRowid)
    return theme
  }

  get(id) {
    const stmt = this.db.prepare(`SELECT * FROM theme WHERE theme_id = ?`)
    const theme = stmt.get(id)
    return theme
  }

  get_by_name(name) {
    const stmt = this.db.prepare(`SELECT theme_id FROM theme WHERE name LIKE ?`)
    const theme = stmt.get(name)
    return theme
  }

  list() {
    const stmt = this.db.prepare(`SELECT * FROM theme ORDER BY \"order\" ASC`)
    const themes = stmt.all()
    return themes
  }

  update(theme_id, new_name) {
    if (typeof this.get_by_name(new_name) != "undefined") {
      throw new Error("Name is not unique; not updated")
    }

    const stmt = this.db.prepare(`UPDATE theme SET name=? WHERE theme_id=?`)
    const info = stmt.run(new_name, theme_id)
    return info
  }

  update_order(theme_id, new_order) {
    const stmt = this.db.prepare(`UPDATE theme SET \"order\"=? WHERE theme_id=?`)
    const info = stmt.run(new_order, theme_id)
    return info.changes
  }

  delete(theme_id) {
    this.presets.delete_by_theme(theme_id)
    this.tracks.delete_by_theme(theme_id)
    const stmt = this.db.prepare(`DELETE FROM theme WHERE theme_id=?`)
    stmt.run(theme_id)
  }

}

module.exports = Theme