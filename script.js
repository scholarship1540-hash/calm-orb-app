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

function speak(text) const video = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const message = document.getElementById("message");
const orb = document.querySelector(".orb");

let stress = 0;
let lastState = "";
let lastNoseX = null;

/* VOICE */
function speak(text){
  if(!('speechSynthesis' in window)) return;
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

document.addEventListener("click", function enable(){
  window.speechSynthesis.resume();
  document.removeEventListener("click", enable);
});

/* UPDATE UI */
function updateUI(){

  if(stress < 0) stress = 0;
  if(stress > 100) stress = 100;

  stressText.innerText = "Stress Level: " + Math.round(stress) + "%";

  let state;

  if(stress > 70){
    state = "high";
    document.body.style.background="#2b0000";
    message.innerText="High stress detected";
    orb.style.transform="scale(1.3)";
  }
  else if(stress > 40){
    state = "medium";
    document.body.style.background="#1e293b";
    message.innerText="Moderate stress";
    orb.style.transform="scale(1.1)";
  }
  else{
    state = "low";
    document.body.style.background="#0f172a";
    message.innerText="Calm";
    orb.style.transform="scale(1)";
  }

  if(state !== lastState){
    if(state==="high"){
      speak("Your stress is high. Do a breathing exercise now.");
    }
    if(state==="medium"){
      speak("Your stress is moderate. Slow your breathing.");
    }
    if(state==="low"){
      speak("You are calm.");
    }
    lastState = state;
  }
}

/* CAMERA */
async function startCamera(){

  try{
    const stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
  }catch(e){
    message.innerText="Camera permission denied";
    return;
  }

  const faceMesh = new FaceMesh({
    locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces:1,
    refineLandmarks:true,
    minDetectionConfidence:0.6,
    minTrackingConfidence:0.6
  });

  faceMesh.onResults(results => {

    if(!results.multiFaceLandmarks.length) return;

    const landmarks = results.multiFaceLandmarks[0];
    const nose = landmarks[1];
    const currentX = nose.x;

    if(lastNoseX !== null){
      const movement = Math.abs(currentX - lastNoseX);
      if(movement > 0.02){
        stress += 5;
      }
    }

    lastNoseX = currentX;

    stress -= 0.5;
    updateUI();
  });

  const camera = new Camera(video,{
    onFrame: async ()=>{
      await faceMesh.send({image:video});
    },
    width:640,
    height:480
  });

  camera.start();
}

updateUI();
startCamera();{
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

