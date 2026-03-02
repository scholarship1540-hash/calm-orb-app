document.addEventListener("DOMContentLoaded", function () {

  const videoElement = document.getElementById("camera");
  const stressText = document.getElementById("stressValue");
  const instruction = document.getElementById("instruction");

  let stressScore = 20;
  let lastBlinkTime = 0;
  let lastNoseX = null;

  function updateStress() {
    if (stressScore > 100) stressScore = 100;
    if (stressScore < 0) stressScore = 0;
    stressText.innerText = "Stress Level: " + Math.round(stressScore) + "%";
  }

  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      videoElement.srcObject = stream;
      instruction.innerText = "Camera active";

      startFaceMesh();

    } catch (error) {
      instruction.innerText = "Camera access denied";
      console.error(error);
    }
  }

  function startFaceMesh() {

    const faceMesh = new FaceMesh({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    faceMesh.onResults(results => {

      if (!results.multiFaceLandmarks.length) return;

      const landmarks = results.multiFaceLandmarks[0];

      // Blink detection
      const leftEyeTop = landmarks[159];
      const leftEyeBottom = landmarks[145];
      const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);

      if (eyeDistance < 0.01) {
        const now = Date.now();
        if (now - lastBlinkTime > 400) {
          stressScore += 5;
          lastBlinkTime = now;
        }
      }

      // Head movement detection
      const nose = landmarks[1];
      const currentX = nose.x;

      if (lastNoseX !== null) {
        const movement = Math.abs(currentX - lastNoseX);
        if (movement > 0.02) stressScore += 3;
      }

      lastNoseX = currentX;

      stressScore -= 0.5;
      updateStress();
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });

    camera.start();
  }

  initCamera();

});

