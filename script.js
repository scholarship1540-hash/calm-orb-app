const videoElement = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");
const orb = document.querySelector(".orb");

let stressScore = 20;
let lastBlinkTime = 0;
let lastNoseX = null;

let breathingInterval;
let currentBreathingSpeed = null;
let lastSpokenState = "";

/* ================= VOICE ================= */

function speak(message) {
  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

/* ================= BREATHING ================= */

function startBreathing(speed) {
  if (currentBreathingSpeed === speed) return;

  currentBreathingSpeed = speed;
  clearInterval(breathingInterval);

  orb.style.transition = speed + "ms ease-in-out";

  breathingInterval = setInterval(() => {
    orb.style.transform = "scale(1.5)";
    setTimeout(() => {
      orb.style.transform = "scale(1)";
    }, speed / 2);
  }, speed);
}

/* ================= STRESS UPDATE ================= */

function updateStress() {

  if (stressScore > 100) stressScore = 100;
  if (stressScore < 0) stressScore = 0;

  stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

  if (stressScore > 70) {
    document.body.style.backgroundColor = "#2b0000";
    instruction.innerText = "High stress detected.";
    startBreathing(2000);

    if (lastSpokenState !== "high") {
      speak("You are in high stress. Please do activity.");
      lastSpokenState = "high";

      launchActivity();
    }
  }
  else if (stressScore > 40) {
    document.body.style.backgroundColor = "#1e293b";
    instruction.innerText = "Moderate stress.";
    startBreathing(3000);

    if (lastSpokenState !== "moderate") {
      speak("Moderate stress detected. Try to relax.");
      lastSpokenState = "moderate";
    }
  }
  else {
    document.body.style.backgroundColor = "#0f172a";
    instruction.innerText = "You appear calm.";
    startBreathing(4000);

    if (lastSpokenState !== "calm") {
      speak("You appear calm.");
      lastSpokenState = "calm";
    }
  }
}

/* ================= LAUNCH ACTIVITY ================= */

function launchActivity() {
  document.getElementById("monitor").style.display = "none";
  document.getElementById("activityContainer").style.display = "block";
}

/* ================= CAMERA ================= */

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoElement.srcObject = stream;
  })
  .catch(err => {
    instruction.innerText = "Camera access denied.";
  });

/* ================= FACE MESH ================= */

const faceMesh = new FaceMesh({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

faceMesh.onResults(results => {

  if (!results.multiFaceLandmarks.length) return;

  const landmarks = results.multiFaceLandmarks[0];

  /* Blink detection */
  const leftEyeTop = landmarks[159];
  const leftEyeBottom = landmarks[145];
  const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);

  if (eyeDistance < 0.01) {
    const now = Date.now();
    if (now - lastBlinkTime > 400) {
      stressScore += 5;
      lastBlinkTime = now;
    }
  }

  /* Head shake detection */
  const nose = landmarks[1];
  const currentX = nose.x;

  if (lastNoseX !== null) {
    const movement = Math.abs(currentX - lastNoseX);
    if (movement > 0.02) {
      stressScore += 3;
    }
  }

  lastNoseX = currentX;

  /* Calm decay */
  stressScore -= 0.5;

  updateStress();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();
