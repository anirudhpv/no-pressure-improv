# No Pressure Improv — website

A small, static, multi-page site for No Pressure Improv (NPI): a homepage, an interactive
monthly events calendar, and an archive page for the Improv Marathon.

No build step, no framework, no server-side code. Plain HTML, CSS and vanilla JS. Any
static file host will serve it as-is.

## Structure

```
index.html          Homepage: hero, upcoming-events carousel, community links, calendar teaser
calendar.html        Interactive, multi-month events calendar (hover/click a date, price toggle)
shop.html            Merch shop: printed tees and block-printed totes (see below)
marathon.html        Archive page for the (completed) Improv Marathon
admin.html           Calendar editor — a form-based helper for editing events.json (see below)
robots.txt           Blocks search engines and known AI/LLM crawlers from indexing the site

partials/
  header.html        Shared header markup (brand + nav), injected into every page — see below
  footer.html         Shared footer markup, injected into every page

assets/
  data/
    events.json      Single source of truth for all events, across all months
    products.json    Shop products (t-shirts, tote bags)
  css/
    base.css         Shared tokens, header, footer, buttons — loaded by every page
    home.css         Homepage-only styles (hero, carousel, community cards)
    marathon.css     Marathon archive page styles
    calendar.css     Calendar page's own content styles (calendar grid, panels, etc.)
    shop.css         Shop page styles
    admin.css        Calendar editor page styles
  js/
    analytics.js     Google Analytics (GA4) config — loaded on every page, tracking ID lives here
    include.js       Fetches partials/header.html and partials/footer.html into every page
    home.js          Homepage carousel: fetches events.json, shows upcoming events
    calendar.js       Calendar rendering: fetches events.json, month navigation, hover/click-to-pin, price toggle, image lightbox
    shop.js          Shop rendering: fetches products.json, builds product cards
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

## The shop

`shop.html` lists products from **`assets/data/products.json`** in one flat grid, filtered
by a left-hand sidebar of checkboxes (a collapsible "Filters" button on mobile). There are
two independent facet groups, built dynamically from whatever values exist in the data:

- **Category** (`type`) — T-shirt, Tote bag, etc. — the generic kind of product.
- **Brand** (`brand`) — HartleyTees, Greenika, etc. — who actually makes it. A brand isn't
  tied to one category (Greenika could sell totes and tees both), so the two facets are
  independent: checking boxes within one group is OR'd together (Tote bag OR T-shirt),
  while the two groups are AND'd against each other (must match the category selection
  *and* the brand selection). Each card shows both as chip labels. Leaving a group's
  checkboxes all unchecked means "don't filter on this."

Each product is:

```json
{
  "id": "tee-question-everything",
  "type": "T-shirt",
  "brand": "HartleyTees",
  "name": "Question Everything",
  "desc": "Screen-printed unisex tee.",
  "variants": "Regular tee, oversized tee, sweatshirt, hoodie or zip hoodie · sizes vary by fit",
  "price": 1000,
  "priceFrom": true,
  "image": "shirt-question-everything.jpg"
}
```

`price: null` shows "TBC" (same convention as events, currently used for the tote bag,
whose price isn't set yet); `priceFrom: true` shows "From ₹X" for products with multiple
fits at different prices (the t-shirt designs — regular tee is ₹1000, going up to ₹1800
for a hoodie); `image: null` shows a "Photo coming soon" placeholder block instead of a
broken image.

The t-shirt design images were pulled from https://hartleytees.vercel.app/ (the vendor's
own catalog); the tote bag photo is a real product shot. Before this goes fully live:

- **Tote price** — fill in the tote's `price` once it's settled.
- **Order form** — checkout currently points to a placeholder Tally URL
  (`https://tally.so/r/REPLACE_WITH_MERCH_FORM`) in `assets/js/shop.js` (the `ORDER_FORM`
  constant). Build a real Tally form (name, design/fit/size, address, transaction ID) and
  swap that URL in. Payment reuses the same UPI ID/QR code already used for event
  registration.

### The cart

Each product has an "Add to cart" button instead of linking straight out to the order
form. The cart itself (icon bottom-right, with an item-count badge) is stored in the
browser's `localStorage` under the key `npi-shop-cart` — it's just an array of
`{id, qty}`, resolved against `products.json` at render time, so it survives a refresh
but is local to that one browser/device (no accounts, no server, single "session" by
design — this is still a demo site). From the cart you can adjust quantities, remove
items, copy a plain-text order summary to paste into the order form, or go straight to
checkout (which just opens the same Tally form — it doesn't know about your cart contents
until a real backend exists to receive them). "Clear cart" empties it entirely.

If this becomes a real e-commerce site, this is the piece that moves server-side first:
the cart would live behind an account/session instead of `localStorage`, and checkout
would submit the cart directly instead of asking someone to retype it into a form.

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
