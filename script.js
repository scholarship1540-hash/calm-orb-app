const orb = document.querySelector(".orb");
const text = document.querySelector("p");

let tapTimes = [];
let breathingSpeed = 4000; // default inhale speed

document.body.addEventListener("click", () => {
  const now = Date.now();
  tapTimes.push(now);

  // Keep only last 5 taps
  if (tapTimes.length > 5) {
    tapTimes.shift();
  }

  detectStress();
});

function detectStress() {
  if (tapTimes.length < 2) return;

  const interval = tapTimes[tapTimes.length - 1] - tapTimes[tapTimes.length - 2];

  if (interval < 300) {
    breathingSpeed = 2000;
    text.innerText = "High stress detected. Slow down with me.";
  } else if (interval < 800) {
    breathingSpeed = 3000;
    text.innerText = "Let’s regulate together.";
  } else {
    breathingSpeed = 4000;
    text.innerText = "Nice and steady.";
  }

  startBreathing();
}

function startBreathing() {
  orb.style.transform = "scale(1.5)";
  setTimeout(() => {
    orb.style.transform = "scale(1)";
  }, breathingSpeed);
}
