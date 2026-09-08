(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });

  const ORDER_FORM = "https://tally.so/r/REPLACE_WITH_MERCH_FORM";
  const grid = document.getElementById("products");
  const filterBar = document.getElementById("catFilter");

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function priceHTML(p){
    if (p.price==null) return `<span class="price">₹ TBC<small>SEE FORM</small></span>`;
    const amount = Number(p.price).toLocaleString("en-IN");
    return p.priceFrom
      ? `<span class="price">From ₹${amount}<small>PER ITEM</small></span>`
      : `<span class="price">₹${amount}<small>PER ITEM</small></span>`;
  }
  function imageHTML(p){
    return p.image
      ? `<img class="product-photo" src="assets/images/${p.image}" alt="${esc(p.name)}" data-zoom>`
      : `<div class="product-photo placeholder" aria-hidden="true"><span>📷</span>Photo coming soon</div>`;
  }

  function productHTML(p){
    return `
      <article class="product" data-type="${esc(p.type)}">
        ${imageHTML(p)}
        <div class="product-body">
          <span class="chip">${esc(p.type)}</span>
          <h3>${esc(p.name)}</h3>
          <p class="desc">${esc(p.desc)}</p>
          <p class="variants">${esc(p.variants)}</p>
          <div class="product-foot">
            ${priceHTML(p)}
            <a class="btn btn-pink" href="${ORDER_FORM}" target="_blank" rel="noopener">Order this ↗</a>
          </div>
        </div>
      </article>`;
  }

  let active = new Set(["All"]);

  function render(types){
    grid.querySelectorAll(".product").forEach(card => {
      card.hidden = !(active.has("All") || active.has(card.dataset.type));
    });
    filterBar.querySelectorAll(".cat-btn").forEach(b => {
      const on = active.has("All") || active.has(b.dataset.cat);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  function toggleCategory(cat, types){
    if (cat === "All"){
      active = new Set(["All"]);
    } else {
      active.delete("All");
      if (active.has(cat)) active.delete(cat); else active.add(cat);
      if (active.size === 0) active = new Set(["All"]);
      if (types.every(t => active.has(t))) active = new Set(["All"]);
    }
  }

  fetch("assets/data/products.json").then(r=>r.json()).then(products => {
    const types = [...new Set(products.map(p => p.type))];

    grid.innerHTML = `<div class="product-grid">${products.map(productHTML).join("")}</div>`;

    filterBar.innerHTML = ["All", ...types].map(cat => `
      <button type="button" class="cat-btn" data-cat="${esc(cat)}" aria-pressed="false">${esc(cat === "All" ? "All" : cat + "s")}</button>`).join("");
    filterBar.addEventListener("click", e => {
      const b = e.target.closest(".cat-btn"); if (!b) return;
      toggleCategory(b.dataset.cat, types);
      render(types);
    });
    render(types);
  }).catch(() => {
    grid.innerHTML = `<p class="empty-note">Couldn't load the shop right now — please refresh or check back shortly.</p>`;
  });
})();
