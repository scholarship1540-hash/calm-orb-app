/* ================= HIGH STRESS AUTO TRIGGER ================= */

let voiceUnlocked = false;
let highStressTriggered = false;

// Unlock voice on first click
document.body.addEventListener("click", function () {
  if (!voiceUnlocked) {
    const unlock = new SpeechSynthesisUtterance("System ready");
    speechSynthesis.speak(unlock);
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

// MODIFY your updateStressDisplay function like this:
const originalUpdateStressDisplay = updateStressDisplay;

updateStressDisplay = function () {

  originalUpdateStressDisplay();

  if (stressLevel >= 70 && !highStressTriggered) {

    highStressTriggered = true;

    speak("Your stress level is high. Please start a calming activity.");

    // Random activity
    const activities = ["breathe", "release", "ground"];
    const random = activities[Math.floor(Math.random() * activities.length)];

    setTimeout(() => {
      showScreen(random);
    }, 1500);
  }

  if (stressLevel < 60) {
    highStressTriggered = false;
  }
};
