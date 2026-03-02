const orb = document.querySelector(".orb");
const text = document.getElementById("statusText");
const panicBtn = document.getElementById("panicBtn");
const videoElement = document.getElementById("camera");

let tapTimes = [];
let stressLevel = "low";
let breathingInterval = null;
let lastFaceX = null;

/* ================= VOICE ================= */

function speak(message) {
  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

/* ================= BREATHING ================= */

function startBreathing(speed) {
  clearInterval(breathingInterval);

  breathingInterval = setInterval(() => {
    orb.style.transform = "scale(1.5)";

    if (navigator.vibrate) {
      navigator.vibrate([200, 200, 200]);
    }

    setTimeout(() => {
      orb.style.transform = "scale(1)";
    }, speed / 2);

  }, speed);
}

/* ================= TAP DETECTION ================= */

document.body.addEventListener("click", (event) => {
  if (stressLevel === "panic") return;

  const now = Date.now();
  tapTimes.push(now);

  if (tapTimes.length > 5) tapTimes.shift();

  if (tapTimes.length < 2) return;

  const interval =
    tapTimes[tapTimes.length - 1] -
    tapTimes[tapTimes.length - 2];

  if (interval < 600) stressLevel = "high";
  else if (interval < 1200) stressLevel = "medium";
  else stressLevel = "low";

  applyIntervention();
});

function applyIntervention() {
  clearInterval(breathingInterval);

  if (stressLevel === "high") {
    document.body.style.backgroundColor = "#2b0000";
    text.innerText = "High stress detected.";
    speak("High stress detected. You are safe.");
    startBreathing(2000);
  }
  else if (stressLevel === "medium") {
    document.body.style.backgroundColor = "#1e293b";
    text.innerText = "Let’s regulate together.";
    speak("Let us regulate together.");
    startBreathing(3000);
  }
  else {
    document.body.style.backgroundColor = "#0f172a";
    text.innerText = "Nice and steady.";
    speak("Nice and steady.");
    startBreathing(4000);
  }
}

/* ================= PANIC MODE ================= */

panicBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  stressLevel = "panic";

  document.body.style.backgroundColor = "#000000";
  text.innerText = "Panic reset activated.";
  speak("Panic reset activated. You are safe.");

  startBreathing(5000);
});

/* ================= CAMERA ================= */

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoElement.srcObject = stream;
  })
  .catch(err => {
    console.log("Camera denied:", err);
  });

const faceDetection = new FaceDetection({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});

faceDetection.setOptions({
  model: "short",
  minDetectionConfidence: 0.6
});

faceDetection.onResults(results => {

  if (results.detections.length > 0 && stressLevel !== "panic") {

    const box = results.detections[0].boundingBox;
    const currentX = box.xCenter;

    if (lastFaceX !== null) {
      let movement = Math.abs(currentX - lastFaceX);

      if (movement > 0.05) {
        stressLevel = "high";
        document.body.style.backgroundColor = "#2b0000";
        text.innerText = "Agitated head movement detected.";
        speak("Agitated movement detected.");
        startBreathing(2000);
      } else {
        document.body.style.backgroundColor = "#111827";
        text.innerText = "Face detected. Staying calm.";
      }
    }

    lastFaceX = currentX;
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceDetection.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();

/* ================= ACCELEROMETER ================= */

let shakeThreshold = 15;
let lastX = null;
let lastY = null;
let lastZ = null;

window.addEventListener("devicemotion", function(event) {

  let acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  let x = acceleration.x;
  let y = acceleration.y;
  let z = acceleration.z;

  if (lastX !== null) {
    let delta = Math.abs(x + y + z - lastX - lastY - lastZ);

    if (delta > shakeThreshold && stressLevel !== "panic") {
      stressLevel = "high";
      document.body.style.backgroundColor = "#2b0000";
      text.innerText = "Agitated movement detected.";
      speak("Agitated movement detected.");
      startBreathing(2000);
    }
  }

  lastX = x;
  lastY = y;
  lastZ = z;
});
