document.addEventListener("DOMContentLoaded", function () {

  const videoElement = document.getElementById("camera");
  const stressText = document.getElementById("stressValue");
  const instruction = document.getElementById("instruction");

  const monitorSection = document.getElementById("monitor");
  const activitySection = document.getElementById("activity");

  let stressScore = 20;
  let lastBlinkTime = 0;
  let lastNoseX = null;
  let activityStarted = false;
  let cameraInstance = null;

  /* ================= VOICE ================= */

  function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  /* ================= STRESS ================= */

  function updateStress() {
    stressScore = Math.max(0, Math.min(100, stressScore));
    stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

    if (stressScore > 70 && !activityStarted) {
      activityStarted = true;
      speak("You are in high stress. Now click on one activity you want.");
      launchActivity();
    }document.addEventListener("DOMContentLoaded", function () {

let stressScore = 20;
let lastBlinkTime = 0;
let lastNoseX = null;
let activityStarted = false;
let cameraInstance;

const video = document.getElementById("camera");
const stressText = document.getElementById("stressValue");
const instruction = document.getElementById("instruction");

function speak(msg){
  const s = new SpeechSynthesisUtterance(msg);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(s);
}

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

/* CAMERA */
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
  video.srcObject = stream;
  video.play();
  startFaceMesh();
})
.catch(()=> instruction.innerText="Camera denied");

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

    const eyeDist = Math.abs(landmarks[159].y - landmarks[145].y);

    if(eyeDist < 0.01){
      const now = Date.now();
      if(now - lastBlinkTime > 600){
        stressScore += 5;
        lastBlinkTime = now;
      }
    }

    const movement = Math.abs(
      landmarks[1].x - (lastNoseX || landmarks[1].x)
    );

    if(movement > 0.03) stressScore += 3;

    lastNoseX = landmarks[1].x;

    stressScore -= 0.02;

    updateStress();
  });

  cameraInstance = new Camera(video,{
    onFrame: async()=> await faceMesh.send({image:video})
  });

  cameraInstance.start();
}

/* BREATHING */
window.startBreathing=function(){
  hideAll();
  document.getElementById("breathingSection").style.display="block";

  const circle=document.querySelector(".breathing-circle");
  const text=document.getElementById("breathingText");

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

/* THOUGHTS */
window.startThoughts=function(){
  hideAll();
  document.getElementById("thoughtSection").style.display="block";

  let count=0;
  const container=document.getElementById("thoughtContainer");
  container.innerHTML="";

  function create(){
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
        create();
      }else{
        card.style.transform="translateX(-50%)";
      }
    };
  }
  create();
};

/* RHYTHM */
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

