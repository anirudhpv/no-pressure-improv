(function(){
  const form = document.getElementById("eventForm");
  const list = document.getElementById("eventList");
  const countLabel = document.getElementById("countLabel");
  const jsonOut = document.getElementById("jsonOut");
  const formTitle = document.getElementById("formTitle");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelEdit");

  const fields = ["date","format","start","end","kind","price","title","host","venue","desc","image"];
  const el = id => document.getElementById(`f-${id}`);

  let events = [];
  let editIndex = -1;

  fetch("assets/data/events.json").then(r=>r.json()).then(data => {
    events = data.slice();
    renderAll();
  }).catch(() => {
    list.innerHTML = `<p class="empty-note">Couldn't load assets/data/events.json — start adding events below and they'll still export correctly.</p>`;
    renderAll();
  });

  function sorted(){ return events.slice().sort((a,b)=> a.date.localeCompare(b.date) || a.start.localeCompare(b.start)); }

  function fmtRow(e){
    const [y,m,d] = e.date.split("-");
    return `${d}/${m}/${y} · ${e.start}–${e.end}`;
  }

  function renderList(){
    const items = sorted();
    countLabel.textContent = `(${items.length})`;
    if (!items.length){
      list.innerHTML = `<p class="empty-note">No events yet. Add one using the form.</p>`;
      return;
    }
    list.innerHTML = items.map(e => {
      const i = events.indexOf(e);
      return `
      <div class="ev-row">
        <div class="when">${fmtRow(e)}</div>
        <div class="what"><b>${escapeHtml(e.title)}</b><span>${escapeHtml(e.venue)}${e.venueLink?" 🔗":""} · ${e.format==="online"?"Online":"In-person"}</span></div>
        <div class="row-actions">
          <a href="event-${encodeURIComponent(e.id)}.html" target="_blank" rel="noopener">View</a>
          <button type="button" data-edit="${i}">Edit</button>
          <button type="button" data-del="${i}">Delete</button>
        </div>
      </div>`;
    }).join("");
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  function slugify(s){
    return String(s).toLowerCase().replace(/['']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  function renderExport(){
    jsonOut.value = JSON.stringify(sorted(), null, 2) + "\n";
  }

  function renderAll(){ renderList(); renderExport(); }

  function readForm(id){
    const price = el("price").value;
    const venueLink = el("venuelink").value.trim();
    return {
      id,
      date: el("date").value,
      start: el("start").value,
      end: el("end").value,
      format: el("format").value,
      kind: el("kind").value.trim(),
      title: el("title").value.trim(),
      host: el("host").value.trim(),
      venue: el("venue").value.trim(),
      venueLink: venueLink===""? null : venueLink,
      desc: el("desc").value.trim(),
      price: price===""? null : Number(price),
      image: el("image").value.trim(),
    };
  }

  function fillForm(e){
    el("date").value = e.date;
    el("start").value = e.start;
    el("end").value = e.end;
    el("format").value = e.format;
    el("kind").value = e.kind;
    el("title").value = e.title;
    el("host").value = e.host;
    el("venue").value = e.venue;
    el("venuelink").value = e.venueLink==null ? "" : e.venueLink;
    el("desc").value = e.desc;
    el("price").value = e.price==null ? "" : e.price;
    el("image").value = e.image || "";
  }

  function resetForm(){
    form.reset();
    editIndex = -1;
    formTitle.textContent = "Add an event";
    saveBtn.textContent = "Add event";
    cancelBtn.hidden = true;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    // Keep an edited event's id stable (it may already be linked to from elsewhere);
    // only generate a fresh one for brand-new events.
    const id = editIndex>-1
      ? events[editIndex].id
      : `${el("date").value}-${slugify(el("title").value)}`;
    const data = readForm(id);
    if (editIndex>-1) events[editIndex] = data;
    else events.push(data);
    resetForm();
    renderAll();
  });

  cancelBtn.addEventListener("click", resetForm);

  list.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn){
      editIndex = Number(editBtn.dataset.edit);
      fillForm(events[editIndex]);
      formTitle.textContent = "Edit event";
      saveBtn.textContent = "Save changes";
      cancelBtn.hidden = false;
      form.scrollIntoView({behavior:"smooth", block:"start"});
    }
    if (delBtn){
      const i = Number(delBtn.dataset.del);
      if (confirm(`Delete "${events[i].title}"?`)){
        events.splice(i,1);
        if (editIndex===i) resetForm();
        renderAll();
      }
    }
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const blob = new Blob([jsonOut.value], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "events.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText(jsonOut.value); }
    catch(_){ jsonOut.select(); document.execCommand("copy"); }
  });
})();
