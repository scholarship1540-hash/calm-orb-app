const videoElement = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");
const orb = document.querySelector(".orb");

let stressScore = 0;
let blinkCounter = 0;
let lastBlinkTime = 0;
let lastNoseX = null;

/* ================= VOICE ================= */

function speak(message) {
  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

document.addEventListener("click", function enableAudio() {
  window.speechSynthesis.resume();
  document.removeEventListener("click", enableAudio);
});

/* ================= BREATHING ================= */

function startBreathing(speed) {
  orb.style.transition = speed + "ms ease-in-out";

  setInterval(() => {
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
    instruction.innerText = "High stress detected. Breathe slowly.";
    speak("High stress detected. Breathe slowly.");
    startBreathing(2000);
  }
  else if (stressScore > 40) {
    document.body.style.backgroundColor = "#1e293b";
    instruction.innerText = "Moderate stress. Regulate breathing.";
    speak("Moderate stress. Regulate breathing.");
    startBreathing(3000);
  }
  else {
    document.body.style.backgroundColor = "#0f172a";
    instruction.innerText = "You appear calm.";
    startBreathing(4000);
  }
}

/* ================= FACE MESH ================= */

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoElement.srcObject = stream;
  });

const faceMesh = new FaceMesh({
  locateFile: (file) =>
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

  /* ----- Blink Detection ----- */
  const leftEyeTop = landmarks[159];
  const leftEyeBottom = landmarks[145];

  const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);

  if (eyeDistance < 0.01) {
    const now = Date.now();
    if (now - lastBlinkTime > 500) {
      blinkCounter++;
      lastBlinkTime = now;
      stressScore += 5; // rapid blinking increases stress
    }
  }

  /* ----- Head Movement Detection ----- */
  const nose = landmarks[1];
  const currentX = nose.x;

  if (lastNoseX !== null) {
    const movement = Math.abs(currentX - lastNoseX);

    if (movement > 0.02) {
      stressScore += 3;
    }
  }

  lastNoseX = currentX;

  /* Natural calm decay */
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
