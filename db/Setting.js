class Setting {

  constructor(db) {
    this.db = db
    this.default_colors = {
      'primary': "hsl(25, 56%, 25%)",
      'accent': "hsl(43, 74%, 49%)",
      'text': "hsl(0,0%,100%)"
    }
  }

  get(name) {
    const stmt = this.db.prepare(`SELECT value FROM settings WHERE option=?`)
    const setting = stmt.get(name)
    return setting.value
  }

  update(key, value) {
    const stmt = this.db.prepare(`UPDATE settings SET value = ? WHERE option = '${key}'`)
    const setting = stmt.run(value)
    return setting.changes
  }

  reset_ui_colors() {
    set_primary_color(this.default_colors.primary)
    set_accent_color(this.default_colors.accent)
    set_text_color(this.default_colors.text)
  }

  get_active_theme() {
    return this.get('last_theme')
  }

  set_active_theme(id) {
    return this.update('last_theme', id)
  }

  get_last_effect_volume() {
    return this.get('effect_volume')
  }

  set_last_effect_volume(value) {
    return this.update('effect_volume', value)
  }

  get_background_image() {
    return this.get('background_image')
  }

  set_background_image(url) {
    this.update('background_image', url)
  }

  get_font() {
    return this.get('font')
  }

  set_font(font) {
    return this.update('font', font)
  }

  get_primary_color() {
    return this.get('primary_color')
  }

  set_primary_color(color) {
    return this.update('primary_color', color)
  }

  get_accent_color() {
    return this.get('accent_color')
  }

  set_accent_color(color) {
    return this.update('accent_color', color)
  }

  get_text_color() {
    return this.get('text_color')
  }

  set_text_color(color) {
    return this.update('text_color', color)
  }

  get_shades() {
    const primary = this.get_primary_color();
    if (!primary) return;

    const primaryValues = primary
      .replace('%', '')
      .substring(4, primary.length - 1)
      .split(',')
      .map(value => parseInt(value));

    const p1 = primaryValues[2] + 20;
    const p2 = primaryValues[2] + 10;
    const p3 = primaryValues[2];
    const p4 = primaryValues[2] - 5;
    const p5 = primaryValues[2] - 10;
    const p6 = primaryValues[2] - 15;

    return [
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p1}%)`,
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p2}%)`,
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p3}%)`,
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p4}%)`,
      `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${p4}%, 70%)`,
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p5}%)`,
      `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${p6}%)`,
      `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${p6}%, 70%)`,
    ];
  }

  HSLToRGB(hsl) {
    const values = hsl
      .replace('%', '')
      .substring(4, hsl.length - 1)
      .split(',')
      .map(value => parseInt(value));

    const hue = values[0];
    const sat = values[1];
    const val = values[2];

    const rgb = [0, 0, 0];
    //calc rgb for 100% SV, go +1 for BR-range
    for (let i = 0; i < 4; i++) {
      if (Math.abs(hue - i * 120) < 120) {
        const distance = Math.max(60, Math.abs(hue - i * 120));
        rgb[i % 3] = 1 - ((distance - 60) / 60);
      }
    }

    //desaturate by increasing lower levels
    const max = Math.max(...rgb);
    const factor = 255 * (val / 100);

    for (let i = 0; i < 3; i++) {
      //use distance between 0 and max (1) and multiply with value
      rgb[i] = Math.round((rgb[i] + (max - rgb[i]) * (1 - sat / 100)) * factor);
    }

    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
}

module.exports = Setting