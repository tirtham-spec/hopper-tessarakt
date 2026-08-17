/**
 * DeHaat Honest Farms — builds the HTML slide deck at site/deck/index.html.
 *
 * 28 slides, one-to-one with 14TH_AUG_DHF_BLC_DECK.pptx, carrying the same
 * text, the same numbers and the same photography. The stage is 1280×720 so
 * 96px = 1in and every measure maps straight across from the .pptx build.
 *
 *   node tools/build-html-deck.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'site', 'deck', 'index.html');
const A = f => '../assets/' + f;

// escape, but leave an already-formed entity alone so authored &amp; survives
const E = s => String(s)
  .replace(/&(?!(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BR = s => E(s).replace(/\n/g, '<br>');

/* ── slide registry ─────────────────────────────────────────────── */
const SLIDES = [];
const slide = (o) => SLIDES.push(o);

/* ── components ─────────────────────────────────────────────────── */
const head = (eyebrow, title, lead, cls) => `
      <header class="head">
        <span class="banner">${E(eyebrow)}</span>
        <img class="mark" src="${A('logo.png')}" alt="DeHaat Honest Farms">
        <h2${cls ? ` class="${cls}"` : ''}>${E(title)}</h2>
        ${lead ? `<p class="lead">${E(lead)}</p>` : ''}
      </header>`;

const rule = t => `<h3 class="rule">${E(t)}</h3>`;
const card = (inner, cls = '') => `<div class="card${cls ? ' ' + cls : ''}">${inner}</div>`;
const box = (title, body, tone) =>
  `<div class="box ${tone}">${title ? `<b>${E(title)}</b>` : ''}<p>${BR(body)}</p></div>`;
const stat = (v, l, tone = 't-blue', size = '') =>
  `<div class="stat ${tone}${size ? ' ' + size : ''}"><b>${E(v)}</b><span>${BR(l)}</span></div>`;
const ul = (arr, cls = '') =>
  `<ul${cls ? ` class="${cls}"` : ''}>${arr.map(t => `<li>${E(t)}</li>`).join('')}</ul>`;
const lbl = (t, cls = '') => `<div class="lbl${cls ? ' ' + cls : ''}">${E(t)}</div>`;
// every picture is placed at its own aspect ratio, so nothing is cropped
const RATIO = {
  's01-team-field.jpg': 1.776, 's06-honestly-better.jpg': 1, 's15-harvest.jpg': 1.776,
  's16-meet-the-producer.jpg': 1, 's16-pack-toordal.jpg': 0.667, 's17-carton-phone.jpg': 1.5,
  's20-warehouse.jpg': 1.776, 's21-value-added.jpg': 1.5, 's21-pulses.jpg': 1,
  's22-wheat.jpg': 0.667, 's23-spices.jpg': 0.559, 's24-store.jpg': 1.779,
  's28-sapling.jpg': 1.5,
  'news-ccpa.jpg': 0.75, 'news-ndtv.jpg': 1.78, 'news-c.jpg': 1.78, 'news-3.jpg': 0.75,
  'news-b.jpg': 1.78, 'shelf-jars.jpg': 1.93, 'shelf-poha.jpg': 1.664,
  'shelf-twobrothers.jpg': 0.701, 'shelf-tribalveda.jpg': 0.69, 'shelf-ingress.jpg': 0.704,
  'pk-vedaka.jpg': 0.643, 'pk-fortune.jpg': 0.912, 'pk-tatasampann.jpg': 0.789,
  'pk-conscious.jpg': 0.834, 'pk-24mantra.jpg': 1
};
const band = (src, h, cls = '') =>
  `<div class="pic" style="height:${h}px">${fig(src, cls, `height:${h}px;width:auto;max-width:100%`)}</div>`;
const fig = (src, cls = '', style = '') =>
  `<figure${cls ? ` class="${cls}"` : ''} style="${RATIO[src] ? `aspect-ratio:${RATIO[src]};` : ''}${style}"><img src="${A(src)}" alt=""></figure>`;

const hbars = (rows, max) => `<div class="hbars">${rows.map(r => `
          <div class="hbar"><span class="hl">${E(r.l)}</span><span class="hv ${r.t}">${E(r.d)}${r.d2 ? `<em>${E(r.d2)}</em>` : ''}</span><i class="${r.t}" style="--w:${(r.v / max * 100).toFixed(1)}%"></i></div>`).join('')}
        </div>`;

const vbars = (rows, max, o = {}) => `<div class="chart" style="--ph:${o.h || 250}px${o.gap ? `;--gap:${o.gap}px` : ''}">
          <div class="plot${o.nogrid ? ' nogrid' : ''}">${o.band ? `
            <div class="band" style="top:${((1 - o.band[1] / max) * 100).toFixed(1)}%;height:${((o.band[1] - o.band[0]) / max * 100).toFixed(1)}%">${o.bandLabel ? `<span>${E(o.bandLabel)}</span>` : ''}</div>` : ''}${rows.map(r => `
            <div class="col ${r.t}"><b>${E(r.d)}</b><i style="--p:${(r.v / max * 100).toFixed(1)}%"></i></div>`).join('')}
          </div>
          <div class="xaxis">${rows.map(r => `<span>${BR(r.l)}</span>`).join('')}</div>
        </div>`;

const gbars = (rows, max, legend, o = {}) => `<div class="chart" style="--ph:${o.h || 250}px">
          <div class="plot">${rows.map(r => `
            <div class="col grp">${r.v.map((v, i) => `<div class="sub ${legend[i].t}"><b>${E(r.d[i])}</b><i style="--p:${(v / max * 100).toFixed(1)}%"></i></div>`).join('')}</div>`).join('')}
          </div>
          <div class="xaxis">${rows.map(r => `<span>${BR(r.l)}</span>`).join('')}</div>
          <div class="legend">${legend.map(g => `<span class="${g.t}"><i></i>${E(g.n)}</span>`).join('')}</div>
        </div>`;

/* ═══════════════ 01 · TITLE ═══════════════ */
slide({ bleed: true, dark: true, nofoot: true, html: `
      <div class="bleed-img"><img src="${A('s01-team-field.jpg')}" alt=""></div>
      <div class="veil"><img src="${A('veil-h.png')}" alt=""></div>
      <div class="cover">
        <p class="eyebrow">ISB CGMO Cohort II  ·  Business Leadership Challenge</p>
        <img class="logo" src="${A('logo.png')}" alt="DeHaat Honest Farms">
        <h1>DeHaat Honest Farms:<em>Category Creation &amp; Scale Acceleration</em></h1>
        <div class="team">
          <span class="badge">TEAM 1</span>
          <p>Sabika Mirza   ·   Sharon Batliwalla   ·   Syed Kashif Ali   ·   Sonu Adarsh   ·   Abhishek Nandan</p>
        </div>
      </div>` });

