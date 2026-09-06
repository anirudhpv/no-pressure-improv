const IMG = {"e28": "assets/images/event-28.jpg", "e25": "assets/images/event-25.jpg", "e21": "assets/images/event-21.jpg", "e19": "assets/images/event-19.jpg", "e11": "assets/images/event-11.jpg", "e4": "assets/images/event-04.jpg", "e13": "assets/images/event-13.jpg"};
const EVENTS = [
  { day:4,  img:"e4",  format:"inperson", title:"Quit Playin' Games With My Heart", host:"Shweta & Samyukthaa", when:"Fri 4 Sep · 7–9 PM", venue:"Shubham SSPA, JP Nagar" },
  { day:11, img:"e11", format:"inperson", title:"Improv Jam in West Bengaluru", host:"Laxmi", when:"Fri 11 Sep · 7–8:30 PM", venue:"Oorkathe" },
  { day:13, img:"e13", format:"online",   title:"The 5-Minute Club", host:"Rutika Yoelkar", when:"Sun 13 Sep · 11:30 AM", venue:"Online" },
  { day:19, img:"e19", format:"inperson", title:"Feelings Are Good", host:"Aditya Ramesh", when:"Sat 19 Sep · 6–9 PM", venue:"Venue shared after registration" },
  { day:21, img:"e21", format:"inperson", title:"Breaktime with Saga", host:"Saga", when:"Mon 21 Sep · 6–9 PM", venue:"Concept 01, Koramangala" },
  { day:25, img:"e25", format:"inperson", title:"Improv Jam in West Bengaluru", host:"Abhi", when:"Fri 25 Sep · 7–8:30 PM", venue:"Oorkathe" },
  { day:28, img:"e28", format:"inperson", title:"Patti Stiles' Improvise Freely", host:"Laxmi", when:"Mon 28 Sep · 7–9 PM", venue:"Dhurii, Indiranagar" },
];

(function(){
  const track = document.getElementById("track");
  const dots = document.getElementById("dots");
  const countEl = document.getElementById("slideCount");

  track.innerHTML = EVENTS.map((e,i) => `
    <article class="slide f-${e.format}" data-i="${i}">
      <img src="${IMG[e.img]}" alt="">
      <div class="info">
        <span class="datepill">Sep ${e.day}</span>
        <h3>${e.title}</h3>
        <p class="meta"><b>${e.when}</b><br>${e.host} · ${e.venue}</p>
      </div>
    </article>`).join("");

  dots.innerHTML = EVENTS.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Go to event ${i+1}"></button>`).join("");
  const dotEls = [...dots.children];

  function setActive(i){
    dotEls.forEach((d,n)=>d.setAttribute("aria-current", String(n===i)));
    countEl.textContent = `${i+1} / ${EVENTS.length}`;
  }
  function goTo(i){
    i = Math.max(0, Math.min(EVENTS.length-1, i));
    track.scrollTo({left: i*track.clientWidth, behavior:"smooth"});
  }
  let current = 0;
  track.addEventListener("scroll", ()=>{
    clearTimeout(track._t);
    track._t = setTimeout(()=>{
      current = Math.round(track.scrollLeft / track.clientWidth);
      setActive(current);
    }, 80);
  }, {passive:true});

  document.getElementById("prev").addEventListener("click", ()=>goTo(current-1));
  document.getElementById("next").addEventListener("click", ()=>goTo(current+1));
  dots.addEventListener("click", e=>{ const b=e.target.closest("button"); if(b) goTo(Number(b.dataset.i)); });

  let timer = setInterval(()=>goTo((current+1)%EVENTS.length), 5000);
  const panel = track.closest(".panel");
  panel.addEventListener("mouseenter", ()=>clearInterval(timer));
  panel.addEventListener("mouseleave", ()=>{ timer = setInterval(()=>goTo((current+1)%EVENTS.length), 5000); });
  panel.addEventListener("focusin", ()=>clearInterval(timer));

  // click-and-drag to scroll (mouse and touch alike, via pointer events)
  let dragging = false, dragged = false, startX = 0, startScroll = 0;
  track.addEventListener("pointerdown", e=>{
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; dragged = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("dragging");
    track.setPointerCapture(e.pointerId);
    track.style.scrollBehavior = "auto";
    clearInterval(timer);
  });
  track.addEventListener("pointermove", e=>{
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");
    track.style.scrollBehavior = "";
    goTo(Math.round(track.scrollLeft / track.clientWidth));
    timer = setInterval(()=>goTo((current+1)%EVENTS.length), 5000);
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  // a drag that actually moved shouldn't also fire the browser's click on the slide underneath
  track.addEventListener("click", e=>{ if (dragged) { e.preventDefault(); e.stopPropagation(); } }, {capture:true});

  setActive(0);
  window.addEventListener("resize", ()=>goTo(current));
})();