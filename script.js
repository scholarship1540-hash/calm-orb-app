const orb = document.querySelector(".orb");
const text = document.querySelector("p");

let tapTimes = [];
let stressLevel = "low";
let breathingInterval = null;

// Detect taps anywhere on screen
document.body.addEventListener("click", () => {
  const now = Date.now();
  tapTimes.push(now);

  // Keep last 5 taps only
  if (tapTimes.length > 5) {
    tapTimes.shift();
  }

  detectStress();
});

function detectStress() {
  if (tapTimes.length < 2) return;

  const interval =
    tapTimes[tapTimes.length - 1] -
    tapTimes[tapTimes.length - 2];

  // Easier realistic thresholds
  if (interval < 600) {
    stressLevel = "high";
  } else if (interval < 1200) {
    stressLevel = "medium";
  } else {
    stressLevel = "low";
  }

  applyIntervention();
}

function applyIntervention() {
  clearInterval(breathingInterval);

  if (stressLevel === "high") {
    document.body.style.backgroundColor = "#2b0000";
    text.innerText = "High stress detected. Slow down with me.";
    startBreathing(2000);
  } 
  else if (stressLevel === "medium") {
    document.body.style.backgroundColor = "#1e293b";
    text.innerText = "Let’s regulate together.";
    startBreathing(3000);
  } 
  else {
    document.body.style.backgroundColor = "#0f172a";
    text.innerText = "Nice and steady.";
    startBreathing(4000);
  }
}

function startBreathing(speed) {
  breathingInterval = setInterval(() => {
    orb.style.transform = "scale(1.5)";

    if (navigator.vibrate) {
      navigator.vibrate(50); // vibration for mobile
    }

    setTimeout(() => {
      orb.style.transform = "scale(1)";
    }, speed / 2);

  }, speed);
}
