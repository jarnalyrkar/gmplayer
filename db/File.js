class File {

  constructor(db) {
    this.db = db
  }

  create(fullpath, filename, filetype) {
    const stmt = this.db.prepare(`INSERT INTO file(fullpath, filename, filetype) VALUES(?,?,?)`)
    const file = stmt.run(fullpath, filename, filetype)
    return this.get(file.lastInsertRowid)
  }

  get(file_id) {
    const stmt = this.db.prepare(`SELECT * FROM file WHERE file_id=?`)
    return stmt.get(file_id)
  }

  get_by_fullpath(fullpath) {
    const stmt = this.db.prepare(`SELECT * FROM file WHERE fullpath LIKE ?`)
    return stmt.get(fullpath)
  }

  get_by_name(name) {
    const stmt = this.db.prepare(`SELECT 'file_id' FROM file WHERE filename LIKE ?`)
    const file = stmt.get(name)
    return file
  }

  get_by_track(track_id) {
    const stmt = this.db.prepare(`SELECT file_id, fullpath, filename FROM file INNER JOIN track_file USING(file_id) WHERE track_id=?`)
    const files = stmt.all(track_id)
    return files
  }

  get_except_track(track_id) {
    const stmt = this.db.prepare(`SELECT 'filename' FROM file INNER JOIN track_file USING(file_id) WHERE track_id NOT LIKE ?`)
    const files = stmt.all(track_id)
    return files
  }

  delete(file_id) {
    // foreign values
    let stmt = this.db.prepare(`DELETE FROM track_file WHERE file_id=?`)
    stmt.run(file_id)

    stmt = this.db.prepare("DELETE FROM file WHERE file_id=?")
    const deleted = stmt.run(file_id)
    return deleted.changes
  }

  delete_by_track(track_id) {
    // Check if file is used by other tracks. If so, don't delete.
    const files = this.get_by_track(track_id)
    files.forEach(file => {
      let stmt = this.db.prepare(`SELECT * FROM track_file WHERE track_id!=? AND file_id=?`)
      let tied_up = stmt.get(track_id, file.file_id)
      if (typeof tied_up === "undefined") {
        this.delete(file.file_id)
      }
    })
  }

  add_file_to_track(file_id, track_id) {
    let stmt = this.db.prepare(`SELECT COUNT(*) as count FROM track_file WHERE track_id=? AND file_id=?`)
    const exists = stmt.get(file_id, track_id)
    if (!file_id || !track_id || exists['count'] > 0) return

    stmt = this.db.prepare(`INSERT INTO track_file(track_id, file_id) VALUES(?, ?)`)
    const info = stmt.run(track_id, file_id)
    return info
  }

  random_in_track(track_id) {
    if (!track_id) return
    const files_in_track = this.get_by_track(track_id)
    const randIndex = Math.floor(Math.random() * files_in_track.length)
    return files_in_track[Math.max(0, randIndex)]
  }

}

module.exports = File