(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });

  const ORDER_FORM = "https://tally.so/r/REPLACE_WITH_MERCH_FORM";
  const grid = document.getElementById("products");

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function priceHTML(p){
    return p.price==null
      ? `<span class="price">₹ TBC<small>SEE FORM</small></span>`
      : `<span class="price">₹${Number(p.price).toLocaleString("en-IN")}<small>PER ITEM</small></span>`;
  }
  function imageHTML(p){
    return p.image
      ? `<img class="product-photo" src="assets/images/${p.image}" alt="${esc(p.name)}" data-zoom>`
      : `<div class="product-photo placeholder" aria-hidden="true"><span>📷</span>Photo coming soon</div>`;
  }

  fetch("assets/data/products.json").then(r=>r.json()).then(products => {
    grid.innerHTML = products.map(p => `
      <article class="product">
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
      </article>`).join("");
  }).catch(() => {
    grid.innerHTML = `<p class="empty-note">Couldn't load the shop right now — please refresh or check back shortly.</p>`;
  });
})();
