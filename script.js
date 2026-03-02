let stress = 40;
let voiceUnlocked = false;
let activityRunning = false;

const stressText = document.getElementById("stressValue");
const increaseBtn = document.getElementById("increaseBtn");
const activity = document.getElementById("activity");
const breathText = document.getElementById("breathText");
const video = document.getElementById("camera");

/* ================= CAMERA ================= */

window.onload = function () {

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      alert("Camera error: " + err);
    });

};

/* ================= VOICE UNLOCK ================= */

document.body.addEventListener("click", function () {
  if (!voiceUnlocked) {
    const msg = new SpeechSynthesisUtterance("System ready");
    speechSynthesis.speak(msg);
    voiceUnlocked = true;
  }
}, { once: true });

function speak(text) {
  if (!voiceUnlocked) return;
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}

/* ================= STRESS BUTTON ================= */

increaseBtn.onclick = function () {

  stress += 15;
  if (stress > 100) stress = 100;

  stressText.innerText = stress;

  if (stress >= 70 && !activityRunning) {
    startActivity();
  }
};

/* ================= ACTIVITY ================= */

function startActivity() {

  activityRunning = true;
  activity.style.display = "block";

  speak("Your stress is high. Please breathe slowly.");

  const steps = ["Inhale slowly...", "Hold...", "Exhale slowly..."];
  let i = 0;

  let interval = setInterval(function () {

    breathText.innerText = steps[i];
    i++;

    if (i >= steps.length) {
      clearInterval(interval);

      stress -= 30;
      if (stress < 0) stress = 0;

      stressText.innerText = stress;
      activity.style.display = "none";
      activityRunning = false;
    }

  }, 3000);
}
