# No Pressure Improv — website

A small, static, multi-page site for No Pressure Improv (NPI): a homepage, an interactive
monthly events calendar, and an archive page for the Improv Marathon.

No build step, no framework, no server-side code. Plain HTML, CSS and vanilla JS. Any
static file host will serve it as-is.

## Structure

```
index.html          Homepage: hero, September carousel, community links, calendar teaser
calendar.html        Interactive September 2026 events calendar (hover/click a date, price toggle)
marathon.html        Archive page for the (completed) Improv Marathon

assets/
  css/
    base.css         Shared tokens, header, footer, buttons — used by index.html and marathon.html
    home.css         Homepage-only styles (hero, carousel, community cards)
    marathon.css     Marathon archive page styles
    calendar.css     Calendar page styles (its own, separate design system)
  js/
    home.js          Homepage carousel logic + event data for the carousel
    calendar.js       Calendar rendering, hover/click-to-pin, price toggle, image lightbox
  images/
    logo.png
    event-04.jpg, event-11.jpg, event-13.jpg, event-19.jpg,
    event-21.jpg, event-25.jpg, event-28.jpg   Event posters
    qr-code.jpg, financial-assistance.jpg      Used on the calendar page's registration section
```

`calendar.html` intentionally keeps its own visual identity (it was designed and shipped
before the homepage refresh) — it links back to the homepage and the Marathon page via a
thin nav bar at the top, rather than sharing `base.css`.

## Editing the event data

- **Carousel (homepage):** edit the `EVENTS` array at the top of `assets/js/home.js`.
- **Full calendar:** edit the `EVENTS` array in `assets/js/calendar.js` (near the top,
  right after the `IMG` map). Each event has a `day`, `img` key (must match a key in
  `IMG`), start/end time, format (`inperson` or `online`), kind, title, host, venue,
  description, and price (`null` shows "TBC" until you fill it in).
- Add a poster image to `assets/images/`, then add its filename to the `IMG` map in
  `assets/js/calendar.js` under a short key, and reference that key from the event's
  `img` field.
- Registration currently links out to a Tally form (`https://tally.so/r/gDoGBM`). Update
  that URL in `calendar.html` and `calendar.js` if the form changes.

## Deploying

This is static output — push it to any static host:

- **GitHub Pages:** Settings → Pages → Deploy from branch → pick this branch and `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages:** point the project at this repo, no build command,
  publish directory `/`.
- **Any web server (Apache, Nginx, S3, etc.):** upload the contents of this folder as-is.

There is no `.env`, no API keys, and no server-side dependency — everything runs in the
browser.

## Known follow-ups

- `calendar.html` uses a different color palette and font pairing from `index.html` /
  `marathon.html` (it predates the homepage redesign). Worth unifying into one design
  system if this becomes the permanent site rather than a demo.
- The Marathon archive page uses plain color-block cards for its lineup instead of photos —
  the original event's photos live only on the external NPI site and weren't available to
  pull into this repo.
