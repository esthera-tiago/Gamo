const countries = [
    "AO", "BI", "BJ", "BF", "BW",
    "CF", "CI", "CM", "CD", "CG",
    "DJ", "DZ", "EG", "ER", "ET",
    "GA", "GH", "GN", "GM", "GW",
    "GQ", "KE", "LR", "LY", "LS" ,
    "MA", "MG", "ML", "MZ", "MR",
    "MW", "NA", "NE", "NG", "RW",
    "EH", "SD", "SS", "SN", "SL",
    "SZ", "TD", "TG", "TN", "TZ",
    "UG", "ZA", "ZM", "ZW", "SO"
]

let score = 0
let target = null
let targetName = null
let scoreF = null
let shuffle = []
let currentIndex = 0
let restartButton = null
//Time variables
let startTime = null
let timerInterval = null
let totalElapsedTime = 0
let currentLapStartTime = null
let laps = []
//Pause variables
let isTimerPaused = false
let pausedTime = 0
let pauseStartTime = null

//Timer functions
function startTimer(){
    startTime = Date.now()
    currentLapStartTime = startTime
    laps = []
    totalElapsedTime = 0

    if (timerInterval){
        clearInterval(timerInterval)
    }
    timerInterval = setInterval(updateTimer, 1000)

    updateTimer()
    updateLaps()
}

function stopTimer(){
    if (timerInterval){
        clearInterval(timerInterval)
        timerInterval = null
    }

    if(startTime){
        totalElapsedTime = Date.now() - startTime
        startTime = null
    }
}

function recordLapsTime(isCorrect){
    if (!currentLapStartTime || isTimerPaused) return

    const now = Date.now()
    const lapTime = now - currentLapStartTime
    const countryCode = target
    const countryEl = document.getElementById(countryCode)
    const countryName = (countryEl && countryEl.dataset && countryEl.dataset.name) ? countryEl.dataset.name : countryCode

    laps.push({
        duration: lapTime,
        correct: isCorrect,
        country: countryCode,
        countryName: countryName,
        timeStamp: new Date().toLocaleTimeString()
    })

    currentLapStartTime = Date.now()
    updateLaps()
    console.log(`Lap recorded: ${formatTime(lapTime)} - ${isCorrect ? 'Correct' : 'Wrong'} - ${countryName}`);
}

function updateTimer(){
    if(!startTime || isTimerPaused) return
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const timerElement = document.getElementById('current-time')
    if (timerElement) {
        timerElement.textContent = formatTime(elapsed)
        if(!isTimerPaused){
            timerElement.style.animation = "none"
            setTimeout(() => {
                timerElement.style.animation = "pulse 1s infinite"
            }, 100);
        }
    }
}

