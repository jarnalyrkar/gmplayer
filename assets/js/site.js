import CP from '@taufik-nurrohman/color-picker';


// Constants, helpers
const keystrokes = '123456789abcdefghijklmnopqrstuvwxyz'.split('')
let theme_width = document.querySelector('#theme').clientWidth // inline-padding
document.querySelector('#theme').style.width = theme_width + "px"
setListHeight();


function setListHeight() {

  // get header height
  const header = document.querySelector('header')
  const headerHeight = header.clientHeight
  // get footer height
  const footerHeight = document.querySelector('footer').clientHeight
  const margin = parseFloat(window.getComputedStyle(header)['marginBottom']) +
    parseFloat(window.getComputedStyle(header)['marginTop'])
  const taken = headerHeight + footerHeight + margin
  document.querySelectorAll('.list').forEach(list => {
    list.style.maxHeight = `calc(100vh - ${taken}px)`
  })

}

function removeTags(str) {
  if ((str === null) || (str === ''))
    return false;
  else
    str = str.toString();
  return str.replace(/(<([^>]+)>)/ig, '');
}

function showToast(message) {
  const toast = document.querySelector('#toast')
  toast.classList.add('show')
  toast.innerHTML = message
  setTimeout(() => {
    toast.classList.remove('show')
  }, 4000)
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function createTitleInput(value) {
  const input = document.createElement('textarea')
  input.type = "text"
  input.value = value
  input.rows = 1
  input.select()
  input.style.flex = "unset"
  input.addEventListener('input', () => {
    input.style.height = ""
    input.style.height = input.scrollHeight + "px"
  })

  return input
}

function activateElement(id, list) {
  const current = list.querySelector('.list__item[data-state=selected]')
  if (current && current.getAttribute('data-id') === id) return false;

  if (current) {
    current.removeAttribute('data-state')
  }
  const element = list.querySelector(`[data-id="${id}"]`)
  element.setAttribute('data-state', 'selected')

  if (list.parentElement.id === "theme") {
    getDataByTheme(id)
    // loadJson(`/api/theme/set-last.php?id=${id}`)
    settings.set_active_theme(id)
  }
  if (list.parentElement.id === "preset") {
    const currentThemeId = document.querySelector('#theme .list__item[data-state=selected]').getAttribute('data-id')
    // loadJson(`/api/preset/set-last.php?preset_id=${id}&theme_id=${currentThemeId}`)
    presets.set_active_in_theme(id, currentThemeId)
  }
}

function fadeOut(audio) {
  const steps = 0.05
  const interval = 50
  const targetVolume = 0
  console.log(audio.volume)
  let fadeout = setInterval(() => {
    if (audio.volume.toFixed(2) > targetVolume + steps) {
      audio.volume -= steps
    } else {
      audio.volume = 0
      audio.pause()
      audio.remove()
      clearInterval(fadeout)
    }
  }, interval)
}

function fadeIn(audio, targetVolume) {
  const steps = 0.05
  const interval = 50
  audio.volume = 0
  audio.play()
  targetVolume = parseInt(targetVolume)
  let fadein = setInterval(() => {
    if (audio.volume.toFixed(2) < (targetVolume / 100) - steps) {
      audio.volume += steps
    } else {
      audio.volume = targetVolume / 100
      clearInterval(fadein)
    }
  }, interval)
}

function fadeTo(audio, targetVolume) {
  if (!audio) return
  const steps = 0.05
  const target = targetVolume / 100
  const interval = 50
  const audio_id = audio.getAttribute('data-id')
  const track = document.querySelector(`#track li[data-id="${audio_id}"]`)
  if (!track) return
  let range = track.querySelector('input[type=range]')
  audio.volume = range.value / 100
  if (audio.volume < target) {
    let fadeTo = setInterval(() => {
      if (audio.volume.toFixed(2) >= target - steps) {
        audio.volume = target
        range.value = audio.volume * 100
        clearInterval(fadeTo)
      } else {
        audio.volume += steps
        range.value = audio.volume * 100
      }
    }, interval)
  } else {
    let fadeTo = setInterval(() => {
      if (audio.volume.toFixed(2) <= target + steps) {
        audio.volume = target
        range.value = audio.volume * 100
        clearInterval(fadeTo)
      } else {
        audio.volume -= steps
        range.value = audio.volume * 100
      }
    }, interval)
  }
}

async function playEffect(id) {
  let audio = await createAudio(id)
  if (audio) {
    audio.play()
    audio.addEventListener('ended', () => {
      audio.remove()
    })
  }
}

// Application state

// getters & setters
function getDataByTheme(id) {
  setPresets(id)
  setTracks(id)
  setEffects(id)
}

function setPresets(theme_id) {
  const parent = document.querySelector('#preset .list')
  parent.innerHTML = ""

  presets.get_by_theme(theme_id).then(data => {
    if (data.length > 0) {
      data.forEach(item => {
        const template = document.querySelector('#item')
        const clone = template.content.cloneNode(true)
        const li = clone.querySelector('.list__item')
        li.setAttribute('data-id', item.preset_id)
        li.setAttribute('data-order', item.order)
        if (item.current) li.setAttribute('data-state', 'selected')
        clone.querySelector('[data-action=select]').value = item.name
        parent.appendChild(clone)
      })
    } else {
      parent.insertAdjacentHTML('beforeEnd', '<li class="empty">No presets added yet!</li>')
    }
  })
}

function setTracks(theme_id) {
  const parent = document.querySelector('#track .list')
  parent.innerHTML = ""
  // loadJson(`/api/track/get.php?theme_id=${theme_id}&type=1`)
  tracks.get_music_by_theme(theme_id).then(data => {
    if (data && data.length > 0) {
      data.forEach(item => {
        const template = document.querySelector("#track-item")
        const clone = template.content.cloneNode(true)
        const li = clone.querySelector('li')
        const selected = document.querySelector('#preset [data-state=selected]')
        if (!selected) return
        let preset_id = selected.getAttribute('data-id')
        li.setAttribute('data-id', item.track_id)
        li.setAttribute('data-order', item.order)
        li.querySelector('[data-action=play]').classList.add('active')
        // loadJson(`/api/preset/track-settings.php?preset_id=${preset_id}&track_id=${item.track_id}`)
        window.presets.get_settings_for_track(preset_id, item.track_id).then(data => {
          if (!data) return
          const range = li.querySelector('input[type=range]')
          range.value = data.volume
          const existing = document.querySelector(`audio[data-id="${track.getAttribute('data-id')}"]`)
          if (data.playing) {
            if (!existing) {
              let audio = createAudio(item.track_id)
              if (audio) {
                if (audio.paused) {
                  audio.play()
                }
                fadeTo(audio, data.volume)
              }
            } else {
              if (existing.paused) {
                existing.play()
              }
              fadeTo(existing, data.volume)
            }
          } else {
            if (existing) {
              fadeOut(existing)
            }
          }

        })
        li.querySelector('.track__title').innerHTML = item.name
        parent.appendChild(clone)
      })
    } else {
      parent.innerHTML = '<li class="empty">No tracks added yet!</li>'
    }
  })
}

function setEffects(theme_id) {
  const parent = document.querySelector('#effect .list')
  parent.innerHTML = ""
  // loadJson(`/api/track/get.php?theme_id=${theme_id}&type=2`)
  tracks.get_effects_by_theme(theme_id).then(data => {
    if (data && data.length > 0) {
      let counter = 0
      data.forEach(item => {
        const template = document.querySelector("#effect-item")
        const clone = template.content.cloneNode(true)
        const li = clone.querySelector('li')
        const keystroke = keystrokes[parent.querySelectorAll('li:not(.empty)').length + counter]
        li.setAttribute('data-id', item.track_id)
        li.setAttribute('data-order', item.order)
        li.querySelector('.track__title').innerHTML = item.name
        li.querySelector('.keystroke').setAttribute('data-keystroke', keystroke)
        li.querySelector('.keystroke').innerHTML = keystroke
        parent.appendChild(clone)
        counter++;
      })
    } else {
      parent.innerHTML = '<li class="empty">No effects added yet!</li>'
    }
  })
}

function saveNewOrder(target) {
  const data_type = target.closest('section').id
  const theme_id = document.querySelector('#theme [data-state=selected]').getAttribute('data-id')
  if (data_type === "theme") {
    const items = document.querySelectorAll('#theme li')
    const length = items.length
    for (let i = 1; i <= length; i++) {
      if (parseInt(items[i - 1].getAttribute('data-order')) === i) continue
      const id = items[i - 1].getAttribute('data-id')
      items[i - 1].setAttribute('data-order', i)
      // loadJson(`/api/theme/update-order.php?id=${id}&order=${i}`)
      themes.update_order(id, i)
    }
  } else if (data_type === "preset") {
    const items = document.querySelectorAll('#preset li')
    const length = items.length
    for (let i = 1; i <= length; i++) {
      if (parseInt(items[i - 1].getAttribute('data-order')) === i) continue
      const id = items[i - 1].getAttribute('data-id')
      items[i - 1].setAttribute('data-order', i)
      presets.set_order_in_theme(id, theme_id, i)
      // loadJson(`/api/preset/update-order.php?preset_id=${id}&theme_id=${theme_id}&order=${i}`)
    }
  } else if (data_type === "track" || data_type === "effect") {
    // Update track order
    let items = null
    if (data_type === "track") {
      items = document.querySelectorAll('#track li')
    } else if (data_type === "effect") {
      items = document.querySelectorAll('#effect li')
    }
    const length = items.length
    for (let i = 1; i <= length; i++) {
      if (parseInt(items[i - 1].getAttribute('data-order')) === i) continue
      const id = items[i - 1].getAttribute('data-id')
      items[i - 1].setAttribute('data-order', i)
      if (data_type === "effect") {
        items[i - 1].setAttribute('data-keystroke', i)
        items[i - 1].querySelector('[data-action=play]').innerHTML = i
      }
      // loadJson(`/api/track/update-order.php?track_id=${id}&theme_id=${theme_id}&order=${i}`)
      tracks.set_order(id, theme_id, i)
    }
  }
}

function tagTracksWithoutFiles() {
  const songs = document.querySelectorAll('#track li')
  const effects = document.querySelectorAll('#effect li')
  const tracks = [...songs, ...effects]
  tracks.forEach(track => {
    if (track.classList.contains('empty')) return;
    const id = track.getAttribute('data-id')
    // loadJson(`/api/track/has-files.php?id=${id}`)
    files.get_by_track(id).then(files => {
      if (files.length < 1) {
        track.classList.add('no-files')
        track.querySelector('[data-action=play]').title = "No files added to this track yet"
      } else {
        track.classList.remove('no-files')
        track.querySelector('[data-action=play]').title = "Play"
      }
    })
  })
}
tagTracksWithoutFiles()

// DOM Node references
// DOM update functions
function createTheme(name, list) {
  let order
  if (list.children.length === 1 && list.children[0].classList.contains('empty')) {
    order = 1
  } else {
    order = list.children.length + 1
  }
  themes.create(name, order).then(({ theme_id }) => {
    const template = document.querySelector('#item')
    const clone = template.content.cloneNode(true)
    const li = clone.querySelector('.list__item')
    li.setAttribute('data-id', theme_id)
    li.setAttribute('data-order', order)
    clone.querySelector('.list__item input[type=button]').value = name
    list.append(clone)
    const empty = list.querySelector('.empty')
    if (empty) {
      empty.remove()
      activateElement(theme_id, list)
    }
    // Add default preset
    const presetList = document.querySelector('#preset .list')
    createPreset('Default', theme_id, presetList)
  })
}

function createPreset(name, theme_id, list) {
  let current = 0
  const selectedTheme = document.querySelector('#theme [data-state=selected]')
  let selectedThemeId = null
  if (selectedTheme) {
    selectedThemeId = selectedTheme.getAttribute('data-id')
  }
  if (list.querySelector('.empty')) {
    current = 1
  }
  let order
  if (list.children.length === 1 && list.children[0].classList.contains('empty')) {
    order = 1
  } else {
    order = list.children.length + 1
  }
  let missing_params = []
  if (!theme_id) missing_params.push("theme")
  if (missing_params.length) {
    showToast("Please select a theme before creating a preset")
    return
  }

  // loadJson(`/api/preset/create.php?name=${name}&theme_id=${theme_id}&order=${order}&current=${current}`)
  presets.create(name, theme_id, order, current).then(data => {
    if (parseInt(theme_id) !== parseInt(selectedThemeId)) {
      return
    }
    const id = data.preset_id
    const template = document.querySelector('#item')
    const clone = template.content.cloneNode(true)
    const li = clone.querySelector('.list__item')
    li.setAttribute('data-id', id)
    li.setAttribute('data-order', order)
    clone.querySelector('.list__item input[type=button]').value = name
    list.append(clone)
    if (current) {
      console.log(id, theme_id)
      presets.set_active_in_theme(id, theme_id)
      // loadJson(`/api/preset/set-last.php?preset_id=${id}&theme_id=${theme_id}`)
    }
    const empty = list.querySelector(".empty")
    if (empty) {
      empty.remove()
      activateElement(id, list)
    }
  })
}

function createTrack(value, theme_id, list) {
  const preset = document.querySelector('#preset [data-state=selected]')
  if (!preset) {
    showToast("Please add a preset before adding a track")
    return
  }
  const preset_id = preset.getAttribute('data-id')
  let order
  if (list.children.length === 1 && list.children[0].classList.contains('empty')) {
    order = 1
  } else {
    order = list.children.length + 1
  }
  tracks.create(value, theme_id, 1, order, preset_id).then((track) => {
    const template = document.querySelector('#track-item')
    const clone = template.content.cloneNode(true)
    const li = clone.querySelector('.list__item')
    li.setAttribute('data-id', track.track_id)
    li.setAttribute('data-order', order)
    li.querySelector('.track__title').innerHTML = value
    list.append(clone)
    tagTracksWithoutFiles()
    const empty = list.querySelector('.empty')
    if (empty) empty.remove()
  })
}

function createEffect(value, theme_id, list) {
  let order
  if (list.children.length === 1 && list.children[0].classList.contains('empty')) {
    order = 1
  } else {
    order = list.children.length + 1
  }
  if (!theme_id) {
    showToast("Please create a theme before adding an effect")
    return
  }
  // loadJson(`/api/track/create.php?name=${value}&theme_id=${theme_id}&type_id=2&order=${order}`)
  tracks.create(value, theme_id, 2, order).then((effect) => {
    const template = document.querySelector('#effect-item')
    const clone = template.content.cloneNode(true)
    const li = clone.querySelector('li')
    li.setAttribute('data-id', effect.track_id)
    li.querySelector('.track__title').innerHTML = value
    const keystroke = keystrokes[list.querySelectorAll('li:not(.empty)').length]
    li.querySelector('.keystroke').innerHTML = keystroke
    li.querySelector('.keystroke').setAttribute('data-keystroke', keystroke)
    list.append(clone)
    tagTracksWithoutFiles()
    const empty = list.querySelector('.empty')
    if (empty) empty.remove()
  })
}

function isMusic(id) {
  return document.querySelector(`#track [data-id="${id}"]`)
}

async function createAudio(id) {
  const audio = await window.files.random_in_track(parseInt(id))
  if (audio) {
    let el = document.createElement('audio')
    el.src = "load-audio://" + audio.fullpath
    el.setAttribute('data-id', id)
    document.body.appendChild(el)

    // Play effect
    if (!isMusic(id)) {
      el.volume = document.querySelector('.effect-volume .volume-slider__bar').value / 100
      el.setAttribute('data-type', 'effect')
      el.play()
    }
    el.addEventListener('ended', () => {
      el.remove()
      if (isMusic(id)) {
        const timeout = randomBetween(3000, 15000)
        // get and play new track when ended
        setTimeout(() => {
          createAudio(id).then(newEl => {
            if (newEl) {
              let volume = document.querySelector(`#track [data-id="${id}"] [type=range]`).value / 100
              newEl.volume = volume
              newEl.play()
            }
          })
        }, timeout)
      }
    })
    return el
  } else {
    return false
  }
}

function removePresets() {
  const presetList = document.querySelector('#preset .list')
  presetList.querySelectorAll('li').forEach(preset => preset.remove())
  presetList.innerHTML = '<li class="empty">No presets added yet!</li>'
}

// Event handlers
document.addEventListener('click', (ev) => {

  if (ev.target.getAttribute('data-action') === 'select') {
    const preset_id = ev.target.parentElement.getAttribute('data-id')
    const section = ev.target.closest("section")
    const list = section.querySelector('.list')
    activateElement(preset_id, list)
    if (section.id === "preset") {
      getTrackSettings(preset_id)
    }
  }

  if (ev.target.getAttribute('data-action') === 'delete') {
    const parent = ev.target.closest("section")
    const li = ev.target.closest('li')
    const type = parent.id
    const list = parent.querySelector(".list")
    const id = li.getAttribute('data-id')
    if (type === "effect" || type === "track") {
      const existingAudio = document.querySelector(`audio[data-id="${id}"]`)
      if (existingAudio) {
        existingAudio.remove()
      }
      // loadJson(`/api/track/delete.php?id=${id}`)
      tracks.delete(id)
      li.remove()
      if (list.children.length === 0) {
        list.innerHTML = `<li class="empty">No ${type}s added yet!</li>`
      }
      return
    }
    const selected = list.querySelector('[data-state=selected]')
    if (type === 'theme') {
      // loadJson(`/api/theme/delete.php?id=${id}`)
      themes.delete(id)
      document.querySelectorAll("audio").forEach(track => track.remove())
    }
    if (type === 'preset') {
      // loadJson(`/api/preset/delete.php?id=${id}`)
      presets.delete(id)
    }
    li.remove()
    if (selected && id === selected.getAttribute('data-id')) {
      let available = list.querySelector('.list__item')
      if (!available) {
        if (type === "theme") {
          let parent = document.querySelector('#track')
          parent.querySelectorAll('li:not(.empty)').forEach(li => li.remove())
          if (parent.querySelectorAll('li:not(.empty)').length === 0) {
            document.querySelector('#track .list').innerHTML = `<li class="empty">No tracks added yet!</li>`
          }
          parent = document.querySelector('#effect')
          const effects = document.querySelectorAll('li:not(.empty)')
          effects.forEach(li => li.remove())
          if (parent.querySelectorAll('li:not(.empty)').length === 0) {
            document.querySelector('#effect .list').innerHTML = `<li class="empty">No effects added yet!</li>`
          }
        }
        list.innerHTML = `<li class="empty">No ${type}s added yet!</li>`
        removePresets()
        return
      }
      activateElement(available.getAttribute('data-id'), list)
      tagTracksWithoutFiles()
    } else if (list.children.length === 0) {
      list.innerHTML = `<li class="empty">No ${type}s added yet!</li>`
    }
    // loadJson(`/api/${type}/delete.php?id=${id}`)
    if (type === 'preset') {
      presets.delete(id)
    }
    if (type === 'theme') {
      themes.delete(id)
    }
    if (type === 'track') {
      tracks.delete(id)
    }
  }

  if (ev.target.getAttribute('data-action') === 'see-files') {
    const track_id = ev.target.closest('li').getAttribute('data-id')
    const theme_id = document.querySelector('#theme [data-state=selected]').getAttribute('data-id')

    const template = document.querySelector('#track-files')
    const clone = template.content.cloneNode(true)
    const dialog = clone.querySelector(".dialog")

    // Get all existing files for the track
    // loadJson(`/api/file/get.php?track_id=${track_id}`)
    files.get_by_track(track_id).then(files => {
      if (files.length > 0) {
        files.forEach(file => {
          const template = dialog.querySelector('#file')
          const clone = template.content.cloneNode(true)
          const li = clone.querySelector('li')
          li.setAttribute('data-id', file.file_id)
          li.setAttribute('data-filename', file.filename)
          li.querySelector('.file__name').innerHTML = file.filename
          dialog.querySelector('.files').appendChild(clone)
        })
      } else {
        dialog.querySelector('.files').insertAdjacentHTML('afterbegin', '<li class="empty">No files yet</li>')
      }
    })

    // listen for uploads
    dialog.querySelector('#new-track-file').addEventListener('click', (ev) => {
      const empty = dialog.querySelector('.empty')
      if (empty) empty.remove()

      window.electron.openDialog();
      window.electron.on('on-file-select', (paths) => {
        paths.forEach(path => {
          window.files.add_file_to_track(path.id, track_id)
          // Add file to dom:
          const template = document.querySelector('#file')
          const clone = template.content.cloneNode(true)
          const li = clone.querySelector('li')
          li.setAttribute('data-filename', path.filename)
          li.setAttribute('data-id', path.id)
          li.querySelector('.file__name').innerHTML = path.filename
          document.querySelector('.files').appendChild(clone)
          tagTracksWithoutFiles()
        })
      })


    })

    document.body.appendChild(clone)
    dialog.classList.add('dialog--show')
  }

  if (ev.target.getAttribute('data-action') === 'play') {
    // find if audio-element already exists with this file_id, if so, fade pause
    const li = ev.target.closest('li')
    if (li.classList.contains('no-files')) return
    const id = li.getAttribute('data-id')
    const existingAudio = document.querySelector(`audio[data-id="${id}"]`)
    const volumeBar = li.querySelector('input[type=range]')
    ev.target.classList.toggle('active')
    let shouldPlay = ev.target.classList.contains('active') ? 1 : 0
    const presetId = document.querySelector('#preset [data-state=selected]').getAttribute('data-id')
    presets.set_track_play(id, presetId, shouldPlay)
    let targetVolume = null
    if (volumeBar) { // music
      targetVolume = volumeBar.value
      if (existingAudio) {
        if (existingAudio.paused) {
          fadeIn(existingAudio, targetVolume)
        } else {
          fadeOut(existingAudio)
        }
        return
      } else {
        createAudio(id).then(audio => {
          if (audio) {
            fadeIn(audio, targetVolume)
            return
          }
        })
      }
    } else { // Effect
      li.querySelector('.keystroke').classList.add('flash')
      // createAudio(id)
      playEffect(id)
      let flash = setTimeout(() => {
        li.querySelector('.keystroke').classList.remove('flash')
      }, 750)
    }
  }

  if (ev.target.getAttribute('data-action') === 'delete-file') {
    const file_id = ev.target.parentElement.getAttribute('data-id')
    // loadJson(`/api/file/delete.php?id=${file_id}`)
    files.delete(file_id)
    ev.target.parentElement.remove()
    tagTracksWithoutFiles()
  }

  if (ev.target.getAttribute('data-action') === 'close-dialog') {
    const dialog = ev.target.closest('.dialog')
    if (dialog.id === "infobox" || dialog.id === "settings") {
      dialog.classList.remove('dialog--show')
    } else {
      dialog.remove()
    }
  }

  if (ev.target.getAttribute('data-action') === 'stop') {
    const activeFiles = document.querySelectorAll('audio')
    if (activeFiles.length > 0) {
      activeFiles.forEach(file => {
        fadeOut(file)
      })
    }
    const activeTracks = document.querySelectorAll('[data-action=play].active')
    activeTracks.forEach(track => track.classList.remove('active'))
  }

  if (ev.target.getAttribute('data-action') === 'info') {
    document.querySelector('#infobox').classList.add('dialog--show')
  }

  if (ev.target.getAttribute('data-action') === 'themes-toggle') {
    const theme = document.querySelector('#theme')
    let transform = theme_width // inline padding + gap
    const mainColor = root.style.getPropertyValue('--primary-100')
    const accentColor = root.style.getPropertyValue('--accent-trans')
    if (theme.style.width === "0px") {
      ev.target.querySelector('.arrow').style.transform = "rotateY(0)"
      ev.target.style.backgroundColor = mainColor
      ev.target.style.color = accentColor
      theme.style.width = theme_width + "px"
      theme.style.transform = `translateX(0px)`
      theme.classList.remove('shrinking')
    } else {
      ev.target.style.backgroundColor = accentColor
      ev.target.style.color = mainColor
      ev.target.querySelector('.arrow').style.transform = "rotateY(180deg)"
      theme.classList.add('shrinking')
      theme.style.width = "0px"
      theme.style.transform = `translateX(-${theme_width}px)`
    }
  }

  if (ev.target.getAttribute('data-action') === 'settings') {
    document.querySelector('#settings').classList.add('dialog--show')
  }

  if (ev.target.getAttribute('data-action') === 'reset-theme') {
    // loadJson(`/api/settings/reset-theme.php`)

    settings.reset_ui_colors().then(() => {

      settings.get_primary_color().then(color => {
        const primaryValues = color.substr(4).replace(")", "").replaceAll("%", '').split(', ')
        root.style.setProperty('--primary-100', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) + 20}%)`)
        root.style.setProperty('--primary-200', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) + 10}%)`)
        root.style.setProperty('--primary-300', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2])}%)`)
        root.style.setProperty('--primary-400', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) - 5}%)`)
        root.style.setProperty('--primary-400-trans', `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) - 5}%, 70%)`)
        root.style.setProperty('--primary-500', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) - 10}%)`)
        root.style.setProperty('--primary-600', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) - 15}%)`)
        root.style.setProperty('--primary-600-trans', `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${parseFloat(primaryValues[2]) - 15}%, 70%)`)
      })

      settings.get_accent_color().then(color => {
        console.log(color)
        const primaryValues = color.substr(4).replace(")", "").replaceAll("%", '').split(', ')
        root.style.setProperty('--accent', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2]}%)`)
        root.style.setProperty('--accent-trans', `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2]}%, 70%)`)
      })
    })
  }

  if (ev.target.getAttribute('data-action') === 'dominant-theme') {
    setColors()
  }


  if (ev.target.classList.contains('dialog__outer')) {
    const dialog = ev.target.closest('.dialog')
    if (dialog.id === "settings" || dialog.id === "infobox") {
      dialog.classList.remove('dialog--show')
    } else {
      document.querySelector('.dialog').remove()
    }
  }
})

function getTrackSettings(preset_id) {
  const tracks = document.querySelectorAll('#track li')
  tracks.forEach(track => {
    if (track.classList.contains('no-files')) return
    const track_id = track.getAttribute('data-id')
    // loadJson(`/api/preset/track-settings.php?preset_id=${preset_id}&track_id=${track_id}`)
    presets.get_settings_for_track(preset_id, track_id).then(data => {
      if (data) {
        const existing = document.querySelector(`audio[data-id="${track.getAttribute('data-id')}"]`)
        const range = track.querySelector('[type=range]')
        const volume = range.value / 100
        if (!existing) {
          createAudio(track_id).then(audio => {
            if (audio) {
              if (data.playing && audio.playing) {
                fadeTo(audio, data.volume)
              } else if (data.playing && !audio.playing) {
                range.value = data.volume
                fadeIn(audio, data.volume)
              } else {
                range.value = data.volume
              }
            }
          })
        } else {
          existing.volume = data.volume / 100
          if (data.playing) {
            existing.play()
            fadeTo(existing, data.volume)
          } else {
            fadeOut(existing)
          }
        }
        if (data.playing) {
          track.querySelector('[data-action=play]').classList.add('active')
        } else {
          track.querySelector('[data-action=play]').classList.remove('active')
        }
      } else {
        // Create preset_track connection
        // loadJson(`/api/preset/get-track.php?track_id=${track_id}&preset_id=${preset_id}`)
        presets.get_settings_for_track(track_id, preset_id)
          .then(info => {
            if (!info) {
              if (track_id && preset_id) {
                // loadJson(`/api/preset/add-track.php?track_id=${track_id}&preset_id=${preset_id}`)
                window.tracks.add_track_to_preset(track_id, preset_id)
                  .then((settings) => {
                    // Recursive or infinite loop - who can tell?
                    getTrackSettings(preset_id)
                  })
              }
            }
          })
      }
    })
  })
}



document.querySelectorAll('.add-form').forEach(form =>
  form.addEventListener('submit', (ev) => {
    ev.preventDefault()
    const button = form.querySelector('[type=submit]')
    const input = form.querySelector('input[id^=new]')
    if (input.value === "") {
      return
    }
    const value = removeTags(input.value)
    const list = form.parentElement.nextElementSibling // list
    const type = list.parentElement.id
    let theme_id = ""
    const selectedTheme = document.querySelector('#theme .list__item[data-state=selected]')
    if (selectedTheme) {
      theme_id = selectedTheme.getAttribute('data-id')
    }
    if (type === "theme") {
      createTheme(value, list)
    }
    if (type === "preset") {
      createPreset(value, theme_id, list)
    }
    if (type === "track") {
      createTrack(value, theme_id, list)
    }
    if (type === "effect") {
      createEffect(value, theme_id, list)
    }
    input.value = ""
  }
  ))

document.addEventListener('keydown', ev => {
  const effects = document.querySelectorAll('#effect .list li:not(.empty)')
  const effectsLength = effects.length
  if (effectsLength > 0) {
    for (let i = 0; i < effectsLength; i++) {
      if (ev.code === `Digit${i + 1}` || ev.code === `Numpad${i + 1}`) {
        const id = effects[i].getAttribute('data-id')
        effects[i].querySelector('.keystroke').classList.add('flash')
        playEffect(id)
        let flash = setTimeout(() => {
          effects[i].querySelector('.keystroke').classList.remove('flash')
        }, 1000)
      }
      if (effects[i].getAttribute('data-keystroke') && ev.code === "Key" + effects[i].getAttribute('data-keystroke').toLocaleUpperCase()) {
        const id = effects[i].getAttribute('data-id')
        effects[i].querySelector('.keystroke').classList.add('flash')
        playEffect(id)
        let flash = setTimeout(() => {
          effects[i].querySelector('.keystroke').classList.remove('flash')
        }, 1000)
      }
    }
  }

  if (ev.code === "Escape") {
    const dialog = document.querySelector('.dialog')
    if (dialog) {
      dialog.remove()
    }
  }
})

// Volume handling
document.addEventListener('change', ev => {
  if (ev.target.classList.contains('volume-slider__bar')) {
    const audioId = ev.target.closest('li').getAttribute('data-id')
    const audioElement = document.querySelector(`audio[data-id="${audioId}"]`)
    const presetId = document.querySelector('#preset [data-state=selected]').getAttribute('data-id')
    // loadJson(`/api/preset/update-volume.php?preset_id=${presetId}&track_id=${audioId}&volume=${ev.target.value}`)
    presets.set_track_volume(presetId, audioId, ev.target.value)

    if (audioElement) {
      fadeTo(audioElement, ev.target.value)
    }
  }

  if (ev.target.id === "main-effects-volume") {
    document.querySelectorAll('audio[data-type="effect"]').forEach(effect => {
      fadeTo(effect, ev.target.value)
    })
    // loadJson(`/api/track/set-effect-volume.php?volume=${ev.target.value}`)
    settings.set_last_effect_volume(ev.target.value)
  }

  if (ev.target.id === "bg-img-url") {
    document.body.style.backgroundImage = `url(${ev.target.value})`
    // loadJson(`/api/settings/set-background.php?url=${ev.target.value}`)
    settings.set_background_image(ev.target.value)
    // setColors()
  }
  if (ev.target.id === "font-setting") {
    // loadJson(`/api/settings/set-font.php?font=${ev.target.value}`)
    settings.set_vont(ev.target.value)
    root.style.setProperty("--font", `"${ev.target.value}"`)

    const font = ev.target.value.replace(' ', '+')
    WebFont.load({
      google: {
        families: [font]
      }
    })
  }
})

document.addEventListener('dblclick', ev => {
  if (ev.target.getAttribute('data-action') === "select") {
    const data_type = ev.target.closest('section').id
    ev.target.setAttribute('type', 'text')
    ev.target.select()
    const id = ev.target.closest('li').getAttribute('data-id')
    document.addEventListener('click', (click) => {
      if (click.target === ev.target) return
      ev.target.setAttribute('type', 'button')
      console.log(data_type, id, ev.target.value)
      // loadJson(`/api/${data_type}/update.php?id=${id}&new-name=${ev.target.value}`)

    })
    addEventListener('keydown', (pressed) => {
      if (pressed.key === "Enter") {
        // loadJson(`/api/${data_type}/update.php?id=${id}&new-name=${ev.target.value}`)
        ev.target.setAttribute('type', 'button')
      }
    })
  }

  if (ev.target.classList.contains('track-title')) {
    const data_type = ev.target.closest('section').id
    const current_item = ev.target.closest('li')
    const id = current_item.getAttribute('data-id')

    ev.target.style.display = "none"

    const textarea = createTitleInput(ev.target.innerHTML)
    ev.target.insertAdjacentElement('afterend', textarea)
    textarea.focus()
    textarea.select()
    textarea.addEventListener('keydown', (pressed) => {
      if (pressed.key === "Enter") {
        ev.preventDefault()
        ev.target.removeAttribute('style')
        ev.target.innerHTML = textarea.value
        textarea.remove()
        // loadJson(`/api/track/update.php?id=${id}&new-name=${textarea.value}`)
        tracks.update(id, textarea.value)
      }
    })

    document.addEventListener('click', (click) => {
      if (click.target.type === "textarea") return
      ev.target.removeAttribute('style')
      ev.target.innerHTML = textarea.value
      textarea.remove()
      // loadJson(`/api/track/update.php?id=${id}&new-name=${textarea.value}`)
      tracks.update(id, textarea.value)
    })
  }
})

let dragged;
let order;
let index;
let indexDrop;
let list;

document.addEventListener("dragstart", ({ target }) => {
  dragged = target;
  order = target.getAttribute('data-order');
  list = target.parentNode.children;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i] === dragged) {
      index = i;
    }
  }
});

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("drop", ({ target }) => {
  if (target.nodeName === "LI" && target.getAttribute('data-order') !== order) {
    dragged.remove(dragged);
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === target) {
        indexDrop = i;
      }
    }
    if (index > indexDrop) {
      target.before(dragged);
    } else {
      target.after(dragged);
    }
    saveNewOrder(target)
  }
});

// Event handler bindings
// Initial setup

// Theme
const root = document.documentElement
// Color picker
const primaryEl = document.querySelector('#primary-color')
if (primaryEl) {
  const primaryPicker = new CP(primaryEl)
  let primaryHSL;

  primaryPicker.on('drag', (r, g, b, a) => {
    const value = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
    primaryEl.nextElementSibling.value = value
    primaryEl.style.backgroundColor = value
    // Convert rgba to HSL, then this:
    const primaryValues = RGBToHSL(r.toFixed(2), g.toFixed(2), b.toFixed(2))
    root.style.setProperty('--primary-100', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] + 20}%)`)
    root.style.setProperty('--primary-200', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] + 10}%)`)
    root.style.setProperty('--primary-300', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2]}%)`)
    root.style.setProperty('--primary-400', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] - 5}%)`)
    root.style.setProperty('--primary-400-trans', `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] - 5}%, 70%)`)
    root.style.setProperty('--primary-500', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] - 10}%)`)
    root.style.setProperty('--primary-600', `hsl(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] - 15}%)`)
    root.style.setProperty('--primary-600-trans', `hsla(${primaryValues[0]}, ${primaryValues[1]}%, ${primaryValues[2] - 15}%, 70%)`)
    primaryHSL = `hsl(${primaryValues[0].toFixed(2)},${primaryValues[1].toFixed(2)}%,${primaryValues[2].toFixed(2)}%)`
  })

  primaryPicker.on('stop', () => {
    console.log("Set primary color")
    // loadJson(`/api/settings/set-primary-color.php?color=${primaryHSL}`)
    settings.set_primary_color(primaryHSL)
  })
}

