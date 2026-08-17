# DeHaat Honest Farms — Category Creation & Scale Acceleration

A long-form strategy website built from the DHF Business Leadership Challenge
deck (ISB CGMO Cohort II, Team 1), rebuilt in the Honest Farms brand system.
Not a slide deck — one continuous scrolling page with six chapters, a sticky
chapter nav, parallax photo bands and live charts.

**Deploy target:** Cloudflare Workers · project name `sabika-dhf-project`

---

## What's here

```
site/
  index.html      the page — hero, TL;DR, six chapters, close
  styles.css      brand system + layout (self-contained)
  app.js          scroll spy, parallax, reveals, counters, SVG charts
  fonts/          Archivo Black + Nunito Sans + Noto Sans Devanagari (woff2)
  assets/         logo, competitor packs, field photography, press, marks
tools/bundle.mjs  single-file export
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

Type is taken straight off the logo. **Archivo Black** for display — it matches
the heavy, slightly condensed HONEST FARMS wordmark on the blue banner.
**Nunito Sans** for everything else — it echoes the rounded warmth of the
DeHaat wordmark and holds up at long reading lengths. **Noto Sans Devanagari**
carries the धन्यवाद sign-off.

Structure: paper-toned content sections alternating with a warm sand tint,
broken by full-bleed dark photo bands that open each of the six chapters, plus
dark sections for the manifesto, the North Star and the close.

## Interactions

- Sticky header that rides transparent over the hero and solidifies on scroll,
  with a read-progress bar and a scroll-spy chapter nav
- Parallax on every full-bleed photo band and the hero
- Reveal-on-scroll for every block, staggered within a group
- Animated stat counters
- A TL;DR at the top: the whole argument in six linked cards
- Accordion phase cards, a TAM/SAM/SOM selector, a quote carousel, a
  four-persona explorer, a clickable moat ladder, an FY27/FY31 chart toggle
- Hover tooltips on every chart
- Mobile drawer nav, back-to-top, and `prefers-reduced-motion` respected
  throughout

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
non-ASCII character, producing one ~5 MB HTML file that renders identically
from a file:// path, an email attachment, or a host with a strict CSP. Useful
as a fallback when there's no wifi in the room.

## Source

Rebuilt from `14TH_AUG_DHF_BLC_DECK.pptx`. Every figure, quote, factor loading
and financial number in the web deck is carried over from that file; nothing
was invented. Photography, the logo and the certification marks are extracted
from the original presentation.

---

## HTML slide deck

```bash
node tools/build-html-deck.js                     # site/deck/index.html
node tools/shoot-deck.js  out/                    # screenshot + fit check
node tools/check-scroll.js                        # navigation smoke test
node tools/check-crops.js                         # picture cropping audit
node tools/dump-html-deck.js                      # per-slide text dump
python3 tools/verify-fidelity.py <source.pptx>    # per-slide fidelity audit
node tools/bundle-deck.mjs DHF-Honest-Farms-Deck.html   # one self-contained file
```

The same 28 slides as the .pptx, in the browser. The stage is 1280×720 —
96px to the inch — so every measure carries straight across from the PowerPoint
build and the two stay in step.

**It scrolls.** One long page with CSS scroll-snap: a slide at a time, snapped
to the viewport centre, driven by the wheel, the trackpad, a swipe, the arrow
keys or the space bar. `G` opens a contact sheet of all 28; click one to jump.
`F` is fullscreen, `?` lists the keys. The slide number lives in the URL hash,
so `#12` is a shareable link to slide 12.

**It's editable.** `E` turns on edit mode and every heading, paragraph, bullet,
table cell and chart label becomes editable in place — 811 text nodes. Edits
save to the browser as you type and survive a refresh; the download button
writes a copy with the edits baked in, and Reset restores the original wording.
Nothing leaves the page.

Charts are HTML and CSS — bars are divs with a width or height percentage, so
they inherit the type and colour tokens and stay editable like everything else.

### Pictures

Every photograph is the one the source deck carries **on that slide**, pulled
from the `.pptx` at full resolution: the team at the pond on slide 1, the
Honestly Better key visual on 6, the shelf strip and press clippings on 13, the
harvest frame behind the purpose statement on 15, Meet the Producer and the
toor dal pack on 16, the carton and phone on 17, the warehouse on 20, the
value-added flat lay and the pulses grid on 21, wheat on 22, spices on 23, the
store interior on 24, the sapling on 28.

