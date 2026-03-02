document.addEventListener("DOMContentLoaded",()=>{

let stress=20;
let lastBlink=0;
let lastX=null;
let triggered=false;

const video=document.getElementById("camera");
const stressText=document.getElementById("stressValue");
const instruction=document.getElementById("instruction");

function speak(t){
  const s=new SpeechSynthesisUtterance(t);
  speechSynthesis.cancel();
  speechSynthesis.speak(s);
}

function updateStress(){
  stress=Math.max(0,Math.min(100,stress));
  stressText.innerText="Stress Level: "+Math.round(stress)+"%";

  if(stress>70 && !triggered){
    triggered=true;
    speak("You are in high stress now click on one activity you want");
    document.getElementById("monitor").style.display="none";
    document.getElementById("activity").style.display="block";
  }
}

/* CAMERA */
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
  video.srcObject=stream;
  video.play();
  startFace();
})
.catch(()=>instruction.innerText="Camera denied");

/* FACEMESH */
function startFace(){
  const face=new FaceMesh({
    locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
  });

  face.onResults(r=>{
    if(triggered) return;
    if(!r.multiFaceLandmarks.length) return;

    const l=r.multiFaceLandmarks[0];

    const eye=Math.abs(l[159].y-l[145].y);
    if(eye<0.01){
      if(Date.now()-lastBlink>700){
        stress+=4;
        lastBlink=Date.now();
      }
    }

    const move=Math.abs(l[1].x-(lastX||l[1].x));
    if(move>0.04) stress+=2;

    lastX=l[1].x;

    stress-=0.01;

    updateStress();
  });

  new Camera(video,{
    onFrame:async()=>await face.send({image:video})
  }).start();
}

/* MENU CONTROL */
window.goBackMenu=()=>{
  document.querySelectorAll(".section")
  .forEach(s=>s.style.display="none");
  document.getElementById("menu").style.display="block";
};

function hideSections(){
  document.querySelectorAll(".section")
  .forEach(s=>s.style.display="none");
  document.getElementById("menu").style.display="none";
}

/* BREATHING */
window.startBreathing=()=>{
  hideSections();
  document.getElementById("breathing").style.display="block";

  const c=document.querySelector(".circle");
  const t=document.getElementById("breathText");

  setInterval(()=>{
    c.style.transform="scale(1.5)";
    t.innerText="Breathe In";
    setTimeout(()=>{
      c.style.transform="scale(1)";
      t.innerText="Breathe Out";
    },4000);
  },8000);
};

/* THOUGHTS */
window.startThoughts=()=>{
  hideSections();
  document.getElementById("thoughts").style.display="block";

  const area=document.getElementById("cardArea");
  area.innerHTML="";
  let count=0;

  function create(){
    if(count>=5){
      area.innerHTML="<h3>Well Done</h3>";
      return;
    }
    const card=document.createElement("div");
    card.className="card";
    card.innerText="Release this thought";
    area.appendChild(card);

    let sx=0;
    card.onmousedown=e=>{
      sx=e.clientX;
      document.onmousemove=ev=>{
        const dx=ev.clientX-sx;
        card.style.transform=
        `translateX(calc(-50% + ${dx}px)) rotate(${dx/10}deg)`;
      };
    };
    document.onmouseup=e=>{
      document.onmousemove=null;
      if(Math.abs(e.clientX-sx)>100){
        card.remove();
        count++;
        stress-=5;
        create();
      }else{
        card.style.transform="translateX(-50%)";
      }
    };
  }
  create();
};

/* RHYTHM */
window.startRhythm=()=>{
  hideSections();
  document.getElementById("rhythm").style.display="block";

  const dots=document.querySelectorAll(".dot");
  let target=0;

  function next(){
    dots.forEach(d=>d.classList.remove("active"));
    target=Math.floor(Math.random()*4);
    dots[target].classList.add("active");
  }

  dots.forEach(d=>{
    d.onclick=()=>{
      if(parseInt(d.dataset.i)===target){
        stress-=2;
        next();
      }
    };
  });
  next();
};

/* KNIFE */
window.startKnife=()=>{
  hideSections();
  document.getElementById("knife").style.display="block";

  const wheel=document.getElementById("wheel");
  wheel.innerHTML="";
  let knives=10;
  let angles=[];
  document.getElementById("knifeLeft").innerText=knives;

  function throwKnife(){
    if(knives<=0) return;

    const angle=Math.floor(Math.random()*360);

    for(let a of angles){
      if(Math.abs(a-angle)<20){
        document.getElementById("knife").innerHTML="<h3>Game Over</h3>";
        wheel.removeEventListener("click",throwKnife);
        return;
      }
    }

    angles.push(angle);

    const k=document.createElement("div");
    k.className="knife";
    k.style.transform=`rotate(${angle}deg)`;
    wheel.appendChild(k);

    knives--;
    document.getElementById("knifeLeft").innerText=knives;
    stress-=3;

    if(knives===0){
      document.getElementById("knife").innerHTML="<h3>You Win</h3>";
      wheel.removeEventListener("click",throwKnife);
    }
  }

  wheel.addEventListener("click",throwKnife);
};

});
