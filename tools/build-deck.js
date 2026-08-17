/**
 * DeHaat Honest Farms — Category Creation & Scale Acceleration
 * Builds the editable slide deck (.pptx) from the same content and design
 * system as the website. Charts are drawn from native shapes so they stay
 * editable after a Canva import.
 *
 *   node tools/build-deck.js [out.pptx]
 */
const PptxGenJS = require('pptxgenjs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const A = f => path.join(ROOT, 'site', 'assets', f);
const OUT = process.argv[2] || path.join(ROOT, 'DHF-Honest-Farms-Deck.pptx');

/* ── palette (sampled from the Honest Farms logo) ───────────── */
const INK='0C1A2B', INK2='14283F';
const BLUE='3A5D97', BLUE2='6688BE', BLUESOFT='EAF0F8';
const GREEN='177A46', GREEN2='2FA362', GREEN3='5FC28C', GREENSOFT='E4F2EA';
const GOLD='9E7220', GOLD2='C8922E', GOLDSOFT='FAF0DA';
const CLAY='9E3A24', CLAY2='C4553B', CLAYSOFT='FBE9E3';
const PAPER='FCFAF6', WHITE='FFFFFF', SAND='F3ECE0', SAND2='EDE4D4', LINE='E5DCCB';
const TX='16202D', TX2='54606F', TX3='8B95A2', TXL='EEE9E0', TXL2='A9B6C7';
const GREY='B5AD9C';

/* ── type ───────────────────────────────────────────────────── */
const FD = 'Archivo Black';   // display — matches the HONEST FARMS wordmark
const FB = 'Nunito Sans';     // text — matches the rounded DeHaat wordmark

/* ── geometry ───────────────────────────────────────────────── */
const W = 13.333, H = 7.5, M = 0.55, CW = W - M * 2;

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Team 1 — ISB CGMO Cohort II';
pres.company = 'DeHaat Honest Farms';
pres.title = 'Category Creation & Scale Acceleration';

const shadow = () => ({ type: 'outer', color: '0C1A2B', opacity: 0.07, blur: 18, offset: 2, angle: 90 });

/* ═══════════ helpers ═══════════ */

function newSlide(bg) {
  const s = pres.addSlide();
  s.background = { color: bg || PAPER };
  return s;
}

/** The banner from the logo lockup, reused as the section marker. */
function banner(s, x, y, text, opt) {
  opt = opt || {};
  const t = text.toUpperCase();
  const w = t.length * 0.098 + 0.5;
  const h = 0.30;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.07,
    fill: { color: opt.fill || BLUE }, line: { width: 0 }
  });
  s.addText(t, {
    x, y, w, h, fontFace: FB, fontSize: 9, bold: true, color: opt.color || WHITE,
    align: 'center', charSpacing: 1.6, margin: 0, valign: 'middle'
  });
  return w;
}

/** eyebrow + title + optional lead. Returns the y where content may start. */
function head(s, eyebrow, title, lead, opt) {
  opt = opt || {};
  const light = !!opt.light;
  let y = 0.28;
  banner(s, M, y, eyebrow, light ? { fill: GREEN3, color: INK } : {});
  if (!opt.noMark) {
    s.addImage({ path: A('logo.png'), x: W - M - 1.25, y: 0.26, w: 1.25, h: 0.46 });
  }
  y = 0.64;
  const tSize = opt.titleSize || 25;
  const tH = opt.titleH || 0.86;
  s.addText(title, {
    x: M, y, w: opt.titleW || (CW - 1.5), h: tH, fontFace: FD, fontSize: tSize,
    color: light ? WHITE : INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02
  });
  y += tH + 0.04;
  if (lead) {
    s.addText(lead, {
      x: M, y, w: opt.leadW || 10.6, h: opt.leadH || 0.34, fontFace: FB, fontSize: 11,
      color: light ? TXL2 : TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.14
    });
    y += (opt.leadH || 0.34) + 0.06;
  }
  return y + 0.06;
}

/** page furniture: slide number + running foot */
let pageNo = 0;
function foot(s, chapter, light) {
  pageNo += 1;
  const n = String(pageNo).padStart(2, '0');
  s.addShape(pres.ShapeType.line, {
    x: M, y: H - 0.40, w: CW, h: 0,
    line: { color: light ? 'FFFFFF' : LINE, width: 0.75, transparency: light ? 84 : 0 }
  });
  s.addText((chapter || '').toUpperCase(), {
    x: M, y: H - 0.36, w: 5.6, h: 0.26, fontFace: FB, fontSize: 8, bold: true,
    color: light ? TXL2 : TX3, charSpacing: 1.4, margin: 0, valign: 'middle'
  });
  s.addText(n, {
    x: W - M - 1.0, y: H - 0.38, w: 1.0, h: 0.3, fontFace: FD, fontSize: 11,
    color: light ? GREEN3 : GREEN, align: 'right', margin: 0, valign: 'middle'
  });
}

/** a full-bleed statement, used to break between chapters */
function card(s, x, y, w, h, opt) {
  opt = opt || {};
  const stroked = opt.line !== undefined;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: opt.r === undefined ? 0.1 : opt.r,
    fill: { color: opt.fill || WHITE },
    line: stroked ? { color: opt.line, width: opt.lw === undefined ? 1.25 : opt.lw }
                  : { color: opt.fill || WHITE, width: 0.5 },
    shadow: opt.flat ? undefined : shadow()
  });
}

/** big number + caption block */
function stat(s, x, y, w, value, label, opt) {
  opt = opt || {};
  const h = opt.h || 1.35;
  const vs = opt.vs || 25;
  const vh = vs * 1.24 / 72 + 0.04;
  s.addShape(pres.ShapeType.line, { x, y, w, h: 0,
    line: { color: opt.rule || (opt.color || BLUE), width: 2 } });
  s.addText(value, {
    x, y: y + 0.16, w, h: vh, fontFace: FD,
    fontSize: vs, color: opt.color || BLUE, margin: 0, valign: 'top'
  });
  s.addText(label, {
    x, y: y + 0.2 + vh, w: w - 0.15, h: h - vh - 0.26, fontFace: FB, fontSize: 8.5,
    color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.14
  });
}

/** coloured callout box */
function box(s, x, y, w, h, title, body, tone) {
  const map = {
    green: [GREENSOFT, 'C6E3D3', GREEN], gold: [GOLDSOFT, 'EEDFBA', GOLD],
    clay: [CLAYSOFT, 'F0CDC2', CLAY], blue: [BLUESOFT, 'CBD9EE', BLUE],
    plain: [WHITE, LINE, INK]
  };
  const [fill, ln, tc] = map[tone || 'plain'];
  card(s, x, y, w, h, { fill, flat: true });
  let ty = y + 0.13;
  if (title) {
    const th = title.length > 40 ? 0.44 : 0.24;
    s.addText(title, { x: x + 0.22, y: ty, w: w - 0.44, h: th, fontFace: FB, fontSize: 10.5,
      bold: true, color: tc, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    ty += th + 0.03;
  }
  s.addText(body, { x: x + 0.22, y: ty, w: w - 0.44, h: y + h - ty - 0.1, fontFace: FB,
    fontSize: 9, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
}

/** small uppercase section label */
function label(s, x, y, w, t, color) {
  w = Math.min(w, W - M - x);
  s.addText(t.toUpperCase(), {
    x, y, w, h: 0.24, fontFace: FB, fontSize: 9.5, bold: true,
    color: color || TX3, charSpacing: 1.8, margin: 0, valign: 'middle'
  });
}

/* ── charts drawn from shapes (stay editable in Canva) ─────── */

/** horizontal bars: rows = [{label, value, display, color}] */
function hBars(s, x, y, w, rows, max, opt) {
  opt = opt || {};
  const rowH = opt.rowH || 0.5, barH = opt.barH || 0.15;
  rows.forEach((r, i) => {
    const ry = y + i * rowH;
    s.addText(r.label, { x, y: ry, w: w - 1.9, h: 0.22, fontFace: FB, fontSize: 9.5,
      color: TX2, margin: 0, valign: 'middle' });
    s.addText(r.display, { x: x + w - 1.9, y: ry, w: 1.9, h: 0.22, fontFace: FB, fontSize: 10,
      bold: true, color: r.color, align: 'right', margin: 0, valign: 'middle' });
    s.addShape(pres.ShapeType.roundRect, { x, y: ry + 0.24, w, h: barH, rectRadius: barH / 2,
      fill: { color: SAND2 }, line: { width: 0 } });
    const bw = Math.max(0.08, w * (r.value / max));
    s.addShape(pres.ShapeType.roundRect, { x, y: ry + 0.24, w: bw, h: barH, rectRadius: barH / 2,
      fill: { color: r.color }, line: { width: 0 } });
  });
  return y + rows.length * rowH;
}

/** vertical bars: rows = [{label, value, display, color}] */
function vBars(s, x, y, w, h, rows, max, opt) {
  opt = opt || {};
  const n = rows.length, gap = opt.gap || 0.16;
  const bw = (w - gap * (n - 1)) / n;
  const labelH = opt.labelH || 0.44;
  const plotH = h - labelH - 0.3;

  if (opt.band) {
    const by1 = y + 0.3 + plotH * (1 - opt.band[1] / max);
    const by2 = y + 0.3 + plotH * (1 - opt.band[0] / max);
    s.addShape(pres.ShapeType.roundRect, { x, y: by1, w, h: by2 - by1, rectRadius: 0.05,
      fill: { color: GOLDSOFT }, line: { width: 0 } });
    if (opt.bandLabel) {
      s.addText(opt.bandLabel.toUpperCase(), { x: x + 0.1, y: by1 - 0.26, w: w * 0.42, h: 0.22,
        fontFace: FB, fontSize: 8.5, bold: true, color: GOLD, charSpacing: 1.2, margin: 0,
        align: opt.bandAlign || 'left', valign: 'middle' });
    }
  }
  if (!opt.noGrid) {
    for (let g = 1; g <= 4; g++) {
      const gy = y + 0.3 + plotH * (1 - g / 4);
      s.addShape(pres.ShapeType.line, { x, y: gy, w, h: 0, line: { color: LINE, width: 0.5, dashType: 'sysDot' } });
    }
  }
  s.addShape(pres.ShapeType.line, { x, y: y + 0.3 + plotH, w, h: 0, line: { color: LINE, width: 1 } });

  rows.forEach((r, i) => {
    const bx = x + i * (bw + gap);
    const bh = Math.max(0.05, plotH * (r.value / max));
    const by = y + 0.3 + plotH - bh;
    s.addShape(pres.ShapeType.roundRect, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.05,
      fill: { color: r.color }, line: { width: 0 } });
    s.addText(r.display, { x: bx - 0.05, y: by - 0.3, w: bw + 0.1, h: 0.26, fontFace: FB,
      fontSize: 10.5, bold: true, color: INK, align: 'center', margin: 0, valign: 'bottom' });
    s.addText(r.label, { x: bx - 0.05, y: y + 0.34 + plotH, w: bw + 0.1, h: labelH, fontFace: FB,
      fontSize: 8.5, color: TX2, align: 'center', margin: 0, valign: 'top', lineSpacingMultiple: 1 });
  });
}


/** section rule + label, used to open a block inside a slide */
function rule(s, x, y, w, t, color) {
  s.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color: color || LINE, width: 1 } });
  s.addText(t.toUpperCase(), {
    x, y: y + 0.05, w, h: 0.24, fontFace: FB, fontSize: 9, bold: true,
    color: color || TX3, charSpacing: 1.6, margin: 0, valign: 'middle'
  });
  return y + 0.32;
}

const bullets = (arr, opt) => arr.map((t, i) => ({
  text: t, options: Object.assign({ bullet: true, breakLine: i < arr.length - 1 }, opt || {})
}));

