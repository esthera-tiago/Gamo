import { showToast, showModal, closeModal, renderStars, formatTime, createElement } from './ui.js'
import { post } from './api.js'
import { getToken } from './auth.js'

export const COUNTRY_NAMES = {
  DZ: 'Algeria', AO: 'Angola', BJ: 'Benin', BW: 'Botswana', BF: 'Burkina Faso',
  BI: 'Burundi', CV: 'Cabo Verde', CM: 'Cameroon', CF: 'Central African Republic',
  TD: 'Chad', KM: 'Comoros', CG: 'Congo', CD: 'Democratic Republic of the Congo',
  DJ: 'Djibouti', EG: 'Egypt', GQ: 'Equatorial Guinea', ER: 'Eritrea',
  SZ: 'Eswatini', ET: 'Ethiopia', GA: 'Gabon', GM: 'Gambia', GH: 'Ghana',
  GN: 'Guinea', GW: 'Guinea-Bissau', CI: "Côte d'Ivoire", KE: 'Kenya',
  LS: 'Lesotho', LR: 'Liberia', LY: 'Libya', MG: 'Madagascar', MW: 'Malawi',
  ML: 'Mali', MR: 'Mauritania', MU: 'Mauritius', MA: 'Morocco', MZ: 'Mozambique',
  NA: 'Namibia', NE: 'Niger', NG: 'Nigeria', RW: 'Rwanda',
  ST: 'São Tomé and Príncipe', SN: 'Senegal', SC: 'Seychelles', SL: 'Sierra Leone',
  SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan', SD: 'Sudan',
  TZ: 'Tanzania', TG: 'Togo', TN: 'Tunisia', UG: 'Uganda',
  EH: 'Western Sahara', ZM: 'Zambia', ZW: 'Zimbabwe',
}

const state = {
  level: null,
  countries: [],
  remaining: [],
  current: null,
  score: 0,
  errors: 0,
  startTime: null,
  totalCountries: 0,
  foundCountries: [],
  wrongClicks: {},
  timerInterval: null,
  elapsed: 0,
  isPaused: false,
}

function getAvailablePaths(allPaths) {
  const codes = new Set()
  for (const p of allPaths) {
    if (p.id) codes.add(p.id)
  }
  return codes
}

function filterAvailableCountries(countryList, allPaths) {
  const available = getAvailablePaths(allPaths)
  return countryList.filter(c => {
    if (!available.has(c)) {
      console.warn(`Country ${c} (${COUNTRY_NAMES[c] || 'unknown'}) not found on map — skipped`)
      return false
    }
    return true
  })
}

function forEachPath(code, fn) {
  const paths = document.querySelectorAll(`#africa-map path[id="${code}"]`)
  paths.forEach(fn)
}

export function initGame(level, allPaths) {
  state.level = level
  state.score = 0
  state.errors = 0
  state.foundCountries = []
  state.wrongClicks = {}
  state.elapsed = 0
  state.isPaused = false

  let countryList
  if (level.countries.includes('ALL')) {
    countryList = Object.keys(COUNTRY_NAMES)
  } else {
    countryList = [...level.countries]
  }

  countryList = filterAvailableCountries(countryList, allPaths)

  state.countries = shuffleArray(countryList)
  state.remaining = [...state.countries]
  state.totalCountries = state.countries.length
  state.startTime = Date.now()

  resetPathStyles(allPaths, level.countries)
  startTimer()

  updateUI()
  nextCountry()
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function resetPathStyles(allPaths, activeCountries) {
  for (const path of allPaths) {
    const code = path.id
    if (!code) continue
    path.classList.remove('correct-answer', 'wrong-answer', 'interactive', 'locked')
    path.style.pointerEvents = ''
    path.style.display = ''

    if (activeCountries.includes('ALL') || activeCountries.includes(code)) {
      path.classList.add('interactive')
    } else {
      path.classList.add('locked')
    }
  }
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval)
  state.startTime = Date.now()
  state.timerInterval = setInterval(() => {
    if (!state.isPaused) {
      state.elapsed = Math.floor((Date.now() - state.startTime) / 1000)
      updateTimerDisplay()
    }
  }, 200)
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval)
    state.timerInterval = null
  }
}

function updateTimerDisplay() {
  const el = document.getElementById('timer')
  if (el) el.textContent = formatTime(state.elapsed)
}

function updateUI() {
  const progressEl = document.getElementById('progress-text')
  const scoreEl = document.getElementById('score-display')
  const levelNameEl = document.getElementById('level-name')
  const foundListEl = document.getElementById('found-list')

  if (progressEl) progressEl.textContent = `${state.foundCountries.length} / ${state.totalCountries}`
  if (scoreEl) scoreEl.textContent = state.score
  if (levelNameEl) levelNameEl.textContent = state.level.name

  const bar = document.getElementById('progress-bar')
  if (bar) {
    const pct = state.totalCountries > 0 ? (state.foundCountries.length / state.totalCountries) * 100 : 0
    bar.style.width = `${pct}%`
  }

  if (foundListEl) {
    foundListEl.innerHTML = ''
    for (const code of state.foundCountries) {
      const item = document.createElement('li')
      item.textContent = COUNTRY_NAMES[code] || code
      foundListEl.appendChild(item)
    }
  }
}

