const videoElement = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");
const orb = document.querySelector(".orb");

let stressScore = 0;
let lastNoseX = null;
let breathingInterval = null;

/* ================= VOICE ================= */

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

// unlock voice after first click
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

  if (stressScore > 70) {
    document.body.style.backgroundColor = "#2b0000";
    instruction.innerText = "High stress detected.";
    speak("You are in high stress. Breathe slowly.");
    startBreathing(2000);
  }
  else if (stressScore > 40) {
    document.body.style.backgroundColor = "#1e293b";
    instruction.innerText = "Moderate stress.";
    speak("Moderate stress detected. Regulate your breathing.");
    startBreathing(3000);
  }
  else {
    document.body.style.backgroundColor = "#0f172a";
    instruction.innerText = "Low stress. You are calm.";
    speak("You are calm.");
    startBreathing(4000);
  }
}

/* ================= CAMERA SAFE INIT ================= */

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
        stressScore += 3;
      }
    }

    lastNoseX = currentX;

    // natural calming
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

/* ================= START ================= */

startBreathing(4000);   // default calm breathing
updateStress();         // initialize display
initCamera();           // start camera safely