/* ═════════════════ 01 · TITLE ═════════════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('makhana-farm.jpg'), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
  s.addImage({ path: A('veil-h.png'), x: 0, y: 0, w: W, h: H });

  s.addText('ISB CGMO COHORT II   ·   BUSINESS LEADERSHIP CHALLENGE', {
    x: M, y: 1.35, w: 9, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true,
    color: GREEN3, charSpacing: 2.8, margin: 0, valign: 'middle' });
  s.addImage({ path: A('logo.png'), x: M, y: 1.85, w: 2.5, h: 0.92 });
  s.addText('DeHaat Honest Farms:', {
    x: M, y: 3.02, w: 9.2, h: 0.66, fontFace: FD, fontSize: 30, color: WHITE, margin: 0, valign: 'top' });
  s.addText('Category Creation & Scale Acceleration', {
    x: M, y: 3.70, w: 11.4, h: 0.7, fontFace: FD, fontSize: 30, color: GREEN3, margin: 0, valign: 'top' });
  s.addText('Verified in the fields. Honest on the shelves.', {
    x: M, y: 4.74, w: 8, h: 0.4, fontFace: FB, fontSize: 15, italic: true, color: TXL, margin: 0, valign: 'middle' });

  s.addShape(pres.ShapeType.line, { x: M, y: 5.55, w: 9.6, h: 0,
    line: { color: 'FFFFFF', width: 0.75, transparency: 78 } });
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.78, w: 1.05, h: 0.32, rectRadius: 0.16,
    fill: { color: GREEN3 }, line: { color: GREEN3, width: 0.5 } });
  s.addText('TEAM 1', { x: M, y: 5.78, w: 1.05, h: 0.32, fontFace: FB, fontSize: 9, bold: true,
    color: INK, align: 'center', charSpacing: 1.4, margin: 0, valign: 'middle' });
  s.addText('Sabika Mirza   ·   Sharon Batliwalla   ·   Syed Kashif Ali   ·   Sonu Adarsh   ·   Abhishek Nandan', {
    x: M + 1.25, y: 5.78, w: 9.2, h: 0.32, fontFace: FB, fontSize: 11.5, color: TXL, margin: 0, valign: 'middle' });
}

/* ═════════════════ 02 · THE MANDATE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The mandate', 'Scale DHF from ₹53 Cr (FY26) to ₹300+ Cr in three years.',
    'Not by outspending organic, but by creating and owning a category that does not yet formally exist.',
    { titleH: 0.86, leadH: 0.34 });
  const phases = [
    ['PHASE 1', 'DIAGNOSE & DECODE', 'Build a shared, fact-based understanding of category, competition & consumer',
      ['Category & consumer insight base', 'Trust tension map + segmentation', 'Imitation risk heatmap', 'Internal diagnosis snapshot']],
    ['PHASE 2', 'CATEGORY & BRAND STRATEGY', 'Define what DHF must own in the mind of the consumers',
      ['Category creation framework', 'Positioning & Brand Architecture', 'Proof hierarchy', 'Codified Pesticide-Free standard']],
    ['PHASE 3', 'GROWTH ENGINE DESIGN', 'Decide where to play and how to win – the moat',
      ['Top growth drivers', 'Hero SKU list (10–15 SKUs)', 'Channel role matrix', 'Competitive defense playbook']],
    ['PHASE 4', 'SCALE BLUEPRINT', 'Build a sustainable, funded path to growth',
      ['5-year growth ambition', 'Investment & capital roadmap', 'Category Rulebook & governance', 'Operating model + KPI framework']]
  ];
  const cw = (CW - 0.26 * 3) / 4, ch = 2.62;
  phases.forEach(([n, t, d, o], i) => {
    const x = M + i * (cw + 0.26);
    card(s, x, y0, cw, ch);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: 0.05, h: ch, fill: { color: GREEN }, line: { color: GREEN, width: 0.5 } });
    s.addText(n, { x: x + 0.24, y: y0 + 0.16, w: cw - 0.4, h: 0.26, fontFace: FB, fontSize: 9, bold: true,
      color: GREEN, charSpacing: 1.4, margin: 0, valign: 'top' });
    s.addText(t, { x: x + 0.24, y: y0 + 0.44, w: cw - 0.4, h: 0.56, fontFace: FD, fontSize: 12.5,
      color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(d, { x: x + 0.24, y: y0 + 1.04, w: cw - 0.4, h: 0.66, fontFace: FB, fontSize: 9,
      color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
    s.addText(bullets(o), { x: x + 0.24, y: y0 + 1.74, w: cw - 0.4, h: 0.82, fontFace: FB, fontSize: 8.5,
      color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 2 });
  });

  const ey = rule(s, M, y0 + ch + 0.26, CW, 'The evidence base', BLUE);
  const ev = [
    ['305', 'Respondents for Quantitative survey. 5 metros · Fielded 28–29 May 2026, by 1Lattice'],
    ['31+', 'Qualitative respondents\n6 cities · intercepts, IDIs, ethnography'],
    ['₹90.9 Cr', 'Internal revenue audited\n4,365 MT · 8 half-years · 8 channels'],
    ['4', 'Competitors benchmarked\n11 DHF advantages stress-tested']
  ];
  ev.forEach(([v, l], i) => {
    const x = M + i * (CW / 4);
    s.addText(v, { x, y: ey, w: CW / 4 - 0.3, h: 0.42, fontFace: FD, fontSize: 21, color: BLUE, margin: 0, valign: 'top' });
    s.addText(l, { x, y: ey + 0.44, w: CW / 4 - 0.3, h: 0.6, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });
  foot(s, 'The mandate');
}

/* ═════════════════ 03 · THE WHITESPACE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The category', 'A ₹48,000 Cr Category with No Definition, No Standard, and No Owner.',
    'The whitespace is regulatory and semantic, not just commercial.', { titleH: 0.86, leadH: 0.32 });

  const stats = [
    ['84%', 'Indian consumers are extremely or very concerned about food safety (PwC Voice of the Consumer 2025)', 24],
    ['35.9%', 'Share of monitored samples with detectable residues, up from 22.6% in 2018–19', 24],
    ['2.8%', 'Of 86,401 FSSAI samples tested 2022–25 breached maximum residue limits', 24],
    ['$8.6B → $22B', 'India organic food, 2024 → 2033 (CAGR ~11%)', 17]
  ];
  const sw = (CW - 0.26 * 3) / 4;
  stats.forEach(([v, l, vs], i) => stat(s, M + i * (sw + 0.26), y0, sw, v, l, { color: BLUE, vs, h: 1.3 }));

  const cy = rule(s, M, y0 + 1.46, 6.4, 'Sizing the pesticide-free opportunity', BLUE);
  const tam = [
    ['TAM', '₹48,000 Cr', 1.0, 'Pesticide-free food across the top 300 cities. Anchored to Technopak\'s 5–6% organic-of-packaged-food potential (₹35,000 Cr), uplifted 1.3–1.5× because pesticide-free prices below organic.'],
    ['SAM', '₹13,500 Cr', 0.28, 'A 28% serviceability factor: staples, pulses, rice, spices and select value-added, sold through quick commerce, e-commerce and modern trade to ~25 Mn health-conscious households.'],
    ['SOM', '₹300–350 Cr', 0.026, 'The three-year ambition — 2.2–2.6% of SAM, 0.6–0.7% of TAM. Five-year aspiration ₹700–800 Cr.']
  ];
  const tw = 6.4;
  tam.forEach(([tag, v, frac, note], i) => {
    const y = cy + i * 0.94;
    card(s, M, y, tw, 0.84);
    s.addText(tag, { x: M + 0.2, y: y + 0.13, w: 0.7, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true,
      color: BLUE, charSpacing: 1.4, margin: 0, valign: 'middle' });
    s.addText(v, { x: M + 0.9, y: y + 0.1, w: 2.0, h: 0.32, fontFace: FD, fontSize: 15, color: INK, margin: 0, valign: 'middle' });
    s.addText(note, { x: M + 2.95, y: y + 0.1, w: tw - 3.15, h: 0.7, fontFace: FB, fontSize: 8, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.2, y: y + 0.6, w: 2.6, h: 0.09, rectRadius: 0.045,
      fill: { color: SAND2 }, line: { color: SAND2, width: 0.5 } });
    const c = i === 0 ? BLUE : i === 1 ? GREEN2 : GREEN;
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.2, y: y + 0.6, w: Math.max(0.09, 2.6 * frac), h: 0.09,
      rectRadius: 0.045, fill: { color: c }, line: { color: c, width: 0.5 } });
  });

  const rx = M + tw + 0.35, rw = CW - tw - 0.35;
  const ry = rule(s, rx, y0 + 1.46, rw, 'Why the category has not formed yet', BLUE);
  const reasons = [
    ['01', 'No standard definition, "pesticide-free" is not a regulated term in India'],
    ['02', 'Harder to prove than to claim; proof lives in back-end systems, not on pack'],
    ['03', 'Awkward economics; trust-led cost structure at a mass-premium price'],
    ['04', 'No player has codified or defended it; the term commoditizes before standards exist']
  ];
  reasons.forEach(([n, t], i) => {
    const y = ry + i * 0.52;
    s.addText(n, { x: rx, y, w: 0.4, h: 0.24, fontFace: FD, fontSize: 10, color: GREEN, margin: 0, valign: 'top' });
    s.addText(t, { x: rx + 0.42, y, w: rw - 0.42, h: 0.46, fontFace: FB, fontSize: 9, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  box(s, rx, ry + 2.16, rw, 1.26, 'DEMAND IS REAL. BELIEF IS THE BOTTLENECK.',
    'Indian shoppers will pay ~20% more for low-impact products — the highest of 11 countries surveyed; yet ~60% fear greenwashing and only ~29% trust corporate environmental claims.', 'green');

  foot(s, 'The category');
  s.addText('Source: *Technopak Report 2022-23', { x: 7.0, y: H - 0.36, w: 4.0, h: 0.26, fontFace: FB,
    fontSize: 7.5, color: TX3, align: 'right', margin: 0, valign: 'middle' });
}

/* ═════════════════ 04 · CATEGORY STRUCTURE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The shelf', 'Category Structure: Laddering on pricing & claims', null, { titleH: 0.86 });

  const tiers = [
    ['pk-vedaka.jpg', 'RETAILER & REGIONAL PRIVATE LABEL', 'Retailer QA and lab testing.', 'No Ownable Narrative'],
    ['pk-fortune.jpg', 'CONVENTIONAL NATIONAL PACKAGED', 'Factory & FSSAI process credibility.', 'Trust Story shallow, easily copied.'],
    ['pk-tatasampann.jpg', 'NATURAL OR NUTRITION-LED', 'Process + Nutrition + Brand Legacy.', 'Natural reads wholesome, Not Safer.'],
    ['pk-conscious.jpg', 'CLEAN-LABEL / PROVENANCE CHALLENGERS', 'Sourcing stories.', 'Premium, fragmented, No Mass Trust Code.'],
    ['pk-24mantra.jpg', 'CERTIFIED ORGANIC SPECIALISTS', 'NPOP/NOP certification + traceability.', 'Structurally higher price ladder; Scale Friction.']
  ];
  const tw = (CW - 0.22 * 4) / 5, th = 2.42;
  tiers.forEach(([img, t, a, b], i) => {
    const x = M + i * (tw + 0.22);
    card(s, x, y0, tw, th);
    s.addImage({ path: A(img), x: x + 0.42, y: y0 + 0.14, w: tw - 0.84, h: 1.02,
      sizing: { type: 'contain', w: tw - 0.84, h: 1.02 } });
    s.addText(t, { x: x + 0.18, y: y0 + 1.24, w: tw - 0.36, h: 0.42, fontFace: FB, fontSize: 8,
      bold: true, color: INK, charSpacing: 0.5, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
    s.addText(a, { x: x + 0.18, y: y0 + 1.68, w: tw - 0.36, h: 0.36, fontFace: FB, fontSize: 8,
      color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addText(b, { x: x + 0.18, y: y0 + 2.02, w: tw - 0.36, h: 0.34, fontFace: FB, fontSize: 8,
      bold: true, color: CLAY, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });

  const cy = rule(s, M, y0 + th + 0.24, CW, 'The price ladder: toor dal, ₹ / kg', BLUE);
  vBars(s, M + 0.1, cy, CW - 0.2, 2.5, [
    { label: 'Vedaka\n(private label)', value: 136, display: '₹136', color: BLUE2 },
    { label: 'Fortune', value: 145, display: '₹145', color: BLUE2 },
    { label: 'Tata Sampann', value: 156, display: '₹156', color: BLUE },
    { label: 'BB Royal\nOrganic', value: 157, display: '₹157', color: GOLD2 },
    { label: 'Organic Tattva', value: 255, display: '₹255', color: GREEN },
    { label: 'Tata Sampann\nOrganic', value: 257, display: '₹257', color: GREEN },
    { label: '24 Mantra\nOrganic', value: 306, display: '₹306', color: GREEN }
  ], 345, { band: [150, 250], bandLabel: 'Accessible-premium · ₹150–250 / kg', bandAlign: 'right', gap: 0.3, labelH: 0.44 });
  foot(s, 'The category');
}

/* ═════════════════ 05 · PROOF & CLAIMS BENCHMARKING ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The proof benchmark', 'Proof & Claims Benchmarking', null, { titleH: 0.86 });
  s.addText('WHO CAN ACTUALLY SHOW THEIR WORK', { x: M, y: y0 - 0.02, w: 7, h: 0.24, fontFace: FB,
    fontSize: 9, bold: true, color: TX3, charSpacing: 1.6, margin: 0, valign: 'middle' });

  const brands = [
    ['Organic Tattva', 'QR: YES', GREENSOFT, GREEN, '250-parameter farm-level residue test, QR on every pack to the batch report. The category benchmark.', false],
    ['24 Mantra  (ITC)', 'QR: NO', 'EDE8DF', TX3, 'EU + USDA + NPOP certification, 1.4 lakh acres, 27,500 farmers. Logos are the proof — no consumer-facing test report.', false],
    ['Tata Sampann', 'QR: NO', 'EDE8DF', TX3, 'Brand trust plus an "unpolished" visual cue and a celebrity anchor. No public batch-level residue disclosure.', false],
    ['Organic India  (Tata)', 'QR: NO', 'EDE8DF', TX3, 'Certification-heavy — USDA, EU, NPOP, Kosher — across 35+ export markets. Logos, not data.', false],
    ['DeHaat Honest Farms', 'QR: GAP', CLAYSOFT, CLAY, '230+ pesticide checks, batch-level testing, failing lots rejected. All of it invisible to the shopper.', true]
  ];
  const bw = (CW - 0.24 * 4) / 5, bh = 1.86;
  brands.forEach(([n, chip, cf, cc, d, isDhf], i) => {
    const x = M + i * (bw + 0.24);
    card(s, x, y0 + 0.28, bw, bh, { fill: isDhf ? BLUESOFT : WHITE, line: isDhf ? BLUE : undefined, lw: 1.5 });
    s.addText(n, { x: x + 0.2, y: y0 + 0.42, w: bw - 0.4, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true,
      color: INK, margin: 0, valign: 'top' });
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y0 + 0.74, w: 0.92, h: 0.24, rectRadius: 0.12,
      fill: { color: cf }, line: { color: cf, width: 0.5 } });
    s.addText(chip, { x: x + 0.2, y: y0 + 0.74, w: 0.92, h: 0.24, fontFace: FB, fontSize: 7.5, bold: true,
      color: cc, align: 'center', charSpacing: 0.8, margin: 0, valign: 'middle' });
    s.addText(d, { x: x + 0.2, y: y0 + 1.06, w: bw - 0.4, h: 1.0, fontFace: FB, fontSize: 8.5,
      color: isDhf ? CLAY : TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });
  });

  const iy = rule(s, M, y0 + 0.28 + bh + 0.26, 7.4, 'Imitation risk: months to copy', BLUE);
  hBars(s, M, iy, 7.4, [
    { label: 'Pesticide-Free label claim', value: 0.2, display: 'already copied', color: CLAY },
    { label: '200+ SKU breadth', value: 4.5, display: '3–6 months', color: CLAY2 },
    { label: 'Quick-commerce presence', value: 9, display: '6–12 months', color: GOLD2 },
    { label: '230+ quality checkpoints', value: 15, display: '12–18 months', color: GOLD2 },
    { label: 'QR batch traceability', value: 15, display: '12–18 months', color: BLUE2 },
    { label: 'Farm-level residue testing', value: 21, display: '18–24 months', color: BLUE },
    { label: 'Curated 5,000-farmer cohort', value: 30, display: '24–36 months', color: GREEN2 },
    { label: 'Farmer margin model', value: 48, display: '3–5 years', color: GREEN },
    { label: 'DeHaat agritech input control', value: 66, display: '5+ years', color: GREEN }
  ], 70, { rowH: 0.32, barH: 0.11 });

  const rx = M + 7.75, rw = CW - 7.75;
  const my = rule(s, rx, y0 + 0.28 + bh + 0.26, rw, 'Messaging consistency, scored*', BLUE);
  [['Tata Sampann', '9'], ['Organic Tattva', '8'], ['Organic India', '7'], ['24 Mantra', '6']].forEach(([n, v], i) => {
    const y = my + i * 0.42;
    s.addText(n, { x: rx, y, w: rw - 1.2, h: 0.3, fontFace: FB, fontSize: 10, color: TX2, margin: 0, valign: 'middle' });
    s.addText(v + '/10', { x: rx + rw - 1.2, y, w: 1.2, h: 0.3, fontFace: FD, fontSize: 12, color: INK,
      align: 'right', margin: 0, valign: 'middle' });
    s.addShape(pres.ShapeType.line, { x: rx, y: y + 0.34, w: rw, h: 0, line: { color: LINE, width: 0.5, dashType: 'dash' } });
  });
  box(s, rx, my + 1.86, rw, 1.1, null,
    '24 Mantra 6/10 — expected to reach 9/10 within 12 to 18 months of ITC integration.', 'clay');
  foot(s, 'The category');
  s.addText('Source: *Technopak Report 2022-23', { x: 7.0, y: H - 0.36, w: 4.0, h: 0.26, fontFace: FB,
    fontSize: 7.5, color: TX3, align: 'right', margin: 0, valign: 'middle' });
}

/* ═════════════════ 06 · SYSTEM-LED CHALLENGER ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Untapped opportunity', 'DeHaat Honest Farms: A Pesticide-free, System-led Challenger.',
    null, { titleH: 0.86 });
  s.addText('UNTAPPED OPPORTUNITY FOR DEHAAT HONEST FARMS.', { x: M, y: y0 - 0.02, w: 8, h: 0.24,
    fontFace: FB, fontSize: 9, bold: true, color: TX3, charSpacing: 1.6, margin: 0, valign: 'middle' });

  const advs = [
    ['01', 'AgriTech-embedded input control', 'We prevent pesticide use at source, rather than testing for it afterward', 'near zero'],
    ['02', 'Continuous quality intelligence across 2M farms', 'Quality trajectory is known before harvest, not after rejection', 'zero'],
    ['03', 'Farmer economic ecosystem', 'Supply exclusivity earned through 30 to 50% better farmer returns', 'minimal']
  ];
  advs.forEach(([n, t, d, u], i) => {
    const y = y0 + 0.3 + i * 1.3;
    card(s, M, y, 7.5, 1.16);
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.22, y: y + 0.22, w: 0.44, h: 0.44, rectRadius: 0.08,
      fill: { color: GREEN }, line: { color: GREEN, width: 0.5 } });
    s.addText(n, { x: M + 0.22, y: y + 0.22, w: 0.44, h: 0.44, fontFace: FD, fontSize: 9, color: WHITE,
      align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: M + 0.8, y: y + 0.16, w: 6.5, h: 0.3, fontFace: FB, fontSize: 11.5, bold: true,
      color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: M + 0.8, y: y + 0.46, w: 6.5, h: 0.36, fontFace: FB, fontSize: 9.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addText('CURRENT UTILIZATION IN BRAND COMMUNICATION: ' + u.toUpperCase(), {
      x: M + 0.8, y: y + 0.84, w: 6.5, h: 0.24, fontFace: FB, fontSize: 8, bold: true, color: CLAY,
      charSpacing: 0.8, margin: 0, valign: 'top' });
  });
  box(s, M, y0 + 4.2, 7.5, 0.88, null,
    'Proof comes from controlling procurement and processing, not from holding a certificate. No brand occupies it today, and DHF\'s own Shelf Price is inconsistent across platforms.', 'blue');

  const rx = M + 7.8, rw = CW - 7.8;
  s.addImage({ path: A('pack-toordal.jpg'), x: rx + rw / 2 - 1.05, y: y0 + 0.3, w: 2.1, h: 2.5,
    sizing: { type: 'contain', w: 2.1, h: 2.5 } });
  box(s, rx, y0 + 2.95, rw, 2.13, 'Priced as Accessible - Premium @ ₹150 – ₹250 / kg (Tur Daal for instance)',
    'Value and mainstream brands sit at ₹136/- to 157/-; certified organic sits at ₹255/- to 306/-.\nThe corridor between them is empty of trust codes and is already being squeezed from below by BB Royal Organic at ₹157/-.', 'gold');
  foot(s, 'The category');
}

/* ═════════════════ 07 · QUALITATIVE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Qualitative research by the team · 31 respondents across 6 cities',
    'Scope for education on the Pesticide-Free Category', null, { titleH: 0.86 });
  const sw = (CW - 0.3 * 2) / 3;
  [['70%', 'of in-market shoppers could not distinguish "organic" from "pesticide-free"', CLAY],
   ['100%', 'cited health of self & family as their primary food purchase driver', GREEN],
   ['0%', 'connected the word "pure" to pesticide residue — a language gap, not an interest gap', BLUE]
  ].forEach(([v, l, c], i) => stat(s, M + i * (sw + 0.3), y0, sw, v, l, { color: c, h: 1.1 }));

  const ty = rule(s, M, y0 + 1.28, 6.3, 'Four tensions beneath the category', BLUE);
  const tensions = [
    ['01', 'Conceptual fog, not an information gap', 'Consumers do not merely lack information — they hold incorrect information that feels correct'],
    ['02', 'Adulteration fatalism', '73% agree some adulteration is unavoidable. The risk is known and quietly accepted – example highest in chilli'],
    ['03', 'Bodily proof beats label proof', 'Confidence comes from energy, weight, blood work of self and family members'],
    ['04', 'Assumed safety in Makhana', 'Believed to be "grown from lotus stems" and "processed like popcorn". Neither is accurate, and it is the only category with no residue conversation']
  ];
  tensions.forEach(([n, t, d], i) => {
    const y = ty + i * 0.9;
    card(s, M, y, 6.3, 0.8, { r: 0.05 });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.045, h: 0.8, fill: { color: BLUE }, line: { color: BLUE, width: 0.4 } });
    s.addText(n + '   ' + t, { x: M + 0.2, y: y + 0.08, w: 6.0, h: 0.24, fontFace: FB, fontSize: 10,
      bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: M + 0.2, y: y + 0.32, w: 6.0, h: 0.44, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });

  const qx = M + 6.6, qw = CW - 6.6;
  const qy = rule(s, qx, y0 + 1.28, qw, 'In their own words', BLUE);
  const quotes = [
    ['“Pesticides are sometimes put in soil, not on fruits. This makes them pesticide-free.”', 'In-market intercept, Bengaluru'],
    ['“There is no such thing as Pesticide-Free. We have done enough research.”', 'In-market intercept, Bengaluru'],
    ['“Pesticide-free means no use of pesticides at any stage of the lifecycle of the produce.”', 'Organic farmer, Hyderabad — the most accurate definition in the sample'],
    ['“Testing information plays a very important role. Knowing the source and certifications matters most in rice and dal — they are staples.”', 'Benifer Lewis, 45, Mumbai']
  ];
  quotes.forEach(([q, c], i) => {
    const y = qy + i * 0.9;
    card(s, qx, y, qw, 0.8, { r: 0.05, fill: SAND });
    s.addText(q, { x: qx + 0.2, y: y + 0.07, w: qw - 0.4, h: 0.48, fontFace: FB, fontSize: 9, italic: true,
      color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
    s.addText(c, { x: qx + 0.2, y: y + 0.56, w: qw - 0.4, h: 0.2, fontFace: FB, fontSize: 7.5, color: TX3,
      margin: 0, valign: 'top' });
  });
  foot(s, 'The consumer');
}

/* ═════════════════ 08 · RESEARCH METHODOLOGY ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Quantitative research by 1Lattice – commissioned by DHF',
    'How the survey was built, and who answered it', null, { titleH: 0.86 });

  const ly = rule(s, M, y0, 6.1, 'Research methodology', BLUE);
  const meth = [
    ['~18 min', '50 questions across 10 topics and 4 food categories'],
    ['4 screens', 'Decision-maker role, purchase frequency, ≥2 of 4 categories, income — SEC D/E and sub-monthly buyers terminated'],
    ['15-item battery', 'Five-point Likert attitude statements, written for post-survey factor extraction'],
    ['2 trust grids', 'Six claims tested twice — once bare, once with an independent certificate attached']
  ];
  const mw = (6.1 - 0.24) / 2;
  meth.forEach(([v, d], i) => {
    const x = M + (i % 2) * (mw + 0.24);
    const y = ly + Math.floor(i / 2) * 1.12;
    card(s, x, y, mw, 1.0);
    s.addText(v, { x: x + 0.18, y: y + 0.1, w: mw - 0.36, h: 0.3, fontFace: FD, fontSize: 12, color: BLUE, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.18, y: y + 0.42, w: mw - 0.36, h: 0.5, fontFace: FB, fontSize: 8, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });
  const fy = ly + 2.32;
  card(s, M, fy, 6.1, 1.86, { fill: SAND, line: SAND2 });
  label(s, M + 0.2, fy + 0.1, 4, 'Fieldwork & governance', BLUE);
  s.addText(bullets([
    'Online panel, fielded by 1Lattice, 28–29 May 2026. n=305 after quality screening. Report dated 12 June 2026.',
    'Five metros: Delhi NCR 31% · Bengaluru 21% · Mumbai 17% · Ahmedabad 15% · Pune 15%.',
    'Category bases: rice n=253 · tur dal n=241 · red chilli n=164 · makhana n=58.',
    'Makhana is reported as directional only. Every segment claim in this deck rests on the full n=305 base, not on a category sub-base.'
  ]), { x: M + 0.2, y: fy + 0.36, w: 5.7, h: 1.4, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0,
    valign: 'top', lineSpacingMultiple: 1.1, paraSpaceAfter: 2 });

  const rx = M + 6.4, rw = CW - 6.4;
  const py = rule(s, rx, y0, rw, 'Consumer profiles', BLUE);
  const prof = [['78%', 'have a child under 12 and / or an elderly member at home'],
    ['82%', 'do the household grocery shopping entirely themselves'],
    ['63%', 'earn ₹1–2.5 Lakh per month'],
    ['58%', 'shop for groceries three or more times a week']];
  const pw = (rw - 0.2 * 3) / 4;
  prof.forEach(([v, l], i) => {
    const x = rx + i * (pw + 0.2);
    s.addText(v, { x, y: py, w: pw, h: 0.38, fontFace: FD, fontSize: 18, color: GREEN, margin: 0, valign: 'top' });
    s.addText(l, { x, y: py + 0.42, w: pw, h: 0.66, fontFace: FB, fontSize: 8, color: TX2, margin: 0,
      valign: 'top', lineSpacingMultiple: 1.08 });
  });
  const wy = rule(s, rx, py + 1.2, rw, 'Where they shop  (% using, multi-select)', BLUE);
  hBars(s, rx, wy, rw, [
    { label: 'Blinkit', value: 53, display: '53%', color: BLUE },
    { label: 'Swiggy Instamart', value: 43, display: '43%', color: BLUE },
    { label: 'Kirana', value: 41, display: '41%', color: BLUE2 },
    { label: 'BigBasket', value: 34, display: '34%', color: BLUE2 },
    { label: 'Amazon / JioMart', value: 30, display: '30%', color: BLUE2 },
    { label: 'Zepto', value: 29, display: '29%', color: BLUE },
    { label: 'Supermarkets', value: 10, display: '10%', color: GREY }
  ], 60, { rowH: 0.33, barH: 0.11 });
  box(s, rx, wy + 2.42, rw, 0.78, null,
    'A quick-commerce-first, metro sample: The exact cohort DHF already sells to, and the cohort that will decide whether the category forms and how it will shape.', 'blue');
  foot(s, 'The consumer');
}

/* ═════════════════ 09 · FACTOR ANALYSIS ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The analytical pipeline', 'Factor Analysis and K – Means on 15 Attitude Statements',
    null, { titleH: 0.86 });
  const steps = [
    ['1', '305 × 15 matrix', 'Every respondent scored on 15 five-point attitude statements'],
    ['2', 'Exploratory factor analysis', 'Principal-axis factoring with Varimax rotation'],
    ['3', '3 latent factors retained', 'Eigenvalues 5.55 · 1.50 · 1.03 — cumulative variance 42.6%'],
    ['4', 'K-means clustering (k=4)', 'Run on standardised factor scores, n_init = 20'],
    ['5', '4 archetypes', 'Named, sized, and profiled on trigger, barrier and channel']
  ];
  const cw = (CW - 0.24 * 4) / 5;
  steps.forEach(([n, t, d], i) => {
    const x = M + i * (cw + 0.24);
    card(s, x, y0, cw, 1.3);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y0 + 0.16, w: 0.32, h: 0.32,
      fill: { color: BLUESOFT }, line: { color: BLUESOFT, width: 0.4 } });
    s.addText(n, { x: x + 0.2, y: y0 + 0.16, w: 0.32, h: 0.32, fontFace: FD, fontSize: 9, color: BLUE,
      align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.2, y: y0 + 0.54, w: cw - 0.4, h: 0.38, fontFace: FB, fontSize: 9.5, bold: true,
      color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(d, { x: x + 0.2, y: y0 + 0.94, w: cw - 0.4, h: 0.32, fontFace: FB, fontSize: 7.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
  });

  const ay = y0 + 1.48;
  card(s, M, ay, CW, 0.72, { fill: INK, line: INK });
  s.addText('ADEQUACY — BOTH TESTS PASSED BEFORE EXTRACTION', { x: M + 0.25, y: ay, w: 4.4, h: 0.72,
    fontFace: FB, fontSize: 9, bold: true, color: GREEN3, charSpacing: 1.2, margin: 0, valign: 'middle' });
  [['KMO', '0.886', '"meritorious"'], ['BARTLETT', 'p < 0.001', 'sphericity rejected'],
   ['SILHOUETTE', '0.347', 'highest at k=4']].forEach(([k, v, n], i) => {
    const x = M + 5.05 + i * 2.45;
    s.addText(k, { x, y: ay + 0.08, w: 1.15, h: 0.26, fontFace: FB, fontSize: 7.5, bold: true, color: TXL2,
      charSpacing: 1, margin: 0, valign: 'middle' });
    s.addText(v, { x, y: ay + 0.32, w: 1.15, h: 0.32, fontFace: FD, fontSize: 12, color: WHITE, margin: 0, valign: 'middle' });
    s.addText(n, { x: x + 1.2, y: ay + 0.32, w: 1.2, h: 0.32, fontFace: FB, fontSize: 7.5, italic: true,
      color: TXL2, margin: 0, valign: 'middle' });
  });

  const fy = rule(s, M, ay + 0.94, CW, 'The three factors — and their defining statements', BLUE);
  const factors = [
    ['F1 — SOCIAL & EXPERIENTIAL TRUST', 'Trust is earned through people and events, not systems and symbols.', BLUE,
      [['Stopped buying after a news story', '0.68'], ['A doctor beats any pack logo', '0.62'],
       ['I trust a farmer I know by name', '0.59'], ['I prefer smaller brands', '0.53']]],
    ['F2 — SYSTEM DISTRUST & PREMIUM INTENT', 'The system is corrupt, and I will pay to exit it. This is the financial engine of premium food brands.', CLAY,
      [['Factories cannot be genuinely clean', '0.65'], ['Some adulteration is unavoidable', '0.50'],
       ['I would pay 20–30% more', '0.48'], ['The problem is proof, not cost', '0.47']]],
    ['F3 — PROOF-DEMANDING VIGILANCE', 'I will check it myself. Show me the evidence.', GREEN,
      [['I will pay only if a test is shown', '0.64'], ['I need to verify proof myself', '0.60'],
       ['I can spot a genuine claim', '0.55'], ['Cost blocks me from safer food', '0.48']]]
  ];
  const fw = (CW - 0.3 * 2) / 3;
  factors.forEach(([t, d, c, rows], i) => {
    const x = M + i * (fw + 0.3);
    card(s, x, fy, fw, 2.2);
    s.addShape(pres.ShapeType.rect, { x, y: fy, w: fw, h: 0.05, fill: { color: c }, line: { color: c, width: 0.4 } });
    s.addText(t, { x: x + 0.2, y: fy + 0.14, w: fw - 0.4, h: 0.24, fontFace: FB, fontSize: 9.5, bold: true,
      color: INK, charSpacing: 0.4, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: fy + 0.38, w: fw - 0.4, h: 0.4, fontFace: FB, fontSize: 8, italic: true,
      color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    rows.forEach(([st, ld], k) => {
      const y = fy + 0.8 + k * 0.33;
      s.addText(st, { x: x + 0.2, y, w: fw - 0.9, h: 0.2, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });
      s.addText(ld, { x: x + fw - 0.7, y, w: 0.5, h: 0.2, fontFace: FB, fontSize: 8.5, bold: true, color: INK,
        align: 'right', margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + 0.21, w: fw - 0.4, h: 0.05, rectRadius: 0.025,
        fill: { color: SAND2 }, line: { color: SAND2, width: 0.4 } });
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + 0.21, w: (fw - 0.4) * parseFloat(ld), h: 0.05,
        rectRadius: 0.025, fill: { color: c }, line: { color: c, width: 0.4 } });
    });
  });
  s.addText('The statistics didn’t create these groups; they revealed groups already in the data. At k=3, Guardians and Trusters merge into one unusable segment.', {
    x: M, y: fy + 2.3, w: CW, h: 0.36, fontFace: FB, fontSize: 9, italic: true, color: TX2, margin: 0, valign: 'top' });
  foot(s, 'The consumer');
}

/* ═════════════════ 10 · FOUR SEGMENTS ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Segmentation output', 'Four Customer Segments emerged from Research', null, { titleH: 0.86 });

  const rows = [
    ['Segment', 'n (%)', 'F1 Social', 'F2 Distrust', 'F3 Vigilance', 'Trust in cert. claim', 'Would pay 11%+'],
    ['Proof-Hungry Guardians', '109  (36%)', '+0.46', '+0.47', '+0.69', '4.4 / 5', '54%'],
    ['Social Trusters', '62  (20%)', '+0.65', '+0.17', '−0.89', '3.6 / 5', '34%'],
    ['Passive Defaulters', '80  (26%)', '−0.39', '−1.05', '−0.34', '3.5 / 5', '6%'],
    ['System Fatalists', '54  (18%)', '−1.09', '+0.41', '+0.13', '3.6 / 5', '22%']
  ];
  const accent = [GREEN, BLUE, GREY, CLAY];
  const colX = [0, 3.4, 4.8, 6.1, 7.45, 8.85, 10.5];
  const colW = [3.4, 1.4, 1.3, 1.35, 1.4, 1.65, 1.5];
  card(s, M, y0, CW, 0.44, { fill: SAND, line: SAND2, r: 0.04 });
  rows[0].forEach((h, c) => {
    s.addText(h.toUpperCase(), { x: M + colX[c] + 0.14, y: y0, w: colW[c] - 0.2, h: 0.44, fontFace: FB,
      fontSize: 7.5, bold: true, color: TX3, charSpacing: 0.8, align: c === 0 ? 'left' : 'right',
      margin: 0, valign: 'middle' });
  });
  rows.slice(1).forEach((r, i) => {
    const y = y0 + 0.44 + i * 0.46;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: 0.46, fill: { color: i % 2 ? PAPER : WHITE },
      line: { color: LINE, width: 0.4 } });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.05, h: 0.46, fill: { color: accent[i] },
      line: { color: accent[i], width: 0.4 } });
    r.forEach((cell, c) => {
      const isNeg = String(cell).indexOf('−') === 0;
      const isPos = String(cell).indexOf('+') === 0;
      s.addText(cell, { x: M + colX[c] + 0.14, y, w: colW[c] - 0.2, h: 0.46, fontFace: FB, fontSize: 9.5,
        bold: c === 0 || c === 6, color: isNeg ? CLAY : isPos ? GREEN : (c === 0 ? INK : TX2),
        align: c === 0 ? 'left' : 'right', margin: 0, valign: 'middle' });
    });
  });
  s.addText('Factor scores are standardized — 0 is the sample mean. Guardians are the only cluster positive on all three factors simultaneously.', {
    x: M, y: y0 + 0.44 + 4 * 0.46 + 0.06, w: CW, h: 0.28, fontFace: FB, fontSize: 8.5, italic: true,
    color: TX3, margin: 0, valign: 'middle' });

  const cy = rule(s, M, y0 + 0.44 + 4 * 0.46 + 0.44, 4.9, 'Percentage of segment willing to pay 11%+', BLUE);
  card(s, M, cy, 4.9, 2.1);
  vBars(s, M + 0.4, cy + 0.16, 4.1, 1.76, [
    { label: 'Guardians', value: 54, display: '54%', color: GREEN },
    { label: 'Trusters', value: 34, display: '34%', color: BLUE },
    { label: 'Fatalists', value: 22, display: '22%', color: CLAY },
    { label: 'Defaulters', value: 6, display: '6%', color: GREY }
  ], 62, { gap: 0.22, labelH: 0.26 });

  const rx = M + 5.2, rw = CW - 5.2;
  const ry = rule(s, rx, y0 + 0.44 + 4 * 0.46 + 0.44, rw, 'The trust wall, not the wallet wall', BLUE);
  s.addText(bullets([
    'Roughly half of every category’s buyers say they would pay nothing extra — and give the reason: they do not trust the claims',
    '44% sit inside a +10–20% corridor; only 5% accept 21–30%',
    'Yet 60% say they would pay 20–30% more if someone they trusted had independently verified it. Stated willingness to pay under distrust is a floor, not a ceiling'
  ]), { x: rx, y: ry, w: rw, h: 1.0, fontFace: FB, fontSize: 9, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 4 });
  box(s, rx, ry + 1.1, rw, 1.0, 'PREMIUM WILLINGNESS DOES NOT TRACK INCOME.',
    'It peaks in the ₹60K–1L band (71%) and falls to 32% in ₹1–1.5L. Geographically, it runs from Delhi NCR at 64% down to Ahmedabad at 33% — which makes Delhi NCR the launch market on belief, not on affluence.', 'gold');
  foot(s, 'The consumer');
}

/* ═════════════════ 11 · THE BUYER PERSONAS ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The buyer personas', 'The Buyer Personas', null, { titleH: 0.86 });
  const P = [
    ['Vandana Iyer', 'THE VERIFIER  ·  36%', 'PROOF-HUNGRY GUARDIAN', BLUE,
     '“The word organic on a label means nothing to me anymore. Show me the actual test report for this batch and I\'ll happily pay more.”',
     '34–45 · postgraduate · senior professional · nuclear family with young children · ₹1.5–2.5L+/month · Tier-1 metro',
     'Batch-specific lab report by QR; "below detectable limits"; a specialist who has personally reviewed it',
     'No way to verify independently; greenwashing fatigue; a scan, not a research project'],
    ['Meera Nair', 'THE BELIEVER  ·  20%', 'SOCIAL TRUSTER', GREEN,
     '“If my doctor and my sister both say it\'s good for the family, that\'s all the proof I need. I\'m not going to scan codes and read reports.”',
     '30–50 · graduate · homemaker or teacher · joint or extended family · ₹1–1.5L/month · Tier-1 and Tier-2',
     'Doctor and dietitian endorsement; a trusted person already using it; warm, relatable word of mouth',
     'Clinical, jargon-heavy messaging; conflicting opinions in her circle; nobody she trusts has vouched'],
    ['Karan Mehta', 'THE CRUISE-CONTROLLER  ·  26%', 'PASSIVE DEFAULTER', '8A8474',
     '“Honestly, I just buy whatever brand I know that looks decent and isn\'t overpriced. Food safety isn\'t something I lose sleep over.”',
     '26–38 · graduate · IT / sales / ops professional · DINK or small family · ₹80K–1.5L/month · heavy quick-commerce user',
     'Visible on the app he already uses; price parity with his usual brand; taste he notices',
     'Not stocked where he shops; a premium with no obvious reason; anything requiring effort to switch'],
    ['Sanjay Deshpande', 'THE SCEPTIC  ·  18%', 'SYSTEM FATALIST', CLAY,
     '“Every brand says it\'s pure. Adulteration is everywhere, and no factory is truly clean. Prove me wrong — but don\'t insult me with marketing.”',
     '38–55 · graduate to postgraduate · senior professional or business owner · established family · Tier-1 and Tier-2',
     'Unscripted farmer proof; independent, non-brand-paid verification; being shown what is imperfect',
     'Polished claims like everyone else\'s; certification with no visible teeth; anything that reads like a script']
  ];
  const pw = (CW - 0.24 * 3) / 4, ph = 4.62;
  P.forEach(([nm, arch, seg, c, quote, prof, conv, block], i) => {
    const x = M + i * (pw + 0.24);
    card(s, x, y0, pw, ph);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: pw, h: 0.05, fill: { color: c }, line: { color: c, width: 0.4 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y0 + 0.18, w: 0.54, h: 0.54, fill: { color: c }, line: { color: c, width: 0.4 } });
    s.addText(nm.charAt(0), { x: x + 0.2, y: y0 + 0.18, w: 0.54, h: 0.54, fontFace: FD, fontSize: 14,
      color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(nm, { x: x + 0.86, y: y0 + 0.2, w: pw - 1.06, h: 0.26, fontFace: FB, fontSize: 12, bold: true,
      color: INK, margin: 0, valign: 'middle' });
    s.addText(arch, { x: x + 0.86, y: y0 + 0.46, w: pw - 1.06, h: 0.24, fontFace: FB, fontSize: 8, bold: true,
      color: c, charSpacing: 0.8, margin: 0, valign: 'middle' });
    s.addText(seg, { x: x + 0.2, y: y0 + 0.82, w: pw - 0.4, h: 0.22, fontFace: FB, fontSize: 8, bold: true,
      color: TX3, charSpacing: 1.2, margin: 0, valign: 'middle' });
    s.addText(quote, { x: x + 0.2, y: y0 + 1.06, w: pw - 0.4, h: 0.9, fontFace: FB, fontSize: 8.5,
      italic: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addShape(pres.ShapeType.line, { x: x + 0.2, y: y0 + 2.02, w: pw - 0.4, h: 0,
      line: { color: LINE, width: 0.6, dashType: 'dash' } });
    [['Profile', prof, TX3], ['What converts her / him', conv, GREEN], ['What blocks the sale', block, CLAY]]
      .forEach(([t, d, col], j) => {
        const y = y0 + 2.1 + j * 0.84;
        label(s, x + 0.2, y, pw - 0.4, t, col);
        s.addText(d, { x: x + 0.2, y: y + 0.22, w: pw - 0.4, h: 0.58, fontFace: FB, fontSize: 8, color: TX2,
          margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
      });
  });
  box(s, M, y0 + ph + 0.16, CW, 0.6, null,
    'Guardians convert fast on facts. Trusters need a voice of assurance. Defaulters need shelf presence and price parity. Fatalists need to be shown the imperfections to win their trust.', 'green');
  foot(s, 'The consumer');
}

/* ═════════════════ 12 · TARGETING ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The targeting decision', 'The targeting decision: Where to play first ?', null, { titleH: 0.86 });
  const tg = [
    ['PRIMARY', '36%', 'Proof-Hungry Guardians', 'Largest segment, highest willingness to pay, and the only one that responds to the proof DHF already generates.', GREEN],
    ['SECONDARY', '20%', 'Social Trusters', 'Activated by the Guardians\' verification becoming social proof. Doctor endorsement bridges both segments at once.', BLUE],
    ['DEFER', '26%', 'Passive Defaulters', 'Proof-heavy messaging misfires. Capture cheaply in phase two, once the category feels default.', GREY],
    ['SEQUENCE LAST', '18%', 'System Fatalists', 'Smallest and hardest. Needs a separate radical-transparency, farmer / founder-direct playbook.', CLAY]
  ];
  const cw = (CW - 0.26 * 3) / 4;
  tg.forEach(([tag, pct, nm, d, c], i) => {
    const x = M + i * (cw + 0.26);
    card(s, x, y0, cw, 1.78);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 0.05, fill: { color: c }, line: { color: c, width: 0.4 } });
    s.addText(tag, { x: x + 0.2, y: y0 + 0.16, w: cw - 0.4, h: 0.22, fontFace: FB, fontSize: 8, bold: true,
      color: c, charSpacing: 1.2, margin: 0, valign: 'middle' });
    s.addText(pct, { x: x + 0.2, y: y0 + 0.4, w: cw - 0.4, h: 0.44, fontFace: FD, fontSize: 22, color: INK, margin: 0, valign: 'top' });
    s.addText(nm, { x: x + 0.2, y: y0 + 0.88, w: cw - 0.4, h: 0.24, fontFace: FB, fontSize: 10, bold: true,
      color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: y0 + 1.12, w: cw - 0.4, h: 0.62, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });

  const cy = rule(s, M, y0 + 1.94, 6.2, 'What would make you try a new brand?  (% naming it the single top driver)', BLUE);
  hBars(s, M, cy, 6.2, [
    { label: 'Doctor / child-specialist endorsement', value: 44, display: '44%', color: GREEN },
    { label: '"Below detectable limits" + QR to lab report', value: 27, display: '27%', color: BLUE },
    { label: 'Farmer\'s name and village on pack', value: 12, display: '12%', color: BLUE2 },
    { label: 'Government certificate as the lead message', value: 8, display: '8%', color: GREY },
    { label: '"Tested for 200+ chemicals"', value: 6, display: '6%', color: CLAY },
    { label: 'Farm-visit invitations', value: 3, display: '3%', color: GREY },
    { label: 'Side-by-side residue comparison vs rivals', value: 1, display: '1%', color: GREY }
  ], 50, { rowH: 0.33, barH: 0.11 });

  const rx = M + 6.6, rw = CW - 6.6;
  box(s, rx, cy, rw, 1.16, 'THE UNCOMFORTABLE FINDING',
    'DHF leads with the claim only 6% find convincing and barely uses the endorsement 44% name first. Doctor endorsement wins in every segment. 55% of Trusters, 56% of Defaulters, 50% of Fatalists. Only Guardians rank the QR lab report first.', 'clay');
  box(s, rx, cy + 1.26, rw, 1.14, 'THE LARGEST SEGMENT IS THE MOST VALUABLE',
    'Guardians are 36% of decision-makers but hold roughly 60% of all stated premium-rupee intent. They also do their own diligence, which means they generate the reviews, the doctor conversations and the proof trail that the next segment follows.', 'blue');
  card(s, rx, cy + 2.48, rw, 0.76, { fill: INK, line: INK });
  label(s, rx + 0.22, cy + 2.56, 3, 'The play', GREEN3);
  s.addText('Win Guardians with proof → convert their advocacy into the social proof that activates Trusters → ride the combined 56% into default category leadership.', {
    x: rx + 0.22, y: cy + 2.76, w: rw - 0.44, h: 0.44, fontFace: FB, fontSize: 9, color: TXL, margin: 0,
    valign: 'top', lineSpacingMultiple: 1.1 });
  foot(s, 'The consumer');
}

/* ═════════════════ 13 · CLAIM CLUTTER ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The shelf today', 'With every shelf using a different, often unverifiable claim, generic language adds to the noise.',
    null, { titleH: 0.86, titleSize: 21 });

  const ly = rule(s, M, y0, 6.2, 'GT & MT shelves are flooded with claims, sending diverse trust signals to consumers', BLUE);
  const claims = ['Farmer-face labelling - personal provenance', '‘Naturally grown’, ‘unpolished’',
    'Certification seal on label', '‘Direct from farmer’', '100% Natural'];
  let cx = M, cy = ly;
  claims.forEach(t => {
    const w = 0.068 * t.length + 0.4;
    if (cx + w > M + 6.2) { cx = M; cy += 0.46; }
    s.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w, h: 0.38, rectRadius: 0.19,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75, dashType: 'dash' } });
    s.addText(t, { x: cx, y: cy, w, h: 0.38, fontFace: FB, fontSize: 9, color: TX2, align: 'center', margin: 0, valign: 'middle' });
    cx += w + 0.12;
  });

  const shelfY = cy + 0.62;
  ['shelf-jars.jpg', 'shelf-poha.jpg', 'shelf-twobrothers.jpg', 'shelf-tribalveda.jpg', 'shelf-ingress.jpg']
    .forEach((f, i) => {
      const iw = (6.2 - 0.14 * 4) / 5;
      s.addImage({ path: A(f), x: M + i * (iw + 0.14), y: shelfY, w: iw, h: 1.5,
        sizing: { type: 'cover', w: iw, h: 1.5 } });
    });
  box(s, M, shelfY + 1.66, 6.2, 1.0, null,
    'DHF’s edge is a specific: Verifiable Proof Mechanism (QR + Test Data), not another claim in the pile.', 'green');

  const rx = M + 6.6, rw = CW - 6.6;
  const ny = rule(s, rx, y0, rw, 'Media is building the case for verified proof', BLUE);
  const news = [['news-ccpa.jpg', 'Regulatory crackdown'], ['news-ndtv.jpg', 'Market growth, affordability gap'],
    ['news-c.jpg', 'Celebrity & consumer validation'], ['news-3.jpg', 'Policy & certification landscape'],
    ['news-b.jpg', 'Pesticide safety alarm']];
  const nw = (rw - 0.2 * 2) / 3;
  news.forEach(([f, cap], i) => {
    const x = rx + (i % 3) * (nw + 0.2);
    const y = ny + Math.floor(i / 3) * 1.86;
    s.addImage({ path: A(f), x, y, w: nw, h: 1.24, sizing: { type: 'cover', w: nw, h: 1.24 } });
    s.addText(cap, { x, y: y + 1.28, w: nw, h: 0.44, fontFace: FB, fontSize: 8, color: TX2, margin: 0,
      valign: 'top', lineSpacingMultiple: 1.06 });
  });
  foot(s, 'Brand & proof');
}

/* ═════════════════ 14 · BRAND MANIFESTO ═════════════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('panel-spices.jpg'), x: 9.5, y: 0, w: 3.833, h: H });
  const y0 = head(s, 'Brand manifesto', 'We believe', null, { light: true, titleSize: 30, titleH: 0.72, titleW: 7.8 });
  s.addText('The future of food isn’t claimed on a label; it’s proven in the field. Every seed we recommend, every practice we track, and every farmer we name is how we turn honesty into something you can verify, not just believe.', {
    x: M, y: y0, w: 8.2, h: 0.9, fontFace: FB, fontSize: 13.5, color: TXL, margin: 0, valign: 'top', lineSpacingMultiple: 1.16 });

  s.addShape(pres.ShapeType.line, { x: M, y: y0 + 1.02, w: 8.2, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 76 } });
  s.addText('WE STAND FOR', { x: M, y: y0 + 1.07, w: 4, h: 0.24, fontFace: FB, fontSize: 9, bold: true,
    color: GREEN3, charSpacing: 1.6, margin: 0, valign: 'middle' });
  const values = [
    ['Resilience', 'We meet uncertainty with patience and grit, learning from the land and adapting so farmers can thrive through seasons and shocks.'],
    ['Integrity', 'Transparency is a mechanism, not a promise to be broken. You can check batch data, farmer names, and practices. They are not the claims you’re asked to believe.'],
    ['Simplicity', 'We turn complex agri-data into one clear signal, so our farmers can take confident actions, and consumers can trust what they see instantly.'],
    ['Progress', 'Not progress for its own sake, but progress powered by DeHaat’s own agri-tech, in service of tradition, not instead of it.'],
    ['Education and empowerment', 'We bridge Krishi wisdom and modern methods, so farming becomes more productive, profitable, and sustainable; inspiring young people to see agriculture as a modern opportunity.'],
    ['Connection', 'The farmer isn’t a sourcing story we tell; they’re the name on the batch, accountable and credited. When farmers prosper, supply is reliable; when consumers can trace what they buy back to a real farm, honesty becomes provable, not just promised.']
  ];
  const vw = (8.2 - 0.24) / 2;
  values.forEach(([t, d], i) => {
    const x = M + (i % 2) * (vw + 0.24);
    const y = y0 + 1.4 + Math.floor(i / 2) * 1.1;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: vw, h: 0.98, rectRadius: 0.08,
      fill: { color: '17304A' }, line: { color: '2E5470', width: 0.75 } });
    s.addText(t, { x: x + 0.18, y: y + 0.08, w: vw - 0.36, h: 0.26, fontFace: FD, fontSize: 9.5, color: WHITE,
      margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.18, y: y + 0.34, w: vw - 0.36, h: 0.58, fontFace: FB, fontSize: 8, color: TXL,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });
  s.addText([{ text: 'We are Honest Farms. ', options: { italic: true, color: TXL } },
             { text: 'Verified in the fields, Honest on the shelves.', options: { bold: true, color: GREEN3 } }], {
    x: M, y: y0 + 4.76, w: 8.2, h: 0.4, fontFace: FB, fontSize: 13.5, margin: 0, valign: 'middle' });
  foot(s, 'Brand & proof', true);
}

/* ═════════════════ 15 · BRAND PURPOSE ═════════════════ */
{
  const s = newSlide(SAND);
  s.addImage({ path: A('sapling.jpg'), x: 7.7, y: 0, w: 5.633, h: 6.92, sizing: { type: 'cover', w: 5.633, h: 6.92 } });
  head(s, 'Brand purpose', 'To nurture soil and skills, to do business honestly, and to prove it batch by batch, farmer by farmer.',
    null, { titleSize: 27, titleH: 3.0, titleW: 6.7 });
  s.addNotes('It’s a promise about the value you deliver to your customers.');
  foot(s, 'Brand & proof');
}