/* ═══════════════ 02 · THE MANDATE ═══════════════ */
{
  const phases = [
    ['PHASE 1', 'DIAGNOSE &amp; DECODE', 'Build a shared, fact-based understanding of category, competition &amp; consumer',
      ['Category &amp; consumer insight base', 'Trust tension map + segmentation', 'Imitation risk heatmap', 'Internal diagnosis snapshot']],
    ['PHASE 2', 'CATEGORY &amp; BRAND STRATEGY', 'Define what DHF must own in the mind of the consumers',
      ['Category creation framework', 'Positioning &amp; Brand Architecture', 'Proof hierarchy', 'Codified Pesticide-Free standard']],
    ['PHASE 3', 'GROWTH ENGINE DESIGN', 'Decide where to play and how to win – the moat',
      ['Top growth drivers', 'Hero SKU list (10–15 SKUs)', 'Channel role matrix', 'Competitive defense playbook']],
    ['PHASE 4', 'SCALE BLUEPRINT', 'Build a sustainable, funded path to growth',
      ['5-year growth ambition', 'Investment &amp; capital roadmap', 'Category Rulebook &amp; governance', 'Operating model + KPI framework']]
  ];
  const ev = [
    ['305', 'Respondents for Quantitative survey. 5 metros · Fielded 28–29 May 2026, by 1Lattice'],
    ['31+', 'Qualitative respondents\n6 cities · intercepts, IDIs, ethnography'],
    ['₹90.9 Cr', 'Internal revenue audited\n4,365 MT · 8 half-years · 8 channels'],
    ['4', 'Competitors benchmarked\n11 DHF advantages stress-tested']
  ];
  slide({
    chapter: 'The mandate',
    html: head('The mandate', 'Scale DHF from ₹53 Cr (FY26) to ₹300+ Cr in three years.',
      'Not by outspending organic, but by creating and owning a category that does not yet formally exist.') + `
      <div class="body stack gap-lg spread">
        <div class="g4">${phases.map(([n, t, d, o]) => card(`
            <div class="lbl g">${n}</div>
            <h4 style="font-family:var(--fd);font-weight:400;font-size:17px;line-height:1.16;margin:8px 0 10px;color:var(--ink)">${t}</h4>
            <p style="font-size:12px;color:var(--tx2);line-height:1.38;margin-bottom:11px">${d}</p>
            ${ul(o.map(x => x.replace(/&amp;/g, '&')), 'tight')}`, 'tl fill" style="--c:var(--green)')).join('')}
        </div>
        <div>
          ${rule('The evidence base')}
          <div class="g4">${ev.map(([v, l]) => `<div><b class="num" style="font-size:27px;color:var(--blue);display:block">${E(v)}</b><span style="display:block;font-size:11.5px;color:var(--tx2);line-height:1.34;padding-top:6px">${BR(l)}</span></div>`).join('')}
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 03 · THE WHITESPACE ═══════════════ */
{
  const stats = [
    ['84%', 'Indian consumers are extremely or very concerned about food safety (PwC Voice of the Consumer 2025)', ''],
    ['35.9%', 'Share of monitored samples with detectable residues, up from 22.6% in 2018–19', ''],
    ['2.8%', 'Of 86,401 FSSAI samples tested 2022–25 breached maximum residue limits', ''],
    ['$8.6B → $22B', 'India organic food, 2024 → 2033 (CAGR ~11%)', 'sm']
  ];
  const tam = [
    ['TAM', '₹48,000 Cr', 100, 'var(--blue)', "Pesticide-free food across the top 300 cities. Anchored to Technopak's 5–6% organic-of-packaged-food potential (₹35,000 Cr), uplifted 1.3–1.5× because pesticide-free prices below organic."],
    ['SAM', '₹13,500 Cr', 28, 'var(--green2)', 'A 28% serviceability factor: staples, pulses, rice, spices and select value-added, sold through quick commerce, e-commerce and modern trade to ~25 Mn health-conscious households.'],
    ['SOM', '₹300–350 Cr', 2.6, 'var(--green)', 'The three-year ambition — 2.2–2.6% of SAM, 0.6–0.7% of TAM. Five-year aspiration ₹700–800 Cr.']
  ];
  const reasons = [
    'No standard definition, "pesticide-free" is not a regulated term in India',
    'Harder to prove than to claim; proof lives in back-end systems, not on pack',
    'Awkward economics; trust-led cost structure at a mass-premium price',
    'No player has codified or defended it; the term commoditizes before standards exist'
  ];
  slide({
    chapter: 'The category', src: 'Source: *Technopak Report 2022-23',
    html: head('The category', 'A ₹48,000 Cr Category with No Definition, No Standard, and No Owner.',
      'The whitespace is regulatory and semantic, not just commercial.') + `
      <div class="body stack gap-lg spread">
        <div class="g4">${stats.map(([v, l, s]) => stat(v, l, 't-blue', s)).join('')}</div>
        <div class="split s-53">
          <div>
            ${rule('Sizing the pesticide-free opportunity')}
            <div class="stack sm">${tam.map(([tag, v, pct, c, note]) => card(`
              <div style="display:grid;grid-template-columns:52px 128px 1fr;gap:14px;align-items:start">
                <span class="lbl b">${tag}</span>
                <div><b class="num" style="font-size:19px;color:var(--ink);display:block">${E(v)}</b>
                  <i style="display:block;height:7px;border-radius:4px;background:var(--sand2);margin-top:9px;position:relative"><s style="position:absolute;inset:0 auto 0 0;width:${pct}%;min-width:5px;border-radius:4px;background:${c}"></s></i></div>
                <p style="font-size:11px;color:var(--tx2);line-height:1.34">${E(note)}</p>
              </div>`, 'flat" style="padding:12px 14px')).join('')}
            </div>
          </div>
          <div>
            ${rule('Why the category has not formed yet')}
            <div class="stack sm" style="margin-bottom:16px">${reasons.map(t => `
              <div style="display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start">
                <i style="width:7px;height:7px;border-radius:2px;background:var(--green);margin-top:5px"></i>
                <p style="font-size:12.5px;color:var(--tx2);line-height:1.36">${E(t)}</p>
              </div>`).join('')}
            </div>
            ${box('DEMAND IS REAL. BELIEF IS THE BOTTLENECK.',
              'Indian shoppers will pay ~20% more for low-impact products — the highest of 11 countries surveyed; yet ~60% fear greenwashing and only ~29% trust corporate environmental claims.', 'green')}
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 04 · CATEGORY STRUCTURE ═══════════════ */
{
  const tiers = [
    ['pk-vedaka.jpg', 'RETAILER &amp; REGIONAL PRIVATE LABEL', 'Retailer QA and lab testing.', 'No Ownable Narrative'],
    ['pk-fortune.jpg', 'CONVENTIONAL NATIONAL PACKAGED', 'Factory &amp; FSSAI process credibility.', 'Trust Story shallow, easily copied.'],
    ['pk-tatasampann.jpg', 'NATURAL OR NUTRITION-LED', 'Process + Nutrition + Brand Legacy.', 'Natural reads wholesome, Not Safer.'],
    ['pk-conscious.jpg', 'CLEAN-LABEL / PROVENANCE CHALLENGERS', 'Sourcing stories.', 'Premium, fragmented, No Mass Trust Code.'],
    ['pk-24mantra.jpg', 'CERTIFIED ORGANIC SPECIALISTS', 'NPOP/NOP certification + traceability.', 'Structurally higher price ladder; Scale Friction.']
  ];
  slide({
    chapter: 'The category',
    html: head('The price ladder', 'Category Structure: Laddering on pricing & claims') + `
      <div class="body stack gap-lg spread">
        <div class="g5">${tiers.map(([img, t, a, b]) => card(`
            ${band(img, 96, 'white')}
            <h4 style="font-size:11px;font-weight:800;letter-spacing:.03em;line-height:1.28;margin:11px 0 7px;color:var(--ink)">${t}</h4>
            <p style="font-size:11px;color:var(--tx2);line-height:1.32">${a}</p>
            <p style="font-size:11px;color:var(--clay);font-weight:700;line-height:1.32;margin-top:4px">${b}</p>`, 'fill')).join('')}
        </div>
        <div>
          ${rule('The price ladder: toor dal, ₹ / kg')}
          ${vbars([
            { l: 'Vedaka\n(private label)', v: 136, d: '₹136', t: 't-blue2' },
            { l: 'Fortune', v: 145, d: '₹145', t: 't-blue2' },
            { l: 'Tata Sampann', v: 156, d: '₹156', t: 't-blue' },
            { l: 'BB Royal\nOrganic', v: 157, d: '₹157', t: 't-gold' },
            { l: 'Organic Tattva', v: 255, d: '₹255', t: 't-green' },
            { l: 'Tata Sampann\nOrganic', v: 257, d: '₹257', t: 't-green' },
            { l: '24 Mantra\nOrganic', v: 306, d: '₹306', t: 't-green' }
          ], 345, { h: 206, gap: 26 })}
        </div>
      </div>`
  });
}

/* ═══════════════ 05 · PROOF & CLAIMS BENCHMARKING ═══════════════ */
{
  const brands = [
    ['Organic Tattva', 'QR: YES', 'ok', '250-parameter farm-level residue test, QR on every pack to the batch report. The category benchmark.', false],
    ['24 Mantra  (ITC)', 'QR: NO', '', 'EU + USDA + NPOP certification, 1.4 lakh acres, 27,500 farmers. Logos are the proof — no consumer-facing test report.', false],
    ['Tata Sampann', 'QR: NO', '', 'Brand trust plus an "unpolished" visual cue and a celebrity anchor. No public batch-level residue disclosure.', false],
    ['Organic India  (Tata)', 'QR: NO', '', 'Certification-heavy — USDA, EU, NPOP, Kosher — across 35+ export markets. Logos, not data.', false],
    ['DeHaat Honest Farms', 'QR: GAP', 'gap', '230+ pesticide checks, batch-level testing, failing lots rejected. All of it invisible to the shopper.', true]
  ];
  slide({
    chapter: 'The category', src: 'Source: *Technopak Report 2022-23',
    html: head('The proof benchmark', 'Proof & Claims Benchmarking') + `
      <div class="body stack spread">
        <div>
          ${rule('Who can actually show their work')}
          <div class="g5">${brands.map(([n, chip, cc, d, dhf]) => card(`
              <h4 style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:8px">${E(n)}</h4>
              <span class="chip ${cc}">${E(chip)}</span>
              <p style="font-size:10.5px;line-height:1.32;margin-top:7px;color:${dhf ? 'var(--clay)' : 'var(--tx2)'}">${E(d)}</p>`,
            (dhf ? 'pick ' : '') + 'fill" style="padding:13px 15px')).join('')}
          </div>
        </div>
        <div class="split s-62">
          <div>
            ${rule('Imitation risk: months to copy')}
            ${hbars([
              { l: 'Pesticide-Free label claim', v: 0.2, d: 'already copied', t: 't-clay' },
              { l: '200+ SKU breadth', v: 4.5, d: '3–6 months', t: 't-clay2' },
              { l: 'Quick-commerce presence', v: 9, d: '6–12 months', t: 't-gold' },
              { l: '230+ quality checkpoints', v: 15, d: '12–18 months', t: 't-gold' },
              { l: 'QR batch traceability', v: 15, d: '12–18 months', t: 't-blue2' },
              { l: 'Farm-level residue testing', v: 21, d: '18–24 months', t: 't-blue' },
              { l: 'Curated 5,000-farmer cohort', v: 30, d: '24–36 months', t: 't-green2' },
              { l: 'Farmer margin model', v: 48, d: '3–5 years', t: 't-green' },
              { l: 'DeHaat agritech input control', v: 66, d: '5+ years', t: 't-green' }
            ], 70)}
          </div>
          <div>
            ${rule('Messaging consistency, scored*')}
            <div style="display:flex;flex-direction:column">${[['Tata Sampann', '9'], ['Organic Tattva', '8'], ['Organic India', '7'], ['24 Mantra', '6']].map(([n, v]) => `
              <div style="display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;border-bottom:1px dashed var(--line)"><span style="font-size:12.5px;color:var(--tx2)">${E(n)}</span><b class="num" style="font-size:16px;color:var(--ink)">${v}/10</b></div>`).join('')}
            </div>
            <div style="margin-top:14px">${box(null, '24 Mantra 6/10 — expected to reach 9/10 within 12 to 18 months of ITC integration.', 'clay')}</div>
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 06 · SYSTEM-LED CHALLENGER ═══════════════ */
{
  const advs = [
    ['AgriTech-embedded input control', 'We prevent pesticide use at source, rather than testing for it afterward'],
    ['Continuous quality intelligence across 2M farms', 'Quality trajectory is known before harvest, not after rejection'],
    ['Farmer economic ecosystem', 'Supply exclusivity earned through 30 to 50% better farmer returns']
  ];
  slide({
    chapter: 'The category',
    html: head('Untapped opportunity', 'DeHaat Honest Farms: A Pesticide-free, System-led Challenger.') + `
      <div class="body split s-62">
        <div>
          ${rule('Untapped opportunity for DeHaat Honest Farms.')}
          <div class="stack sm">${advs.map(([t, d]) => card(`
              <div style="display:grid;grid-template-columns:34px 1fr;gap:13px;align-items:start">
                <span class="pill g sq" aria-hidden="true"></span>
                <div>
                  <h4 style="font-size:14px;font-weight:800;color:var(--ink)">${E(t)}</h4>
                  <p style="font-size:12px;color:var(--tx2);line-height:1.36;margin-top:5px">${E(d)}</p>
                </div>
              </div>`)).join('')}
          </div>
          <p class="lbl c" style="margin-top:11px">Current utilization in brand communication: near zero, zero, and minimal</p>
          <div style="margin-top:14px">${box(null, "Proof comes from controlling procurement and processing, not from holding a certificate. No brand occupies it today, and DHF's own Shelf Price is inconsistent across platforms.", 'blue')}</div>
        </div>
        <div class="stack">
          ${fig('s06-honestly-better.jpg', 'white', 'box-shadow:var(--shadow)')}
          ${box('Priced as Accessible - Premium @ ₹150 – ₹250 / kg (Tur Daal for instance)',
            'Value and mainstream brands sit at ₹136/- to 157/-; certified organic sits at ₹255/- to 306/-.\nThe corridor between them is empty of trust codes and is already being squeezed from below by BB Royal Organic at ₹157/-.', 'gold')}
        </div>
      </div>`
  });
}

/* ═══════════════ 07 · QUALITATIVE ═══════════════ */
{
  const tensions = [
    ['01', 'Conceptual fog, not an information gap', 'Consumers do not merely lack information — they hold incorrect information that feels correct'],
    ['02', 'Adulteration fatalism', '73% agree some adulteration is unavoidable. The risk is known and quietly accepted – example highest in chilli'],
    ['03', 'Bodily proof beats label proof', 'Confidence comes from energy, weight, blood work of self and family members'],
    ['04', 'Assumed safety in Makhana', 'Believed to be "grown from lotus stems" and "processed like popcorn". Neither is accurate, and it is the only category with no residue conversation']
  ];
  const quotes = [
    ['“Pesticides are sometimes put in soil, not on fruits. This makes them pesticide-free.”', 'In-market intercept, Bengaluru'],
    ['“There is no such thing as Pesticide-Free. We have done enough research.”', 'In-market intercept, Bengaluru'],
    ['“Pesticide-free means no use of pesticides at any stage of the lifecycle of the produce.”', 'Organic farmer, Hyderabad — the most accurate definition in the sample'],
    ['“Testing information plays a very important role. Knowing the source and certifications matters most in rice and dal — they are staples.”', 'Benifer Lewis, 45, Mumbai']
  ];
  slide({
    chapter: 'The consumer',
    html: head('Qualitative research by the team · 31 respondents across 6 cities',
      'Scope for education on the Pesticide-Free Category') + `
      <div class="body stack gap-lg spread">
        <div class="g3">
          ${stat('70%', 'of in-market shoppers could not distinguish "organic" from "pesticide-free"', 't-clay')}
          ${stat('100%', 'cited health of self &amp; family as their primary food purchase driver', 't-green')}
          ${stat('0%', 'connected the word "pure" to pesticide residue — a language gap, not an interest gap', 't-blue')}
        </div>
        <div class="split">
          <div>
            ${rule('Four tensions beneath the category')}
            <div class="stack sm">${tensions.map(([n, t, d]) => card(`
                <h4 style="font-size:13px;font-weight:800;color:var(--ink)"><span style="color:var(--blue)">${n}</span>&nbsp;&nbsp;${E(t)}</h4>
                <p style="font-size:11px;color:var(--tx2);line-height:1.34;margin-top:3px">${E(d)}</p>`,
              'tl" style="--c:var(--blue);padding:9px 13px')).join('')}
            </div>
          </div>
          <div>
            ${rule('In their own words')}
            <div class="stack sm">${quotes.map(([q, c]) => card(`
                <p class="quote" style="font-size:11.5px">${E(q)}</p><p class="cite" style="font-size:10px;margin-top:4px">${E(c)}</p>`,
              'sand" style="padding:9px 13px')).join('')}
            </div>
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 08 · RESEARCH METHODOLOGY ═══════════════ */
{
  const meth = [
    ['~18 min', '50 questions across 10 topics and 4 food categories'],
    ['4 screens', 'Decision-maker role, purchase frequency, ≥2 of 4 categories, income — SEC D/E and sub-monthly buyers terminated'],
    ['15-item battery', 'Five-point Likert attitude statements, written for post-survey factor extraction'],
    ['2 trust grids', 'Six claims tested twice — once bare, once with an independent certificate attached']
  ];
  const prof = [['78%', 'have a child under 12 and / or an elderly member at home'],
    ['82%', 'do the household grocery shopping entirely themselves'],
    ['63%', 'earn ₹1–2.5 Lakh per month'],
    ['58%', 'shop for groceries three or more times a week']];
  slide({
    chapter: 'The consumer',
    html: head('Quantitative research by 1Lattice – commissioned by DHF',
      'How the survey was built, and who answered it') + `
      <div class="body split s-53">
        <div>
          ${rule('Research methodology')}
          <div class="g2">${meth.map(([v, d]) => card(`
              <b class="num" style="font-size:17px;color:var(--blue);display:block">${E(v)}</b>
              <p style="font-size:11.5px;color:var(--tx2);line-height:1.36;margin-top:6px">${E(d)}</p>`, 'fill')).join('')}
          </div>
          <div style="margin-top:16px">${card(`
            ${lbl('Fieldwork &amp; governance', 'b')}
            <div style="margin-top:9px">${ul([
              'Online panel, fielded by 1Lattice, 28–29 May 2026. n=305 after quality screening. Report dated 12 June 2026.',
              'Five metros: Delhi NCR 31% · Bengaluru 21% · Mumbai 17% · Ahmedabad 15% · Pune 15%.',
              'Category bases: rice n=253 · tur dal n=241 · red chilli n=164 · makhana n=58.',
              'Makhana is reported as directional only. Every segment claim in this deck rests on the full n=305 base, not on a category sub-base.'
            ])}</div>`, 'sand')}
          </div>
        </div>
        <div>
          ${rule('Consumer profiles')}
          <div class="g4" style="margin-bottom:18px">${prof.map(([v, l]) => `
            <div><b class="num" style="font-size:23px;color:var(--green);display:block">${E(v)}</b><span style="display:block;font-size:11px;color:var(--tx2);line-height:1.32;padding-top:5px">${E(l)}</span></div>`).join('')}
          </div>
          ${rule('Where they shop  (% using, multi-select)')}
          ${hbars([
            { l: 'Blinkit', v: 53, d: '53%', t: 't-blue' },
            { l: 'Swiggy Instamart', v: 43, d: '43%', t: 't-blue' },
            { l: 'Kirana', v: 41, d: '41%', t: 't-blue2' },
            { l: 'BigBasket', v: 34, d: '34%', t: 't-blue2' },
            { l: 'Amazon / JioMart', v: 30, d: '30%', t: 't-blue2' },
            { l: 'Zepto', v: 29, d: '29%', t: 't-blue' },
            { l: 'Supermarkets', v: 10, d: '10%', t: 't-grey' }
          ], 60)}
          <div style="margin-top:14px">${box(null, 'A quick-commerce-first, metro sample: The exact cohort DHF already sells to, and the cohort that will decide whether the category forms and how it will shape.', 'blue')}</div>
        </div>
      </div>`
  });
}

/* ═══════════════ 09 · FACTOR ANALYSIS ═══════════════ */
{
  const steps = [
    ['1', '305 × 15 matrix', 'Every respondent scored on 15 five-point attitude statements'],
    ['2', 'Exploratory factor analysis', 'Principal-axis factoring with Varimax rotation'],
    ['3', '3 latent factors retained', 'Eigenvalues 5.55 · 1.50 · 1.03 — cumulative variance 42.6%'],
    ['4', 'K-means clustering (k=4)', 'Run on standardised factor scores, n_init = 20'],
    ['5', '4 archetypes', 'Named, sized, and profiled on trigger, barrier and channel']
  ];
  const factors = [
    ['F1 — SOCIAL &amp; EXPERIENTIAL TRUST', 'Trust is earned through people and events, not systems and symbols.', 'var(--blue)',
      [['Stopped buying after a news story', '0.68'], ['A doctor beats any pack logo', '0.62'],
       ['I trust a farmer I know by name', '0.59'], ['I prefer smaller brands', '0.53']]],
    ['F2 — SYSTEM DISTRUST &amp; PREMIUM INTENT', 'The system is corrupt, and I will pay to exit it. This is the financial engine of premium food brands.', 'var(--clay)',
      [['Factories cannot be genuinely clean', '0.65'], ['Some adulteration is unavoidable', '0.50'],
       ['I would pay 20–30% more', '0.48'], ['The problem is proof, not cost', '0.47']]],
    ['F3 — PROOF-DEMANDING VIGILANCE', 'I will check it myself. Show me the evidence.', 'var(--green)',
      [['I will pay only if a test is shown', '0.64'], ['I need to verify proof myself', '0.60'],
       ['I can spot a genuine claim', '0.55'], ['Cost blocks me from safer food', '0.48']]]
  ];
  slide({
    chapter: 'The consumer',
    html: head('The analytical pipeline', 'Factor Analysis and K – Means on 15 Attitude Statements') + `
      <div class="body stack">
        <div class="g5">${steps.map(([n, t, d]) => card(`
            <span class="pill soft">${n}</span>
            <h4 style="font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.28;margin:9px 0 5px">${E(t)}</h4>
            <p style="font-size:11px;color:var(--tx2);line-height:1.32">${E(d)}</p>`, 'fill')).join('')}
        </div>
        ${card(`<div style="display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:18px;align-items:center">
            <span class="lbl" style="color:var(--green3);font-size:11.5px">Adequacy — both tests passed before extraction</span>
            ${[['KMO', '0.886', '"meritorious"'], ['BARTLETT', 'p &lt; 0.001', 'sphericity rejected'], ['SILHOUETTE', '0.347', 'highest at k=4']].map(([k, v, n]) => `
            <div><span class="lbl" style="font-size:10px">${k}</span><div style="display:flex;align-items:baseline;gap:9px;margin-top:3px"><b class="num" style="font-size:19px;color:#fff">${v}</b><span style="font-size:11px;font-style:italic;color:var(--txl2)">${E(n)}</span></div></div>`).join('')}
          </div>`, 'ink')}
        <div>
          ${rule('The three factors — and their defining statements')}
          <div class="g3">${factors.map(([t, d, c, rows]) => card(`
              <h4 style="font-size:12.5px;font-weight:800;color:var(--ink);letter-spacing:.02em">${t}</h4>
              <p style="font-size:11px;font-style:italic;color:var(--tx2);line-height:1.34;margin:5px 0 10px">${E(d)}</p>
              ${rows.map(([st, ld]) => `
              <div style="margin-bottom:7px">
                <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:11.5px;color:var(--tx2)">${E(st)}</span><b style="font-size:11.5px;color:var(--ink)">${ld}</b></div>
                <i style="display:block;height:4px;border-radius:2px;background:var(--sand2);margin-top:3px;position:relative"><s style="position:absolute;inset:0 auto 0 0;width:${parseFloat(ld) * 100}%;border-radius:2px;background:${c}"></s></i>
              </div>`).join('')}`, `tt fill" style="--c:${c}`)).join('')}
          </div>
        </div>
        <p style="font-size:12px;font-style:italic;color:var(--tx2)">The statistics didn’t create these groups; they revealed groups already in the data. At k=3, Guardians and Trusters merge into one unusable segment.</p>
      </div>`
  });
}

/* ═══════════════ 10 · FOUR SEGMENTS ═══════════════ */
{
  const rows = [
    ['Proof-Hungry Guardians', '109  (36%)', '+0.46', '+0.47', '+0.69', '4.4 / 5', '54%', 'var(--green)'],
    ['Social Trusters', '62  (20%)', '+0.65', '+0.17', '−0.89', '3.6 / 5', '34%', 'var(--blue)'],
    ['Passive Defaulters', '80  (26%)', '−0.39', '−1.05', '−0.34', '3.5 / 5', '6%', 'var(--grey)'],
    ['System Fatalists', '54  (18%)', '−1.09', '+0.41', '+0.13', '3.6 / 5', '22%', 'var(--clay)']
  ];
  const cell = c => c.startsWith('−') ? ` class="neg"` : c.startsWith('+') ? ` class="pos"` : '';
  slide({
    chapter: 'The consumer',
    html: head('Four Customer Segments', 'Four Customer Segments emerged from Research') + `
      <div class="body stack gap-lg spread">
        <div>
          <table>
            <thead><tr>${['Segment', 'n (%)', 'F1 Social', 'F2 Distrust', 'F3 Vigilance', 'Trust in cert. claim', 'Would pay 11%+'].map(h => `<th>${E(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr>${r.slice(0, 7).map((c, i) => `<td${i === 0 ? ` style="--c:${r[7]}"` : cell(c)}>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
          <p style="font-size:11.5px;font-style:italic;color:var(--tx3);padding-top:8px">Factor scores are standardized — 0 is the sample mean. Guardians are the only cluster positive on all three factors simultaneously.</p>
        </div>
        <div class="split s-53">
          <div>
            ${rule('Percentage of segment willing to pay 11%+')}
            ${card(vbars([
              { l: 'Guardians', v: 54, d: '54%', t: 't-green' },
              { l: 'Trusters', v: 34, d: '34%', t: 't-blue' },
              { l: 'Fatalists', v: 22, d: '22%', t: 't-clay' },
              { l: 'Defaulters', v: 6, d: '6%', t: 't-grey' }
            ], 62, { h: 138, gap: 26 }))}
          </div>
          <div>
            ${rule('The trust wall, not the wallet wall')}
            ${ul([
              'Roughly half of every category’s buyers say they would pay nothing extra — and give the reason: they do not trust the claims',
              '44% sit inside a +10–20% corridor; only 5% accept 21–30%',
              'Yet 60% say they would pay 20–30% more if someone they trusted had independently verified it. Stated willingness to pay under distrust is a floor, not a ceiling'
            ])}
            <div style="margin-top:12px">${box('PREMIUM WILLINGNESS DOES NOT TRACK INCOME.',
              'It peaks in the ₹60K–1L band (71%) and falls to 32% in ₹1–1.5L. Geographically, it runs from Delhi NCR at 64% down to Ahmedabad at 33% — which makes Delhi NCR the launch market on belief, not on affluence.', 'gold')}</div>
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 11 · THE BUYER PERSONAS ═══════════════ */
{
  const P = [
    ['Vandana Iyer', 'THE VERIFIER  ·  36%', 'PROOF-HUNGRY GUARDIAN', 'var(--blue)',
     '“The word organic on a label means nothing to me anymore. Show me the actual test report for this batch and I\'ll happily pay more.”',
     '34–45 · postgraduate · senior professional · nuclear family with young children · ₹1.5–2.5L+/month · Tier-1 metro',
     'Batch-specific lab report by QR; "below detectable limits"; a specialist who has personally reviewed it',
     'No way to verify independently; greenwashing fatigue; a scan, not a research project'],
    ['Meera Nair', 'THE BELIEVER  ·  20%', 'SOCIAL TRUSTER', 'var(--green)',
     '“If my doctor and my sister both say it\'s good for the family, that\'s all the proof I need. I\'m not going to scan codes and read reports.”',
     '30–50 · graduate · homemaker or teacher · joint or extended family · ₹1–1.5L/month · Tier-1 and Tier-2',
     'Doctor and dietitian endorsement; a trusted person already using it; warm, relatable word of mouth',
     'Clinical, jargon-heavy messaging; conflicting opinions in her circle; nobody she trusts has vouched'],
    ['Karan Mehta', 'THE CRUISE-CONTROLLER  ·  26%', 'PASSIVE DEFAULTER', '#8A8474',
     '“Honestly, I just buy whatever brand I know that looks decent and isn\'t overpriced. Food safety isn\'t something I lose sleep over.”',
     '26–38 · graduate · IT / sales / ops professional · DINK or small family · ₹80K–1.5L/month · heavy quick-commerce user',
     'Visible on the app he already uses; price parity with his usual brand; taste he notices',
     'Not stocked where he shops; a premium with no obvious reason; anything requiring effort to switch'],
    ['Sanjay Deshpande', 'THE SCEPTIC  ·  18%', 'SYSTEM FATALIST', 'var(--clay)',
     '“Every brand says it\'s pure. Adulteration is everywhere, and no factory is truly clean. Prove me wrong — but don\'t insult me with marketing.”',
     '38–55 · graduate to postgraduate · senior professional or business owner · established family · Tier-1 and Tier-2',
     'Unscripted farmer proof; independent, non-brand-paid verification; being shown what is imperfect',
     'Polished claims like everyone else\'s; certification with no visible teeth; anything that reads like a script']
  ];
  slide({
    chapter: 'The consumer',
    html: head('The buyer personas', 'The Buyer Personas') + `
      <div class="body stack">
        <div class="g4">${P.map(([nm, arch, seg, c, quote, prof, conv, block]) => card(`
            <div style="display:flex;align-items:center;gap:11px">
              <span class="pill" style="background:${c}">${nm.charAt(0)}</span>
              <div><h4 style="font-size:14.5px;font-weight:800;color:var(--ink);line-height:1.1">${E(nm)}</h4>
                <span class="lbl" style="color:${c};font-size:10px">${E(arch)}</span></div>
            </div>
            <div class="lbl" style="margin:11px 0 8px;font-size:10.5px">${E(seg)}</div>
            <p class="quote" style="font-size:11.5px">${E(quote)}</p>
            <hr style="border:0;border-top:1px dashed var(--line);margin:11px 0">
            ${[['Profile', prof, ''], ['What converts her / him', conv, 'g'], ['What blocks the sale', block, 'c']].map(([t, d, k]) => `
            <div style="margin-bottom:9px">${lbl(t, k)}<p style="font-size:11px;color:var(--tx2);line-height:1.36;padding-top:4px">${E(d)}</p></div>`).join('')}`,
          `tt fill" style="--c:${c}`)).join('')}
        </div>
        ${box(null, 'Guardians convert fast on facts. Trusters need a voice of assurance. Defaulters need shelf presence and price parity. Fatalists need to be shown the imperfections to win their trust.', 'green')}
      </div>`
  });
}

/* ═══════════════ 12 · TARGETING ═══════════════ */
{
  const tg = [
    ['PRIMARY', '36%', 'Proof-Hungry Guardians', 'Largest segment, highest willingness to pay, and the only one that responds to the proof DHF already generates.', 'var(--green)'],
    ['SECONDARY', '20%', 'Social Trusters', "Activated by the Guardians' verification becoming social proof. Doctor endorsement bridges both segments at once.", 'var(--blue)'],
    ['DEFER', '26%', 'Passive Defaulters', 'Proof-heavy messaging misfires. Capture cheaply in phase two, once the category feels default.', 'var(--grey)'],
    ['SEQUENCE LAST', '18%', 'System Fatalists', 'Smallest and hardest. Needs a separate radical-transparency, farmer / founder-direct playbook.', 'var(--clay)']
  ];
  slide({
    chapter: 'The consumer',
    html: head('The targeting decision', 'The targeting decision: Where to play first ?') + `
      <div class="body stack gap-lg spread">
        <div class="g4">${tg.map(([tag, pct, nm, d, c]) => card(`
            <span class="lbl" style="color:${c}">${E(tag)}</span>
            <b class="num" style="font-size:31px;color:var(--ink);display:block;margin:5px 0 3px">${E(pct)}</b>
            <h4 style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:6px">${E(nm)}</h4>
            <p style="font-size:11.5px;color:var(--tx2);line-height:1.38">${E(d)}</p>`, `tt fill" style="--c:${c}`)).join('')}
        </div>
        <div class="split s-53">
          <div>
            ${rule('What would make you try a new brand?  (% naming it the single top driver)')}
            ${hbars([
              { l: 'Doctor / child-specialist endorsement', v: 44, d: '44%', t: 't-green' },
              { l: '"Below detectable limits" + QR to lab report', v: 27, d: '27%', t: 't-blue' },
              { l: "Farmer's name and village on pack", v: 12, d: '12%', t: 't-blue2' },
              { l: 'Government certificate as the lead message', v: 8, d: '8%', t: 't-grey' },
              { l: '"Tested for 200+ chemicals"', v: 6, d: '6%', t: 't-clay' },
              { l: 'Farm-visit invitations', v: 3, d: '3%', t: 't-grey' },
              { l: 'Side-by-side residue comparison vs rivals', v: 1, d: '1%', t: 't-grey' }
            ], 50)}
          </div>
          <div class="stack sm">
            ${box('THE UNCOMFORTABLE FINDING', 'DHF leads with the claim only 6% find convincing and barely uses the endorsement 44% name first. Doctor endorsement wins in every segment. 55% of Trusters, 56% of Defaulters, 50% of Fatalists. Only Guardians rank the QR lab report first.', 'clay')}
            ${box('THE LARGEST SEGMENT IS THE MOST VALUABLE', 'Guardians are 36% of decision-makers but hold roughly 60% of all stated premium-rupee intent. They are the only segment that responds to the asset DHF already owns — a verifiable, batch-level test result. They also do their own diligence, which means they generate the reviews, the doctor conversations and the proof trail that the next segment follows.', 'blue')}
            ${card(`${lbl('The play', 'g')}<p style="font-size:12px;color:var(--txl);line-height:1.42;padding-top:6px">Win Guardians with proof → convert their advocacy into the social proof that activates Trusters → ride the combined 56% into default category leadership.</p>`, 'ink')}
          </div>
        </div>
      </div>`
  });
}

/* ═══════════════ 13 · THE SHELF TODAY ═══════════════ */
{
  const claims = ['Farmer-face labelling - personal provenance', '‘Naturally grown’, ‘unpolished’',
    'Certification seal on label', '‘Direct from farmer’', '100% Natural'];
  const news = [['news-ccpa.jpg', 'Regulatory crackdown'], ['news-ndtv.jpg', 'Market growth, affordability gap'],
    ['news-c.jpg', 'Celebrity &amp; consumer validation'], ['news-3.jpg', 'Policy &amp; certification landscape'],
    ['news-b.jpg', 'Pesticide safety alarm']];
  slide({
    chapter: 'Brand & proof',
    html: head('GT & MT shelves', 'With every shelf using a different, often unverifiable claim, generic language adds to the noise.', null, 'sm') + `
      <div class="body split">
        <div>
          ${rule('GT &amp; MT shelves are flooded with claims, sending diverse trust signals to consumers')}
          <div style="display:flex;flex-wrap:wrap;gap:7px">${claims.map(c => `
            <span style="font-size:11.5px;color:var(--tx2);border:1px dashed var(--line);background:#fff;border-radius:15px;padding:6px 12px">${E(c)}</span>`).join('')}
          </div>
          <div class="g5" style="gap:8px;margin-top:16px">${['shelf-jars.jpg', 'shelf-poha.jpg', 'shelf-twobrothers.jpg', 'shelf-tribalveda.jpg', 'shelf-ingress.jpg'].map(f => band(f, 128)).join('')}</div>
          <div style="margin-top:16px">${box(null, 'DHF’s edge is a specific: Verifiable Proof Mechanism (QR + Test Data), not another claim in the pile.', 'green')}</div>
        </div>
        <div>
          ${rule('Media is building the case for verified proof')}
          <div class="g3" style="align-content:start">${news.map(([f, cap]) => `<div>${band(f, 132)}<figcaption>${cap}</figcaption></div>`).join('')}</div>
        </div>
      </div>`
  });
}

/* ═══════════════ 14 · BRAND MANIFESTO ═══════════════ */
{
  const values = [
    ['Resilience', 'We meet uncertainty with patience and grit, learning from the land and adapting so farmers can thrive through seasons and shocks.'],
    ['Integrity', 'Transparency is a mechanism, not a promise to be broken. You can check batch data, farmer names, and practices. They are not the claims you’re asked to believe.'],
    ['Simplicity', 'We turn complex agri-data into one clear signal, so our farmers can take confident actions, and consumers can trust what they see instantly.'],
    ['Progress', 'Not progress for its own sake, but progress powered by DeHaat’s own agri-tech, in service of tradition, not instead of it.'],
    ['Education and empowerment', 'We bridge Krishi wisdom and modern methods, so farming becomes more productive, profitable, and sustainable; inspiring young people to see agriculture as a modern opportunity, and equip our teams to listen, advise with real data, and deliver real value.'],
    ['Connection', 'The farmer isn’t a sourcing story we tell; they’re the name on the batch, accountable and credited. When farmers prosper, supply is reliable; when consumers can trace what they buy back to a real farm, honesty becomes provable, not just promised.']
  ];
  slide({
    chapter: 'Brand & proof', dark: true,
    html: head('Brand manifesto', 'We believe') + `
      <div class="body stack">
        <p style="font-size:16px;color:var(--txl);line-height:1.52;max-width:1000px">The future of food isn’t claimed on a label; it’s proven in the field. Every seed we recommend, every practice we track, and every farmer we name is how we turn honesty into something you can verify, not just believe.</p>
        <div>
          ${rule('We stand for')}
          <div class="g3" style="gap:12px">${values.map(([t, d]) => card(`
              <h4 style="font-family:var(--fd);font-weight:400;font-size:13px;color:#fff">${E(t)}</h4>
              <p style="font-size:11px;color:var(--txl);line-height:1.38;margin-top:5px">${E(d)}</p>`, 'ink2 fill" style="padding:11px 13px')).join('')}
          </div>
        </div>
        <p style="font-size:15px;color:var(--txl);font-style:italic">We are Honest Farms. <b style="font-style:normal;color:var(--green3)">Verified in the fields, Honest on the shelves.</b></p>
      </div>` });
}

/* ═══════════════ 15 · BRAND PURPOSE ═══════════════ */
slide({
  bleed: true, dark: true, chapter: 'Brand & proof',
  html: `
      <div class="bleed-img"><img src="${A('s15-harvest.jpg')}" alt=""></div>
      <div class="veil"><img src="${A('veil-flat.png')}" alt=""></div>
      <div class="veil"><img src="${A('veil-h.png')}" alt=""></div>
      <img class="mark" src="${A('logo.png')}" alt="" style="position:absolute;right:53px;top:30px;width:120px">
      <div class="statement">
        <span class="banner">Brand purpose</span>
        <h2>To nurture soil and skills, to do business honestly, and to prove it batch by batch, farmer by farmer.</h2>
      </div>
      <div class="bleed-foot"><span class="foot-n">__PAGE__</span></div>` });

/* ═══════════════ 16 · FARMERS IN THE SPOTLIGHT ═══════════════ */
{
  const mechs = [
    ['QR to farmer', 'Scan the pack and land on a unique microsite of that farmer - know his village, harvest date, daily life, growth, consumer connects &amp; download the Pesticide-Free Certificate.'],
    ['Village / Farm clusters on pack', 'Like most wine brands across the world, Bordeaux, Nice, Nashik, Napa Valley - Prove provenance'],
    ['Farmers as content creators', 'They play the lead role with unscripted reels, voice notes, and live harvest streams. Rougher, less polished than a typical ad, which is exactly what signals "real" to a sceptical buyer.'],
    ['Hand-written Farmer Letters in pack', 'Rotating, handwritten-style notes from the actual farmer of that batch'],
    ['Farmers send audit invitation', 'No need to give advance notice. Wins the prove me wrong archetype'],
    ['Farmer-Led sampling', 'The farmers, not agency promoters, make demos at flea markets or housing societies to drive trials'],
    ['Consumer-to-farmer feedback loop', 'Get consumers to review the farmers and their fields’ produce, instead of the product purchased']
  ];
  slide({
    chapter: 'Brand & proof',
    html: head('Making backend Agri-tech Rigor visible to the consumers',
      'Flip the Script on QR Traceability: Farmers in the Spotlight') + `
      <div class="body split s-66">
        <div class="g2" style="gap:11px;align-content:start">${mechs.map(([t, d]) => card(`
            <h4 style="font-size:12.5px;font-weight:800;color:var(--ink)">${t}</h4>
            <p style="font-size:11px;color:var(--tx2);line-height:1.38;margin-top:5px">${d}</p>`,
          'tl fill" style="--c:var(--green);padding:11px 14px')).join('')}
        </div>
        <div class="stack sm">
          ${band('s16-meet-the-producer.jpg', 214, 'white')}
          ${band('s16-pack-toordal.jpg', 246, 'white')}
        </div>
      </div>` });
}

/* ═══════════════ 17 · BRAND ARCHITECTURE ═══════════════ */
{
  const stakes = [
    ['FARMERS/FPO', 'Dehaat trains Farmers for productivity, profitability and sustainability with simplified agri-tech data to give clear signals to consumers. Winning trust with no hidden stories, no shortcuts.'],
    ['Q-COMM, E-COMM &amp; MTs', "Made to win Honest Farms' brand trust by showing superiority in backend agri-tech, not just another category claim on apps/shelves."],
    ['CONSUMERS', 'Empowered to verify every batch, farmer, and agri practice before they add to cart and put food on the table.'],
    ['EMPLOYEES', 'Hire and train to demonstrate the spirit of progress - bringing Krishi wisdom and modern methods to make farming more productive, profitable, and sustainable.']
  ];
  slide({
    chapter: 'Brand & proof',
    html: head('Positioning', 'The only food brand in India that consumers verify, not just trust.') + `
      <div class="body split s-53">
        <div class="stack sm">
          ${[['ROLE', 'An honest guide that leads with transparency, answers with proof, and never preaches.'],
             ['BELIEF', 'Progress moves from seed to plate, and every hand that touches it is named, not hidden.']]
            .map(([t, d]) => card(`${lbl(t, 'g')}<p style="font-size:13px;color:var(--tx);line-height:1.4;padding-top:6px">${E(d)}</p>`, 'nogrow')).join('')}
          <div class="g3" style="gap:11px">
            ${[['FUNCTIONAL BENEFIT:', 'Verified safety.', 'No detectable residue.'],
               ['EMOTIONAL BENEFIT:', 'Relief.', "You're no longer the only one keeping watch."],
               ['EXPERIENTIAL BENEFIT:', 'Honest Progress with every basket,', 'from seed to plate.']]
              .map(([t, b, d]) => card(`${lbl(t, 'b')}<p style="font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.3;padding-top:6px">${E(b)}</p><p style="font-size:11.5px;color:var(--tx2);line-height:1.34;padding-top:3px">${E(d)}</p>`, 'sand fill')).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 232px;gap:14px" class="nogrow">
            ${card(`${lbl('Promise:', 'g')}<p style="font-family:var(--fd);font-weight:400;font-size:16px;color:#fff;padding-top:7px">Verified in the fields, Honest on the shelves.</p>`, 'ink')}
            ${band('s17-carton-phone.jpg', 96, 'white')}
          </div>
        </div>
        <div>
          <div class="g2" style="gap:13px">${stakes.map(([t, d]) => card(`
              ${lbl(t, 'b')}<p style="font-size:11.5px;color:var(--tx2);line-height:1.42;padding-top:7px">${d}</p>`, 'fill')).join('')}
          </div>
        </div>
      </div>` });
}

/* ═══════════════ 18 · THE NORTH STAR ═══════════════ */
{
  const vpr = [['V', 'Vandana - The Verifier', 'Scans the batch QR; visits the microsite to engage with farmers'],
    ['M', 'Meera - The Believer', 'Confirms it with her doctor or her circle of influence'],
    ['K', 'Karan -  The Cruise Controller', 'Notices it’s on his app already; repeat-buys anyway'],
    ['S', 'Sanjay - The Sceptic', 'Watches unscripted farm content; takes up an audit invite from the farmer']];
  slide({
    chapter: 'Brand & proof', dark: true,
    notes: ['It is the only metric that goes down if the proof mechanism breaks — brand awareness would not.',
      'It is measurable from day one, without a tracker study: scans, microsite sessions, report downloads, audit sign-ups.',
      'It is the one number a professor, a retailer and a farmer would all read the same way.',
      'Karan counts as verified without ever scanning — someone else’s verification is what put the product in front of him. That is how a category becomes the default.'],
    html: head('The North Star', 'Be the only food brand in India that consumers verify, not just trust.') + `
      <div class="body stack gap-lg">
        ${card(`${lbl('How do we measure success?', 'g')}<p style="font-size:15px;color:var(--txl);line-height:1.46;padding-top:8px">Verified Purchase Rate — the % of purchases where a consumer engages a real proof point (batch QR scan, farmer profile, lab report) before or after buying the product.</p>`, 'ink2')}
        <div class="g4 grow">${vpr.map(([i0, t, d]) => card(`
            <span class="pill" style="background:var(--green3);color:var(--ink)">${i0}</span>
            <h4 style="font-size:13px;font-weight:800;color:#fff;margin:11px 0 6px">${E(t)}</h4>
            <p style="font-size:12px;color:var(--txl2);line-height:1.4">${E(d)}</p>`, 'ink2 fill')).join('')}
        </div>
        <p style="font-family:var(--fd);font-weight:400;font-size:19px;color:#fff;line-height:1.36;border-top:1px solid rgba(255,255,255,.2);padding-top:16px">Revenue and share are outcomes. Verified Purchase Rate is the lever that sales, product, and marketing teams continuously optimize.</p>
      </div>` });
}

/* ═══════════════ 19 · PROOF ARCHITECTURE ═══════════════ */
{
  const dl = [
    ['Vandana — The Verifier', 'PROOF-HUNGRY GUARDIANS  ·  36%', 'var(--blue)', '“Scan the pack. See exactly what\'s inside.”',
      ['QR to the batch-level lab report and the farmer', "Doctor or dietitian citation on pack, beside the farmer's view", 'Certification carrying a live verification link'],
      'QR code  ·  D2C  ·  Modern trade', 'Fast, once proof is visible. She does her own diligence.'],
    ['Meera — The Believer', 'SOCIAL TRUSTERS  ·  20%', 'var(--green)', '“Ask your doctor. Then ask your sister. They\'ve approved us.”',
      ['Doctor and dietitian partnership programme', 'Referral incentive for existing customers', 'Testimonials from families she recognises'],
      'Clinic tie-ups  ·  Community WhatsApp  ·  WOM', 'Medium. Needs one or two trusted validators, then sticks.'],
    ['Karan Mehta', 'THE CRUISE-CONTROLLER  ·  26%', 'var(--grey)', '“Same taste. Same price. Honestly, better choice.”',
      ['Priority placement in quick-commerce search', 'Price parity with the brand he already buys', 'Taste-forward sampling, never health-forward'],
      'Quick commerce  ·  Modern trade endcaps', 'Fast to trial, low loyalty. Needs habitual reinforcement.'],
    ['Sanjay Deshpande', 'THE SCEPTIC  ·  18%', 'var(--clay)', '“We\'ll show you the parts no brand talks about.”',
      ['Unscripted farmer and founder video content', 'Open invitations to audit or visit the farm', 'Independent verification nobody paid for'],
      'Farmer-direct platforms  ·  Founder-led content', 'Slowest — but becomes a vocal advocate once earned.']
  ];
  const m = [
    ['Trust lever', 'Verified data (QR + lab)', 'Human endorsement', 'Familiarity, shelf presence', 'Radical transparency'],
    ['Price perception', 'Premium OK, with proof', 'Modest premium if endorsed', 'Expects price parity', 'Suspicious of any premium'],
    ['Key to win', 'Batch proof + doctor review', 'Get her circle to vouch', 'Be visible and taste-led', 'Show the imperfect parts']
  ];
  slide({
    chapter: 'Brand & proof',
    html: head('Proof architecture', 'One standard, four communication deliveries') + `
      <div class="body stack gap-lg spread">
        <div class="g4">${dl.map(([n, seg, c, line, mech, chn, sp]) => card(`
            <h4 style="font-size:13px;font-weight:800;color:var(--ink)">${E(n)}</h4>
            <span class="lbl" style="font-size:9.5px;display:block;margin:4px 0 8px">${E(seg)}</span>
            <p style="font-size:12px;font-weight:800;font-style:italic;color:${c};line-height:1.34">${E(line)}</p>
            <div style="margin-top:11px">${lbl('The mechanism')}${ul(mech, 'tight')}</div>
            <div style="margin-top:9px">${lbl('Channel')}<p style="font-size:11px;font-weight:700;color:var(--tx);padding-top:4px">${E(chn)}</p></div>
            <div style="margin-top:9px">${lbl('Conversion speed')}<p style="font-size:11px;color:var(--tx2);padding-top:4px;line-height:1.32">${E(sp)}</p></div>`,
          `tt fill" style="--c:${c}`)).join('')}
        </div>
        <div>
          ${rule('Trust is multi-dimensional for each archetype')}
          <table class="matrix">
            <thead><tr><th></th><th>Vandana</th><th>Meera</th><th>Karan</th><th>Sanjay</th></tr></thead>
            <tbody>${m.map(r => `<tr>${r.map(c => `<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>` });
}

/* ═══════════════ 20 · LAYING THE FOUNDATION ═══════════════ */
slide({
  bleed: true, dark: true, nofoot: true, chapter: 'The growth engine',
  html: `
      <div class="bleed-img"><img src="${A('warehouse.jpg')}" alt=""></div>
      <div class="veil"><img src="${A('veil-h.png')}" alt=""></div>
      <img class="mark" src="${A('logo.png')}" alt="" style="position:absolute;right:53px;top:34px;width:140px">
      <div class="breaker">
        <span class="banner" style="align-self:flex-start;background:var(--green3);color:var(--ink)">Warehouse</span>
        <h2>Laying the Foundation For Growth over the next 5 years</h2>
      </div>` });

/* ═══════════════ 21 · PORTFOLIO REALITY ═══════════════ */
{
  const tens = [
    ['01', 'Revenue is anchored in the slowest-growing, lowest-margin block.', 'Pulses are 56% of revenue and grow below the portfolio average.'],
    ['02', 'Realization is falling while volume rises.', 'Revenue per MT fell 4.3% in FY26-H2; a margin warning masked by tonnage.'],
    ['03', 'Proof is asserted, not demonstrated.', 'Seven simultaneous taglines, no hierarchy, and "230+ quality checks" stated but never explained.']
  ];
  slide({
    chapter: 'The growth engine',
    html: head('Three tension points', 'DHFs Strategy says accessible - premium food brand. Portfolio says commodities.', null, 'sm') + `
      <div class="body stack gap-lg spread">
        <div class="g4">
          ${stat('₹90.9 Cr', 'Cumulative revenue audited across eight half-years; FY26 ≈ ₹53 Cr, up ~30% YoY', 't-blue', 'md')}
          ${stat('+219%', 'Growth of the value-added block (makhana, jaggery, honey) = 29% of revenue, the real engine', 't-green', 'md')}
          ${stat('24%', 'Of revenue from a single account, Zepto — and one rupee in four is at platform mercy', 't-clay', 'md')}
          ${stat('~33%', 'Of revenue (≈₹30 Cr) has no channel attribution at all', 't-clay', 'md')}
        </div>
        <div class="split s-53">
          <div>
            ${rule('Portfolio mix vs portfolio growth  (cumulative ₹ Cr, growth %)')}
            ${card(hbars([
              { l: 'Pulses  ·  56% of revenue', v: 50.4, d: '₹50.4 Cr', d2: '+113%', t: 't-blue' },
              { l: 'Value-Added  ·  29%', v: 26.0, d: '₹26.0 Cr', d2: '+219%', t: 't-green' },
              { l: 'Spices  ·  12%', v: 10.9, d: '₹10.9 Cr', d2: '+185%', t: 't-gold' },
              { l: 'Oil &amp; Ghee  ·  1%', v: 0.8, d: '₹0.8 Cr', d2: 'NPD', t: 't-grey' }
            ], 56))}
            <div class="g2" style="gap:12px;margin-top:13px">${band('s21-value-added.jpg', 122)}${band('s21-pulses.jpg', 122)}</div>
          </div>
          <div>
            ${rule('Three tension points that decide the strategy')}
            <div class="stack sm">${tens.map(([n, t, d]) => card(`
                <h4 style="font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.32"><span style="color:var(--clay)">${n}</span>&nbsp;&nbsp;${E(t)}</h4>
                <p style="font-size:11.5px;color:var(--tx2);line-height:1.36;margin-top:4px">${E(d)}</p>`,
              'tl" style="--c:var(--clay);padding:11px 14px')).join('')}
            </div>
          </div>
        </div>
      </div>` });
}

/* ═══════════════ 22 · THE TRAJECTORY ═══════════════ */
slide({
  chapter: 'The growth engine',
  html: head('Growth engine design', '₹53 Cr today. ₹748 Cr by FY31.', 'Where to sell it. What to sell. What it costs.') + `
      <div class="body split s-66">
        ${card(rule('₹ Cr') + vbars([
          { l: 'FY26', v: 53, d: '₹53', t: 't-blue2' },
          { l: 'FY27', v: 104, d: '₹104', t: 't-blue2' },
          { l: 'FY28', v: 168, d: '₹168', t: 't-blue' },
          { l: 'FY29', v: 274, d: '₹274', t: 't-green2' },
          { l: 'FY30', v: 450, d: '₹450', t: 't-green2' },
          { l: 'FY31', v: 748, d: '₹748', t: 't-green' }
        ], 830, { h: 300, gap: 24 }), 'fill')}
        <div class="stack">
          ${stat('14.1×', 'On the FY26 base of ₹53 cr', 't-green', 'md')}
          ${stat('64%', 'Net revenue CAGR, FY27 to FY31', 't-green', 'md')}
          ${stat('+5.8pp', 'Gross margin, 37.5% → 43.3%', 't-green', 'md')}
          ${band('s22-wheat.jpg', 112)}
        </div>
      </div>` });

/* ═══════════════ 23 · CATEGORY MIX ═══════════════ */
slide({
  chapter: 'The growth engine',
  html: head('Growth engine design', 'Spices carry the margin.') + `
      <div class="body split s-62">
        ${card(gbars([
          { l: 'Pulses', v: [43, 228], d: ['₹43', '₹228'] },
          { l: 'Spices', v: [18, 202], d: ['₹18', '₹202'] },
          { l: 'Value-Added', v: [32, 169], d: ['₹32', '₹169'] },
          { l: 'Oil &amp; Ghee', v: [9, 120], d: ['₹9', '₹120'] },
          { l: 'Processed', v: [2, 30], d: ['₹2', '₹30'] }
        ], 250, [{ n: 'FY27', t: 't-blue2' }, { n: 'FY31', t: 't-green' }], { h: 292 }), 'fill')}
        <div class="stack">
          ${stat('11.2×', 'Spices, FY27 → FY31. Mix moves from 17% to 27% of revenue, at 51–58% gross margin.', 't-green', 'sm')}
          ${stat('₹99.9 Cr', 'Makhana — the single largest SKU in the FY31 plan, and a realisation play, not a tonnage play.', 't-green', 'sm')}
          ${stat('₹95.5 Cr', 'From four ground spice powders that do not exist today. Pure NPD, from a zero base.', 't-green', 'sm')}
          ${box(null, 'Pulses hold the volume base. Spices deliver the entire +5.8pp of margin expansion. So, a slipped spice launch is a slipped P&L.', 'clay')}
          ${band('s23-spices.jpg', 86)}
        </div>
      </div>` });

/* ═══════════════ 24 · DISTRIBUTION ═══════════════ */
slide({
  chapter: 'The growth engine',
  html: head('The distribution roadmap', 'Earn the shelf. Then densify it.') + `
      <div class="body stack gap-lg spread">
        <div class="g3">
          ${stat('22,628', 'selling points by FY31, from 1,672 today', 't-blue')}
          ${stat('110', 'offline cities, from 22 today', 't-blue')}
          ${stat('40%', "the ceiling on any single channel's share of revenue", 't-blue')}
        </div>
        <div class="split s-53">
          <div class="col-spread">
            ${card(hbars([
              { l: 'E-commerce &amp; quick commerce', v: 304, d: '₹304 Cr', t: 't-blue' },
              { l: 'Regional &amp; premium offline', v: 263, d: '₹263 Cr', t: 't-green' },
              { l: 'National modern trade', v: 129, d: '₹129 Cr', t: 't-blue2' },
              { l: 'Exports', v: 54, d: '₹54 Cr', t: 't-gold' }
            ], 340), 'grow')}
            <div style="margin-top:13px">${box(null, 'No single channel above 40% — the ceiling is what stops the plan becoming a bet on one platform.', 'blue')}</div>
          </div>
          <div class="col-spread">
            <div class="stack sm nogrow">${['Earn the metro shelf', 'Ride quick commerce into Tier 2 &amp; 3',
              'Convert regional chains, state by state', 'Densify what is already open'].map((t, i) => card(`
              <div style="display:flex;align-items:center;gap:13px"><span class="pill">${i + 1}</span><h4 style="font-size:13px;font-weight:800;color:var(--ink)">${t}</h4></div>`,
              '" style="padding:10px 14px')).join('')}
            </div>
            <div style="margin-top:13px">${box(null, '13.5× the selling points at 5× the revenue. The plan does not need better stores, it needs more of them, faster than the dilution.', 'gold')}</div>
            <div class="nogrow" style="margin-top:13px">${band('s24-store.jpg', 104)}</div>
          </div>
        </div>
      </div>` });

/* ═══════════════ 25 · THE MOAT ═══════════════ */
{
  const rungs = [['L4', 'Farmer-direct transparency', 'structural', 'var(--green)', 'var(--greensoft)'],
    ['L3', 'DeHaat input control', '5.5 yrs to copy', '#2C7A3F', '#fff'],
    ['L2', 'NPOP certification', 'parity', 'var(--tx3)', '#fff'],
    ['L1', 'QR to the batch lab report', '1.2 yrs to copy', 'var(--blue)', 'var(--bluesoft)'],
    ['L0', 'A label claim', '0.3 yrs to copy', 'var(--clay)', '#fff']];
  slide({
    chapter: 'The moat & the ask',
    html: head('Growth engine design', 'What DHF controls, and how defensible it is.') + `
      <div class="body split s-58">
        <div>
          <div class="g3" style="margin-bottom:16px">
            ${stat('10 Mn+', 'Farmers on the\nDehaat network', 't-green', 'md')}
            ${stat('8', 'Sourcing clusters\nowned end to end', 't-green', 'md')}
            ${stat('230+', 'Pesticide checks\nOn every batch', 't-green', 'md')}
          </div>
          <p style="font-family:var(--fd);font-weight:400;font-size:20px;color:var(--ink);margin-bottom:16px">We don't test the harvest. We control the input.</p>
          ${rule('The five steps behind the claim')}
          <div class="g5" style="gap:9px">${[['1', 'Clean\ncultivation'], ['2', 'Direct\nsourcing'], ['3', '230+\nchecks'],
            ['4', 'Controlled\nprocessing'], ['5', 'Traceable\nto source']].map(([n, t]) => card(`
              <div style="display:grid;justify-items:center;gap:7px"><span class="pill gsoft" style="width:26px;height:26px;font-size:11px">${n}</span>
              <p style="font-size:11px;font-weight:700;color:var(--tx);text-align:center;line-height:1.26">${BR(t)}</p></div>`,
            'fill" style="padding:11px 8px')).join('')}
          </div>
          <p class="lbl" style="margin:13px 0 10px">Bihar makhana · Uttarakhand jaggery · Gujarat java peanut · and five more, owned end-to-end</p>

        </div>
        <div>
          ${rule('The moat has to be visible by FY29')}
          <div class="stack sm">${rungs.map(([l, t, n, c, f]) => `
            <div style="display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;background:${f};border-radius:8px;padding:11px 14px;${l === 'L1' ? 'outline:2px solid var(--blue);' : 'box-shadow:var(--shadow);'}">
              <b class="num" style="font-size:16px;color:${c}">${l}</b>
              <span style="font-size:12.5px;font-weight:800;color:var(--ink)">${E(t)}</span>
              <span class="lbl" style="color:${c};font-size:10px">${E(n)}</span>
            </div>`).join('')}
          </div>
          <p style="font-size:13px;font-weight:800;color:var(--ink);margin:14px 0 12px">DHF sits at L1. Only L3 and L4 survive imitation.</p>
          ${box(null, 'The only asset that cannot be bought inside five years. ITC bought 24 Mantra; Wingreens bought Safe Harvest — DHF has roughly two years to build, certify and make this moat consumer-visible before ₹274 Cr makes it worth attacking.', 'green')}
        </div>
      </div>` });
}

/* ═══════════════ 26 · THE SCALE BLUEPRINT ═══════════════ */
slide({
  chapter: 'The moat & the ask',
  html: head('The scale blueprint', '₹105 Cr buys breakeven by FY29') + `
      <div class="body split s-53">
        <div class="stack spread">
          <table class="plain nogrow">
            <thead><tr><th></th><th>FY27</th><th>FY28</th><th>FY29</th></tr></thead>
            <tbody>
              <tr><td>Revenue</td><td>104</td><td>168</td><td>274</td></tr>
              <tr><td>Investable margin</td><td>27.6</td><td>50.2</td><td>86.6</td></tr>
              <tr><td>EBITDA</td><td class="neg">−12.4</td><td class="neg">−7.9</td><td class="pos">+4.7</td></tr>
            </tbody>
          </table>
          <p class="nogrow" style="font-size:12.5px;color:var(--tx2);line-height:1.44;padding:16px 0 0">Investment intensity falls from 38% to 30% of revenue. Breakeven is not efficiency — it is the same rupees over more revenue.</p>
          ${box(null, "DHF clears breakeven at ₹274 Cr only because a 43.1% gross margin buys ₹38 Cr that Farmley's 29% does not.\nNo Indian clean-label brand between ₹75 and ₹400 Cr is EBITDA-positive today.", 'gold nogrow')}
        </div>
        <div class="stack spread">
          ${card(`
            ${lbl('The funding ask', 'g')}
            <b class="num" style="font-size:42px;color:#fff;display:block;margin:8px 0 14px">₹105 Cr</b>
            ${[['Operating losses', '20.3'], ['Capex', '29.5'], ['Working capital', '37.3'], ['Contingency', '17.4']].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.16)"><span style="font-size:12.5px;color:var(--txl2)">${E(k)}</span><b style="font-size:13px;color:#fff">${v}</b></div>`).join('')}
            <p style="font-size:11.5px;font-style:italic;color:var(--txl2);padding-top:11px">Below every comparable in the set.</p>`, 'ink')}
          ${stat('22 → 98', 'People, FY26 to FY29, across six functions. Revenue per head reaches ₹2.80 cr.', 't-green', 'md nogrow')}
        </div>
      </div>` });

/* ═══════════════ 27 · CATEGORY LEADERSHIP ═══════════════ */
{
  const pillars = [
    ['EDUCATE WHAT PESTICIDE-FREE MEANS',
      ['Pesticide-free call-out with QR to the farmer, carrying the Jaivik Bharat logo, on the front of pack',
       'Invite parents, teachers and children to the farm to see the process and meet the farmers',
       'Bring the 56% core audience into cook-off sessions after the visit; give the 18% sceptics firsthand access',
       'Webinars and podcasts led by the farmers and doctors — the two voices the research says are believed',
       'On-ground activation in schools and colleges, and with GPs, gastro specialists and nutritionists. Catch them young']],
    ['OUT-PROOF EVERYONE: CERTIFICATION VISIBLE',
      ['Quick-commerce platforms like Zepto, Amazon — showcase the Pesticide-Free certificate for every product, on the app (Like Nykaa)',
       'The copycat test: when an incumbent prints "Pesticide-free", DeHaat Honest Farms asks publicly ” Where is the batch certificate?”']],
    ['VERTICAL SOURCING CONTROL: FARM TO FORK',
      ['Own the input decision, not just the output test. Control at sowing is what a competitor cannot contract for',
       'Embed the brand in Indian routine until the habit forms: Think Pesticide-free, Think Honest Farms']]
  ];
  slide({
    chapter: 'The moat & the ask',
    html: head('Category leadership', 'Open the category to make it a Proprietary Eponym',
      'A category only becomes large if others are allowed in. DeHaat Honest Farms wins not by owning the words, but by owning the standard, the proof, and the relevance in consumers’ lives.') + `
      <div class="body stack gap-lg spread">
        <div class="g3">${pillars.map(([t, b]) => card(`
            <i style="display:block;width:26px;height:4px;border-radius:2px;background:var(--green)"></i>
            <h4 style="font-size:12.5px;font-weight:800;color:var(--ink);letter-spacing:.02em;margin:10px 0 9px">${E(t)}</h4>
            ${ul(b, 'tight')}`, 'fill')).join('')}
        </div>
        <div>
          ${rule('Guardrails for communication in line with industry bodies')}
          <div class="split" style="grid-template-columns:1fr 1fr 168px;gap:16px">
            ${card(`${lbl('What we say', 'g')}${ul(['“Tested for 230+ pesticides. None Detected.”',
              '“No detectable pesticide residue, verified batch by batch.”',
              '“Independently lab-tested. Scan to see this batch’s report.”',
              '“Stronger residue testing than the organic standard requires.”'], 'tight')}`, 'flat fill" style="background:var(--greensoft)')}
            ${card(`${lbl('What we never say', 'c')}${ul(['“100% pesticide-free” — or any absolute.',
              '“Chemical-free”, “toxin-free”, “100% pure”.', '“Healthier than organic.”',
              'Anything implying the product prevents disease.', 'Never win by attacking organic or conventional.'], 'tight')}`, 'flat fill" style="background:var(--claysoft)')}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:center;justify-items:center">
              <img src="${A('jaivik.png')}" alt="Jaivik Bharat" style="width:52px">
              <img src="${A('fssai.png')}" alt="FSSAI" style="width:70px">
              <img src="${A('asci.png')}" alt="ASCI" style="width:80px;grid-column:1/-1">
            </div>
          </div>
        </div>
      </div>` });
}

/* ═══════════════ 28 · CLOSE ═══════════════ */
slide({
  bleed: true, dark: true, nofoot: true, html: `
      <div class="closing">
        ${fig('s28-sapling.jpg', 'plain', 'width:400px')}
        <p class="dhan">धन्यवाद</p>
        <img class="mk" src="${A('logo.png')}" alt="DeHaat Honest Farms">
      </div>` });

/* ═══════════════ assemble ═══════════════ */
let page = 0;
const frames = SLIDES.map((s, i) => {
  if (!s.nofoot) page += 1;
  const html = (s.html || '').replace('__PAGE__', String(page).padStart(2, '0'));
  const foot = (s.nofoot || s.bleed) ? '' : `
      <footer class="foot">
        ${s.src ? `<span class="foot-src">${E(s.src)}</span>` : ''}
        <span class="foot-n">${String(page).padStart(2, '0')}</span>
      </footer>`;
  const panel = s.panel
    ? `<figure style="position:absolute;right:0;top:0;bottom:0;width:${s.panelW || 420}px;border-radius:0"><img src="${A(s.panel)}" alt=""></figure>`
    : '';
  const cls = ['slide', s.dark ? 'dark' : '', s.cls || '', s.bleed ? 'bleed' : ''].filter(Boolean).join(' ');
  return `  <div class="frame" data-i="${i}">
    <div class="fit"><div class="holder">
      <section class="${cls}" data-notes="${s.notes ? E(s.notes.join(' — ')) : ''}">${panel}${html}${foot}
      </section>
    </div></div>
  </div>`;
}).join('\n');

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>DeHaat Honest Farms — Category Creation &amp; Scale Acceleration</title>
<meta name="description" content="ISB CGMO Cohort II · Business Leadership Challenge · Team 1. 28 slides on creating and owning the pesticide-free category.">
<link rel="icon" href="${A('favicon.svg')}">
<link rel="stylesheet" href="deck.css">
</head>
<body>
<div id="bar"></div>
<div id="stage">
${frames}
</div>

<div class="edited-dot" id="editedDot">Edited · saved in this browser</div>

<div id="hint">Scroll<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg></div>

<nav id="hud">
  <button id="prev" title="Previous (←)"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
  <span class="count" id="count">1 / ${SLIDES.length}</span>
  <button id="next" title="Next (→)"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
  <span class="sep"></span>
  <button id="grid" title="All slides (G)"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
  <button id="edit" class="wide" title="Edit any text on the deck (E)"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg><span>Edit text</span></button>
  <button id="save" title="Download this deck as HTML"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg></button>
  <button id="full" title="Fullscreen (F)"><svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M16 3h3a2 2 0 012 2v3"/><path d="M16 21h3a2 2 0 002-2v-3"/><path d="M8 21H5a2 2 0 01-2-2v-3"/></svg></button>
  <button id="ask" title="Keyboard shortcuts (?)">?</button>
</nav>

<div id="toast"></div>

<div id="help">
  <div class="panel">
    <h3>Getting around</h3>
    <dl>
      <dt>Scroll</dt><dd>The deck snaps to one slide at a time</dd>
      <dt>↓ &nbsp;Space</dt><dd>Next slide</dd>
      <dt>↑</dt><dd>Previous slide</dd>
      <dt>G</dt><dd>All slides at a glance — click one to jump</dd>
      <dt>E</dt><dd>Edit text — click any heading, bullet, table cell or chart label and type</dd>
      <dt>F</dt><dd>Fullscreen</dd>
      <dt>Home / End</dt><dd>First / last slide</dd>
      <dt>Esc</dt><dd>Close this, or leave edit mode</dd>
    </dl>
    <p>Edits are saved in this browser as you type, so a refresh keeps them. The download button writes a copy of the deck with your edits baked in. Ctrl/&#8984;+Z undoes inside a text block; the reset button in edit mode clears every change.</p>
  </div>
</div>

<script src="deck.js"></script>
</body>
</html>
`;

fs.writeFileSync(OUT, HTML);
console.log('wrote ' + OUT + '  (' + SLIDES.length + ' slides, ' + page + ' numbered)');
