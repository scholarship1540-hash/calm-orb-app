const orb = document.querySelector(".orb");
const text = document.querySelector("p");

let tapTimes = [];
let stressLevel = "low";
let breathingInterval;

document.body.addEventListener("click", () => {
  const now = Date.now();
  tapTimes.push(now);

  if (tapTimes.length > 5) {
    tapTimes.shift();
  }

  detectStress();
});

function detectStress() {
  if (tapTimes.length < 2) return;

  const interval = tapTimes[tapTimes.length - 1] - tapTimes[tapTimes.length - 2];

  if (interval < 300) {
    stressLevel = "high";
  } else if (interval < 800) {
    stressLevel = "medium";
  } else {
    stressLevel = "low";
  }

  applyIntervention();
}

function applyIntervention() {
  clearInterval(breathingInterval);

  if (stressLevel === "high") {
    document.body.style.background = "#2b0000";
    text.innerText = "High stress detected. Slow down with me.";
    startBreathing(2000);
  } 
  else if (stressLevel === "medium") {
    document.body.style.background = "#1e293b";
    text.innerText = "Let's regulate together.";
    startBreathing(3000);
  } 
  else {
    document.body.style.background = "#0f172a";
    text.innerText = "Nice and steady.";
    startBreathing(4000);
  }
}

function startBreathing(speed) {
  breathingInterval = setInterval(() => {
    orb.style.transform = "scale(1.5)";
    setTimeout(() => {
      orb.style.transform = "scale(1)";
    }, speed / 2);
  }, speed);
}
