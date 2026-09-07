(function(){
  function markCurrentNav(root){
    const here = location.pathname.split("/").pop() || "index.html";
    root.querySelectorAll("nav a[href]").forEach(a => {
      if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
    });
  }
  function include(el){
    return fetch(el.dataset.include).then(r => r.text()).then(html => {
      el.innerHTML = html;
      if (el.id === "site-header") markCurrentNav(el);
    });
  }
  document.querySelectorAll("[data-include]").forEach(include);
})();
