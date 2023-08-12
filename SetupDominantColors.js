const download = require('image-downloader')
const path = require('path')
const ColorThief = require('colorthief')
const DB = require('./db/DB')
const db = new DB()
const fs = require('fs')

function setup_dominant_colors(url) {
  const options = {
    url: url,
    dest: path.join(__dirname, '/temp/')
  }
  download.image(options).then(({filename}) => {
    const img = filename
    ColorThief.getColor(img).then(color => {
      const dominant = RGBToHSL(color[0], color[1], color[2])
      db.settings.set_primary_color(`hsl(${dominant[0]}, ${dominant[1]}%, ${dominant[2]}%)`)
      const lightness = setForegroundValue(dominant[2])
      const accent = `hsl(${dominant[0]}, ${dominant[1]}%, ${lightness}%)`
      db.settings.set_accent_color(accent)
      fs.readdir('temp', (err, files) => {
        if (err) throw err

        for (const file of files) {
          fs.unlink(path.join('temp', file), (err) => {
            if (err) throw err
          })
        }
      })
    })
  })
}

function setForegroundValue(lightness) {
  if (lightness <= 25) {
    return 75
  }
  if (lightness <= 50) {
    return 100
  }
  if (lightness <= 75) {
    return 0
  }
  if (lightness <= 100) {
    return 25
  }
}

function RGBToHSL(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return [
    (60 * h < 0 ? 60 * h + 360 : 60 * h).toFixed(2),
    (100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)).toFixed(2),
    ((100 * (2 * l - s)) / 2).toFixed(2),
  ];
}

function hue_shift(h, s) {
  h = parseFloat(h)
  h += s; while (h >= 360.0) h -= 360.0; while (h < 0.0) h += 360.0; return h;
}


module.exports = setup_dominant_colors