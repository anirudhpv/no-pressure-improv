# No Pressure Improv — website

A small, static, multi-page site for No Pressure Improv (NPI): a homepage, an interactive
monthly events calendar, and an archive page for the Improv Marathon.

No build step, no framework, no server-side code. Plain HTML, CSS and vanilla JS. Any
static file host will serve it as-is.

## Structure

```
index.html          Homepage: hero, upcoming-events carousel, community links, calendar teaser
calendar.html        Interactive, multi-month events calendar (hover/click a date, price toggle)
marathon.html        Archive page for the (completed) Improv Marathon
admin.html           Calendar editor — a form-based helper for editing events.json (see below)
robots.txt           Blocks search engines and known AI/LLM crawlers from indexing the site

partials/
  header.html        Shared header markup (brand + nav), injected into every page — see below
  footer.html         Shared footer markup, injected into every page

assets/
  data/
    events.json      Single source of truth for all events, across all months
  css/
    base.css         Shared tokens, header, footer, buttons — loaded by every page
    home.css         Homepage-only styles (hero, carousel, community cards)
    marathon.css     Marathon archive page styles
    calendar.css     Calendar page's own content styles (calendar grid, panels, etc.)
    admin.css        Calendar editor page styles
  js/
    include.js       Fetches partials/header.html and partials/footer.html into every page
    home.js          Homepage carousel: fetches events.json, shows upcoming events
    calendar.js       Calendar rendering: fetches events.json, month navigation, hover/click-to-pin, price toggle, image lightbox
    admin.js         Calendar editor: fetches events.json, lets you add/edit/delete events client-side, exports updated JSON
  images/
    logo.png
    event-04.jpg, event-11.jpg, event-13.jpg, event-19.jpg,
    event-21.jpg, event-25.jpg, event-28.jpg   Event posters
    qr-code.jpg, financial-assistance.jpg      Used on the calendar page's registration section
```

## The shared header and footer

Every page has the exact same header (logo linking home, then Calendar/Marathon nav) and
footer (© line + Instagram link). Rather than copy-pasting that markup into every file
(which drifts out of sync over time), each page just has a mount point:

```html
<header class="top" id="site-header" data-include="partials/header.html"></header>
...
<footer id="site-footer" data-include="partials/footer.html"></footer>
```

`assets/js/include.js` (loaded on every page) fetches those two files and drops their
content into the matching element, and marks whichever nav link matches the current page
with `aria-current="page"` automatically — no per-page configuration needed. All shared
visual styling (colors, fonts, spacing) for the header/footer/brand lives in `base.css`
only, which every page loads (including `calendar.html`, whose own `calendar.css` handles
just its page-specific content).

To change the header or footer, edit the one file in `partials/` — every page picks it up.

Because this relies on `fetch()`, viewing a page by double-clicking the `.html` file
(`file://`) won't load the header/footer — serve the folder over local HTTP when testing
(e.g. `python -m http.server`) or just push and view it on the deployed site.

## Editing the event data

All events — for every month, past and future — live in one file: **`assets/data/events.json`**.
Both the homepage carousel and the full calendar read from it, so there's only one place to edit.

Each event is:

```json
{
  "date": "2026-09-04",
  "start": "19:00", "end": "21:00",
  "format": "inperson",
  "kind": "Improv Jam",
  "title": "Quit Playin' Games With My Heart",
  "host": "Shweta & Samyukthaa",
  "venue": "Shubham SSPA, JP Nagar",
  "venueLink": null,
  "desc": "An Improv Jam for everyone. We'll play silly games and have fun.",
  "price": null,
  "image": "event-04.jpg"
}
```

`price: null` shows "TBC" until you fill it in. `venueLink` is optional (a Google Maps
link, or an online meeting link) — when set, the venue on the calendar page becomes a
link; leave it `null` to show plain text. `image` must match a filename already uploaded
to `assets/images/`.

You can hand-edit `events.json` directly, or use **`admin.html`**, a small form-based
helper: it loads the current events, lets you add/edit/delete them through a form, and
generates the updated JSON for you to download or copy. It isn't linked from anywhere on
the site (and is blocked from indexing like everything else — see below) — it doesn't save
automatically either, since this is a static site with no backend or login. The flow is
always: edit in `admin.html` → download/copy the updated `events.json` → replace the file
in the repo → commit and push.

Note for later: this JSON file is a placeholder for a real database. If/when this site
gets a backend, `admin.html`'s form becomes the UI for a real "save" action instead of a
download, and `events.json` goes away in favor of an API call.

Registration currently links out to a Tally form (`https://tally.so/r/gDoGBM`). Update
that URL in `calendar.html` and `calendar.js` if the form changes.

## Keeping this off search engines and AI crawlers

`robots.txt` disallows all crawlers, plus explicit entries for known AI/LLM bots (GPTBot,
ClaudeBot, CCBot, Google-Extended, etc.), and every page carries a
`<meta name="robots" content="noindex, nofollow, ...">` tag. This is best-effort, not
access control — the site is still public to anyone with the link, and a public GitHub
repo's source is separately visible on github.com regardless of robots.txt (which only
governs the Pages site). It stops well-behaved crawlers from indexing it; it doesn't
password-protect it.

## Deploying

This is static output — push it to any static host:

- **GitHub Pages:** Settings → Pages → Deploy from branch → pick this branch and `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages:** point the project at this repo, no build command,
  publish directory `/`.
- **Any web server (Apache, Nginx, S3, etc.):** upload the contents of this folder as-is.

There is no `.env`, no API keys, and no server-side dependency — everything runs in the
browser.

## Known follow-ups

- `calendar.html`'s page content (calendar grid, event panels, etc. — everything below the
  shared header) still uses a different color palette and font pairing from `index.html` /
  `marathon.html` (it predates the homepage redesign); only the header/footer are unified.
  Worth unifying the rest into one design system if this becomes the permanent site rather
  than a demo.
- The Marathon archive page uses plain color-block cards for its lineup instead of photos —
  the original event's photos live only on the external NPI site and weren't available to
  pull into this repo.
