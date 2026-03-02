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

  /* ================= UPDATE STRESS ================= */

  function updateStress() {
    if (stressScore > 100) stressScore = 100;
    if (stressScore < 0) stressScore = 0;

    stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";

    // 🔥 Trigger activity when stress > 40 (change to 70 if you want)
    if (stressScore > 70 && !activityStarted) {
      activityStarted = true;
      speak("You are in high stress. Do activity now.");
      launchActivity();
    }
  }

  /* ================= LAUNCH ACTIVITY ================= */

  function launchActivity() {

    // Stop MediaPipe camera loop
    if (cameraInstance) {
      cameraInstance.stop();
    }

    // Stop video stream
    const stream = videoElement.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Switch UI
    monitorSection.style.display = "none";
    activitySection.style.display = "block";

    startBreathing();
  }

  /* ================= BREATHING ACTIVITY ================= */

  function startBreathing() {

    const circle = document.querySelector(".breathing-circle");
    const text = document.getElementById("activityText");

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
  }

  /* ================= CAMERA ================= */

  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      videoElement.srcObject = stream;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
        instruction.innerText = "Camera active";
        startFaceMesh();
      };

    } catch (error) {
      instruction.innerText = "Camera denied";
      console.error(error);
    }
  }

  /* ================= FACEMESH ================= */

  function startFaceMesh() {

    const faceMesh = new FaceMesh({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(results => {

      if (activityStarted) return;

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

      const landmarks = results.multiFaceLandmarks[0];

      // Blink detection
      const leftEyeTop = landmarks[159];
      const leftEyeBottom = landmarks[145];
      const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);

      if (eyeDistance < 0.01) {
        const now = Date.now();
        if (now - lastBlinkTime > 400) {
          stressScore += 15;
          lastBlinkTime = now;
        }
      }

      // Head shake detection
      const nose = landmarks[1];
      const currentX = nose.x;

      if (lastNoseX !== null) {
        const movement = Math.abs(currentX - lastNoseX);
        if (movement > 0.02) {
          stressScore += 10;
        }
      }

      lastNoseX = currentX;

      // Slow calm reduction
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

