export function $(sel, ctx = document) {
  return ctx.querySelector(sel)
}

export function $$(sel, ctx = document) {
  return [...ctx.querySelectorAll(sel)]
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag)
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') {
      el.className = val
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(val)) {
        el.dataset[dk] = dv
      }
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), val)
    } else {
      el.setAttribute(key, val)
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child))
    } else if (child instanceof Node) {
      el.appendChild(child)
    }
  }
  return el
}

export function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-container')
  let container = existing
  if (!container) {
    container = createElement('div', { class: 'toast-container' })
    document.body.appendChild(container)
  }

  const toast = createElement('div', { class: `toast toast-${type}` }, [message])
  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('toast-hide')
    setTimeout(() => toast.remove(), 300)
  }, 2500)
}

export function showModal(content) {
  const overlay = createElement('div', { class: 'modal-overlay' })
  const modal = createElement('div', { class: 'modal-content' }, [content])
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay)
  })

  return overlay
}

export function closeModal(overlay) {
  overlay.classList.add('modal-closing')
  setTimeout(() => overlay.remove(), 200)
}

export function renderStars(accuracy) {
  let stars = 0
  if (accuracy > 90) stars = 3
  else if (accuracy > 70) stars = 2
  else stars = 1

  const container = createElement('div', { class: 'stars-container' })
  for (let i = 0; i < 3; i++) {
    const star = createElement('span', { class: `star ${i < stars ? 'star-filled' : 'star-empty'}` })
    container.appendChild(star)
  }
  return container
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function showLoading(container) {
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div>'
}