/* KNIFE GAME */
window.startKnife=function(){
  hideAll();
  document.getElementById("knifeSection").style.display="block";

  let knives=10;
  let angles=[];
  const wheel=document.getElementById("wheel");
  wheel.innerHTML="";
  document.getElementById("knifeCount").innerText=knives;

  document.onclick=function(){
    if(knives<=0) return;

    const angle=Math.floor(Math.random()*360);

    for(let a of angles){
      if(Math.abs(a-angle)<15){
        document.getElementById("knifeSection").innerHTML="<h2>Game Over</h2>";
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
      document.getElementById("knifeSection").innerHTML="<h2>🏆 You Win</h2>";
    }
  };
};

function hideAll(){
  document.getElementById("activityMenu").style.display="none";
  document.getElementById("breathingSection").style.display="none";
  document.getElementById("thoughtSection").style.display="none";
  document.getElementById("rhythmSection").style.display="none";
  document.getElementById("knifeSection").style.display="none";
}

});
  }

  function launchActivity() {
    if (cameraInstance) cameraInstance.stop();
    const stream = videoElement.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());

    monitorSection.style.display = "none";
    activitySection.style.display = "block";
  }

  /* ================= BREATHING ================= */

  window.startBreathing = function () {
    document.getElementById("activityMenu").style.display = "none";
    document.getElementById("breathingSection").style.display = "block";

    const circle = document.querySelector(".breathing-circle");
    const text = document.getElementById("breathingText");

    setInterval(() => {
      circle.style.transform = "scale(1.5)";
      text.innerText = "Breathe In...";
      speak("Breathe in");

      setTimeout(() => {
        circle.style.transform = "scale(1)";
        text.innerText = "Breathe Out...";
        speak("Breathe out");
      }, 4000);
    }, 8000);
  };

  /* ================= THOUGHTS ================= */

  window.startThoughts = function () {
    document.getElementById("activityMenu").style.display = "none";
    document.getElementById("thoughtSection").style.display = "block";

    let releasedCount = 0;
    document.getElementById("releasedCount").innerText = 0;

    function createCard() {
      if (releasedCount >= 5) {
        document.getElementById("thoughtSection").innerHTML =
          "<h1>✨ Well Done</h1><p>You released your thoughts.</p>";
        return;
      }

      const container = document.getElementById("thoughtContainer");
      const card = document.createElement("div");
      card.className = "thoughtCard";
      card.innerText = "Let this thought go...";

      let startX = 0;

      card.onmousedown = (e) => {
        startX = e.clientX;
        document.onmousemove = (ev) => {
          const moveX = ev.clientX - startX;
          card.style.transform =
            `translateX(calc(-50% + ${moveX}px)) rotate(${moveX/10}deg)`;
        };
      };

      document.onmouseup = (e) => {
        document.onmousemove = null;
        const diff = e.clientX - startX;

        if (Math.abs(diff) > 100) {
          card.remove();
          releasedCount++;
          document.getElementById("releasedCount").innerText = releasedCount;
          stressScore -= 15;
          createCard();
        } else {
          card.style.transform = "translateX(-50%)";
        }
      };

      container.appendChild(card);
    }

    createCard();
  };

  /* ================= RHYTHM ================= */

  let rhythmScore = 0;
  let rhythmStreak = 0;
  let rhythmSpeed = 1500;
  let currentTarget = -1;
  let rhythmTimer = null;

  window.startRhythm = function () {

    document.getElementById("activityMenu").style.display = "none";
    document.getElementById("rhythmSection").style.display = "block";

    rhythmScore = 0;
    rhythmStreak = 0;
    rhythmSpeed = 1500;

    document.getElementById("rhythmScore").innerText = 0;
    document.getElementById("rhythmStreak").innerText = 0;

    nextRound();
  };

  function nextRound() {

    const dots = document.querySelectorAll(".dot");

    if (currentTarget >= 0) {
      dots[currentTarget].classList.remove("active");
    }

    currentTarget = Math.floor(Math.random() * dots.length);
    dots[currentTarget].classList.add("active");

    rhythmTimer = setTimeout(() => {
      rhythmStreak = 0;
      document.getElementById("rhythmStreak").innerText = rhythmStreak;
      nextRound();
    }, rhythmSpeed);
  }

  document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("dot")) return;

    const clicked = parseInt(e.target.dataset.id);

    if (clicked === currentTarget) {

      clearTimeout(rhythmTimer);

      rhythmScore++;
      rhythmStreak++;

      document.getElementById("rhythmScore").innerText = rhythmScore;
      document.getElementById("rhythmStreak").innerText = rhythmStreak;

      stressScore -= 5;

      if (rhythmSpeed > 600) rhythmSpeed -= 50;

      if (rhythmScore >= 15) {
        document.getElementById("rhythmSection").innerHTML =
          "<h1>✨ Grounded!</h1><p>You focused successfully.</p>";
        return;
      }

      nextRound();

    } else {
      rhythmStreak = 0;
      document.getElementById("rhythmStreak").innerText = rhythmStreak;
    }
  });

  /* ================= CAMERA ================= */

  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
        instruction.innerText = "Camera active";
        startFaceMesh();
      };
    } catch {
      instruction.innerText = "Camera denied";
    }
  }

  function startFaceMesh() {
    const faceMesh = new FaceMesh({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({ maxNumFaces: 1 });

    faceMesh.onResults(results => {
      if (activityStarted) return;
      if (!results.multiFaceLandmarks.length) return;

      const landmarks = results.multiFaceLandmarks[0];

      const eyeDistance =
        Math.abs(landmarks[159].y - landmarks[145].y);

      if (eyeDistance < 0.01) {
        const now = Date.now();
        if (now - lastBlinkTime > 400) {
          stressScore += 15;
          lastBlinkTime = now;
        }
      }

      const movement =
        Math.abs(landmarks[1].x - (lastNoseX || landmarks[1].x));

      if (movement > 0.02) stressScore += 10;

      lastNoseX = landmarks[1].x;

      stressScore -= 0.05;

      updateStress();
    });

    cameraInstance = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      }
    });

    cameraInstance.start();
  }

  initCamera();
});

