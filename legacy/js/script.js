function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const root = document.documentElement;
    const toggleButton = document.querySelector('.theme-toggle');
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        updateToggleIcon('light');
        updateGradientColors('light');
    } else {
        document.body.classList.remove('light-theme');
        updateToggleIcon('dark');
        updateGradientColors('dark');
    }
    
    localStorage.setItem('theme', theme);
}

function updateToggleIcon(theme) {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;
    
    const svg = toggleButton.querySelector('svg');
    if (!svg) return;
    
    if (theme === 'light') {
        svg.innerHTML = `<path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>`;
    } else {
        svg.innerHTML = `<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>`;
    }
}

function updateGradientColors(theme) {
    const gradientElement = document.getElementById('gradient');
    if (!gradientElement) return;
    
    const stops = gradientElement.querySelectorAll('stop');
    if (stops.length < 3) return;
    
    if (theme === 'light') {
        stops[0].setAttribute('style', 'stop-color:#d8b4fe;stop-opacity:1');
        stops[1].setAttribute('style', 'stop-color:#e9d5ff;stop-opacity:1');
        stops[2].setAttribute('style', 'stop-color:#f3e8ff;stop-opacity:1');
    } else {
        stops[0].setAttribute('style', 'stop-color:#8b5cf6;stop-opacity:1');
        stops[1].setAttribute('style', 'stop-color:#a78bfa;stop-opacity:1');
        stops[2].setAttribute('style', 'stop-color:#c4b5fd;stop-opacity:1');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    const toggleButton = document.querySelector('.theme-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTheme);
    }
});