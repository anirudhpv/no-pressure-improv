(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });

  const TALLY = "https://tally.so/r/gDoGBM";
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const grid = document.getElementById("grid");
  const panel = document.getElementById("panel");
  const list = document.getElementById("list");
  const hint = document.getElementById("hint");
  const monthLabel = document.getElementById("monthLabel");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  const pad = n => String(n).padStart(2,"0");
  const iso = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;
  function fmtTime(t){ const [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; const hh=((h+11)%12)+1; return m? `${hh}:${String(m).padStart(2,"0")} ${ap}` : `${hh} ${ap}`; }
  function ordinal(n){ const s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function venueHTML(e){
    return e.venueLink
      ? `<a href="${esc(e.venueLink)}" target="_blank" rel="noopener">${esc(e.venue)} ↗</a>`
      : esc(e.venue);
  }
  function priceHTML(e){
    return e.price==null
      ? `<span class="price">₹ TBC<small>SEE FORM</small></span>`
      : `<span class="price">₹${Number(e.price).toLocaleString("en-IN")}<small>PER SEAT</small></span>`;
  }
  function gcal(e){
    const [y,m,d] = e.date.split("-");
    const s = `${y}${m}${d}T${e.start.replace(":","")}00`, en = `${y}${m}${d}T${e.end.replace(":","")}00`;
    const q = new URLSearchParams({ action:"TEMPLATE", text:`NPI: ${e.title}`, dates:`${s}/${en}`, ctz:"Asia/Kolkata",
      details:`${e.desc}\n\nRegister: ${TALLY}`, location:e.venue });
    return "https://calendar.google.com/calendar/render?"+q.toString();
  }

  fetch("assets/data/events.json").then(r=>r.json()).then(init).catch(()=>{
    panel.innerHTML = `<div class="empty"><h3>Couldn't load the calendar.</h3><p>Please refresh, or check back shortly.</p></div>`;
  });

  function init(EVENTS){
    const byDate = {};
    EVENTS.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
    const allDates = Object.keys(byDate).sort();

    const now = new Date();
    const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());

    let curY, curM;
    const upcoming = allDates.filter(d => d >= todayISO);
    if (upcoming.length){ const [y,m] = upcoming[0].split("-"); curY=+y; curM=+m-1; }
    else if (allDates.length){ const [y,m] = allDates[allDates.length-1].split("-"); curY=+y; curM=+m-1; }
    else { curY = now.getFullYear(); curM = now.getMonth(); }

    let pinned = null, preview = null;
    let cells = {};

    function firstDayForMonth(y,m){
      const inMonth = allDates.filter(d => d.startsWith(`${y}-${pad(m+1)}`));
      const upcomingInMonth = inMonth.find(d => d >= todayISO);
      return upcomingInMonth || inMonth[0] || null;
    }

    function renderGrid(){
      grid.innerHTML = "";
      cells = {};
      const daysInMonth = new Date(curY, curM+1, 0).getDate();
      const firstDow = new Date(curY, curM, 1).getDay();
      monthLabel.innerHTML = `${MONTH_NAMES[curM]} <small>${curY}</small>`;
      grid.setAttribute("aria-label", `Days of ${MONTH_NAMES[curM]} ${curY}`);
      for (let i=0;i<firstDow;i++){ const b=document.createElement("div"); b.className="day blank"; b.setAttribute("aria-hidden","true"); grid.appendChild(b); }
      for (let d=1; d<=daysInMonth; d++){
        const dateISO = iso(curY, curM, d);
        const evs = byDate[dateISO];
        const el = document.createElement(evs ? "button" : "div");
        el.className = "day" + (evs ? " has" : "");
        if (evs){
          el.type="button";
          if (evs.some(e=>e.format==="inperson")) el.classList.add("inperson");
          if (evs.some(e=>e.format==="online")) el.classList.add("online");
          el.setAttribute("aria-label", `${DOW[new Date(curY,curM,d).getDay()]} ${ordinal(d)} ${MONTH_NAMES[curM]}: ${evs.map(e=>e.title).join(", ")}`);
          el.setAttribute("aria-pressed","false");
        } else {
          el.setAttribute("aria-label", `${ordinal(d)} ${MONTH_NAMES[curM]}, no session`);
        }
        if (dateISO===todayISO) el.classList.add("today");
        el.dataset.date = dateISO;
        el.innerHTML = `<span>${pad(d)}</span>` + (evs ? `<span class="dot">${evs.map(e=>`<i class="${e.format==="online"?"o":""}"></i>`).join("")}</span>` : "");
        grid.appendChild(el);
        cells[dateISO]=el;
      }
      paint();
    }

    function render(dateISO, mode){
      const evs = byDate[dateISO] || [];
      const [y,m,d] = dateISO.split("-").map(Number);
      const date = new Date(y, m-1, d);
      const head = `
        <div class="panel-date">
          <div class="big">${pad(d)}</div>
          <div class="meta"><b>${DOW[date.getDay()]}</b><span>${MONTH_NAMES[m-1]} ${y}${dateISO===todayISO?" · Today":""}</span></div>
          <span class="state">${mode==="pinned" ? "Pinned" : "Previewing"}</span>
        </div>`;
      let body;
      if (!evs.length){
        const upcomingAll = allDates.filter(x=>x>dateISO)[0];
        const prevAll = [...allDates].reverse().find(x=>x<dateISO);
        body = `<div class="empty">
          <h3>Nothing on the ${ordinal(d)}.</h3>
          <p>A quiet day. Rest your yes-and muscles.</p>
          <div class="empty next">
            ${prevAll? `<button class="btn btn-ghost" data-jump="${prevAll}">← ${fmtShort(prevAll)}: ${esc(byDate[prevAll][0].title)}</button>` : ""}
            ${upcomingAll? `<button class="btn btn-ghost" data-jump="${upcomingAll}">${fmtShort(upcomingAll)}: ${esc(byDate[upcomingAll][0].title)} →</button>` : ""}
          </div></div>`;
      } else {
        body = `<div class="events">` + evs.map(e => `
          <article class="ev">
            <img class="poster" src="assets/images/${e.image||""}" alt="Poster for ${esc(e.title)}" data-zoom>
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
              <dt>When</dt><dd>${DOW[date.getDay()]}, ${ordinal(d)} ${MONTH_NAMES[m-1]} · ${fmtTime(e.start)} to ${fmtTime(e.end)} IST</dd>
              <dt>Where</dt><dd>${venueHTML(e)}</dd>
            </dl>
            <p class="desc">${esc(e.desc)}</p>
            <div class="ev-actions">
              <a class="btn btn-primary" href="${TALLY}" target="_blank" rel="noopener">Register for this</a>
              <a class="btn btn-ghost" href="${gcal(e)}" target="_blank" rel="noopener">Add to Google Calendar</a>
              <a class="btn btn-ghost" href="event-${encodeURIComponent(e.id)}.html">View event page ↗</a>
            </div>
            </div>
          </article>`).join("") + `</div>`;
      }
      panel.innerHTML = head + body;
      panel.querySelectorAll("[data-jump]").forEach(b => b.addEventListener("click", ()=> pin(b.dataset.jump)));
    }

    function fmtShort(dateISO){
      const [y,m,d] = dateISO.split("-").map(Number);
      return `${ordinal(d)} ${MONTH_NAMES[m-1].slice(0,3)}`;
    }

    function paint(){
      Object.values(cells).forEach(c => { c.classList.remove("pinned","preview"); if (c.classList.contains("has")) c.setAttribute("aria-pressed","false"); });
      if (pinned && cells[pinned]){ cells[pinned].classList.add("pinned"); cells[pinned].setAttribute("aria-pressed","true"); }
      if (preview && preview!==pinned && cells[preview]) cells[preview].classList.add("preview");
    }
    function goToMonth(dateISO){
      const [y,m] = dateISO.split("-");
      curY=+y; curM=+m-1;
      renderGrid();
    }
    function pin(dateISO, scroll=true){
      pinned = dateISO; preview = null;
      const [y,m] = dateISO.split("-");
      if (+y!==curY || +m-1!==curM) goToMonth(dateISO); else paint();
      render(dateISO,"pinned");
      hint.textContent = canHover ? `${fmtShort(dateISO)} pinned · hover to peek at other dates` : `${fmtShort(dateISO)} selected`;
      if (scroll && window.innerWidth<=860) panel.scrollIntoView({behavior:"smooth", block:"start"});
    }
    function peek(dateISO){
      if (!canHover || dateISO===pinned) return;
      preview = dateISO; paint(); render(dateISO,"preview");
    }
    function unpeek(){
      if (!canHover) return;
      preview = null; paint(); if (pinned) render(pinned,"pinned");
    }

    grid.addEventListener("click", e => { const c=e.target.closest(".day"); if (!c || c.classList.contains("blank")) return; pin(c.dataset.date); });
    grid.addEventListener("mouseover", e => { const c=e.target.closest(".day"); if (!c || c.classList.contains("blank")) return; peek(c.dataset.date); });
    grid.addEventListener("mouseleave", unpeek);
    grid.addEventListener("focusin", e => { const c=e.target.closest(".day.has"); if (c) peek(c.dataset.date); });
    grid.addEventListener("keydown", e => {
      const c=e.target.closest(".day.has"); if (!c) return;
      const inMonth = Object.keys(cells).filter(k=>cells[k].classList.contains("has")).sort();
      const i = inMonth.indexOf(c.dataset.date); let n=null;
      if (e.key==="ArrowRight"||e.key==="ArrowDown") n = inMonth[Math.min(i+1,inMonth.length-1)];
      if (e.key==="ArrowLeft"||e.key==="ArrowUp") n = inMonth[Math.max(i-1,0)];
      if (n!=null){ e.preventDefault(); cells[n].focus(); }
    });
    prevBtn.addEventListener("click", ()=>{ curM--; if(curM<0){curM=11;curY--;} pinned=null; renderGrid(); showMonthDefault(); });
    nextBtn.addEventListener("click", ()=>{ curM++; if(curM>11){curM=0;curY++;} pinned=null; renderGrid(); showMonthDefault(); });

    function showMonthDefault(){
      const d = firstDayForMonth(curY,curM);
      if (d){ pin(d, false); }
      else {
        panel.innerHTML = `<div class="empty"><h3>Nothing scheduled in ${MONTH_NAMES[curM]}.</h3><p>Use the arrows to browse another month.</p></div>`;
      }
    }

    // ---------- month list (all events, every month) ----------
    list.innerHTML = allDates.map(dISO => byDate[dISO].map(e => {
      const [ly,lm,ld] = dISO.split("-").map(Number);
      return `
      <div class="row" role="button" tabindex="0" data-date="${dISO}" aria-label="Pin ${esc(e.title)} on ${pad(ld)}">
        <div class="d">${pad(ld)}<small>${DOW[new Date(ly,lm-1,ld).getDay()].slice(0,3).toUpperCase()}</small></div>
        <img class="th" src="assets/images/${e.image||""}" alt="">
        <div class="t"><b>${esc(e.title)}</b><span>with ${esc(e.host)} · ${fmtTime(e.start)} to ${fmtTime(e.end)} · ${esc(e.venue)}</span></div>
        <div class="r">
          <span class="chip f-${e.format}">${e.format==="online"?"Online":"In-person"}</span>${priceHTML(e)}
          <a class="row-link" href="event-${encodeURIComponent(e.id)}.html">View event ↗</a>
        </div>
      </div>`;
    }).join("")).join("");
    list.addEventListener("click", e => {
      if (e.target.closest(".row-link")) return; // let the event-page link navigate normally
      const r=e.target.closest(".row"); if (!r) return;
      pin(r.dataset.date); document.querySelector(".stage").scrollIntoView({behavior:"smooth", block:"start"});
    });
    list.addEventListener("keydown", e => {
      const r=e.target.closest(".row"); if (!r) return;
      if (e.key==="Enter" || e.key===" "){ e.preventDefault(); pin(r.dataset.date); document.querySelector(".stage").scrollIntoView({behavior:"smooth", block:"start"}); }
    });

    // ---------- price toggle ----------
    const toggle = document.getElementById("priceToggle");
    function setPrices(on){ document.body.classList.toggle("show-prices", on); toggle.setAttribute("aria-checked", String(on)); try{ localStorage.setItem("npi-prices", on?"1":"0"); }catch(_){} }
    toggle.addEventListener("click", ()=> setPrices(toggle.getAttribute("aria-checked")!=="true"));
    let saved=false; try{ saved = localStorage.getItem("npi-prices")==="1"; }catch(_){}
    setPrices(saved);

    renderGrid();
    showMonthDefault();
    hint.textContent = canHover ? "Hover to preview · click to pin" : "Tap a date to see what's on";
  }
})();