const accentEl = document.querySelector('#accent-color')
if (accentEl) {
  const accentPicker = new CP(accentEl)
  let accentHSL
  let accentTransHSL
  accentPicker.on('drag', (r, g, b, a) => {
    const value = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
    accentEl.nextElementSibling.value = value
    accentEl.style.backgroundColor = value
    // Convert rgba to hsl, then this:
    const accentValues = RGBToHSL(r, g, b)
    accentHSL = `hsl(${accentValues[0].toFixed(2)}, ${accentValues[1].toFixed(2)}%, ${accentValues[2].toFixed(2)}%)`
    accentTransHSL = `hsl(${accentValues[0].toFixed(2)}, ${accentValues[1].toFixed(2)}%, ${accentValues[2].toFixed(2)}%, 70%)`
    root.style.setProperty('--accent', accentHSL)
    root.style.setProperty('--accent-trans', accentTransHSL)
  })

  accentPicker.on('stop', () => {
    // loadJson(`/api/settings/set-accent-color.php?color=${accentHSL.toString()}`)
    settings.set_accent_color(accentHSL.toString())
  })
}

function hueShift(h, s) {
  h += s; while (h >= 360.0) h -= 360.0; while (h < 0.0) h += 360.0; return h;
}

async function setColors() {
  let image_url = document.querySelector('#bg-img-url').value

  settings.set_dominant_colors(image_url)
  const primary = await settings.get_primary_color()
  const accent = await settings.get_accent_color()

  const primaryValues = primary.split(", ")
  const lightValue = parseFloat(primaryValues[2])

  const accentValues = accent.split(", ")
  const accentLight = parseFloat(accentValues[2])
  root.style.setProperty('--primary-100', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue + 20}%)`)
  root.style.setProperty('--primary-200', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue + 10}%)`)
  root.style.setProperty('--primary-300', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue}%)`)
  root.style.setProperty('--primary-400', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue - 5}%)`)
  root.style.setProperty('--primary-400-trans', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue - 5}%, 70%)`)
  root.style.setProperty('--primary-500', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue - 10}%)`)
  root.style.setProperty('--primary-600', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue - 15}%)`)
  root.style.setProperty('--primary-600-trans', `${primaryValues[0]}, ${primaryValues[1]}, ${lightValue - 15}%, 70%)`)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-trans', `${accentValues[0]}, ${accentValues[1]}, ${accentValues[2]}, 70%`)
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
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
}
