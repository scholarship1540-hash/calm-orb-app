document.addEventListener("DOMContentLoaded", function () {

const videoElement = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");
let stressScore = 20;
let lastBlinkTime = 0;
let lastNoseX = null;
let lastSpokenState = "";
let activityStarted = false;

/* ================= VOICE ================= */

function speak(message) {
  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

/* ================= UPDATE STRESS ================= */

function updateStress() {
  stressScore = Math.max(0, Math.min(100, stressScore));
  stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

  if (stressScore > 70 && !activityStarted) {
    if (lastSpokenState !== "high") {
      speak("You are in high stress. Please do activity.");
      lastSpokenState = "high";
    }
    launchActivity();
  }
}

/* ================= ACTIVITY ================= */

function launchActivity() {
  activityStarted = true;

  document.getElementById("monitor").style.display = "none";
  document.getElementById("activity").style.display = "block";

  startBreathingActivity();
}

function startBreathingActivity() {
  const circle = document.querySelector(".breathing-circle");
  const text = document.getElementById("activityText");

  setInterval(() => {
    circle.style.transform = "scale(1.5)";
    text.innerText = "Breathe In...";
    speak("Breathe in");

    setTimeout(() => {
      circle.style.transform = "scale(1)";
      text.innerText = "Breathe Out...";
      speak("Breathe out");
    }, 4000);
  }, 8000);
}

/* ================= FACEMESH + CAMERA ================= */

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

  const nose = landmarks[1];
  const currentX = nose.x;

  if (lastNoseX !== null) {
    const movement = Math.abs(currentX - lastNoseX);
    if (movement > 0.02) stressScore += 3;
  }

  lastNoseX = currentX;

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

});
