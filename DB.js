class DB {

  constructor() {
    const sqlite3 = require('sqlite3').verbose()
    this.db = new sqlite3.Database('gmplayer.db')
  }

  get_setting_by_name(name) {
    console.log(name)
    return name
    // const sql = "SELECT * FROM settings WHERE option = ?"
    // let results = []
    // db.run(sql, [name], (err, rows) => {
    //   results.push(rows)
    // })
  }

}

module.exports = DB