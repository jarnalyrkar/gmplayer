class DB {

  constructor() {
    this.db = require('better-sqlite3')('gmplayer.db')
    this.db.pragma('journal_mode = WAL')

    this.default_colors = {
      'primary': "hsl(25, 56%, 25%)",
      'accent': "hsl(43, 74%, 49%)",
      'text': "hsl(0,0%,100%)"
    }
  }

  // TODO: Add all methods from db.php here

  get_setting_by_name(name) {
    const stmt = this.db.prepare(`SELECT value FROM settings WHERE option = ?`)
    const setting = stmt.get(name)
    return setting
  }

  get_primary_color() {
    return this.get_setting_by_name('primary_color')
  }

  set_primary_color(color) {
    // Update method
  }

  get_accent_color() {
    return this.get_setting_by_name('accent_color')
  }

  set_accent_color(color) {
    const stmt = this.db.prepare()
  }

  get_text_color() {
    return this.get_setting_by_name('text_color')
  }

  set_text_color(color) {
    const stmt = this.db.prepare(`UPDATE settings SET value = ? WHERE option = 'text_color'`)
    const info = stmt.run(color)
    return info.changes
  }

  reset_theme() {
    // set_primary_color(this.default_colors.primary)
    // set_accent_color(this.default_colors.accent)
    // set_text_color(this.default_colors.text)
  }

}

module.exports = DB