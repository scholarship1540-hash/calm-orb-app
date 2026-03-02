const videoElement = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");
const orb = document.querySelector(".orb");

let stressScore = 0;
let lastNoseX = null;
let breathingInterval = null;
let lastStressState = "";

/* ================= VOICE ================= */

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

// Unlock audio after first click
document.addEventListener("click", function enableAudio() {
  window.speechSynthesis.resume();
  document.removeEventListener("click", enableAudio);
});

/* ================= BREATHING ================= */

function startBreathing(speed) {
  clearInterval(breathingInterval);

  breathingInterval = setInterval(() => {
    orb.style.transform = "scale(1.5)";
    setTimeout(() => {
      orb.style.transform = "scale(1)";
    }, speed / 2);
  }, speed);
}

/* ================= STRESS UPDATE ================= */

function updateStress() {

  if (stressScore < 0) stressScore = 0;
  if (stressScore > 100) stressScore = 100;

  stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

  let currentState = "";

  if (stressScore > 70) {
    currentState = "high";
    document.body.style.backgroundColor = "#2b0000";
    instruction.innerText = "High stress detected.";
    startBreathing(2000);
  }
  else if (stressScore > 40) {
    currentState = "medium";
    document.body.style.backgroundColor = "#1e293b";
    instruction.innerText = "Moderate stress.";
    startBreathing(3000);
  }
  else {
    currentState = "low";
    document.body.style.backgroundColor = "#0f172a";
    instruction.innerText = "Low stress. You are calm.";
    startBreathing(4000);
  }

  // Speak only when stress level changes
  if (currentState !== lastStressState) {

    if (currentState === "high") {
      speak("You are in high stress. Keep breathing slowly.");
    }
    else if (currentState === "medium") {
      speak("Moderate stress detected. Regulate your breathing.");
    }
    else {
      speak("You are calm.");
    }

    lastStressState = currentState;
  }
}

/* ================= CAMERA INITIALIZATION ================= */

async function initCamera() {

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  } catch (err) {
    instruction.innerText = "Camera access denied.";
    return;
  }

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
    const nose = landmarks[1];
    const currentX = nose.x;

    if (lastNoseX !== null) {
      const movement = Math.abs(currentX - lastNoseX);

      if (movement > 0.02) {
        stressScore += 4;
      }
    }

    lastNoseX = currentX;

    // natural calming decay
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
}

/* ================= START SYSTEM ================= */

startBreathing(4000);
updateStress();
initCamera();