export function nextCountry() {
  if (state.remaining.length === 0) {
    endGame()
    return
  }

  state.current = state.remaining[0]
  state.wrongClicks[state.current] = 0

  const promptEl = document.getElementById('current-prompt')
  if (promptEl) {
    promptEl.textContent = COUNTRY_NAMES[state.current] || state.current
  }

  document.querySelectorAll('#africa-map path.current-highlight').forEach(p => p.classList.remove('current-highlight'))
  forEachPath(state.current, (p) => p.classList.add('current-highlight'))

  updateUI()
}

export function handleMapClick(event) {
  if (state.isPaused) return

  const path = event.target.closest('path')
  if (!path) return

  const code = path.id
  if (!code || !COUNTRY_NAMES[code]) return

  if (path.classList.contains('locked')) return
  if (!state.current) return

  if (code === state.current) {
    handleCorrect(code)
  } else if (state.countries.includes(code)) {
    handleWrong(path)
  }
}

function handleCorrect(code) {
  forEachPath(code, (p) => {
    p.classList.add('correct-answer')
    p.classList.remove('interactive')
    p.style.pointerEvents = 'none'
  })

  let points = 10
  if (state.wrongClicks[code] === 0) {
    points += 5
  } else {
    points -= state.wrongClicks[code] * 2
  }

  const timeBonus = getTimeBonus()
  points += timeBonus
  points = Math.max(1, points)

  state.score += points
  state.foundCountries.push(code)
  state.remaining = state.remaining.filter(c => c !== code)

  showToast(`${COUNTRY_NAMES[code] || code} +${points}pts`, 'success')

  updateUI()

  setTimeout(() => {
    forEachPath(code, (p) => p.classList.remove('correct-answer'))
    nextCountry()
  }, 600)
}

function handleWrong(path) {
  path.classList.add('wrong-answer')
  state.errors++
  state.wrongClicks[state.current] = (state.wrongClicks[state.current] || 0) + 1

  showToast('Wrong! Try again', 'error')

  setTimeout(() => {
    path.classList.remove('wrong-answer')
  }, 400)
}

function getTimeBonus() {
  if (state.elapsed < 120) return 50
  if (state.elapsed < 240) return 25
  return 0
}

function endGame() {
  stopTimer()
  state.elapsed = Math.floor((Date.now() - state.startTime) / 1000)

  const accuracy = state.totalCountries > 0
    ? Math.round((state.foundCountries.length / state.totalCountries) * 100)
    : 0

  submitResults(accuracy)
  showResultsModal(accuracy)
}

async function submitResults(accuracy) {
  const token = getToken()
  if (!token) return

  try {
    await post('/scores', {
      level_id: state.level.id,
      score: state.score,
      accuracy,
      time_seconds: state.elapsed,
    })
    await post('/progress', {
      level_id: state.level.id,
      completed: true,
      score: state.score,
      accuracy,
      time_seconds: state.elapsed,
    })
  } catch (err) {
    console.error('Failed to submit results:', err)
  }
}

function showResultsModal(accuracy) {
  const stars = renderStars(accuracy)

  const content = createElement('div', {}, [
    createElement('h2', { class: 'modal-title' }, ['Level Complete!']),
    stars,
    createElement('div', { class: 'results-stats' }, [
      createElement('div', { class: 'stat-row' }, [
        createElement('span', { class: 'stat-label' }, ['Score']),
        createElement('span', { class: 'stat-value' }, [`${state.score}`]),
      ]),
      createElement('div', { class: 'stat-row' }, [
        createElement('span', { class: 'stat-label' }, ['Accuracy']),
        createElement('span', { class: 'stat-value' }, [`${accuracy}%`]),
      ]),
      createElement('div', { class: 'stat-row' }, [
        createElement('span', { class: 'stat-label' }, ['Time']),
        createElement('span', { class: 'stat-value' }, [`${formatTime(state.elapsed)}`]),
      ]),
      createElement('div', { class: 'stat-row' }, [
        createElement('span', { class: 'stat-label' }, ['Found']),
        createElement('span', { class: 'stat-value' }, [`${state.foundCountries.length}/${state.totalCountries}`]),
      ]),
    ]),
    createElement('div', { class: 'modal-actions' }, [
      createElement('button', {
        class: 'btn btn-primary',
        onclick: () => {
          closeModal(overlay)
          window.location.reload()
        },
      }, ['Play Again']),
      createElement('button', {
        class: 'btn btn-secondary',
        onclick: () => {
          closeModal(overlay)
          window.location.href = '/levels.html'
        },
      }, ['Back to Levels']),
    ]),
  ])

  const overlay = showModal(content)
}

export function togglePause() {
  state.isPaused = !state.isPaused
  const overlay = document.getElementById('pause-overlay')
  if (overlay) {
    overlay.style.display = state.isPaused ? 'flex' : 'none'
  }

  const btn = document.getElementById('pause-btn')
  if (btn) {
    btn.textContent = state.isPaused ? 'Resume' : 'Pause'
  }
}
