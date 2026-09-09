(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });

  const TALLY = "https://tally.so/r/gDoGBM";
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const content = document.getElementById("eventContent");

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function ordinal(n){ const s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function fmtTime(t){ const [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; const hh=((h+11)%12)+1; return m? `${hh}:${String(m).padStart(2,"0")} ${ap}` : `${hh} ${ap}`; }
  function priceHTML(e){
    return e.price==null
      ? `<span class="price">₹ TBC<small>SEE FORM</small></span>`
      : `<span class="price">₹${Number(e.price).toLocaleString("en-IN")}<small>PER SEAT</small></span>`;
  }
  function venueHTML(e){
    return e.venueLink
      ? `<a href="${esc(e.venueLink)}" target="_blank" rel="noopener">${esc(e.venue)} ↗</a>`
      : esc(e.venue);
  }
  function gcal(e){
    const [y,m,d] = e.date.split("-");
    const s = `${y}${m}${d}T${e.start.replace(":","")}00`, en = `${y}${m}${d}T${e.end.replace(":","")}00`;
    const q = new URLSearchParams({ action:"TEMPLATE", text:`NPI: ${e.title}`, dates:`${s}/${en}`, ctz:"Asia/Kolkata",
      details:`${e.desc}\n\nRegister: ${TALLY}`, location:e.venue });
    return "https://calendar.google.com/calendar/render?"+q.toString();
  }

  function notFound(){
    content.innerHTML = `
      <div class="event-not-found">
        <h1>Couldn't find that event.</h1>
        <p>It may have been removed, or the link is out of date. <a href="calendar.html">See the full calendar →</a></p>
      </div>`;
  }

  const id = new URLSearchParams(location.search).get("id");
  if (!id) { notFound(); }
  else {
    fetch("assets/data/events.json").then(r=>r.json()).then(events => {
      const e = events.find(ev => ev.id === id);
      if (!e) return notFound();

      const [y,m,d] = e.date.split("-").map(Number);
      const date = new Date(y, m-1, d);
      const when = `${DOW[date.getDay()]}, ${ordinal(d)} ${MONTH_NAMES[m-1]} ${y}`;

      document.title = `${e.title} — No Pressure Improv`;
      document.getElementById("pageDesc").setAttribute("content", `${e.title} · ${when} · ${e.venue} — No Pressure Improv.`);

      content.innerHTML = `
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
            <h1>${esc(e.title)}</h1>
            <p class="host">with ${esc(e.host)}</p>
            <dl class="facts">
              <dt>When</dt><dd>${when} · ${fmtTime(e.start)} to ${fmtTime(e.end)} IST</dd>
              <dt>Where</dt><dd>${venueHTML(e)}</dd>
            </dl>
            <p class="desc">${esc(e.desc)}</p>
            <div class="ev-actions">
              <a class="btn btn-primary" href="${TALLY}" target="_blank" rel="noopener">Register for this</a>
              <a class="btn btn-ghost" href="${gcal(e)}" target="_blank" rel="noopener">Add to Google Calendar</a>
              <a class="btn btn-ghost" href="calendar.html">See on the calendar</a>
            </div>
          </div>
        </article>`;
    }).catch(notFound);
  }
})();
