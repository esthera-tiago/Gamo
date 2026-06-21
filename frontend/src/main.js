import { onAuthStateChange, getSession } from './auth.js'
import { loadLevels } from './levels.js'
import { initGame, handleMapClick, togglePause } from './game.js'
import { $, showToast } from './ui.js'

const page = window.location.pathname

async function init() {
  onAuthStateChange((session) => {
    updateNavAuth(session)
  })

  if (page === '/levels.html') {
    loadLevels()
  }

  if (page === '/game.html') {
    initGamePage()
  }

  if (page === '/about.html') {
    initAboutPage()
  }

  if (page === '/' || page === '/index.html') {
    initLandingPage()
  }
}

function updateNavAuth(session) {
  const authEl = document.getElementById('nav-auth')
  if (!authEl) return

  if (session?.user) {
    authEl.innerHTML = `
      <a href="/levels.html" class="nav-link">Play</a>
      <a href="/about.html" class="nav-link">About</a>
      <button class="btn btn-sm btn-outline" id="signout-btn">Sign Out</button>
    `
    const signoutBtn = document.getElementById('signout-btn')
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        const { signOut } = await import('./auth.js')
        await signOut()
        window.location.href = '/'
      })
    }
  } else {
    authEl.innerHTML = `
      <a href="/levels.html" class="nav-link">Play</a>
      <a href="/about.html" class="nav-link">About</a>
      <a href="/" class="btn btn-sm btn-primary">Sign In</a>
    `
  }
}

function initLandingPage() {
  const googleBtn = document.getElementById('google-signin')
  const emailForm = document.getElementById('email-auth-form')
  const toggleAuth = document.getElementById('toggle-auth-mode')

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const { signInWithGoogle } = await import('./auth.js')
        await signInWithGoogle()
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  if (emailForm) {
    let isSignUp = false

    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('email-input').value
      const password = document.getElementById('password-input').value

      try {
        const { signInWithEmail, signUpWithEmail } = await import('./auth.js')
        if (isSignUp) {
          await signUpWithEmail(email, password)
          showToast('Check your email to confirm sign up!', 'success')
        } else {
          await signInWithEmail(email, password)
          window.location.href = '/levels.html'
        }
      } catch (err) {
        showToast(err.message, 'error')
      }
    })

    if (toggleAuth) {
      toggleAuth.addEventListener('click', () => {
        isSignUp = !isSignUp
        document.getElementById('auth-submit-btn').textContent = isSignUp ? 'Sign Up' : 'Sign In'
        toggleAuth.textContent = isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"
      })
    }
  }
}

function initGamePage() {
  const params = new URLSearchParams(window.location.search)
  const levelData = params.get('level')

  if (!levelData) {
    window.location.href = '/levels.html'
    return
  }

  try {
    const level = JSON.parse(decodeURIComponent(levelData))

    const mapContainer = document.getElementById('africa-map')
    if (mapContainer) {
      fetch('/maps/africa.svg')
        .then(r => r.text())
        .then(svgContent => {
          mapContainer.innerHTML = svgContent
          const svg = mapContainer.querySelector('svg')
          if (svg) {
            svg.style.width = '100%'
            svg.style.height = 'auto'
            svg.removeAttribute('width')
            svg.removeAttribute('height')
          }

          const paths = mapContainer.querySelectorAll('path')
          paths.forEach(p => {
            p.addEventListener('click', handleMapClick)
          })

          const pauseBtn = document.getElementById('pause-btn')
          if (pauseBtn) {
            pauseBtn.addEventListener('click', togglePause)
          }

          initGame(level, paths)
        })
        .catch(err => {
          console.error('Failed to load map:', err)
          showToast('Failed to load map', 'error')
        })
    }
  } catch (err) {
    console.error('Invalid level data:', err)
    window.location.href = '/levels.html'
  }
}

function initAboutPage() {
}

document.addEventListener('DOMContentLoaded', init)
