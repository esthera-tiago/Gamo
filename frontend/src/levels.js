import { $, $$, createElement, showLoading, showToast } from './ui.js'
import { get, post } from './api.js'
import { getSession, getToken } from './auth.js'

const SVG_ICONS = {
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  africa: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
}

const LEVEL_DESCRIPTIONS = {
  'north-africa': 'From the Atlas Mountains to the Nile Delta',
  'west-africa': 'Coastal nations and vast Sahel landscapes',
  'central-africa': 'The Congo Basin and Gulf of Guinea',
  'east-africa': 'Great Lakes, savannahs, and the Horn',
  'south-africa-region': 'Savannahs, deserts, and stunning coastlines',
  'all-africa': 'Find every single country on the continent',
}

export async function loadLevels() {
  const container = document.getElementById('levels-grid')
  if (!container) return

  showLoading(container)

  try {
    const session = await getSession()

    let levels
    if (getToken()) {
      levels = await get('/levels')
    } else {
      const { data: guestData } = await get('/levels').catch(() => ({
        data: null,
      }))
      levels = guestData || await getFallbackLevels()
    }

    container.innerHTML = ''
    for (const level of levels) {
      const card = createLevelCard(level)
      container.appendChild(card)
    }

    if (session?.user) {
      loadUserProfile()
    }
  } catch (err) {
    console.error('Failed to load levels:', err)
    const fallback = getFallbackLevels()
    container.innerHTML = ''
    for (const level of fallback) {
      const card = createLevelCard(level)
      container.appendChild(card)
    }
  }
}

function getFallbackLevels() {
  return [
    { id: 1, name: 'North Africa', slug: 'north-africa', order_index: 1, countries: ['DZ','EG','LY','MA','SD','TN','EH'], unlock_requires: null, locked: false, progress: null },
    { id: 2, name: 'West Africa', slug: 'west-africa', order_index: 2, countries: ['BJ','BF','CV','CI','GM','GH','GN','GW','LR','ML','MR','NE','NG','SN','SL','TG'], unlock_requires: 1, locked: false, progress: null },
    { id: 3, name: 'Central Africa', slug: 'central-africa', order_index: 3, countries: ['AO','CM','CF','TD','CG','CD','GQ','GA','ST'], unlock_requires: 2, locked: false, progress: null },
    { id: 4, name: 'East Africa', slug: 'east-africa', order_index: 4, countries: ['BI','DJ','ER','ET','KE','MG','MW','MU','MZ','RW','SC','SO','SS','TZ','UG','ZM','ZW'], unlock_requires: 3, locked: false, progress: null },
    { id: 5, name: 'Southern Africa', slug: 'south-africa-region', order_index: 5, countries: ['BW','LS','NA','SZ','ZA'], unlock_requires: 4, locked: false, progress: null },
    { id: 6, name: 'All Africa', slug: 'all-africa', order_index: 6, countries: ['ALL'], unlock_requires: 5, locked: false, progress: null },
  ]
}

async function loadUserProfile() {
  try {
    const profile = await get('/auth/profile')
    const avatarEl = document.getElementById('user-avatar')
    const nameEl = document.getElementById('user-name')
    if (avatarEl && profile.avatar_url) avatarEl.src = profile.avatar_url
    if (nameEl) nameEl.textContent = profile.username
  } catch (err) {
    console.error('Failed to load profile:', err)
  }
}

function createLevelCard(level) {
  const isLocked = level.locked
  const isCompleted = level.progress?.completed
  const countryCount = level.countries.includes('ALL') ? 54 : level.countries.length

  const card = createElement('div', { class: `level-card ${isLocked ? 'level-locked' : ''} ${isCompleted ? 'level-completed' : ''}` })

  const header = createElement('div', { class: 'level-card-header' }, [
    createElement('div', { class: 'level-icon' }, [SVG_ICONS.africa]),
    createElement('span', { class: 'level-number' }, [`Level ${level.order_index}`]),
  ])
  card.appendChild(header)

  const body = createElement('div', { class: 'level-card-body' }, [
    createElement('h3', { class: 'level-name' }, [level.name]),
    createElement('p', { class: 'level-desc' }, [LEVEL_DESCRIPTIONS[level.slug] || level.description || '']),
    createElement('p', { class: 'level-countries' }, [`${countryCount} countries`]),
  ])
  card.appendChild(body)

  const footer = createElement('div', { class: 'level-card-footer' })

  if (isLocked) {
    footer.appendChild(createElement('div', { class: 'level-lock-info' }, [
      SVG_ICONS.lock,
      createElement('span', {}, [`Complete ${level.lockedBy || 'previous level'} to unlock`]),
    ]))
  } else if (isCompleted && level.progress) {
    const stars = renderStarsSmall(level.progress.accuracy)
    footer.appendChild(stars)
    footer.appendChild(createElement('span', { class: 'level-score' }, [`${level.progress.score} pts`]))
    footer.appendChild(createButton('Play Again', () => startLevel(level)))
  } else {
    footer.appendChild(createButton('Play', () => startLevel(level)))
  }

  card.appendChild(footer)
  return card
}

function renderStarsSmall(accuracy) {
  let count = 1
  if (accuracy > 70) count = 2
  if (accuracy > 90) count = 3

  const container = createElement('div', { class: 'stars-small' })
  for (let i = 0; i < count; i++) {
    container.innerHTML += '<span class="star-small star-filled"></span>'
  }
  for (let i = count; i < 3; i++) {
    container.innerHTML += '<span class="star-small star-empty"></span>'
  }
  return container
}

function createButton(text, onClick) {
  return createElement('button', {
    class: 'btn btn-primary btn-sm',
    onclick: onClick,
  }, [text])
}

function startLevel(level) {
  const data = encodeURIComponent(JSON.stringify(level))
  window.location.href = `/game.html?level=${data}`
}
