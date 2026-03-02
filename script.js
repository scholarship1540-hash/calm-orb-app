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
      speak("You are in high stress. Now click on one activity you want.");
      launchActivity();
    }
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
          stressScore -= 10;
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

    if (currentTarget >= 0)
      dots[currentTarget].classList.remove("active");

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

      stressScore -= 3;

      if (rhythmSpeed > 700) rhythmSpeed -= 50;

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

  /* ================= CAMERA + FACE MESH ================= */

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
        if (now - lastBlinkTime > 600) {
          stressScore += 5;
          lastBlinkTime = now;
        }
      }

      const movement =
        Math.abs(landmarks[1].x - (lastNoseX || landmarks[1].x));

      if (movement > 0.03) {
        stressScore += 3;
      }

      lastNoseX = landmarks[1].x;

      stressScore -= 0.02;

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