/* ═════════════════ 16 · FARMERS IN THE SPOTLIGHT ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Making backend Agri-tech Rigor visible to the consumers',
    'Flip the Script on QR Traceability: Farmers in the Spotlight', null, { titleH: 0.86 });
  const mechs = [
    ['QR to farmer', 'Scan the pack and land on a unique microsite of that farmer - know his village, harvest date, daily life, growth, consumer connects & download the Pesticide-Free Certificate.'],
    ['Village / Farm clusters on pack', 'Like most wine brands across the world, Bordeaux, Nice, Nashik, Napa Valley - Prove provenance.'],
    ['Farmers as content creators', 'They play the lead role with unscripted reels, voice notes, and live harvest streams. Rougher, less polished than a typical ad, which is exactly what signals "real" to a sceptical buyer.'],
    ['Hand-written Farmer Letters in pack', 'Rotating, handwritten-style notes from the actual farmer of that batch.'],
    ['Farmers send audit invitation', 'No need to give advance notice. Wins the prove me wrong archetype.'],
    ['Farmer-Led sampling', 'The farmers, not agency promoters, make demos at flea markets or housing societies to drive trials.'],
    ['Consumer-to-farmer feedback loop', 'Get consumers to review the farmers and their fields’ produce, instead of the product purchased.']
  ];
  const mw = (8.4 - 0.24) / 2;
  mechs.forEach(([t, d], i) => {
    const x = M + (i % 2) * (mw + 0.24);
    const y = y0 + Math.floor(i / 2) * 1.28;
    card(s, x, y, mw, 1.16);
    s.addShape(pres.ShapeType.rect, { x, y, w: 0.045, h: 1.16, fill: { color: GREEN }, line: { color: GREEN, width: 0.4 } });
    s.addText(t, { x: x + 0.2, y: y + 0.1, w: mw - 0.4, h: 0.26, fontFace: FB, fontSize: 10.5, bold: true,
      color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: y + 0.38, w: mw - 0.4, h: 0.7, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });
  const rx = M + 8.7, rw = CW - 8.7;
  s.addImage({ path: A('qr-scan.jpg'), x: rx, y: y0, w: rw, h: 2.55, sizing: { type: 'cover', w: rw, h: 2.55 } });
  s.addImage({ path: A('pack-range.jpg'), x: rx, y: y0 + 2.68, w: rw, h: 2.4, sizing: { type: 'cover', w: rw, h: 2.4 } });
  s.addNotes('4% → 22% full trust when the pesticide-free claim carries an independent certificate — a 5× uplift, the largest of any claim tested. The three layers together address the cognitive, institutional and "I can check it" needs at once.');
  foot(s, 'Brand & proof');
}

/* ═════════════════ 17 · BRAND ARCHITECTURE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Positioning', 'The only food brand in India that consumers verify, not just trust.',
    null, { titleH: 0.86 });
  const arch = [
    ['ROLE', 'An honest guide that leads with transparency, answers with proof, and never preaches.'],
    ['BELIEF', 'Progress moves from seed to plate, and every hand that touches it is named, not hidden.']
  ];
  arch.forEach(([t, d], i) => {
    const y = y0 + i * 1.04;
    card(s, M, y, 6.2, 0.94);
    label(s, M + 0.2, y + 0.14, 3, t, GREEN);
    s.addText(d, { x: M + 0.2, y: y + 0.4, w: 5.8, h: 0.48, fontFace: FB, fontSize: 10.5, color: TX,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  const bw = (6.2 - 0.2 * 2) / 3;
  [['FUNCTIONAL BENEFIT:', 'Verified safety.', 'No detectable residue.'],
   ['EMOTIONAL BENEFIT:', 'Relief.', 'You\'re no longer the only one keeping watch.'],
   ['EXPERIENTIAL BENEFIT:', 'Honest Progress with every basket,', 'from seed to plate.']].forEach(([t, b, d], i) => {
    const x = M + i * (bw + 0.2);
    const y = y0 + 2.14;
    card(s, x, y, bw, 1.5, { fill: SAND, line: SAND2 });
    label(s, x + 0.16, y + 0.14, bw - 0.3, t, BLUE);
    s.addText(b, { x: x + 0.16, y: y + 0.42, w: bw - 0.32, h: 0.5, fontFace: FB, fontSize: 10, bold: true,
      color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
    s.addText(d, { x: x + 0.16, y: y + 0.94, w: bw - 0.32, h: 0.46, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  card(s, M, y0 + 3.78, 6.2, 0.96, { fill: INK, line: INK });
  s.addText('PROMISE:', { x: M + 0.22, y: y0 + 3.9, w: 1.4, h: 0.26, fontFace: FB, fontSize: 9, bold: true,
    color: GREEN3, charSpacing: 1.4, margin: 0, valign: 'middle' });
  s.addText('Verified in the fields, Honest on the shelves.', { x: M + 0.22, y: y0 + 4.18, w: 5.76, h: 0.44,
    fontFace: FD, fontSize: 13.5, color: WHITE, margin: 0, valign: 'middle' });

  const rx = M + 6.5, rw = CW - 6.5;
  const sy = rule(s, rx, y0, rw, 'What the promise means to each stakeholder', BLUE);
  const stakes = [
    ['FARMERS/FPO', 'Dehaat trains Farmers for productivity, profitability and sustainability with simplified agri-tech data to give clear signals to consumers. Winning trust with no hidden stories, no shortcuts.'],
    ['Q-COMM, E-COMM & MTs', 'Made to win Honest Farms\' brand trust by showing superiority in backend agri-tech, not just another category claim on apps/shelves.'],
    ['CONSUMERS', 'Empowered to verify every batch, farmer, and agri practice before they add to cart and put food on the table.'],
    ['EMPLOYEES', 'Hire and train to demonstrate the spirit of progress - bringing Krishi wisdom and modern methods to make farming more productive, profitable, and sustainable.']
  ];
  const kw = (rw - 0.22) / 2;
  stakes.forEach(([t, d], i) => {
    const x = rx + (i % 2) * (kw + 0.22);
    const y = sy + Math.floor(i / 2) * 2.32;
    card(s, x, y, kw, 2.16);
    label(s, x + 0.18, y + 0.14, kw - 0.36, t, BLUE);
    s.addText(d, { x: x + 0.18, y: y + 0.44, w: kw - 0.36, h: 1.6, fontFace: FB, fontSize: 9, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });
  });
  foot(s, 'Brand & proof');
}

/* ═════════════════ 18 · THE NORTH STAR ═════════════════ */
{
  const s = newSlide(INK);
  const y0 = head(s, 'The North Star', 'Be the only food brand in India that consumers verify, not just trust.',
    null, { light: true, titleSize: 28, titleH: 1.4, titleW: 10.4 });
  card(s, M, y0, CW, 1.12, { fill: INK2, line: '2B4258' });
  label(s, M + 0.25, y0 + 0.14, 5, 'How do we measure success?', GREEN3);
  s.addText('Verified Purchase Rate — the % of purchases where a consumer engages a real proof point (batch QR scan, farmer profile, lab report) before or after buying the product.', {
    x: M + 0.25, y: y0 + 0.42, w: CW - 0.5, h: 0.6, fontFace: FB, fontSize: 11.5, color: TXL, margin: 0,
    valign: 'top', lineSpacingMultiple: 1.1 });

  const vy = y0 + 1.42;
  const vpr = [['V', 'Vandana - The Verifier', 'Scans the batch QR; visits the microsite to engage with farmers'],
    ['M', 'Meera - The Believer', 'Confirms it with her doctor or her circle of influence'],
    ['K', 'Karan -  The Cruise Controller', 'Notices it’s on his app already; repeat-buys anyway'],
    ['S', 'Sanjay - The Sceptic', 'Watches unscripted farm content; takes up an audit invite from the farmer']];
  const vw = (CW - 0.28 * 3) / 4;
  vpr.forEach(([i0, t, d], i) => {
    const x = M + i * (vw + 0.28);
    s.addShape(pres.ShapeType.roundRect, { x, y: vy, w: vw, h: 2.1, rectRadius: 0.08,
      fill: { color: '17304A' }, line: { color: '2E5470', width: 0.75 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.22, y: vy + 0.2, w: 0.46, h: 0.46,
      fill: { color: GREEN3 }, line: { color: GREEN3, width: 0.4 } });
    s.addText(i0, { x: x + 0.22, y: vy + 0.2, w: 0.46, h: 0.46, fontFace: FD, fontSize: 11, color: INK,
      align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.22, y: vy + 0.76, w: vw - 0.44, h: 0.28, fontFace: FB, fontSize: 10.5, bold: true,
      color: WHITE, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.22, y: vy + 1.08, w: vw - 0.44, h: 0.9, fontFace: FB, fontSize: 9.5, color: TXL2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });
  });

  s.addShape(pres.ShapeType.line, { x: M, y: vy + 2.38, w: CW, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 80 } });
  s.addText('Revenue and share are outcomes. Verified Purchase Rate is the lever that sales, product, and marketing teams continuously optimize.', {
    x: M, y: vy + 2.54, w: CW, h: 0.56, fontFace: FD, fontSize: 15, color: WHITE, margin: 0, valign: 'top',
    lineSpacingMultiple: 1.06 });
  s.addNotes([
    'It is the only metric that goes down if the proof mechanism breaks — brand awareness would not.',
    'It is measurable from day one, without a tracker study: scans, microsite sessions, report downloads, audit sign-ups.',
    'It is the one number a professor, a retailer and a farmer would all read the same way.',
    'Karan counts as verified without ever scanning — someone else’s verification is what put the product in front of him. That is how a category becomes the default.'
  ].join('\n'));
  foot(s, 'Brand & proof', true);
}

