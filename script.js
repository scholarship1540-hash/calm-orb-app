const orb = document.querySelector(".orb");

orb.addEventListener("mousedown", () => {
  orb.classList.add("breathe");
});

orb.addEventListener("mouseup", () => {
  orb.classList.remove("breathe");
});

// For mobile touch support
orb.addEventListener("touchstart", () => {
  orb.classList.add("breathe");
});

orb.addEventListener("touchend", () => {
  orb.classList.remove("breathe");
});
