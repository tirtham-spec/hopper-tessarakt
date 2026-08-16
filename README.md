# DeHaat Honest Farms — Category Creation & Scale Acceleration

An interactive web version of the DHF Business Leadership Challenge deck
(ISB CGMO Cohort II, Team 1), rebuilt in the Honest Farms brand system.

**Deploy target:** Cloudflare Workers · project name `sabika-dhf-project`

---

## What's here

```
site/
  index.html      28 slides, one <section> each
  styles.css      brand system + layout (self-contained)
  app.js          navigation, reveal, counters, interactions, SVG charts
  fonts/          Fraunces + Inter + Noto Serif Devanagari (self-hosted woff2)
  assets/         logo, pack shots, field photography, certification marks
wrangler.toml     Cloudflare Workers static-asset config
```

No build step and no external requests — fonts, images, CSS and JS all ship
from the same origin, so the deck works offline and on a conference wifi.

## Design system

| Token | Value | Use |
|---|---|---|
| Brand blue | `#3A5D97` | Sampled from the Honest Farms logo banner — data, structure |
| Brand green | `#1B804A` / `#2FA362` | Sampled from the DeHaat wordmark — proof, growth, emphasis |
| Ink | `#0D1B2A` | Dark slides, headlines |
| Paper | `#FBF8F3` | Light slides |
| Harvest gold | `#C8922E` | The empty price corridor, opportunity |
| Clay | `#A63E28` | Risk, tension, "what we never say" |

Type: **Fraunces** (display) + **Inter** (UI/body) + **Noto Serif Devanagari**
(the धन्यवाद sign-off).

Structure: light content slides sandwiched between dark slides at the title,
the manifesto, the North Star, the Part V divider and the close.

## Interactions

| Control | Behaviour |
|---|---|
| `→` `↓` `Space` / `←` `↑` | Next / previous slide |
| `G` | Slide overview grid — jump to any of the 28 |
| `Home` / `End` | First / last slide |
| `?` | Keyboard help |
| `Esc` | Close overlays |
| Swipe | Horizontal swipe navigates on touch |

Plus, in-slide: expandable phase cards, a TAM/SAM/SOM selector, a quote
carousel, a four-persona explorer, selectable brand values, a clickable moat
ladder, an FY27/FY31 chart toggle, animated stat counters, and hover tooltips
on every chart.

## Charts

All charts are hand-built SVG (no library), rendered on first view and driven
by the numbers extracted from the source deck:

- Toor dal price ladder with the empty ₹150–250 corridor
- Imitation risk — months to copy, nine DHF advantages
- Shopping channels used (n=305)
- Willingness to pay 11%+ by segment
- Top driver for trying a new brand
- Portfolio mix vs portfolio growth
- Revenue trajectory FY26 → FY31 (₹53 Cr → ₹748 Cr)
- Revenue by category, FY27 vs FY31
- Channel mix at FY31

## Running it locally

```bash
npm run serve       # http://localhost:8080
```

## Deploying to Cloudflare

### Option A — connect this repo in the dashboard (auto-deploys on push)

Cloudflare dashboard → **Compute (Workers)** → **Create** → **Workers** →
**Import a repository**, then:

| Field | Value |
|---|---|
| Repository | `tirtham-spec/hopper-tessarakt` |
| Branch | `claude/honest-farms-ppt-design-l0mql0` |
| Project name | `sabika-dhf-project` |
| Root directory | `/` |
| Build command | *(leave empty — there is no build step)* |
| Deploy command | `npx wrangler deploy` |

`wrangler.toml` at the repo root supplies the rest: it names the Worker
`sabika-dhf-project` and serves `site/` as static assets. Every push to the
branch redeploys.

Result: `https://sabika-dhf-project.<your-subdomain>.workers.dev`

### Option B — deploy from your machine

```bash
npm install
export CLOUDFLARE_API_TOKEN=...      # "Edit Cloudflare Workers" template
export CLOUDFLARE_ACCOUNT_ID=...
npm run deploy
```

## Single-file export

```bash
node tools/bundle.mjs honest-farms-deck.html
```

Inlines the CSS, JS, fonts and images as data URIs and escapes every
non-ASCII character, producing one ~4 MB HTML file that renders identically
from a file:// path, an email attachment, or a host with a strict CSP. Useful
as a presenting fallback when there's no wifi in the room.

## Source

Rebuilt from `14TH_AUG_DHF_BLC_DECK.pptx`. Every figure, quote, factor loading
and financial number in the web deck is carried over from that file; nothing
was invented. Photography, the logo and the certification marks are extracted
from the original presentation.