function updateLaps(){
    const lapContainer = document.getElementById('laps-time');
    if (!lapContainer) return;
    lapContainer.innerHTML = "";

    const recentLaps = laps.slice(-5);
    recentLaps.forEach((lap, index) => {
        const lapElement = document.createElement('div');
        lapElement.className = `lap-item ${lap.correct ? 'correct' : 'wrong'}`;

        const lapNumber = laps.length - recentLaps.length + index + 1;

        lapElement.innerHTML = `
            <span>${lapNumber}. ${lap.countryName}</span>
            <span>${formatTime(lap.duration)}</span>
        `;

        lapContainer.appendChild(lapElement);
    });
    lapContainer.scrollTop = lapContainer.scrollHeight;
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

//Pause and resume timer functions
function pauseTimer(){
    console.log('pauseTimer invoked, isTimerPaused=', isTimerPaused, 'startTime=', startTime, 'shuffle.length=', shuffle.length)
    if(!startTime || shuffle.length === 0) return

    if(isTimerPaused){
        const pauseDuration = Date.now() - pauseStartTime
        startTime += pauseDuration
        currentLapStartTime +=  pauseDuration
        if(laps.length > 0){
            laps = laps.map(lap => ({
                ...lap,
            }));
        }

        timerInterval = setInterval(updateTimer, 1000)
        isTimerPaused = false
        pauseStartTime = null
        console.log("Timer resumed")
        updatePauseButton()
        updateGameStateOnPause()
    }
    else{
        clearInterval(timerInterval)
        isTimerPaused = true
        pauseStartTime = Date.now()
        console.log("Timer paused")
        updatePauseButton()
        updateGameStateOnPause()
    }
}
function updatePauseButton(){
    const pauseButton = document.getElementById('pause')
    if(!pauseButton) return
    const svg = pauseButton.querySelector('svg')
    if(!svg) return

    const statItem = pauseButton.closest('.stat-item')
    const statLabel = statItem ? statItem.querySelector('.stat-label') : null

    if(isTimerPaused){
        svg.innerHTML = '<path d="M240-240v-480h80v480h-80Zm160 0 400-240-400-240v480Zm80-141v-198l165 99-165 99Zm0-99Z"/>';
        pauseButton.title = "Resume Timer"
        if (statLabel) statLabel.innerText = 'Play'
    }else{
        svg.innerHTML = '<path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/>';
        pauseButton.title = "Pause Timer"
        if (statLabel) statLabel.innerText = 'Pause'
    }
}

function updateGameStateOnPause(){
    const svgPaths = document.querySelectorAll('svg path')
    const restartButton = document.getElementById('restart-btn')
    const pauseButton = document.getElementById('pause')
    if(isTimerPaused){
        svgPaths.forEach(path => {
            path.classList.add('paused')
            path.style.opacity = "0.5"
            
        })

        if (pauseButton) {
            pauseButton.style.opacity = "1"
            const pausePaths = pauseButton.querySelectorAll('svg path')
            pausePaths.forEach(p => {
                p.style.opacity = "1"
                p.classList.remove('paused')
            })
        }
        restartButton.disabled = true
        restartButton.style.opacity = "0.5"
        restartButton.style.cursor = "default"
        showPauseMessage()
    }else{
        svgPaths.forEach(path =>{
            path.classList.remove('paused')
            path.style.opacity = "1"
        })

        if (pauseButton) {
            const pausePaths = pauseButton.querySelectorAll('svg path')
            pausePaths.forEach(p => {
                p.style.opacity = "1"
                p.classList.remove('paused')
            })
            pauseButton.style.opacity = "1"
        }
        restartButton.disabled = false
        restartButton.style.opacity = "1"
        restartButton.style.cursor = "pointer"
        hidePauseMessage()
    }
}

function showPauseMessage(){
    let pauseMessage = document.getElementById('pause-message')
    if(!pauseMessage){
        pauseMessage = document.createElement('div')
        pauseMessage.id = 'pause-message';
        pauseMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Poppins', sans-serif;
            background-color: var(--accent-purple);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 10px;
            font-size: 1.2rem;
            text-decoration: none;
            z-index: 100;
            text-align: center;
        `;
        document.body.appendChild(pauseMessage)
    }
    pauseMessage.innerHTML = "Game Paused<br/>Click the play button to resume"
    pauseMessage.style.display = "block"
}

function hidePauseMessage(){
    const pauseMessage = document.getElementById('pause-message')
    if(pauseMessage){
        pauseMessage.style.display = "none"
    }
}

function showFinalStats(){
    let totalLapTime = 0;
    let correctCount = 0;
    laps.forEach(l => {
        totalLapTime += l.duration;
        if (l.correct) correctCount++;
    });

    const averageTime = laps.length > 0 ? totalLapTime / laps.length : 0;
    const accuracy = laps.length > 0 ? (correctCount / laps.length * 100).toFixed(1) : 0;
    const bestLap = laps.length > 0 ? Math.min(...laps.map(l => l.duration)) : 0;

    const statsOverlay = document.createElement('div')
    statsOverlay.id = 'stats-overlay'
    statsOverlay.style.cssText = `
        position:fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(130deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    const modal = document.createElement('div');
    modal.style.cssText = `
        background:var(--glass-bg);
        backdrop-filter:blur(20px);
        border:2px solid var(--glass-border);
        border-radius:20px;
        padding:2.5rem;
        max-width:500px;
        width:90%;
        box-shadow:0 20px 60px var(--shadow-color);
        animation:slideUp 0.4s ease-out;
    `;
    const title = document.createElement('h2');
    title.textContent = 'Game Complete!';
    title.style.cssText = `
        font-size:2rem;
        font-weight:700;
        padding-bottom:0.5rem;
        background:linear-gradient(135deg,var(--accent-purple),var(--accent-purple-light));
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;margin-bottom:1.5rem;
        text-align:center;
    `;
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
        display:flex;
        flex-direction:column;
        gap:1rem;
        margin-bottom:2rem;
    `;
    [
        { icon: '', label: 'Total Time:   ', value: formatTime(totalElapsedTime) },
        { icon: '', label: 'Score:    ', value: `${score}/${countries.length}` },
        { icon: '', label: 'Accuracy:   ', value: `${accuracy}%` },
        { icon: '', label: 'Average Time:   ', value: formatTime(averageTime) },
        { icon: '', label: 'Best Lap:   ', value: formatTime(bestLap) }
    ].forEach(stat => {
        const statItem = document.createElement('div');
        statItem.style.cssText = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:0.8rem 1.2rem;
            background:rgba(139,92,246,0.15);
            border:1px solid rgba(139,92,246,0.3);
            border-radius:10px;
            transition:all 0.3s;
            width:80%;
        `;
        const label = document.createElement('span');
        label.textContent = `${stat.icon} ${stat.label}`;
        label.style.cssText = `
            color:var(--text-secondary);
            font-size:1rem;
        `;
        const value = document.createElement('span');
        value.textContent = stat.value;
        value.style.cssText = `
            color:var(--accent-purple-light);
            font-size:1.2rem;
            font-weight:600;
        `;
        statItem.appendChild(label);
        statItem.appendChild(value);
        statsContainer.appendChild(statItem);
        statItem.addEventListener('mouseenter', () => {
            statItem.style.background = 'rgba(139,92,246,0.25)';
            statItem.style.transform = 'translateX(5px)';
        });
        statItem.addEventListener('mouseleave', () => {
            statItem.style.background = 'rgba(139,92,246,0.15)';
            statItem.style.transform = 'translateX(0)';
        });
    });

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `display:flex;gap:1rem;justify-content:center;`;
    
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.cssText = `
        padding:1rem 2rem;
        font-size:1.1rem;
        font-weight:600;
        color:#fff;
        background:linear-gradient(135deg,var(--accent-purple),var(--accent-purple-light));
        border:none;
        border-radius:50px;
        cursor:pointer;
        transition:all 0.3s;
        box-shadow:0 10px 30px var(--shadow-color);
    `;
    playAgainBtn.addEventListener('click', () => { closeStatsModal(); startGame(); });
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        padding:1rem 2rem;
        font-size:1.1rem;
        font-weight:600;
        color:var(--text-primary);
        background:var(--glass-bg);
        border:2px solid var(--glass-border);
        border-radius:50px;
        cursor:pointer;
        transition:all 0.3s;`;
    closeBtn.addEventListener('click', closeStatsModal);
    
    buttonsContainer.appendChild(playAgainBtn);
    buttonsContainer.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(statsContainer);
    modal.appendChild(buttonsContainer);
    statsOverlay.appendChild(modal);
    document.body.appendChild(statsOverlay);
    statsOverlay.addEventListener('click', (e) => { if (e.target === statsOverlay) closeStatsModal(); });
}

function closeStatsModal() {
    const statsOverlay = document.getElementById('stats-overlay');
    if (statsOverlay) {
        statsOverlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => statsOverlay.remove(), 300);
    }
}

//Map's game functions
function shuffleArray(array){
    const clone = [...array]
    for (let i = clone.length - 1; i>0; i--){
       let j = Math.floor(Math.random() * (i + 1)); 
       [clone[i], clone[j]] = [clone[j], clone[i]]
    }
    return clone
}

function nextTarget() {
    if (currentIndex >= shuffle.length){
        targetName.innerText = "Game completed"
        stopTimer()
        showFinalStats()
        console.log("Game completed")
        return
    }
    const code = shuffle[currentIndex]
    const el = document.getElementById(code)
    target = code
    const displayName = (el && el.dataset.name) ? el.dataset.name : code
    console.log("nextTarget: code=", code, "el=", el, "displayName=", displayName)
    if (targetName) {
        targetName.innerText = displayName
    } else {
        console.error("targetName element not found!")
    }
}

function startGame() {
    stopTimer()
    document.querySelectorAll('svg path').forEach(path => {
        path.classList.remove('correct-answer', 'wrong-answer', 'answered', 'paused')
        path.classList.add('interactive')
        path.style.fill = ""
        path.style.pointerEvents = ''
        path.style.cursor = ''
    });

    shuffle = shuffleArray(countries)
    currentIndex = 0
    score = 0
    if (scoreF) scoreF.innerText = score

    const lapContainer = document.getElementById('laps-time');
    if (lapContainer){
        lapContainer.innerHTML = ""
    }

    const statsElement = document.querySelectorAll('div[style*="background: #e3f2fd"]')
    if (statsElement && statsElement.length) {
        statsElement.forEach(el => el.remove());
    }
    startTimer()
    nextTarget()
}

function onCountryClick(event) {
    if (isTimerPaused) {
        console.log('Game is paused, click ignored')
        return
    }
    const clickedEl = event.target.closest('path') || event.target
    const clickedId = clickedEl.id
    if(!clickedId || !target) return
    
    const targetEl = document.getElementById(target)
    if (targetEl && (targetEl.classList.contains('correct-answer') || targetEl.classList.contains('wrong-answer'))) return

    if(clickedEl.classList.contains('answered')) return
    if(targetEl.classList.contains('answered')) return

    if (targetEl.classList.contains('answered') || 
        targetEl.classList.contains('correct-answer') || 
        targetEl.classList.contains('wrong-answer')) {
        console.log('This country was already answered')
        return
    }

    if (!clickedEl.classList.contains('interactive')) {
        console.log('Clicked element is not interactive')
        return
    }

    let isCorrect = false
    if (clickedId === target) {
        score++
        isCorrect = true
        if (scoreF) scoreF.innerText = score
        targetEl.classList.remove('interactive')
        targetEl.classList.add('correct-answer', 'answered')
    } else {
         targetEl.classList.remove('interactive')
        targetEl.classList.add('wrong-answer', 'answered')
    }

    recordLapsTime(isCorrect)
    currentIndex++
    setTimeout(() => {
        nextTarget()
    }, 800)
}

function setUpMap() {
    document.querySelectorAll('svg path').forEach(path => {
        path.classList.add('interactive')
        path.addEventListener('click', onCountryClick)
    })
}

window.addEventListener('load', () => {
    targetName = document.getElementById('target-name')
    scoreF = document.getElementById('score')
    restartButton = document.getElementById('restart-btn')

    console.log("Load event fired")
    console.log("targetName=", targetName)
    console.log("scoreF=", scoreF)
    console.log("restartButton=", restartButton)

    console.log("DOM elements found:", {
        targetName: !!targetName,
        scoreF: !!scoreF,
        restartButton: !!restartButton
    });

    if (restartButton) {
        restartButton.addEventListener('click', startGame);
    }

    const pauseButton = document.getElementById('pause')
    console.log('pauseButton=', pauseButton)
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            console.log('pause button clicked')
            pauseTimer()
            updatePauseButton()
            updateGameStateOnPause()
        })
    }

    setUpMap()
    startGame()
})