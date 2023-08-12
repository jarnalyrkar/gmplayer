const Setting = require('./Setting')
const File = require('./File')
const Track = require('./Track')
const Preset = require('./Preset')
const Theme = require('./Theme')
class DB {

  constructor(db_path) {

    console.log("PATH:", db_path)
    this.db = require('better-sqlite3')(db_path)
    this.db.pragma('journal_mode = WAL')

    DB.prototype.MUSIC = 1
    DB.prototype.EFFECT = 2

    DB.prototype.settings = new Setting(this.db)
    DB.prototype.tracks = new Track(this.db)
    DB.prototype.files = new File(this.db)
    DB.prototype.presets = new Preset(this.db)
    DB.prototype.themes = new Theme(this.db)
  }
  setup() {
    // this.db.
  }
}

module.exports = DB