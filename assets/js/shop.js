(function(){
  const lb=document.getElementById("lb"), lbi=lb.querySelector("img");
  document.addEventListener("click", e=>{ const t=e.target.closest("[data-zoom]"); if(!t) return; lbi.src=t.src; lbi.alt=t.alt; lb.classList.add("open"); });
  lb.addEventListener("click", ()=>lb.classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("open"); });

  const ORDER_FORM = "https://tally.so/r/REPLACE_WITH_MERCH_FORM";
  const CART_KEY = "npi-shop-cart";
  const grid = document.getElementById("products");
  const facetCategoryEl = document.getElementById("facetCategory");
  const facetBrandEl = document.getElementById("facetBrand");
  const facetClear = document.getElementById("facetClear");
  const facetsToggle = document.getElementById("facetsToggle");
  const facetsBody = document.getElementById("facetsBody");

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
      <article class="product" data-type="${esc(p.type)}" data-brand="${esc(p.brand)}">
        ${imageHTML(p)}
        <div class="product-body">
          <div class="chips">
            <span class="chip">${esc(p.type)}</span>
            <span class="chip chip-brand">${esc(p.brand)}</span>
          </div>
          <h3>${esc(p.name)}</h3>
          <p class="desc">${esc(p.desc)}</p>
          <p class="variants">${esc(p.variants)}</p>
          <div class="product-foot">
            ${priceHTML(p)}
            <button type="button" class="btn btn-pink" data-add="${esc(p.id)}">Add to cart</button>
          </div>
        </div>
      </article>`;
  }

  // ---------- facet filters (category + brand, independent — AND across groups, OR within a group) ----------
  let selectedCategories = new Set();
  let selectedBrands = new Set();

  function facetGroupHTML(name, values, counts){
    return values.map(v => `
      <label class="facet-item">
        <input type="checkbox" data-facet="${name}" value="${esc(v)}">
        <span>${esc(v)}</span>
        <span class="facet-count">${counts[v]}</span>
      </label>`).join("");
  }

  function applyFacets(){
    grid.querySelectorAll(".product").forEach(card => {
      const catOk = selectedCategories.size === 0 || selectedCategories.has(card.dataset.type);
      const brandOk = selectedBrands.size === 0 || selectedBrands.has(card.dataset.brand);
      card.hidden = !(catOk && brandOk);
    });
  }

  function onFacetChange(e){
    const cb = e.target.closest("[data-facet]"); if (!cb) return;
    const set = cb.dataset.facet === "category" ? selectedCategories : selectedBrands;
    if (cb.checked) set.add(cb.value); else set.delete(cb.value);
    applyFacets();
  }

  // ---------- cart ----------
  const cartToggle = document.getElementById("cartToggle");
  const cartBadge = document.getElementById("cartBadge");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const cartPanel = document.getElementById("cartPanel");
  const cartClose = document.getElementById("cartClose");
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartCheckout = document.getElementById("cartCheckout");
  const cartCopy = document.getElementById("cartCopy");
  const cartClear = document.getElementById("cartClear");

  let byId = {};
  let cart = [];

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(_){ return []; }
  }
  function saveCart(){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(_){}
  }
  function addToCart(id){
    const line = cart.find(l => l.id === id);
    if (line) line.qty++; else cart.push({id, qty:1});
    saveCart(); renderCart();
  }
  function setQty(id, qty){
    const line = cart.find(l => l.id === id);
    if (!line) return;
    if (qty <= 0) cart = cart.filter(l => l.id !== id);
    else line.qty = qty;
    saveCart(); renderCart();
  }
  function removeFromCart(id){
    cart = cart.filter(l => l.id !== id);
    saveCart(); renderCart();
  }
  function cartCount(){ return cart.reduce((n,l)=>n+l.qty,0); }

  function openCart(){
    cartPanel.classList.add("open");
    cartBackdrop.hidden = false;
    cartToggle.setAttribute("aria-expanded","true");
    cartPanel.setAttribute("aria-hidden","false");
  }
  function closeCart(){
    cartPanel.classList.remove("open");
    cartBackdrop.hidden = true;
    cartToggle.setAttribute("aria-expanded","false");
    cartPanel.setAttribute("aria-hidden","true");
  }

  function renderCart(){
    const count = cartCount();
    cartBadge.hidden = count === 0;
    cartBadge.textContent = String(count);

    if (!cart.length){
      cartItemsEl.innerHTML = `<p class="empty-note">Your cart is empty. Add something from the shop.</p>`;
      cartSubtotalEl.innerHTML = "";
      cartCheckout.setAttribute("aria-disabled","true");
      cartCheckout.href = "#";
      return;
    }
    cartCheckout.removeAttribute("aria-disabled");
    cartCheckout.href = ORDER_FORM;

    let subtotal = 0, hasUnknown = false;
    cartItemsEl.innerHTML = cart.map(line => {
      const p = byId[line.id];
      if (!p) return "";
      const lineKnown = p.price != null;
      if (lineKnown) subtotal += p.price * line.qty; else hasUnknown = true;
      const lineTotal = lineKnown ? `₹${(p.price*line.qty).toLocaleString("en-IN")}` : "TBC";
      return `
        <div class="cart-item" data-id="${esc(p.id)}">
          ${p.image ? `<img src="assets/images/${p.image}" alt="">` : `<div class="cart-thumb-placeholder">📷</div>`}
          <div class="cart-item-body">
            <b>${esc(p.name)}</b>
            <span class="cart-item-type">${esc(p.type)}</span>
            <div class="qty-stepper">
              <button type="button" class="qty-btn" data-qty="dec">−</button>
              <span>${line.qty}</span>
              <button type="button" class="qty-btn" data-qty="inc">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-total">${lineTotal}</span>
            <button type="button" class="cart-item-remove" aria-label="Remove ${esc(p.name)}">Remove</button>
          </div>
        </div>`;
    }).join("");

    cartSubtotalEl.innerHTML = `<b>Subtotal</b> ₹${subtotal.toLocaleString("en-IN")}${hasUnknown ? " + TBC items" : ""}`;
  }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartBackdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key==="Escape") closeCart(); });

  cartItemsEl.addEventListener("click", e => {
    const row = e.target.closest(".cart-item"); if (!row) return;
    const id = row.dataset.id;
    const line = cart.find(l => l.id === id);
    if (e.target.closest("[data-qty='inc']")) setQty(id, line.qty+1);
    else if (e.target.closest("[data-qty='dec']")) setQty(id, line.qty-1);
    else if (e.target.closest(".cart-item-remove")) removeFromCart(id);
  });

  cartClear.addEventListener("click", () => {
    if (!cart.length) return;
    if (confirm("Clear your cart?")){ cart = []; saveCart(); renderCart(); }
  });

  cartCopy.addEventListener("click", async () => {
    const lines = cart.map(l => { const p = byId[l.id]; return p ? `- ${p.name} (${p.type}) x${l.qty}` : ""; }).filter(Boolean);
    const text = lines.length ? `NPI Shop order:\n${lines.join("\n")}` : "Your cart is empty.";
    try{ await navigator.clipboard.writeText(text); cartCopy.textContent = "Copied ✓"; }
    catch(_){ cartCopy.textContent = "Couldn't copy"; }
    setTimeout(()=>{ cartCopy.textContent = "Copy order summary"; }, 1800);
  });

  grid.addEventListener("click", e => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    addToCart(b.dataset.add);
    const original = b.textContent;
    b.textContent = "Added ✓";
    setTimeout(()=>{ b.textContent = original; }, 1200);
  });

  facetsToggle.addEventListener("click", () => facetsBody.classList.toggle("open"));

  fetch("assets/data/products.json").then(r=>r.json()).then(products => {
    byId = Object.fromEntries(products.map(p => [p.id, p]));

    grid.innerHTML = `<div class="product-grid">${products.map(productHTML).join("")}</div>`;

    const countBy = key => products.reduce((m,p) => { m[p[key]] = (m[p[key]]||0)+1; return m; }, {});
    const types = [...new Set(products.map(p => p.type))];
    const brands = [...new Set(products.map(p => p.brand))];
    facetCategoryEl.innerHTML = facetGroupHTML("category", types, countBy("type"));
    facetBrandEl.innerHTML = facetGroupHTML("brand", brands, countBy("brand"));
    document.getElementById("facetsBody").addEventListener("change", onFacetChange);
    facetClear.addEventListener("click", () => {
      selectedCategories = new Set(); selectedBrands = new Set();
      facetsBody.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
      applyFacets();
    });

    cart = loadCart();
    renderCart();
  }).catch(() => {
    grid.innerHTML = `<p class="empty-note">Couldn't load the shop right now — please refresh or check back shortly.</p>`;
  });
})();