**Nothing is cropped.** Each figure is set to its picture's own aspect ratio and
the picture is `object-fit: contain` inside it, so a row of mixed portrait and
landscape shots lines up on a shared baseline without a single edge being cut.
`check-crops.js` measures every placed picture and reports anything losing more
than 1% of its frame, or upscaled past 1.6×. Current result: **63 pictures, no
photograph cropped and none upscaled** — the only entries are the transparent
gradient overlays on the three full-bleed slides, at 1.2% of a gradient.

### Fidelity audit

`verify-fidelity.py` checks the deck slide by slide: every string rendered on
HTML slide N has to be traceable to slide N of the source `.pptx` — its text
frames, tables, chart categories, chart series names, cached chart values and
speaker notes. Anything that is not is reported, and re-checked against the
rest of the deck so a string borrowed from another slide is labelled rather
than hidden.

Current result: **28 slides, 693 of 696 strings traced to their own source
slide.** The three exceptions are the section marker *Growth engine design* on
slides 22, 23 and 25 — verbatim from the phase list on source slide 2, used
where those slides carry no label of their own.

Every digit on the deck is checked the same way. Beyond the page numbers, nine
list markers remain: `01`–`04` on slide 7 and `01`–`03` on slide 21, where the
source itself says "four tensions" and "three tension points", and `1`–`4` on
slide 24's four-step sequence. No figure, chart value, percentage or currency
amount appears anywhere it does not appear in the source.

### Hosting it on Cloudflare

`wrangler.toml` serves `site/` as static assets on the Worker
`sabika-dhf-project`, putting the deck at **`/deck/`** and the long-form page at
`/`. Verified against the real Workers runtime with `wrangler dev`, and
`wrangler deploy --dry-run` reads all 81 assets cleanly.

Three ways to publish it — Cloudflare building the repo itself (no secret
anywhere), GitHub Actions (one repository secret), or one command locally — are
written out in **[DEPLOY.md](DEPLOY.md)**, along with why the Claude session
itself could not reach Cloudflare.

`tools/bundle-deck.mjs` also emits a single ~7.6 MB HTML file with the fonts,
images, CSS and JS inlined as data URIs — one file to email or open from a USB
stick, no assets folder required.

---

## Editable slide deck (PowerPoint / Canva / Google Slides)

```bash
node tools/build-deck.js DHF-Honest-Farms-Deck.pptx
python3 tools/check-deck.py DHF-Honest-Farms-Deck.pptx    # layout QA
```

**28 slides at 16:9, mapped one-to-one onto the 28 slides of
`14TH_AUG_DHF_BLC_DECK.pptx`.** Same slide count, same order, same content —
redrawn in the Honest Farms brand system. No slide was added, split, merged or
invented: slide 7 here is slide 7 there.

Every figure was diffed against the source before shipping. All 266 numeric
tokens in the original are carried over; every chart value, factor loading,
segment score and financial line reconciles to the source deck's text, tables
and cached chart XML. Prose is the deck's own — where a sentence was shortened
it is a strict subset of the original, never a rewrite. Speaker notes stay
speaker notes (slides 15, 16 and 18).

Design system:

- The blue banner from the logo lockup is the section marker on every content
  slide — the deck's one repeated motif, taken from the mark itself.
- **No strokes.** Panels are edgeless tinted planes with a soft shadow; stats
  are a rule, a number and a caption rather than a bordered card. A zero-width
  line in OOXML lets the theme's default outline through, so every panel paints
  its stroke in its own fill colour instead.
- Brand mark top-right throughout; the footer carries a hairline, the chapter
  and a display page number.
- Every chart is drawn from native shapes — rectangles, lines and text boxes —
  rather than an embedded chart object or a picture, so the bars stay
  selectable and editable after a Canva import.

**Importing into Canva:** Canva home → **Create a design** → **Import file** →
choose the `.pptx`. Canva converts it into a normal, fully editable Canva
presentation. Archivo Black and Nunito Sans are both in Canva's font library,
so the type maps across without substitution.

### Seeing it without LibreOffice

LibreOffice cannot run in this build environment, so two scripts stand in:

```bash
python3 tools/check-deck.py  DHF-Honest-Farms-Deck.pptx      # geometry QA
python3 tools/render-deck.py DHF-Honest-Farms-Deck.pptx out/ # visual render
```

`check-deck.py` measures shapes falling outside the page, text that cannot fit
its box at the stated point size, and overlapping text boxes. The shipped deck
reports 0 / 0 / 0.

`render-deck.py` rasterises the deck with Pillow using the real brand fonts —
honouring fills, transparency, corner radii, images with alpha, per-run type,
alignment and wrapping with true metrics. It also does per-character font
fallback the way PowerPoint does, which is how we found that Archivo Black
carries no ₹ glyph: every rupee figure falls back to Nunito Sans, in the deck
and in this preview alike.
