(function(){
  const track = document.getElementById("track");
  const dots = document.getElementById("dots");
  const countEl = document.getElementById("slideCount");
  const panel = track.closest(".panel");

  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function fmtTime(t){ const [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; const hh=((h+11)%12)+1; return m? `${hh}:${String(m).padStart(2,"0")} ${ap}` : `${hh} ${ap}`; }
  function fmtWhen(e){
    const [y,m,d] = e.date.split("-").map(Number);
    const date = new Date(y, m-1, d);
    return `${DOW_SHORT[date.getDay()]} ${d} ${MONTH_SHORT[m-1]} · ${fmtTime(e.start)}–${fmtTime(e.end)}`;
  }

  fetch("assets/data/events.json").then(r=>r.json()).then(EVENTS => {
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const upcoming = EVENTS.filter(e => e.date >= todayISO).sort((a,b) => a.date.localeCompare(b.date));

    if (!upcoming.length){
      panel.querySelector(".panel-foot")?.insertAdjacentHTML("beforebegin",
        `<div class="track" style="display:flex;align-items:center;justify-content:center;min-height:220px;color:var(--ink-3,#8E7E93);text-align:center;padding:24px">Nothing scheduled right now — check back soon.</div>`);
      track.remove();
      countEl.textContent = "0 / 0";
      dots.innerHTML = "";
      return;
    }

    track.innerHTML = upcoming.map((e,i) => {
      const [,,d] = e.date.split("-");
      const m = MONTH_SHORT[Number(e.date.split("-")[1])-1];
      return `
      <article class="slide f-${e.format}" data-i="${i}">
        <img src="assets/images/${e.image||""}" alt="">
        <div class="info">
          <span class="datepill">${m} ${Number(d)}</span>
          <h3>${e.title}</h3>
          <p class="meta"><b>${fmtWhen(e)}</b><br>${e.host} · ${e.venue}</p>
        </div>
      </article>`;
    }).join("");

    dots.innerHTML = upcoming.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Go to event ${i+1}"></button>`).join("");
    const dotEls = [...dots.children];

    function setActive(i){
      dotEls.forEach((d,n)=>d.setAttribute("aria-current", String(n===i)));
      countEl.textContent = `${i+1} / ${upcoming.length}`;
    }
    function goTo(i){
      i = Math.max(0, Math.min(upcoming.length-1, i));
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

    let timer = upcoming.length>1 ? setInterval(()=>goTo((current+1)%upcoming.length), 5000) : null;
    panel.addEventListener("mouseenter", ()=>clearInterval(timer));
    panel.addEventListener("mouseleave", ()=>{ if (upcoming.length>1) timer = setInterval(()=>goTo((current+1)%upcoming.length), 5000); });
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
      if (upcoming.length>1) timer = setInterval(()=>goTo((current+1)%upcoming.length), 5000);
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    // a drag that actually moved shouldn't also fire the browser's click on the slide underneath
    track.addEventListener("click", e=>{ if (dragged) { e.preventDefault(); e.stopPropagation(); } }, {capture:true});

    setActive(0);
    window.addEventListener("resize", ()=>goTo(current));
  });
})();
