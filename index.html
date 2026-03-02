document.addEventListener("DOMContentLoaded", function () {

let stressScore = 20;
let lastBlinkTime = 0;
let lastNoseX = null;
let activityStarted = false;
let cameraInstance;

const video = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");

/* ================= VOICE ================= */

function speak(msg){
  const s = new SpeechSynthesisUtterance(msg);
  s.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(s);
}

/* ================= STRESS UPDATE ================= */

function updateStress(){
  stressScore = Math.max(0, Math.min(100, stressScore));
  stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

  if(stressScore > 70 && !activityStarted){
    activityStarted = true;
    speak("You are in high stress. Now click on one activity you want.");
    document.getElementById("monitor").style.display="none";
    document.getElementById("activity").style.display="block";
  }
}

/* ================= CAMERA ================= */

navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
  video.srcObject = stream;
  video.play();
  startFaceMesh();
})
.catch(()=> instruction.innerText="Camera denied");

/* ================= FACEMESH ================= */

function startFaceMesh(){

  const faceMesh = new FaceMesh({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({maxNumFaces:1});

  faceMesh.onResults(results=>{

    if(activityStarted) return;
    if(!results.multiFaceLandmarks.length) return;

    const landmarks = results.multiFaceLandmarks[0];

    // Blink detection (smooth)
    const eyeDist = Math.abs(landmarks[159].y - landmarks[145].y);

    if(eyeDist < 0.01){
      const now = Date.now();
      if(now - lastBlinkTime > 600){
        stressScore += 5;
        lastBlinkTime = now;
      }
    }

    // Head movement (smooth)
    const movement = Math.abs(
      landmarks[1].x - (lastNoseX || landmarks[1].x)
    );

    if(movement > 0.03){
      stressScore += 3;
    }

    lastNoseX = landmarks[1].x;

    // Calm decay (slow)
    stressScore -= 0.02;

    updateStress();
  });

  cameraInstance = new Camera(video,{
    onFrame: async()=> await faceMesh.send({image:video})
  });

  cameraInstance.start();
}

/* ================= ACTIVITY CONTROL ================= */

function hideAll(){
  document.getElementById("activityMenu").style.display="none";
  document.getElementById("breathingSection").style.display="none";
  document.getElementById("thoughtSection").style.display="none";
  document.getElementById("rhythmSection").style.display="none";
  document.getElementById("knifeSection").style.display="none";
}

/* ================= BREATHING ================= */

window.startBreathing = function(){

  hideAll();
  document.getElementById("breathingSection").style.display="block";

  const circle = document.querySelector(".breathing-circle");
  const text = document.getElementById("breathingText");

  setInterval(()=>{
    circle.style.transform="scale(1.5)";
    text.innerText="Breathe In";
    speak("Breathe in");

    setTimeout(()=>{
      circle.style.transform="scale(1)";
      text.innerText="Breathe Out";
      speak("Breathe out");
    },4000);

  },8000);
};

/* ================= THOUGHT RELEASE ================= */

window.startThoughts = function(){

  hideAll();
  document.getElementById("thoughtSection").style.display="block";

  let count=0;
  const container=document.getElementById("thoughtContainer");
  container.innerHTML="";

  function createCard(){

    if(count>=5){
      container.innerHTML="<h2>✨ Well Done</h2>";
      return;
    }

    const card=document.createElement("div");
    card.className="thoughtCard";
    card.innerText="Let this thought go...";
    container.appendChild(card);

    let startX=0;

    card.onmousedown=e=>{
      startX=e.clientX;
      document.onmousemove=ev=>{
        const move=ev.clientX-startX;
        card.style.transform=
        `translateX(calc(-50% + ${move}px)) rotate(${move/10}deg)`;
      };
    };

    document.onmouseup=e=>{
      document.onmousemove=null;
      if(Math.abs(e.clientX-startX)>100){
        card.remove();
        count++;
        stressScore-=8;
        createCard();
      }else{
        card.style.transform="translateX(-50%)";
      }
    };
  }

  createCard();
};

/* ================= RHYTHM GAME ================= */

window.startRhythm=function(){

  hideAll();
  document.getElementById("rhythmSection").style.display="block";

  let score=0;
  const dots=document.querySelectorAll(".dot");
  let target=0;

  function next(){
    dots.forEach(d=>d.classList.remove("active"));
    target=Math.floor(Math.random()*4);
    dots[target].classList.add("active");
  }

  dots.forEach(dot=>{
    dot.onclick=function(){
      if(parseInt(dot.dataset.id)===target){
        score++;
        stressScore-=3;

        if(score>=15){
          document.getElementById("rhythmSection").innerHTML="<h2>✨ Grounded</h2>";
          return;
        }
        next();
      }
    };
  });

  next();
};

/* ================= KNIFE HIT (FIXED) ================= */

window.startKnife=function(){

  hideAll();
  document.getElementById("knifeSection").style.display="block";

  let knives=10;
  let angles=[];
  const wheel=document.getElementById("wheel");

  wheel.innerHTML="";
  document.getElementById("knifeCount").innerText=knives;

  function throwKnife(){

    if(knives<=0) return;

    const angle=Math.floor(Math.random()*360);

    for(let a of angles){
      if(Math.abs(a-angle)<20){
        document.getElementById("knifeSection").innerHTML="<h2>❌ Game Over</h2>";
        wheel.removeEventListener("click",throwKnife);
        return;
      }
    }

    angles.push(angle);

    const knife=document.createElement("div");
    knife.className="knife";
    knife.style.transform=`rotate(${angle}deg)`;
    wheel.appendChild(knife);

    knives--;
    document.getElementById("knifeCount").innerText=knives;

    stressScore-=4;

    if(knives===0){
      document.getElementById("knifeSection").innerHTML="<h2>🏆 You Win!</h2>";
      wheel.removeEventListener("click",throwKnife);
    }
  }

  wheel.addEventListener("click",throwKnife);
};

});
