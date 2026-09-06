const IMG = {"e28": "assets/images/event-28.jpg", "e25": "assets/images/event-25.jpg", "e21": "assets/images/event-21.jpg", "e19": "assets/images/event-19.jpg", "e11": "assets/images/event-11.jpg", "e4": "assets/images/event-04.jpg", "e13": "assets/images/event-13.jpg"};
(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });
  // ---------- data: edit here ----------
  // price: number in rupees, or null to show "TBC" when the price toggle is on.
  const TALLY = "https://tally.so/r/gDoGBM";
  const EVENTS = [
    { day:4, img:"e4",  start:"19:00", end:"21:00", format:"inperson", kind:"Improv Jam",
      title:"Quit Playin' Games With My Heart", host:"Shweta & Samyukthaa", venue:"Shubham SSPA, JP Nagar",
      desc:"An Improv Jam for everyone. We'll play silly games and have fun.", price:null },
    { day:11, img:"e11", start:"19:00", end:"20:30", format:"inperson", kind:"Improv Jam",
      title:"Improv Jam in West Bengaluru", host:"Laxmi", venue:"Oorkathe",
      desc:"A relaxed, no-experience-needed jam for the west side of the city.", price:null },
    { day:13, img:"e13", start:"11:30", end:"12:30", format:"online", kind:"Online Jam",
      title:"The 5-Minute Club", host:"Rutika Yoelkar", venue:"Online (link shared after registration)",
      desc:"A monthly online gathering built around one simple idea: the most meaningful conversations don't need hours of content, they just need the right five minutes. Bring a short piece of media; we listen deeply, stay curious and open, and build on one another's ideas.", price:null },
    { day:19, img:"e19", start:"18:00", end:"21:00", format:"inperson", kind:"Improv Lab",
      title:"Feelings Are Good", host:"Aditya Ramesh", venue:"Venue shared after registration",
      desc:"An experimental Improv Lab which deep dives into playing emotional scenes.", price:null },
    { day:21, img:"e21", start:"18:00", end:"21:00", format:"inperson", kind:"Improv Lab",
      title:"Breaktime with Saga", host:"Saga", venue:"Concept 01, Koramangala",
      desc:"Ever watched a comedy show and thought, I want to try that? Now is your chance. Breaktime with Saga is an interactive, pressure-free evening created by an artist who loves comedy more than anything. Curated specifically for people with zero experience in comedy performance or any art form, this is a safe space to let loose, laugh, and learn.", price:null },
    { day:25, img:"e25", start:"19:00", end:"20:30", format:"inperson", kind:"Improv Jam",
      title:"Improv Jam in West Bengaluru", host:"Abhi", venue:"Oorkathe",
      desc:"A relaxed, no-experience-needed jam for the west side of the city.", price:null },
    { day:28, img:"e28", start:"19:00", end:"21:00", format:"inperson", kind:"Improv Jam",
      title:"Patti Stiles' Improvise Freely: Next Chapter", host:"Laxmi", venue:"Dhurii, Indiranagar",
      desc:"We continue to look at the Patti Stiles book Improvise Freely, which continues to redefine what the basics of improvisational theatre are. One chapter, explored on our feet.", price:null },
  ];
  // -------------------------------------

  const YEAR = 2026, MONTH = 8; // September (0-indexed)
  const DAYS_IN_MONTH = 30;
  const FIRST_DOW = new Date(YEAR, MONTH, 1).getDay(); // 2 = Tuesday
  const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const byDay = {};
  EVENTS.forEach(e => { (byDay[e.day] = byDay[e.day] || []).push(e); });
  const eventDays = Object.keys(byDay).map(Number).sort((a,b)=>a-b);

  const now = new Date();
  const todayDay = (now.getFullYear()===YEAR && now.getMonth()===MONTH) ? now.getDate() : null;
  const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

  const grid = document.getElementById("grid");
  const panel = document.getElementById("panel");
  const list = document.getElementById("list");
  const hint = document.getElementById("hint");

  function fmtTime(t){ const [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; const hh=((h+11)%12)+1; return m? `${hh}:${String(m).padStart(2,"0")} ${ap}` : `${hh} ${ap}`; }
  function ordinal(n){ const s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function gcal(e){
    const p = n => String(n).padStart(2,"0");
    const d = `${YEAR}${p(MONTH+1)}${p(e.day)}`;
    const s = d+"T"+e.start.replace(":","")+"00", en = d+"T"+e.end.replace(":","")+"00";
    const q = new URLSearchParams({ action:"TEMPLATE", text:`NPI: ${e.title}`, dates:`${s}/${en}`, ctz:"Asia/Kolkata",
      details:`${e.desc}\n\nRegister: ${TALLY}`, location:e.venue });
    return "https://calendar.google.com/calendar/render?"+q.toString();
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function priceHTML(e){
    return e.price==null
      ? `<span class="price">₹ TBC<small>SEE FORM</small></span>`
      : `<span class="price">₹${Number(e.price).toLocaleString("en-IN")}<small>PER SEAT</small></span>`;
  }

  // ---------- build calendar ----------
  const cells = {};
  for (let i=0;i<FIRST_DOW;i++){ const b=document.createElement("div"); b.className="day blank"; b.setAttribute("aria-hidden","true"); grid.appendChild(b); }
  for (let d=1; d<=DAYS_IN_MONTH; d++){
    const evs = byDay[d];
    const el = document.createElement(evs ? "button" : "div");
    el.className = "day" + (evs ? " has" : "");
    if (evs){
      el.type="button";
      if (evs.some(e=>e.format==="inperson")) el.classList.add("inperson");
      if (evs.some(e=>e.format==="online")) el.classList.add("online");
      el.setAttribute("aria-label", `${DOW[new Date(YEAR,MONTH,d).getDay()]} ${ordinal(d)} September: ${evs.map(e=>e.title).join(", ")}`);
      el.setAttribute("aria-pressed","false");
    } else {
      el.setAttribute("aria-label", `${ordinal(d)} September, no session`);
    }
    if (d===todayDay) el.classList.add("today");
    el.dataset.day = d;
    el.innerHTML = `<span>${String(d).padStart(2,"0")}</span>` + (evs ? `<span class="dot">${evs.map(e=>`<i class="${e.format==="online"?"o":""}"></i>`).join("")}</span>` : "");
    grid.appendChild(el);
    cells[d]=el;
  }

  // ---------- state ----------
  let pinned = null, preview = null;
  function initialDay(){
    if (todayDay!=null){ const up = eventDays.find(d=>d>=todayDay); if (up!=null) return up; }
    return eventDays[0];
  }

  function render(day, mode){
    const evs = byDay[day] || [];
    const date = new Date(YEAR, MONTH, day);
    const head = `
      <div class="panel-date">
        <div class="big">${String(day).padStart(2,"0")}</div>
        <div class="meta"><b>${DOW[date.getDay()]}</b><span>September 2026${day===todayDay?" · Today":""}</span></div>
        <span class="state">${mode==="pinned" ? "Pinned" : "Previewing"}</span>
      </div>`;
    let body;
    if (!evs.length){
      const next = eventDays.find(d=>d>day), prev=[...eventDays].reverse().find(d=>d<day);
      body = `<div class="empty">
        <h3>Nothing on the ${ordinal(day)}.</h3>
        <p>A quiet day. Rest your yes-and muscles.</p>
        <div class="empty next">
          ${prev? `<button class="btn btn-ghost" data-jump="${prev}">← ${ordinal(prev)}: ${esc(byDay[prev][0].title)}</button>` : ""}
          ${next? `<button class="btn btn-ghost" data-jump="${next}">${ordinal(next)}: ${esc(byDay[next][0].title)} →</button>` : ""}
        </div></div>`;
    } else {
      body = `<div class="events">` + evs.map(e => `
        <article class="ev">
          <img class="poster" src="${IMG[e.img]||""}" alt="Poster for ${esc(e.title)}" data-zoom>
          <div class="body">
          <div class="ev-top">
            <div class="chips">
              <span class="chip f-${e.format}">${e.format==="online"?"Online":"In-person"}</span>
              <span class="chip kind">${esc(e.kind)}</span>
            </div>
            ${priceHTML(e)}
          </div>
          <h3>${esc(e.title)}</h3>
          <p class="host">with ${esc(e.host)}</p>
          <dl class="facts">
            <dt>When</dt><dd>${DOW[date.getDay()]}, ${ordinal(day)} September · ${fmtTime(e.start)} to ${fmtTime(e.end)} IST</dd>
            <dt>Where</dt><dd>${esc(e.venue)}</dd>
          </dl>
          <p class="desc">${esc(e.desc)}</p>
          <div class="ev-actions">
            <a class="btn btn-primary" href="${TALLY}" target="_blank" rel="noopener">Register for this</a>
            <a class="btn btn-ghost" href="${gcal(e)}" target="_blank" rel="noopener">Add to Google Calendar</a>
          </div>
          </div>
        </article>`).join("") + `</div>`;
    }
    panel.innerHTML = head + body;
    panel.querySelectorAll("[data-jump]").forEach(b => b.addEventListener("click", ()=> pin(Number(b.dataset.jump))));
  }

  function paint(){
    Object.values(cells).forEach(c => { c.classList.remove("pinned","preview"); if (c.classList.contains("has")) c.setAttribute("aria-pressed","false"); });
    if (pinned!=null && cells[pinned]){ cells[pinned].classList.add("pinned"); cells[pinned].setAttribute("aria-pressed","true"); }
    if (preview!=null && preview!==pinned && cells[preview]) cells[preview].classList.add("preview");
  }
  function pin(day, scroll=true){
    pinned = day; preview = null; paint(); render(day,"pinned");
    hint.textContent = canHover ? `${ordinal(day)} pinned · hover to peek at other dates` : `${ordinal(day)} selected`;
    if (scroll && window.innerWidth<=860) panel.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function peek(day){
    if (!canHover || day===pinned) return;
    preview = day; paint(); render(day,"preview");
  }
  function unpeek(){
    if (!canHover) return;
    preview = null; paint(); if (pinned!=null) render(pinned,"pinned");
  }

  grid.addEventListener("click", e => { const c=e.target.closest(".day"); if (!c || c.classList.contains("blank")) return; pin(Number(c.dataset.day)); });
  grid.addEventListener("mouseover", e => { const c=e.target.closest(".day"); if (!c || c.classList.contains("blank")) return; peek(Number(c.dataset.day)); });
  grid.addEventListener("mouseleave", unpeek);
  grid.addEventListener("focusin", e => { const c=e.target.closest(".day.has"); if (c) peek(Number(c.dataset.day)); });
  grid.addEventListener("keydown", e => {
    const c=e.target.closest(".day.has"); if (!c) return;
    const i = eventDays.indexOf(Number(c.dataset.day)); let n=null;
    if (e.key==="ArrowRight"||e.key==="ArrowDown") n = eventDays[Math.min(i+1,eventDays.length-1)];
    if (e.key==="ArrowLeft"||e.key==="ArrowUp") n = eventDays[Math.max(i-1,0)];
    if (n!=null){ e.preventDefault(); cells[n].focus(); }
  });

  // ---------- month list ----------
  list.innerHTML = eventDays.map(d => byDay[d].map(e => `
    <button class="row" type="button" data-day="${d}">
      <div class="d">${String(d).padStart(2,"0")}<small>${DOW[new Date(YEAR,MONTH,d).getDay()].slice(0,3).toUpperCase()}</small></div>
      <img class="th" src="${IMG[e.img]||""}" alt="">
      <div class="t"><b>${esc(e.title)}</b><span>with ${esc(e.host)} · ${fmtTime(e.start)} to ${fmtTime(e.end)} · ${esc(e.venue)}</span></div>
      <div class="r"><span class="chip f-${e.format}">${e.format==="online"?"Online":"In-person"}</span>${priceHTML(e)}</div>
    </button>`).join("")).join("");
  list.addEventListener("click", e => { const r=e.target.closest(".row"); if (!r) return; pin(Number(r.dataset.day)); document.querySelector(".stage").scrollIntoView({behavior:"smooth", block:"start"}); });

  // ---------- price toggle ----------
  const toggle = document.getElementById("priceToggle");
  function setPrices(on){ document.body.classList.toggle("show-prices", on); toggle.setAttribute("aria-checked", String(on)); try{ localStorage.setItem("npi-prices", on?"1":"0"); }catch(_){} }
  toggle.addEventListener("click", ()=> setPrices(toggle.getAttribute("aria-checked")!=="true"));
  let saved=false; try{ saved = localStorage.getItem("npi-prices")==="1"; }catch(_){}
  setPrices(saved);

  pin(initialDay(), false);
  hint.textContent = canHover ? "Hover to preview · click to pin" : "Tap a date to see what's on";
})();