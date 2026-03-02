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
  let releasedCount = 0;

  const thoughts = [
    "I'm not good enough",
    "What if I fail?",
    "Everyone is judging me",
    "I can't handle this",
    "I'm falling behind",
    "Nothing will change"
  ];

  function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function updateStress() {
    stressScore = Math.max(0, Math.min(100, stressScore));
    stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

    if (stressScore > 70 && !activityStarted) {
      activityStarted = true;
      speak("You are in high stress. Release your thoughts now.");
      launchActivity();
    }
  }

  function launchActivity() {

    if (cameraInstance) cameraInstance.stop();

    const stream = videoElement.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());

    monitorSection.style.display = "none";
    activitySection.style.display = "block";

    startThoughtRelease();
  }

  function startThoughtRelease() {
    releasedCount = 0;
    document.getElementById("releasedCount").innerText = 0;
    createThoughtCard();
  }

  function createThoughtCard() {

    const container = document.getElementById("thoughtContainer");
    const counterEl = document.getElementById("releasedCount");

    if (thoughts.length === 0) return;

    const text = thoughts.shift();

    const card = document.createElement("div");
    card.className = "thoughtCard";
    card.innerText = text;

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
        counterEl.innerText = releasedCount;

        stressScore -= 15;

        createParticles(container);

        if (releasedCount >= 5) {
          showCompletion();
        } else {
          createThoughtCard();
        }

      } else {
        card.style.transform = "translateX(-50%)";
      }
    };

    container.appendChild(card);
  }

  function createParticles(container) {
    for (let i = 0; i < 12; i++) {

      const p = document.createElement("div");
      p.style.position = "absolute";
      p.style.width = "6px";
      p.style.height = "6px";
      p.style.background = "#22d3ee";
      p.style.borderRadius = "50%";
      p.style.left = "50%";
      p.style.top = "150px";

      const angle = Math.random() * 360;
      const distance = Math.random() * 120;

      p.animate([
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px)`, opacity: 0 }
      ], { duration: 800 });

      container.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  function showCompletion() {
    activitySection.innerHTML = `
      <h1>✨ Well Done</h1>
      <p>You released your thoughts successfully.</p>
    `;
  }

  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      videoElement.srcObject = stream;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
        instruction.innerText = "Camera active";
        startFaceMesh();
      };

    } catch (err) {
      instruction.innerText = "Camera denied";
    }
  }

  function startFaceMesh() {

    const faceMesh = new FaceMesh({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false
    });

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
