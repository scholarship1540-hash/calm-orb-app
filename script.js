document.addEventListener("DOMContentLoaded", async function () {

  const video = document.getElementById("camera");
  const instruction = document.getElementById("instruction");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    video.srcObject = stream;
    instruction.innerText = "Camera is working";

  } catch (err) {
    instruction.innerText = "Camera error: " + err.message;
    console.error(err);
  }

});
