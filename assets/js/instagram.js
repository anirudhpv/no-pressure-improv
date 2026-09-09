(function(){
  const track = document.getElementById("instaTrack");
  const prev = document.getElementById("instaPrev");
  const next = document.getElementById("instaNext");
  if (!track) return;

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  fetch("assets/data/instagram.json").then(r=>r.json()).then(posts => {
    if (!posts.length){
      track.replaceWith(Object.assign(document.createElement("div"), {
        className: "insta-empty",
        innerHTML: `Follow <a href="https://www.instagram.com/nopressureimprov/" target="_blank" rel="noopener">@nopressureimprov</a> on Instagram for the latest.`
      }));
      return;
    }
    track.innerHTML = posts.map(p => `
      <a class="insta-post" href="${esc(p.permalink)}" target="_blank" rel="noopener">
        <img src="${esc(p.imageUrl)}" alt="" loading="lazy">
        ${p.caption ? `<div class="insta-cap">${esc(p.caption)}</div>` : ""}
      </a>`).join("");
  }).catch(() => {
    track.innerHTML = `<div class="insta-empty">Couldn't load recent posts — <a href="https://www.instagram.com/nopressureimprov/" target="_blank" rel="noopener">see them on Instagram</a> instead.</div>`;
  });

  function scrollByCard(dir){
    const card = track.querySelector(".insta-post");
    const amount = card ? card.getBoundingClientRect().width + 14 : 220;
    track.scrollBy({left: dir*amount, behavior:"smooth"});
  }
  prev.addEventListener("click", ()=>scrollByCard(-1));
  next.addEventListener("click", ()=>scrollByCard(1));
})();
