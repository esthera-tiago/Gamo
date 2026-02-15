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

    if(isTimerPaused){
        svg.innerHTML = '<path d="M240-240v-480h80v480h-80Zm160 0 400-240-400-240v480Zm80-141v-198l165 99-165 99Zm0-99Z"/>';
        pauseButton.title = "Resume Timer"
    }else{
        svg.innerHTML = '<path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/>';
        pauseButton.title = "Pause Timer"
    }
}

function updateGameStateOnPause(){
    const svgPaths = document.querySelectorAll('svg path')
    if(isTimerPaused){
        svgPaths.forEach(path => {
            path.classList.add('paused')
            path.style.opacity = "0.7"
        })
        showPauseMessage()
    }else{
        svgPaths.forEach(path =>{
            path.classList.remove('paused')
            path.style.opacity = "1"
        })
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
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
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

function showFinalStats(){
    let totalLapTime = 0;
    let correctCount = 0;
    laps.forEach(l => {
        totalLapTime += l.duration;
        if (l.correct) correctCount++;
    });

    const averageTime = laps.length > 0 ? totalLapTime / laps.length : 0;
    const accuracy = laps.length > 0 ? (correctCount / laps.length * 100).toFixed(1) : 0;
    
    const statsHTML = `
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 10px;">
            <h3>🎮 Game Statistics</h3>
            <p>⏱️ Total Time: ${formatTime(totalElapsedTime)}</p>
            <p>📊 Score: ${score}/${countries.length}</p>
            <p>🎯 Accuracy: ${accuracy}%</p>
            <p>⏱️ Average per country: ${formatTime(averageTime)}</p>
            <p>🏆 Best lap: ${formatTime(laps.length > 0 ? Math.min(...laps.map(l => l.duration)) : 0)}</p>
        </div>
    `;
    
    const timerContainer = document.getElementById('timer-container') || document.getElementById('timer') || document.getElementById('score-container');
    if (timerContainer) {
        timerContainer.insertAdjacentHTML('beforeend', statsHTML);
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