/* ═════════════════ 19 · PROOF ARCHITECTURE ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Proof architecture', 'One standard, four communication deliveries', null, { titleH: 0.86 });
  const dl = [
    ['Vandana — The Verifier', 'PROOF-HUNGRY GUARDIANS  ·  36%', BLUE, '“Scan the pack. See exactly what\'s inside.”',
      ['QR to the batch-level lab report and the farmer', 'Doctor or dietitian citation on pack, beside the farmer\'s view', 'Certification carrying a live verification link'],
      'QR code  ·  D2C  ·  Modern trade', 'Fast, once proof is visible. She does her own diligence.'],
    ['Meera — The Believer', 'SOCIAL TRUSTERS  ·  20%', GREEN, '“Ask your doctor. Then ask your sister. They\'ve approved us.”',
      ['Doctor and dietitian partnership programme', 'Referral incentive for existing customers', 'Testimonials from families she recognises'],
      'Clinic tie-ups  ·  Community WhatsApp  ·  WOM', 'Medium. Needs one or two trusted validators, then sticks.'],
    ['Karan — The Cruise-Controller', 'PASSIVE DEFAULTERS  ·  26%', GREY, '“Same taste. Same price. Honestly, better choice.”',
      ['Priority placement in quick-commerce search', 'Price parity with the brand he already buys', 'Taste-forward sampling, never health-forward'],
      'Quick commerce  ·  Modern trade endcaps', 'Fast to trial, low loyalty. Needs habitual reinforcement.'],
    ['Sanjay — The Sceptic', 'SYSTEM FATALISTS  ·  18%', CLAY, '“We\'ll show you the parts no brand talks about.”',
      ['Unscripted farmer and founder video content', 'Open invitations to audit or visit the farm', 'Independent verification nobody paid for'],
      'Farmer-direct platforms  ·  Founder-led content', 'Slowest — but becomes a vocal advocate once earned.']
  ];
  const cw = (CW - 0.26 * 3) / 4, ch = 3.5;
  dl.forEach(([n, seg, c, line, mech, chn, sp], i) => {
    const x = M + i * (cw + 0.26);
    card(s, x, y0, cw, ch);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 0.05, fill: { color: c }, line: { color: c, width: 0.4 } });
    s.addText(n, { x: x + 0.2, y: y0 + 0.16, w: cw - 0.4, h: 0.26, fontFace: FB, fontSize: 10.5, bold: true,
      color: INK, margin: 0, valign: 'top' });
    s.addText(seg, { x: x + 0.2, y: y0 + 0.42, w: cw - 0.4, h: 0.2, fontFace: FB, fontSize: 7, bold: true,
      color: TX3, charSpacing: 0.6, margin: 0, valign: 'top' });
    s.addText(line, { x: x + 0.2, y: y0 + 0.66, w: cw - 0.4, h: 0.54, fontFace: FB, fontSize: 9.5, italic: true,
      bold: true, color: c, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
    label(s, x + 0.2, y0 + 1.3, cw - 0.4, 'The mechanism');
    s.addText(bullets(mech), { x: x + 0.2, y: y0 + 1.54, w: cw - 0.4, h: 1.1, fontFace: FB, fontSize: 8,
      color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 3 });
    label(s, x + 0.2, y0 + 2.68, cw - 0.4, 'Channel');
    s.addText(chn, { x: x + 0.2, y: y0 + 2.9, w: cw - 0.4, h: 0.32, fontFace: FB, fontSize: 8.5, bold: true,
      color: TX, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    label(s, x + 0.2, y0 + 3.2, cw - 0.4, 'Conversion speed');
    s.addText(sp, { x: x + 0.2, y: y0 + 3.4, w: cw - 0.4, h: 0.28, fontFace: FB, fontSize: 8, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.0 });
  });

  const my = rule(s, M, y0 + ch + 0.2, CW, 'Trust is multi-dimensional for each archetype', BLUE);
  const mrows = [
    ['', 'Vandana', 'Meera', 'Karan', 'Sanjay'],
    ['Trust lever', 'Verified data (QR + lab)', 'Human endorsement', 'Familiarity, shelf presence', 'Radical transparency'],
    ['Price perception', 'Premium OK, with proof', 'Modest premium if endorsed', 'Expects price parity', 'Suspicious of any premium'],
    ['Key to win', 'Batch proof + doctor review', 'Get her circle to vouch', 'Be visible and taste-led', 'Show the imperfect parts']
  ];
  const mcw = [2.0, 2.56, 2.56, 2.56, 2.56];
  mrows.forEach((r, ri) => {
    const y = my + ri * 0.33;
    if (ri === 0) s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: 0.33, fill: { color: SAND }, line: { color: SAND, width: 0.4 } });
    let x = M;
    r.forEach((cell, ci) => {
      s.addText(cell, { x: x + 0.12, y, w: mcw[ci] - 0.2, h: 0.33, fontFace: FB, fontSize: 8.5,
        bold: ri === 0 || ci === 0, color: ri === 0 ? TX3 : (ci === 0 ? TX3 : TX2), margin: 0, valign: 'middle' });
      x += mcw[ci];
    });
    if (ri > 0) s.addShape(pres.ShapeType.line, { x: M, y: y + 0.33, w: CW, h: 0, line: { color: LINE, width: 0.4 } });
  });
  foot(s, 'Brand & proof');
}

/* ═════════════════ 20 · LAYING THE FOUNDATION ═════════════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('warehouse.jpg'), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
  s.addImage({ path: A('veil-h.png'), x: 0, y: 0, w: W, h: H });
  s.addImage({ path: A('logo.png'), x: W - M - 1.5, y: 0.5, w: 1.5, h: 0.55 });
  banner(s, M, 3.42, 'Warehouse', { fill: GREEN3, color: INK });
  s.addText('Laying the Foundation For Growth over the next 5 years', {
    x: M, y: 3.88, w: 10.2, h: 1.5, fontFace: FD, fontSize: 36, color: WHITE, margin: 0, valign: 'top',
    lineSpacingMultiple: 1.04 });
  pageNo += 1;
}

/* ═════════════════ 21 · PORTFOLIO REALITY ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Internal diagnosis', 'DHFs Strategy says accessible - premium food brand. Portfolio says commodities.',
    null, { titleH: 0.86, titleSize: 23 });
  const sw = (CW - 0.26 * 3) / 4;
  [['₹90.9 Cr', 'Cumulative revenue audited across eight half-years; FY26 ≈ ₹53 Cr, up ~30% YoY', BLUE],
   ['+219%', 'Growth of the value-added block (makhana, jaggery, honey) = 29% of revenue, the real engine', GREEN],
   ['24%', 'Of revenue from a single account, Zepto — and one rupee in four is at platform mercy', CLAY],
   ['~33%', 'Of revenue (≈₹30 Cr) has no channel attribution at all', CLAY]
  ].forEach(([v, l, c], i) => stat(s, M + i * (sw + 0.26), y0, sw, v, l, { color: c, h: 1.32 }));

  const cy = rule(s, M, y0 + 1.5, 6.6, 'Portfolio mix vs portfolio growth  (cumulative ₹ Cr, growth %)', BLUE);
  card(s, M, cy, 6.6, 2.72);
  hBars(s, M + 0.3, cy + 0.22, 6.0, [
    { label: 'Pulses  ·  56% of revenue', value: 50.4, display: '₹50.4 Cr · +113%', color: BLUE },
    { label: 'Value-Added  ·  29%', value: 26.0, display: '₹26.0 Cr · +219%', color: GREEN },
    { label: 'Spices  ·  12%', value: 10.9, display: '₹10.9 Cr · +185%', color: GOLD2 },
    { label: 'Oil & Ghee  ·  1%', value: 0.8, display: '₹0.8 Cr · NPD', color: GREY }
  ], 56, { rowH: 0.58, barH: 0.16 });

  const rx = M + 6.9, rw = CW - 6.9;
  const ty = rule(s, rx, y0 + 1.5, rw, 'Three tension points that decide the strategy', BLUE);
  const tens = [
    ['01', 'Revenue is anchored in the slowest-growing, lowest-margin block.', 'Pulses are 56% of revenue and grow below the portfolio average.'],
    ['02', 'Realization is falling while volume rises.', 'Revenue per MT fell 4.3% in FY26-H2; a margin warning masked by tonnage.'],
    ['03', 'Proof is asserted, not demonstrated.', 'Seven simultaneous taglines, no hierarchy, and "230+ quality checks" stated but never explained.']
  ];
  tens.forEach(([n, t, d], i) => {
    const y = ty + i * 0.94;
    card(s, rx, y, rw, 0.84, { r: 0.05 });
    s.addShape(pres.ShapeType.rect, { x: rx, y, w: 0.045, h: 0.84, fill: { color: CLAY }, line: { color: CLAY, width: 0.4 } });
    s.addText(n + '   ' + t, { x: rx + 0.2, y: y + 0.08, w: rw - 0.4, h: 0.36, fontFace: FB, fontSize: 9.5,
      bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(d, { x: rx + 0.2, y: y + 0.46, w: rw - 0.4, h: 0.34, fontFace: FB, fontSize: 8.5, color: TX2,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  foot(s, 'The growth engine');
}

/* ═════════════════ 22 · THE TRAJECTORY ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The growth ambition', '₹53 Cr today. ₹748 Cr by FY31.',
    'Where to sell it. What to sell. What it costs.', { titleH: 0.86, leadH: 0.32 });
  card(s, M, y0, 8.2, 4.98);
  label(s, M + 0.3, y0 + 0.2, 5, 'Net revenue, ₹ Cr', BLUE);
  vBars(s, M + 0.4, y0 + 0.6, 7.4, 4.1, [
    { label: 'FY26', value: 53, display: '₹53', color: BLUE2 },
    { label: 'FY27', value: 104, display: '₹104', color: BLUE2 },
    { label: 'FY28', value: 168, display: '₹168', color: BLUE },
    { label: 'FY29', value: 274, display: '₹274', color: GREEN2 },
    { label: 'FY30', value: 450, display: '₹450', color: GREEN2 },
    { label: 'FY31', value: 748, display: '₹748', color: GREEN }
  ], 830, { gap: 0.3, labelH: 0.3 });

  const rx = M + 8.5, rw = CW - 8.5;
  [['14.1×', 'On the FY26 base of ₹53 cr'],
   ['64%', 'Net revenue CAGR, FY27 to FY31'],
   ['+5.8pp', 'Gross margin, 37.5% → 43.3%']].forEach(([v, l], i) => {
    stat(s, rx, y0 + i * 1.24, rw, v, l, { color: GREEN, h: 1.1, vs: 22 });
  });
  s.addImage({ path: A('value-added.jpg'), x: rx, y: y0 + 3.78, w: rw, h: 1.2, sizing: { type: 'cover', w: rw, h: 1.2 } });
  foot(s, 'The growth engine');
}

/* ═════════════════ 23 · CATEGORY MIX ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Portfolio design', 'Spices carry the margin.', null, { titleH: 0.86 });
  card(s, M, y0, 7.9, 4.98);
  label(s, M + 0.3, y0 + 0.2, 6, 'Revenue by category, ₹ Cr — FY27 vs FY31', BLUE);
  const mix = [['Pulses', 43, 228], ['Spices', 18, 202], ['Value-Added', 32, 169], ['Oil & Ghee', 9, 120], ['Processed', 2, 30]];
  const gx = M + 0.45, gw = 7.1, plotH = 3.68, gy = y0 + 0.6;
  const gmax = 250;
  s.addShape(pres.ShapeType.line, { x: gx, y: gy + plotH, w: gw, h: 0, line: { color: LINE, width: 0.75 } });
  const grpW = gw / mix.length;
  mix.forEach(([nm, a, b], i) => {
    const bx = gx + i * grpW;
    const bw2 = (grpW - 0.34) / 2;
    [[a, BLUE2, 0], [b, GREEN, 1]].forEach(([v, c, k]) => {
      const bh = Math.max(0.04, plotH * (v / gmax));
      const x = bx + 0.1 + k * (bw2 + 0.12);
      s.addShape(pres.ShapeType.roundRect, { x, y: gy + plotH - bh, w: bw2, h: bh, rectRadius: 0.05,
        fill: { color: c }, line: { color: c, width: 0.4 } });
      s.addText('₹' + v, { x: x - 0.1, y: gy + plotH - bh - 0.26, w: bw2 + 0.2, h: 0.24, fontFace: FB,
        fontSize: 8.5, bold: true, color: INK, align: 'center', margin: 0, valign: 'bottom' });
    });
    s.addText(nm, { x: bx, y: gy + plotH + 0.06, w: grpW, h: 0.26, fontFace: FB, fontSize: 8.5, color: TX2,
      align: 'center', margin: 0, valign: 'top' });
  });
  s.addShape(pres.ShapeType.rect, { x: gx, y: gy + plotH + 0.42, w: 0.16, h: 0.16, fill: { color: BLUE2 }, line: { color: BLUE2, width: 0.4 } });
  s.addText('FY27', { x: gx + 0.24, y: gy + plotH + 0.38, w: 0.7, h: 0.24, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });
  s.addShape(pres.ShapeType.rect, { x: gx + 1.05, y: gy + plotH + 0.42, w: 0.16, h: 0.16, fill: { color: GREEN }, line: { color: GREEN, width: 0.4 } });
  s.addText('FY31', { x: gx + 1.29, y: gy + plotH + 0.38, w: 0.7, h: 0.24, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });

  const rx = M + 8.2, rw = CW - 8.2;
  [['11.2×', 'Spices, FY27 → FY31. Mix moves from 17% to 27% of revenue, at 51–58% gross margin.'],
   ['₹99.9 Cr', 'Makhana — the single largest SKU in the FY31 plan, and a realisation play, not a tonnage play.'],
   ['₹95.5 Cr', 'From four ground spice powders that do not exist today. Pure NPD, from a zero base.']
  ].forEach(([v, l], i) => stat(s, rx, y0 + i * 1.3, rw, v, l, { color: GREEN, h: 1.18, vs: 21 }));
  box(s, rx, y0 + 3.96, rw, 1.42, null,
    'Pulses hold the volume base. Spices deliver the entire +5.8pp of margin expansion. So, a slipped spice launch is a slipped P&L.', 'clay');
  foot(s, 'The growth engine');
}

/* ═════════════════ 24 · DISTRIBUTION ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The distribution roadmap', 'Earn the shelf. Then densify it.', null, { titleH: 0.86 });
  const sw = (CW - 0.3 * 2) / 3;
  [['22,628', 'selling points by FY31, from 1,672 today'],
   ['110', 'offline cities, from 22 today'],
   ['40%', 'the ceiling on any single channel\'s share of revenue']
  ].forEach(([v, l], i) => stat(s, M + i * (sw + 0.3), y0, sw, v, l, { h: 1.1 }));

  const cy = rule(s, M, y0 + 1.28, 6.6, 'Channel mix at FY31, ₹ Cr', BLUE);
  card(s, M, cy, 6.6, 2.6);
  hBars(s, M + 0.3, cy + 0.22, 6.0, [
    { label: 'E-commerce & quick commerce', value: 304, display: '₹304 Cr', color: BLUE },
    { label: 'Regional & premium offline', value: 263, display: '₹263 Cr', color: GREEN },
    { label: 'National modern trade', value: 129, display: '₹129 Cr', color: BLUE2 },
    { label: 'Exports', value: 54, display: '₹54 Cr', color: GOLD2 }
  ], 340, { rowH: 0.55, barH: 0.16 });
  box(s, M, cy + 2.72, 6.6, 0.82, null,
    'No single channel above 40% — the ceiling is what stops the plan becoming a bet on one platform.', 'blue');

  const rx = M + 6.9, rw = CW - 6.9;
  const ry = rule(s, rx, y0 + 1.28, rw, 'The sequence', BLUE);
  ['Earn the metro shelf', 'Ride quick commerce into Tier 2 & 3', 'Convert regional chains, state by state',
   'Densify what is already open'].forEach((t, i) => {
    const y = ry + i * 0.72;
    card(s, rx, y, rw, 0.62);
    s.addShape(pres.ShapeType.ellipse, { x: rx + 0.2, y: y + 0.11, w: 0.4, h: 0.4, fill: { color: BLUE }, line: { color: BLUE, width: 0.4 } });
    s.addText(String(i + 1), { x: rx + 0.2, y: y + 0.11, w: 0.4, h: 0.4, fontFace: FD, fontSize: 10,
      color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: rx + 0.72, y, w: rw - 0.92, h: 0.62, fontFace: FB, fontSize: 10.5, bold: true,
      color: INK, margin: 0, valign: 'middle' });
  });
  box(s, rx, ry + 3.02, rw, 0.74, null,
    '13.5× the selling points at 5× the revenue. The plan does not need better stores, it needs more of them, faster than the dilution.', 'gold');
  foot(s, 'The growth engine');
}

/* ═════════════════ 25 · THE MOAT ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Competitive defence', 'What DHF controls, and how defensible it is.', null, { titleH: 0.86 });

  const lw = 7.1;
  const sw = (lw - 0.26 * 2) / 3;
  [['10 Mn+', 'Farmers on the\nDehaat network'], ['8', 'Sourcing clusters\nowned end to end'],
   ['230+', 'Pesticide checks\nOn every batch']].forEach(([v, l], i) =>
    stat(s, M + i * (sw + 0.26), y0, sw, v, l, { color: GREEN, h: 1.0, vs: 22 }));

  s.addText('We don\'t test the harvest. We control the input.', {
    x: M, y: y0 + 1.14, w: lw, h: 0.44, fontFace: FD, fontSize: 16, color: INK, margin: 0, valign: 'middle' });

  const fy = rule(s, M, y0 + 1.66, lw, 'The five steps behind the claim', BLUE);
  const stepW = (lw - 0.2 * 4) / 5;
  [['1', 'Clean\ncultivation'], ['2', 'Direct\nsourcing'], ['3', '230+\nchecks'],
   ['4', 'Controlled\nprocessing'], ['5', 'Traceable\nto source']].forEach(([n, t], i) => {
    const x = M + i * (stepW + 0.2);
    card(s, x, fy, stepW, 1.1);
    s.addShape(pres.ShapeType.ellipse, { x: x + stepW / 2 - 0.18, y: fy + 0.12, w: 0.36, h: 0.36,
      fill: { color: GREENSOFT }, line: { color: GREENSOFT, width: 0.4 } });
    s.addText(n, { x: x + stepW / 2 - 0.18, y: fy + 0.12, w: 0.36, h: 0.36, fontFace: FD, fontSize: 9,
      color: GREEN, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.06, y: fy + 0.54, w: stepW - 0.12, h: 0.48, fontFace: FB, fontSize: 8.5,
      bold: true, color: TX, align: 'center', margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  s.addText('BIHAR MAKHANA · UTTARAKHAND JAGGERY · GUJARAT JAVA PEANUT · AND FIVE MORE, OWNED END-TO-END', {
    x: M, y: fy + 1.2, w: lw, h: 0.3, fontFace: FB, fontSize: 8, bold: true, color: TX3, charSpacing: 0.7,
    margin: 0, valign: 'middle' });
  s.addImage({ path: A('factory.jpg'), x: M, y: fy + 1.58, w: lw, h: 1.72, sizing: { type: 'cover', w: lw, h: 1.72 } });

  const rx = M + lw + 0.35, rw = CW - lw - 0.35;
  const my = rule(s, rx, y0, rw, 'The moat has to be visible by FY29', BLUE);
  const rungs = [['L4', 'Farmer-direct transparency', 'structural', GREEN, GREENSOFT],
    ['L3', 'DeHaat input control', '5.5 yrs to copy', '2C7A3F', WHITE],
    ['L2', 'NPOP certification', 'parity', TX3, WHITE],
    ['L1', 'QR to the batch lab report', '1.2 yrs to copy', BLUE, BLUESOFT],
    ['L0', 'A label claim', '0.3 yrs to copy', CLAY, WHITE]];
  rungs.forEach(([l, t, n, c, f], i) => {
    const y = my + i * 0.62;
    card(s, rx, y, rw, 0.54, { r: 0.05, fill: f, line: l === 'L1' ? BLUE : LINE, lw: l === 'L1' ? 1.5 : 0.75 });
    s.addText(l, { x: rx + 0.18, y, w: 0.55, h: 0.54, fontFace: FD, fontSize: 12, color: c, margin: 0, valign: 'middle' });
    s.addText(t, { x: rx + 0.8, y, w: 2.5, h: 0.54, fontFace: FB, fontSize: 9.5, bold: true, color: INK,
      margin: 0, valign: 'middle' });
    s.addText(n.toUpperCase(), { x: rx + 3.3, y, w: rw - 3.5, h: 0.54, fontFace: FB, fontSize: 8, bold: true,
      color: c, align: 'right', charSpacing: 0.6, margin: 0, valign: 'middle' });
  });
  s.addText('DHF sits at L1. Only L3 and L4 survive imitation.', {
    x: rx, y: my + 3.16, w: rw, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'middle' });
  box(s, rx, my + 3.54, rw, 1.5, null,
    'The only asset that cannot be bought inside five years. ITC bought 24 Mantra; Wingreens bought Safe Harvest — DHF has roughly two years to build, certify and make this moat consumer-visible before ₹274 Cr makes it worth attacking.', 'green');
  foot(s, 'The moat & the ask');
}

/* ═════════════════ 26 · THE SCALE BLUEPRINT ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The scale blueprint', '₹105 Cr buys breakeven by FY29', null, { titleH: 0.86 });

  const pw = 6.5, colw = [2.6, 1.3, 1.3, 1.3];
  const pnl = [['', 'FY27', 'FY28', 'FY29'], ['REVENUE', '104', '168', '274'],
    ['INVESTABLE MARGIN', '27.6', '50.2', '86.6'], ['EBITDA', '−12.4', '−7.9', '+4.7']];
  pnl.forEach((r, ri) => {
    const y = y0 + ri * 0.68;
    if (ri === 0) s.addShape(pres.ShapeType.rect, { x: M, y, w: pw, h: 0.68, fill: { color: SAND }, line: { color: SAND, width: 0.4 } });
    let x = M;
    r.forEach((cell, ci) => {
      const isE = ri === 3 && ci > 0;
      s.addText(cell, { x: x + 0.15, y, w: colw[ci] - 0.25, h: 0.68,
        fontFace: ri === 0 || ci === 0 ? FB : FD, fontSize: ri === 0 ? 9 : (ci === 0 ? 8.5 : 16),
        bold: true,
        color: ri === 0 ? TX3 : (ci === 0 ? TX3 : (isE ? (cell.indexOf('−') === 0 ? CLAY : GREEN) : INK)),
        align: ci === 0 ? 'left' : 'right', charSpacing: ci === 0 ? 0.8 : 0, margin: 0, valign: 'middle' });
      x += colw[ci];
    });
    if (ri > 0) s.addShape(pres.ShapeType.line, { x: M, y: y + 0.68, w: pw, h: 0, line: { color: LINE, width: 0.5 } });
  });
  s.addText('Investment intensity falls from 38% to 30% of revenue. Breakeven is not efficiency — it is the same rupees over more revenue.', {
    x: M, y: y0 + 2.86, w: pw, h: 0.44, fontFace: FB, fontSize: 9.5, color: TX2, margin: 0, valign: 'top',
    lineSpacingMultiple: 1.08 });
  box(s, M, y0 + 3.44, pw, 1.6, null,
    'DHF clears breakeven at ₹274 Cr only because a 43.1% gross margin buys ₹38 Cr that Farmley\'s 29% does not.\nNo Indian clean-label brand between ₹75 and ₹400 Cr is EBITDA-positive today.', 'gold');

  const rx = M + 6.8, rw = CW - 6.8;
  card(s, rx, y0, rw, 3.6, { fill: INK, line: INK });
  label(s, rx + 0.25, y0 + 0.18, 4, 'The funding ask', GREEN3);
  s.addText('₹105 Cr', { x: rx + 0.25, y: y0 + 0.44, w: rw - 0.5, h: 0.74, fontFace: FD, fontSize: 32,
    color: WHITE, margin: 0, valign: 'top' });
  [['Operating losses', '20.3'], ['Capex', '29.5'], ['Working capital', '37.3'], ['Contingency', '17.4']]
    .forEach(([k, v], i) => {
      const y = y0 + 1.44 + i * 0.44;
      s.addText(k, { x: rx + 0.25, y, w: 2.8, h: 0.3, fontFace: FB, fontSize: 9.5, color: TXL2, margin: 0, valign: 'middle' });
      s.addText(v, { x: rx + rw - 1.6, y, w: 1.35, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: WHITE,
        align: 'right', margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.line, { x: rx + 0.25, y: y + 0.3, w: rw - 0.5, h: 0,
        line: { color: 'FFFFFF', width: 0.5, transparency: 84 } });
    });
  s.addText('Below every comparable in the set.', { x: rx + 0.25, y: y0 + 3.24, w: rw - 0.5, h: 0.26,
    fontFace: FB, fontSize: 8.5, italic: true, color: TXL2, margin: 0, valign: 'middle' });
  stat(s, rx, y0 + 3.86, rw, '22 → 98', 'People, FY26 to FY29, across six functions. Revenue per head reaches ₹2.80 cr.',
    { h: 1.18, vs: 24 });
  foot(s, 'The moat & the ask');
}

/* ═════════════════ 27 · CATEGORY LEADERSHIP ═════════════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Category leadership', 'Open the category to make it a Proprietary Eponym',
    'A category only becomes large if others are allowed in. DeHaat Honest Farms wins not by owning the words, but by owning the standard, the proof, and the relevance in consumers’ lives.',
    { titleH: 0.86, leadH: 0.34 });
  const pillars = [
    ['01', 'EDUCATE WHAT PESTICIDE-FREE MEANS',
      ['Pesticide-free call-out with QR to the farmer, carrying the Jaivik Bharat logo, on the front of pack',
       'Invite parents, teachers and children to the farm to see the process and meet the farmers',
       'Bring the 56% core audience into cook-off sessions after the visit; give the 18% sceptics firsthand access',
       'Webinars and podcasts led by the farmers and doctors — the two voices the research says are believed',
       'On-ground activation in schools and colleges, and with GPs, gastro specialists and nutritionists. Catch them young']],
    ['02', 'OUT-PROOF EVERYONE: CERTIFICATION VISIBLE',
      ['Quick-commerce platforms like Zepto, Amazon — showcase the Pesticide-Free certificate for every product, on the app (Like Nykaa)',
       'The copycat test: when an incumbent prints "Pesticide-free", DeHaat Honest Farms asks publicly ” Where is the batch certificate?”']],
    ['03', 'VERTICAL SOURCING CONTROL: FARM TO FORK',
      ['Own the input decision, not just the output test. Control at sowing is what a competitor cannot contract for',
       'Embed the brand in Indian routine until the habit forms: Think Pesticide-free, Think Honest Farms']]
  ];
  const pwid = (CW - 0.28 * 2) / 3;
  pillars.forEach(([n, t, b], i) => {
    const x = M + i * (pwid + 0.28);
    card(s, x, y0, pwid, 2.5);
    s.addText(n, { x: x + 0.22, y: y0 + 0.16, w: 0.8, h: 0.3, fontFace: FD, fontSize: 14, color: GREEN, margin: 0, valign: 'top' });
    s.addText(t, { x: x + 0.22, y: y0 + 0.5, w: pwid - 0.44, h: 0.34, fontFace: FB, fontSize: 9.5, bold: true,
      color: INK, charSpacing: 0.5, margin: 0, valign: 'top' });
    s.addText(bullets(b), { x: x + 0.22, y: y0 + 0.88, w: pwid - 0.44, h: 1.5, fontFace: FB, fontSize: 8,
      color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 3 });
  });

  const gy = rule(s, M, y0 + 2.76, CW, 'Guardrails for communication in line with industry bodies', BLUE);
  const gw = 4.85;
  card(s, M, gy, gw, 1.9, { fill: GREENSOFT, line: 'C6E3D3' });
  s.addText('WHAT WE SAY', { x: M + 0.22, y: gy + 0.1, w: gw - 0.44, h: 0.24, fontFace: FB, fontSize: 9,
    bold: true, color: GREEN, charSpacing: 1, margin: 0, valign: 'middle' });
  s.addText(bullets(['“Tested for 230+ pesticides. None Detected.”',
    '“No detectable pesticide residue, verified batch by batch.”',
    '“Independently lab-tested. Scan to see this batch’s report.”',
    '“Stronger residue testing than the organic standard requires.”']), {
    x: M + 0.22, y: gy + 0.38, w: gw - 0.44, h: 1.4, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0,
    valign: 'top', paraSpaceAfter: 3 });

  card(s, M + gw + 0.3, gy, gw, 1.9, { fill: CLAYSOFT, line: 'F0CDC2' });
  s.addText('WHAT WE NEVER SAY', { x: M + gw + 0.52, y: gy + 0.1, w: gw - 0.44, h: 0.24, fontFace: FB,
    fontSize: 9, bold: true, color: CLAY, charSpacing: 1, margin: 0, valign: 'middle' });
  s.addText(bullets(['“100% pesticide-free” — or any absolute.',
    '“Chemical-free”, “toxin-free”, “100% pure”.', '“Healthier than organic.”',
    'Anything implying the product prevents disease.', 'Never win by attacking organic or conventional.']), {
    x: M + gw + 0.52, y: gy + 0.38, w: gw - 0.44, h: 1.4, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0,
    valign: 'top', paraSpaceAfter: 3 });

  const lx = M + gw * 2 + 0.6;
  s.addImage({ path: A('jaivik.png'), x: lx + 0.3, y: gy + 0.22, w: 0.62, h: 0.64 });
  s.addImage({ path: A('fssai.png'), x: lx + 1.2, y: gy + 0.32, w: 0.82, h: 0.45 });
  s.addImage({ path: A('asci.png'), x: lx + 0.3, y: gy + 1.12, w: 0.95, h: 0.44 });
  foot(s, 'The moat & the ask');
}

/* ═════════════════ 28 · CLOSE ═════════════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('team-field.jpg'), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
  s.addImage({ path: A('veil-flat.png'), x: 0, y: 0, w: W, h: H });
  s.addImage({ path: A('veil-radial.png'), x: 0, y: 0, w: W, h: H });
  s.addText('धन्यवाद', { x: 0, y: 2.35, w: W, h: 1.3, fontFace: 'Noto Sans Devanagari', fontSize: 52,
    color: WHITE, align: 'center', margin: 0, valign: 'middle' });
  s.addText('Verified in the fields. Honest on the shelves.', {
    x: 0, y: 3.75, w: W, h: 0.5, fontFace: FB, fontSize: 17, italic: true, color: GREEN3, align: 'center',
    margin: 0, valign: 'middle' });
  s.addImage({ path: A('logo.png'), x: W / 2 - 1.05, y: 4.62, w: 2.1, h: 0.78 });
}

pres.writeFile({ fileName: OUT }).then(() => console.log('wrote ' + OUT + '  (' + pres.slides.length + ' slides)'));
