<script>

/* ==================== GLOBAL STATE ==================== */

let stressLevel = 40;
let currentScreen = "home";

/* ==================== VOICE SYSTEM ==================== */

let voiceEnabled = false;

document.body.addEventListener("click", () => {
  if (!voiceEnabled) {
    const unlock = new SpeechSynthesisUtterance("Voice activated");
    window.speechSynthesis.speak(unlock);
    voiceEnabled = true;
  }
}, { once: true });

function speak(message) {
  if (!voiceEnabled) return;

  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;
  window.speechSynthesis.speak(speech);
}

/* ==================== NAVIGATION ==================== */

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById("screen-" + screenId).classList.remove("hidden");
  currentScreen = screenId;
}

/* ==================== STRESS DISPLAY ==================== */

const stressBar = document.getElementById("stress-bar");
const stressLabel = document.getElementById("stress-label");
const stressIndicator = document.getElementById("stress-indicator");
const app = document.getElementById("app");

function updateStressDisplay() {

  stressIndicator.style.opacity = "1";
  stressBar.style.width = stressLevel + "%";

  if (stressLevel < 30) {
    stressLabel.textContent = "Calm";
    app.className = "calm-bg h-full w-full relative overflow-auto";
  }
  else if (stressLevel < 60) {
    stressLabel.textContent = "Moderate";
    app.className = "gradient-bg h-full w-full relative overflow-auto";
  }
  else {
    stressLabel.textContent = "High";
    app.className = "stressed-bg h-full w-full relative overflow-auto";
  }

  /* 🔥 HIGH STRESS AUTO TRIGGER */
  if (stressLevel >= 70) {

    speak("Your stress level is high. Let's do a grounding activity.");

    showScreen("ground");

    setTimeout(() => {
      startRhythmGame();
    }, 1000);
  }
}

/* ==================== HOLD STRESS DETECTION ==================== */

const detectionCircle = document.getElementById("detection-circle");
let holdStart = 0;

detectionCircle.addEventListener("mousedown", startHold);
detectionCircle.addEventListener("mouseup", endHold);
detectionCircle.addEventListener("touchstart", startHold);
detectionCircle.addEventListener("touchend", endHold);

function startHold(e) {
  e.preventDefault();
  holdStart = Date.now();
}

function endHold() {

  let duration = Date.now() - holdStart;

  if (duration < 500) {
    stressLevel = Math.min(stressLevel + 15, 100);
  }
  else if (duration < 1500) {
    stressLevel = Math.min(stressLevel + 5, 100);
  }
  else {
    stressLevel = Math.max(stressLevel - 10, 0);
  }

  updateStressDisplay();
}

/* ==================== RHYTHM GAME ==================== */

let rhythmActive = false;
let rhythmScore = 0;
let currentTarget = -1;
let rhythmInterval = null;

function startRhythmGame() {

  rhythmActive = true;
  rhythmScore = 0;

  document.getElementById("rhythm-score").textContent = "0";
  activateNextTarget();
}

function activateNextTarget() {

  if (!rhythmActive) return;

  if (currentTarget >= 0) {
    document.getElementById("rhythm-" + currentTarget).classList.remove("active");
  }

  currentTarget = Math.floor(Math.random() * 6);

  document.getElementById("rhythm-" + currentTarget).classList.add("active");

  rhythmInterval = setTimeout(() => {
    activateNextTarget();
  }, 1500);
}

function tapRhythm(index) {

  if (!rhythmActive) return;

  if (index === currentTarget) {

    rhythmScore++;
    document.getElementById("rhythm-score").textContent = rhythmScore;

    stressLevel = Math.max(stressLevel - 3, 0);
    updateStressDisplay();

    clearTimeout(rhythmInterval);
    activateNextTarget();
  }
}

/* ==================== INIT ==================== */

updateStressDisplay();

</script>
