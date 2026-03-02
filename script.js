/* ================= VOICE ================= */

function speak(message) {
  if (!('speechSynthesis' in window)) return;

  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

// Enable audio after first interaction (important for Chrome)
document.addEventListener("click", function enableAudio() {
  window.speechSynthesis.resume();
  document.removeEventListener("click", enableAudio);
});
