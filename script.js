<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Smart Stress Monitor</title>

<script src="https://cdn.tailwindcss.com"></script>

<style>
body {
  margin:0;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);
  color:white;
  text-align:center;
  overflow:hidden;
  transition: background 1s ease;
}

.stressed-bg {
  background: linear-gradient(135deg,#3a0f2d,#1e1e3f,#0f2847);
}

.calm-bg {
  background: linear-gradient(135deg,#0d2137,#0a2e4a,#063b5c);
}

#circle {
  width:200px;
  height:200px;
  border-radius:50%;
  border:3px solid rgba(255,255,255,0.2);
  display:flex;
  align-items:center;
  justify-content:center;
  margin:40px auto;
  cursor:pointer;
  transition: all .3s ease;
}

#stressBarContainer {
  width:250px;
  height:10px;
  background:rgba(255,255,255,0.2);
  margin:20px auto;
  border-radius:20px;
  overflow:hidden;
}

#stressBar {
  height:100%;
  width:0%;
  background: linear-gradient(to right,green,yellow,red);
  transition: width .5s ease;
}
</style>
</head>

<body>

<h1 class="text-3xl mt-8">Smart Stress Monitor</h1>
<p id="instruction">Press and hold the circle</p>

<div id="circle">HOLD</div>

<div id="stressBarContainer">
  <div id="stressBar"></div>
</div>

<h2 id="stressLabel">Stress Level: 0%</h2>

<script>

/* ============================
   VOICE SYSTEM
============================ */

function speak(message) {
  if (!('speechSynthesis' in window)) return;

  const speech = new SpeechSynthesisUtterance(message);
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

// Enable audio after first click
document.addEventListener("click", function enableAudio(){
  window.speechSynthesis.resume();
  document.removeEventListener("click", enableAudio);
});

/* ============================
   STRESS LOGIC
============================ */

let stressLevel = 40;
let holdStart = 0;
let holdTimer = null;
let lastSpokenState = "";

const circle = document.getElementById("circle");
const stressBar = document.getElementById("stressBar");
const stressLabel = document.getElementById("stressLabel");
const instruction = document.getElementById("instruction");

function updateStressDisplay() {

  if (stressLevel < 0) stressLevel = 0;
  if (stressLevel > 100) stressLevel = 100;

  stressBar.style.width = stressLevel + "%";
  stressLabel.innerText = "Stress Level: " + stressLevel + "%";

  let state = "";

  if (stressLevel < 30) {
    document.body.className = "calm-bg";
    state = "low";
  } 
  else if (stressLevel < 60) {
    document.body.className = "";
    state = "medium";
  } 
  else {
    document.body.className = "stressed-bg";
    state = "high";
  }

  handleVoiceFeedback(state);
}

function handleVoiceFeedback(state) {

  if (state === lastSpokenState) return;

  if (state === "high") {
    speak("Your stress is high. Do a breathing exercise to reduce stress.");
  }
  else if (state === "medium") {
    speak("Your stress is moderate. Try releasing your thoughts.");
  }
  else {
    speak("You are calm. Keep maintaining your balance.");
  }

  lastSpokenState = state;
}

/* ============================
   HOLD DETECTION
============================ */

circle.addEventListener("mousedown", startHold);
circle.addEventListener("touchstart", startHold);

circle.addEventListener("mouseup", endHold);
circle.addEventListener("mouseleave", endHold);
circle.addEventListener("touchend", endHold);

function startHold(e){
  e.preventDefault();
  holdStart = Date.now();

  holdTimer = setInterval(()=>{
    circle.style.transform = "scale(0.95)";
  },50);
}

function endHold(){

  clearInterval(holdTimer);
  circle.style.transform = "scale(1)";

  let duration = Date.now() - holdStart;

  if (duration < 500){
    stressLevel += 15;
  }
  else if (duration < 1500){
    stressLevel += 5;
  }
  else{
    stressLevel -= 15;
  }

  updateStressDisplay();
}

/* ============================
   INIT
============================ */

updateStressDisplay();

</script>

</body>
</html>
