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

const shadow = () => ({ type: 'outer', color: '101C2C', opacity: 0.09, blur: 14, offset: 3, angle: 90 });

/* ═══════════ helpers ═══════════ */

function newSlide(bg) {
  const s = pres.addSlide();
  s.background = { color: bg || PAPER };
  return s;
}

/** eyebrow + title + optional lead. Returns the y where content may start. */
function head(s, eyebrow, title, lead, opt) {
  opt = opt || {};
  const light = !!opt.light;
  let y = 0.36;
  s.addText(eyebrow.toUpperCase(), {
    x: M, y, w: CW, h: 0.22, fontFace: FB, fontSize: 9.5, bold: true,
    color: light ? GREEN3 : GREEN, charSpacing: 2.4, margin: 0, valign: 'middle'
  });
  y += 0.26;
  const tSize = opt.titleSize || 24;
  const tH = opt.titleH || 0.86;
  s.addText(title, {
    x: M, y, w: opt.titleW || CW, h: tH, fontFace: FD, fontSize: tSize,
    color: light ? WHITE : INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02
  });
  y += tH + 0.06;
  if (lead) {
    s.addText(lead, {
      x: M, y, w: opt.leadW || 10.6, h: opt.leadH || 0.54, fontFace: FB, fontSize: 11,
      color: light ? TXL2 : TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.14
    });
    y += (opt.leadH || 0.54) + 0.08;
  }
  return y + 0.06;
}

/** page furniture: slide number + running foot */
let pageNo = 0;
function foot(s, chapter, light) {
  pageNo += 1;
  const n = String(pageNo).padStart(2, '0');
  s.addText(chapter || '', {
    x: M, y: H - 0.46, w: 8, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true,
    color: light ? TXL2 : TX3, charSpacing: 1.6, margin: 0, valign: 'middle'
  });
  s.addText(n, {
    x: W - M - 1.2, y: H - 0.46, w: 1.2, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true,
    color: light ? TXL2 : TX3, align: 'right', margin: 0, valign: 'middle'
  });
}

/** a card panel */
function card(s, x, y, w, h, opt) {
  opt = opt || {};
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: opt.r === undefined ? 0.09 : opt.r,
    fill: { color: opt.fill || WHITE },
    line: { color: opt.line || LINE, width: opt.lw === undefined ? 0.75 : opt.lw },
    shadow: opt.shadow ? shadow() : undefined
  });
}

/** big number + caption block */
function stat(s, x, y, w, value, label, opt) {
  opt = opt || {};
  const h = opt.h || 1.35;
  const vs = opt.vs || 25;
  const vh = vs * 1.24 / 72 + 0.04;
  card(s, x, y, w, h, { fill: opt.fill || WHITE, line: opt.line || LINE });
  s.addText(value, {
    x: x + 0.2, y: y + 0.12, w: w - 0.4, h: vh, fontFace: FD,
    fontSize: vs, color: opt.color || BLUE, margin: 0, valign: 'top'
  });
  s.addText(label, {
    x: x + 0.2, y: y + 0.14 + vh, w: w - 0.4, h: h - vh - 0.22, fontFace: FB, fontSize: 8.5,
    color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1
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
  card(s, x, y, w, h, { fill, line: ln });
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
      s.addText(opt.bandLabel.toUpperCase(), { x: x + 0.1, y: by1 + 0.04, w: w - 0.2, h: 0.22,
        fontFace: FB, fontSize: 8.5, bold: true, color: GOLD, charSpacing: 1.2, margin: 0, valign: 'middle' });
    }
  }
  s.addShape(pres.ShapeType.line, { x, y: y + 0.3 + plotH, w, h: 0, line: { color: LINE, width: 0.75 } });

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

/* ═══════════ 01 · TITLE ═══════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('makhana-farm.jpg'), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
  s.addImage({ path: A('veil-h.png'), x: 0, y: 0, w: W, h: H });

  s.addText('ISB CGMO COHORT II   ·   BUSINESS LEADERSHIP CHALLENGE', {
    x: M, y: 1.15, w: 8, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true,
    color: GREEN3, charSpacing: 2.8, margin: 0, valign: 'middle' });
  s.addImage({ path: A('logo.png'), x: M, y: 1.62, w: 2.5, h: 0.92 });
  s.addText('Category Creation', {
    x: M, y: 2.66, w: 8.2, h: 0.8, fontFace: FD, fontSize: 40, color: WHITE, margin: 0, valign: 'top' });
  s.addText('& Scale Acceleration', {
    x: M, y: 3.44, w: 8.2, h: 0.8, fontFace: FD, fontSize: 40, color: GREEN3, margin: 0, valign: 'top' });
  s.addText('Verified in the fields. Honest on the shelves.', {
    x: M, y: 4.62, w: 8, h: 0.4, fontFace: FB, fontSize: 16, italic: true, color: TXL, margin: 0, valign: 'middle' });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.35, w: 1.05, h: 0.32, rectRadius: 0.16,
    fill: { color: GREEN3 }, line: { width: 0 } });
  s.addText('TEAM 1', { x: M, y: 5.35, w: 1.05, h: 0.32, fontFace: FB, fontSize: 9, bold: true,
    color: INK, align: 'center', charSpacing: 1.4, margin: 0, valign: 'middle' });
  s.addText('Sabika Mirza  ·  Sharon Batliwalla  ·  Syed Kashif Ali  ·  Sonu Adarsh  ·  Abhishek Nandan', {
    x: M + 1.2, y: 5.35, w: 7.2, h: 0.32, fontFace: FB, fontSize: 10.5, color: TXL2, margin: 0, valign: 'middle' });

  const strip = [
    ['₹53 Cr → ₹748 Cr', 'the FY26 base to the FY31 ambition'],
    ['₹48,000 Cr', 'a category with no definition, standard or owner'],
    ['305 + 31', 'respondents behind every claim in this deck']
  ];
  s.addShape(pres.ShapeType.line, { x: M, y: 6.15, w: 8.3, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 80 } });
  strip.forEach(([v, l], i) => {
    const x = M + i * 2.82;
    s.addText(v, { x, y: 6.32, w: 2.7, h: 0.3, fontFace: FD, fontSize: 13, color: WHITE, margin: 0, valign: 'middle' });
    s.addText(l, { x, y: 6.62, w: 2.7, h: 0.42, fontFace: FB, fontSize: 8.5, color: TXL2, margin: 0, valign: 'top' });
  });
  s.addNotes('ISB CGMO Cohort II, Business Leadership Challenge. Team 1: Sabika Mirza, Sharon Batliwalla, Syed Kashif Ali, Sonu Adarsh, Abhishek Nandan.');
}

/* ═══════════ 02 · THE ARGUMENT IN SIX MOVES ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Start here', 'The whole argument, in six moves.',
    'Every section that follows is evidence for one of these six steps.');
  const moves = [
    ['1', 'There is a ₹48,000 Cr category that nobody has defined.',
      '"Pesticide-free" is not a regulated term in India. Demand is real — 84% of consumers are worried about food safety — but no brand has codified the standard, so the words commoditise before they mean anything.'],
    ['2', 'The shelf has an empty corridor, and DHF should own it.',
      'Mainstream dal sits at ₹136–157/kg. Certified organic sits at ₹255–306. Between them is an accessible-premium corridor at ₹150–250 with no trust code attached to it — and it is already being squeezed from below.'],
    ['3', 'The barrier is belief, not budget.',
      'Half of buyers say they would pay nothing extra — and say why: they do not trust the claims. But 60% would pay 20–30% more if someone they trusted had independently verified it.'],
    ['4', 'DHF already generates the proof. It just never shows it.',
      '230+ pesticide checks per batch, batch-level testing, failing lots rejected — all invisible to the shopper. Competitors lead with logos; DHF can lead with data, and put the farmer on it.'],
    ['5', 'So the brand becomes the one you verify, not the one you trust.',
      'Positioning, promise and every communication delivery hang off a single measurable metric — Verified Purchase Rate. Revenue is the outcome; verification is the lever.'],
    ['6', '₹105 Cr buys breakeven at ₹274 Cr, and a moat worth defending.',
      'Spices carry the margin, quick commerce carries the reach, and DeHaat\'s control of the farm input — not the harvest test — is the only asset a competitor cannot buy inside five years.']
  ];
  const cw = (CW - 0.3 * 2) / 3, ch = 2.28;
  moves.forEach(([n, t, b], i) => {
    const x = M + (i % 3) * (cw + 0.3);
    const y = y0 + Math.floor(i / 3) * (ch + 0.28);
    card(s, x, y, cw, ch, { shadow: false });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.22, y: y + 0.2, w: 0.4, h: 0.4, fill: { color: INK }, line: { width: 0 } });
    s.addText(n, { x: x + 0.22, y: y + 0.2, w: 0.4, h: 0.4, fontFace: FD, fontSize: 12,
      color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.22, y: y + 0.68, w: cw - 0.44, h: 0.6, fontFace: FB, fontSize: 11.5,
      bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addText(b, { x: x + 0.22, y: y + 1.28, w: cw - 0.44, h: ch - 1.44, fontFace: FB, fontSize: 9,
      color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });
  foot(s, 'The argument');
}

/* ═══════════ 03 · THE MANDATE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 01 · The Mandate', 'Scale DHF from ₹53 Cr to ₹300+ Cr in three years.',
    'Not by outspending organic, but by creating and owning a category that does not yet formally exist. We broke that into four phases.');
  const phases = [
    ['01', 'Diagnose & Decode', 'Build a shared, fact-based understanding of category, competition and consumer.',
      'Category & consumer insight base\nTrust tension map + segmentation\nImitation risk heatmap\nInternal diagnosis snapshot'],
    ['02', 'Category & Brand Strategy', 'Define what DHF must own in the mind of the consumer.',
      'Category creation framework\nPositioning & brand architecture\nProof hierarchy\nCodified Pesticide-Free standard'],
    ['03', 'Growth Engine Design', 'Decide where to play and how to win — the moat.',
      'Top growth drivers\nHero SKU list (10–15 SKUs)\nChannel role matrix\nCompetitive defense playbook'],
    ['04', 'Scale Blueprint', 'Build a sustainable, funded path to growth.',
      '5-year growth ambition\nInvestment & capital roadmap\nCategory Rulebook & governance\nOperating model + KPI framework']
  ];
  const cw = (CW - 0.26 * 3) / 4, ch = 2.5;
  phases.forEach(([n, t, d, o], i) => {
    const x = M + i * (cw + 0.26);
    card(s, x, y0, cw, ch);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: 0.05, h: ch, fill: { color: GREEN }, line: { width: 0 } });
    s.addText(n, { x: x + 0.24, y: y0 + 0.16, w: cw - 0.4, h: 0.32, fontFace: FD, fontSize: 15, color: GREEN, margin: 0, valign: 'top' });
    s.addText(t, { x: x + 0.24, y: y0 + 0.52, w: cw - 0.4, h: 0.42, fontFace: FB, fontSize: 11.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.24, y: y0 + 0.98, w: cw - 0.4, h: 0.6, fontFace: FB, fontSize: 9, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
    s.addText(o.split('\n').map((li, k, arr) => ({ text: li, options: { bullet: true, breakLine: k < arr.length - 1 } })), {
      x: x + 0.24, y: y0 + 1.62, w: cw - 0.4, h: 0.8, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 2 });
  });

  const ey = y0 + ch + 0.3;
  label(s, M, ey, 4, 'The evidence base');
  const ev = [
    ['305', 'Respondents to the quantitative survey. Five metros, fielded 28–29 May 2026 by 1Lattice.'],
    ['31+', 'Qualitative respondents across six cities — in-market intercepts, IDIs and ethnography.'],
    ['₹90.9 Cr', 'Internal revenue audited: 4,365 MT across eight half-years and eight channels.'],
    ['4', 'Competitors benchmarked, with 11 DHF advantages stress-tested for imitability.']
  ];
  ev.forEach(([v, l], i) => {
    const x = M + i * (CW / 4);
    s.addText(v, { x, y: ey + 0.3, w: CW / 4 - 0.3, h: 0.4, fontFace: FD, fontSize: 20, color: BLUE, margin: 0, valign: 'top' });
    s.addText(l, { x, y: ey + 0.72, w: CW / 4 - 0.3, h: 0.62, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });
  foot(s, 'Part 01 · The Mandate');
}

/* ═══════════ 04 · THE WHITESPACE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 02 · The Category', 'A ₹48,000 Cr category with no definition, no standard, and no owner.',
    'The gap is regulatory and semantic before it is commercial. Consumers are worried about what is on their food and willing to pay to avoid it — but there is no agreed meaning of "pesticide-free", so the willingness has nowhere to land.',
    { titleH: 0.86, leadH: 0.66 });

  const stats = [
    ['84%', 'of Indian consumers are extremely or very concerned about food safety (PwC Voice of the Consumer 2025)', BLUE],
    ['35.9%', 'of monitored samples show detectable residues — up from 22.6% in 2018–19', BLUE],
    ['2.8%', 'of 86,401 FSSAI samples tested 2022–25 breached maximum residue limits', BLUE],
    ['$8.6B → $22B', 'India\'s organic food market, 2024 → 2033, a CAGR of roughly 11%', BLUE]
  ];
  const sw = (CW - 0.26 * 3) / 4;
  stats.forEach(([v, l, c], i) => {
    stat(s, M + i * (sw + 0.26), y0, sw, v, l, { color: c, vs: i === 3 ? 17 : 24, h: 1.42 });
  });

  const cy = y0 + 1.42 + 0.26;
  label(s, M, cy, 5, 'Sizing the pesticide-free opportunity');
  const tam = [
    ['TAM', '₹48,000 Cr', 1.0, 'Pesticide-free food across India\'s top 300 cities. Anchored to Technopak\'s 5–6% organic-of-packaged-food potential (₹35,000 Cr), uplifted 1.3–1.5× because pesticide-free prices below organic.'],
    ['SAM', '₹13,500 Cr', 0.28, 'A 28% serviceability factor: staples, pulses, rice, spices and select value-added, sold through quick commerce, e-commerce and modern trade to roughly 25 Mn health-conscious households.'],
    ['SOM', '₹300–350 Cr', 0.026, 'The three-year ambition — 2.2–2.6% of SAM, 0.6–0.7% of TAM. The five-year aspiration is ₹700–800 Cr.']
  ];
  const tw = 6.4;
  tam.forEach(([tag, v, frac, note], i) => {
    const y = cy + 0.3 + i * 0.86;
    card(s, M, y, tw, 0.76);
    s.addText(tag, { x: M + 0.2, y: y + 0.13, w: 0.7, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: BLUE, charSpacing: 1.4, margin: 0, valign: 'middle' });
    s.addText(v, { x: M + 0.95, y: y + 0.1, w: 1.9, h: 0.32, fontFace: FD, fontSize: 15, color: INK, margin: 0, valign: 'middle' });
    s.addText(note, { x: M + 2.95, y: y + 0.1, w: tw - 3.15, h: 0.66, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.2, y: y + 0.56, w: 2.6, h: 0.09, rectRadius: 0.045, fill: { color: SAND2 }, line: { width: 0 } });
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.2, y: y + 0.56, w: Math.max(0.09, 2.6 * frac), h: 0.09, rectRadius: 0.045, fill: { color: i === 0 ? BLUE : i === 1 ? GREEN2 : GREEN }, line: { width: 0 } });
  });

  const rx = M + tw + 0.35, rw = CW - tw - 0.35;
  label(s, rx, cy, 5, 'Why the category has not formed yet');
  const reasons = [
    ['01', 'No standard definition.', '"Pesticide-free" is not a regulated term in India, so it means whatever the pack says it means.'],
    ['02', 'Harder to prove than to claim.', 'The proof lives in back-end sourcing and testing systems, not on the front of pack.'],
    ['03', 'Awkward economics.', 'A trust-led cost structure has to survive at a mass-premium price point.'],
    ['04', 'Nobody has codified or defended it.', 'Without a standard, the term commoditises before it can carry value.']
  ];
  reasons.forEach(([n, b, t], i) => {
    const y = cy + 0.3 + i * 0.44;
    s.addText(n, { x: rx, y, w: 0.4, h: 0.24, fontFace: FD, fontSize: 10, color: GREEN, margin: 0, valign: 'top' });
    s.addText([{ text: b + ' ', options: { bold: true, color: INK } }, { text: t, options: { color: TX2 } }], {
      x: rx + 0.42, y, w: rw - 0.42, h: 0.42, fontFace: FB, fontSize: 8.5, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
  });
  box(s, rx, cy + 2.02, rw, 1.0, 'Belief is the bottleneck.',
    'Indian shoppers will pay ~20% more for low-impact products — the highest of eleven countries surveyed. Yet ~60% fear greenwashing and only ~29% trust corporate environmental claims.', 'green');

  foot(s, 'Part 02 · The Category  ·  Sources: Technopak 2022–23 · PwC Voice of the Consumer 2025 · FSSAI surveillance data');
}

/* ═══════════ 05 · PRICE LADDER ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Category structure', 'Laddering on price and claims — and the corridor nobody owns.',
    'Plotting toor dal by the kilo makes the gap obvious: there is nothing credible between value pulses and certified organic.');

  card(s, M, y0, 7.6, 4.1);
  label(s, M + 0.3, y0 + 0.2, 5, 'The price ladder · toor dal, ₹ per kg');
  vBars(s, M + 0.35, y0 + 0.55, 6.9, 3.25, [
    { label: 'Vedaka', value: 136, display: '₹136', color: BLUE2 },
    { label: 'Fortune', value: 145, display: '₹145', color: BLUE2 },
    { label: 'Tata\nSampann', value: 156, display: '₹156', color: BLUE },
    { label: 'BB Royal\nOrganic', value: 157, display: '₹157', color: GOLD2 },
    { label: 'Organic\nTattva', value: 255, display: '₹255', color: GREEN },
    { label: 'Tata Sampann\nOrganic', value: 257, display: '₹257', color: GREEN },
    { label: '24 Mantra\nOrganic', value: 306, display: '₹306', color: GREEN }
  ], 345, { band: [150, 250], bandLabel: 'Accessible-premium corridor · ₹150–250', gap: 0.14, labelH: 0.5 });

  const rx = M + 7.9, rw = CW - 7.9;
  label(s, rx, y0, rw, 'Five archetypes on the shelf');
  const tiers = [
    ['Conventional national packaged', 'Factory & FSSAI process credibility. Trust story shallow, easily copied.'],
    ['Retailer & regional private label', 'Retailer QA and lab testing. No ownable narrative.'],
    ['Natural or nutrition-led', 'Process + nutrition + brand legacy. "Natural" reads wholesome, not safer.'],
    ['Clean-label / provenance challengers', 'Sourcing stories. Premium, fragmented, no mass trust code.'],
    ['Certified organic specialists', 'NPOP / NOP certification + traceability. Structurally higher price ladder; scale friction.']
  ];
  tiers.forEach(([t, d], i) => {
    const y = y0 + 0.32 + i * 0.62;
    card(s, rx, y, rw, 0.55, { r: 0.05 });
    s.addText(t, { x: rx + 0.16, y: y + 0.06, w: rw - 0.32, h: 0.2, fontFace: FB, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: rx + 0.16, y: y + 0.25, w: rw - 0.32, h: 0.26, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.05 });
  });
  box(s, rx, y0 + 3.4, rw, 1.0, 'The corridor between them is empty of trust codes.',
    'DHF belongs at ₹150–250/kg — and that corridor is already being squeezed from below by BB Royal Organic at ₹157.', 'gold');
  foot(s, 'Part 02 · The Category');
}

/* ═══════════ 06 · WHO IS ON THE SHELF ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The competitive set', 'Who is actually on the shelf.',
    'Five archetypes, each with a different trust story — and each with a hole in it.');
  const packs = [
    ['pk-fortune.jpg', 'Conventional national packaged', 'Factory and FSSAI process credibility. The trust story is shallow and easily copied.'],
    ['pk-vedaka.jpg', 'Retailer & regional private label', 'Retailer QA and lab testing behind it, but no ownable narrative in front of it.'],
    ['pk-tatasampann.jpg', 'Natural or nutrition-led', 'Process, nutrition and brand legacy. "Natural" reads wholesome — it does not read safer.'],
    ['pk-conscious.jpg', 'Clean-label / provenance challengers', 'Sourcing stories, premium prices, fragmented. No mass trust code.'],
    ['pk-24mantra.jpg', 'Certified organic specialists', 'NPOP / NOP certification and traceability, on a structurally higher price ladder.']
  ];
  const cw = (CW - 0.28 * 4) / 5;
  packs.forEach(([img, t, d], i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, y0, cw, 3.9);
    s.addImage({ path: A(img), x: x + 0.35, y: y0 + 0.22, w: cw - 0.7, h: 1.6, sizing: { type: 'contain', w: cw - 0.7, h: 1.6 } });
    s.addText(t, { x: x + 0.22, y: y0 + 2.0, w: cw - 0.44, h: 0.6, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.05 });
    s.addText(d, { x: x + 0.22, y: y0 + 2.6, w: cw - 0.44, h: 1.1, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });
  foot(s, 'Part 02 · The Category');
}

/* ═══════════ 07 · PROOF BENCHMARK ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Proof & claims benchmarking', 'Who can actually show their work?',
    'If a shopper wanted to check the claim, could they? Only one brand passes — and DHF, which does the most testing, shows the least.');
  const brands = [
    ['Organic Tattva', 'QR · YES', GREENSOFT, GREEN, '250-parameter farm-level residue test, QR on every pack to the batch report. The category benchmark.', false],
    ['24 Mantra (ITC)', 'QR · NO', 'EDE8DF', TX3, 'EU + USDA + NPOP certification, 1.4 lakh acres, 27,500 farmers. Logos are the proof — no consumer-facing test report.', false],
    ['Tata Sampann', 'QR · NO', 'EDE8DF', TX3, 'Brand trust plus an "unpolished" visual cue and a celebrity anchor. No public batch-level residue disclosure.', false],
    ['Organic India (Tata)', 'QR · NO', 'EDE8DF', TX3, 'Certification-heavy — USDA, EU, NPOP, Kosher — across 35+ export markets. Logos, not data.', false],
    ['DeHaat Honest Farms', 'QR · GAP', CLAYSOFT, CLAY, '230+ pesticide checks, batch-level testing, failing lots rejected. All of it invisible to the shopper.', true]
  ];
  const cw = (CW - 0.28 * 4) / 5, ch = 2.1;
  brands.forEach(([n, chip, cf, cc, d, isDhf], i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, y0, cw, ch, { fill: isDhf ? BLUESOFT : WHITE, line: isDhf ? BLUE : LINE, lw: isDhf ? 1.5 : 0.75 });
    s.addText(n, { x: x + 0.2, y: y0 + 0.16, w: cw - 0.4, h: 0.42, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y0 + 0.6, w: 0.98, h: 0.24, rectRadius: 0.12, fill: { color: cf }, line: { width: 0 } });
    s.addText(chip, { x: x + 0.2, y: y0 + 0.6, w: 0.98, h: 0.24, fontFace: FB, fontSize: 7.5, bold: true, color: cc, align: 'center', charSpacing: 0.8, margin: 0, valign: 'middle' });
    s.addText(d, { x: x + 0.2, y: y0 + 0.94, w: cw - 0.4, h: ch - 1.1, fontFace: FB, fontSize: 8.5, color: isDhf ? CLAY : TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });
  });

  const my = y0 + ch + 0.35;
  label(s, M, my, 5, 'Messaging consistency, scored out of 10');
  [['Tata Sampann', '9'], ['Organic Tattva', '8'], ['Organic India', '7'], ['24 Mantra', '6']].forEach(([n, v], i) => {
    const y = my + 0.34 + i * 0.42;
    s.addText(n, { x: M, y, w: 3, h: 0.3, fontFace: FB, fontSize: 10, color: TX2, margin: 0, valign: 'middle' });
    s.addText(v + '/10', { x: M + 3, y, w: 1.1, h: 0.3, fontFace: FD, fontSize: 12, color: INK, align: 'right', margin: 0, valign: 'middle' });
    s.addShape(pres.ShapeType.line, { x: M, y: y + 0.34, w: 4.1, h: 0, line: { color: LINE, width: 0.5, dashType: 'dash' } });
  });
  box(s, M + 4.6, my + 0.2, CW - 4.6, 1.5, 'The clock is already running.',
    '24 Mantra is expected to reach 9/10 within 12 to 18 months of ITC integration. DHF generates more proof than anyone in the set and communicates the least of it — the one gap that is entirely self-inflicted, and the fastest to close.', 'clay');
  foot(s, 'Part 02 · The Category');
}

/* ═══════════ 08 · IMITATION RISK ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Imitation risk', 'How long each advantage survives a determined competitor.',
    'Eleven DHF advantages stress-tested against replication time. The pattern is stark: everything cheap to copy is already copied.');
  card(s, M, y0, 8.4, 4.15);
  hBars(s, M + 0.35, y0 + 0.3, 7.7, [
    { label: 'Pesticide-Free label claim', value: 0.2, display: 'already copied', color: CLAY },
    { label: '200+ SKU breadth', value: 4.5, display: '3–6 months', color: CLAY2 },
    { label: 'Quick-commerce presence', value: 9, display: '6–12 months', color: GOLD2 },
    { label: '230+ quality checkpoints', value: 15, display: '12–18 months', color: GOLD2 },
    { label: 'QR batch traceability', value: 15, display: '12–18 months', color: BLUE2 },
    { label: 'Farm-level residue testing', value: 21, display: '18–24 months', color: BLUE },
    { label: 'Curated 5,000-farmer cohort', value: 30, display: '24–36 months', color: GREEN2 },
    { label: 'Farmer margin model', value: 48, display: '3–5 years', color: GREEN },
    { label: 'DeHaat agritech input control', value: 66, display: '5+ years', color: GREEN }
  ], 70, { rowH: 0.42, barH: 0.13 });

  const rx = M + 8.7, rw = CW - 8.7;
  box(s, rx, y0, rw, 1.55, 'Everything below the line is table stakes.',
    'A label claim, SKU breadth and quick-commerce presence buy nothing durable. They are the cost of entry, not the moat.', 'clay');
  box(s, rx, y0 + 1.72, rw, 2.4, 'Only the bottom three survive.',
    'The curated farmer cohort, the farmer margin model and DeHaat\'s agritech input control take three to five-plus years to replicate — because they are relationships and systems, not features. Those are what the brand should be built on.', 'green');
  foot(s, 'Part 02 · The Category');
}

/* ═══════════ 09 · SYSTEM-LED CHALLENGER ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Untapped opportunity', 'DeHaat Honest Farms is a system-led challenger.',
    'Every other player proves safety by testing the harvest or buying a certificate. DHF is the only one that can prevent the problem at the input — because it already runs the agritech network the farmer plants with.');
  const advs = [
    ['01', 'AgriTech-embedded input control', 'We prevent pesticide use at source, rather than testing for it afterward.', 'Current use in brand communication: near zero'],
    ['02', 'Continuous quality intelligence across 2M farms', 'Quality trajectory is known before harvest, not after rejection.', 'Current use in brand communication: zero'],
    ['03', 'Farmer economic ecosystem', 'Supply exclusivity earned through 30 to 50% better farmer returns.', 'Current use in brand communication: minimal']
  ];
  advs.forEach(([n, t, d, u], i) => {
    const y = y0 + i * 1.24;
    card(s, M, y, 7.4, 1.1);
    s.addShape(pres.ShapeType.roundRect, { x: M + 0.22, y: y + 0.2, w: 0.42, h: 0.42, rectRadius: 0.08, fill: { color: GREEN }, line: { width: 0 } });
    s.addText(n, { x: M + 0.22, y: y + 0.2, w: 0.42, h: 0.42, fontFace: FD, fontSize: 9, color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: M + 0.78, y: y + 0.16, w: 6.4, h: 0.28, fontFace: FB, fontSize: 11.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: M + 0.78, y: y + 0.44, w: 6.4, h: 0.3, fontFace: FB, fontSize: 9.5, color: TX2, margin: 0, valign: 'top' });
    s.addText(u.toUpperCase(), { x: M + 0.78, y: y + 0.76, w: 6.4, h: 0.24, fontFace: FB, fontSize: 8, bold: true, color: CLAY, charSpacing: 0.8, margin: 0, valign: 'top' });
  });
  const rx = M + 7.7, rw = CW - 7.7;
  card(s, rx, y0, rw, 2.6);
  s.addImage({ path: A('pack-toordal.jpg'), x: rx + 1.3, y: y0 + 0.15, w: 1.9, h: 2.3, sizing: { type: 'contain', w: 1.9, h: 2.3 } });
  s.addText('The asset is already on pack and under-worked: a Know Your Farmer QR, 230+ pesticide checks, and a pesticide-free call-out.', {
    x: rx, y: y0 + 2.7, w: rw, h: 0.5, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  box(s, rx, y0 + 3.3, rw, 1.25, 'One thing to fix first.',
    'DHF\'s shelf price is inconsistent across platforms. The accessible-premium corridor is only defensible if the price is coherent everywhere the shopper looks.', 'clay');
  foot(s, 'Part 02 · The Category');
}

/* ═══════════ 10 · QUALITATIVE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 03 · The Consumer', 'Shoppers care enormously. They just don\'t know what the words mean.',
    'Qualitative research by the team — 31 respondents across 6 cities. In-market intercepts, IDIs and ethnography, run before a single survey question was written.');
  const sw = (CW - 0.3 * 2) / 3;
  [['70%', 'of in-market shoppers could not distinguish "organic" from "pesticide-free"', CLAY],
   ['100%', 'cited health of self & family as their primary food purchase driver', GREEN],
   ['0%', 'connected the word "pure" to pesticide residue — a language gap, not an interest gap', BLUE]
  ].forEach(([v, l, c], i) => stat(s, M + i * (sw + 0.3), y0, sw, v, l, { color: c, h: 1.22 }));

  const ty = y0 + 1.44;
  label(s, M, ty, 6, 'Four tensions beneath the category');
  const tensions = [
    ['01', 'Conceptual fog, not an information gap', 'Consumers do not merely lack information — they hold incorrect information that feels correct.'],
    ['02', 'Adulteration fatalism', '73% agree some adulteration is unavoidable. The risk is known and quietly accepted — highest in chilli.'],
    ['03', 'Bodily proof beats label proof', 'Confidence comes from energy, weight and blood work of self and family members.'],
    ['04', 'Assumed safety in makhana', 'Believed to be "grown from lotus stems" and "processed like popcorn". Neither is accurate, and it is the only category with no residue conversation.']
  ];
  tensions.forEach(([n, t, d], i) => {
    const y = ty + 0.3 + i * 0.75;
    card(s, M, y, 6.3, 0.66, { r: 0.05 });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.045, h: 0.66, fill: { color: BLUE }, line: { width: 0 } });
    s.addText(n + '  ' + t, { x: M + 0.2, y: y + 0.07, w: 6.0, h: 0.22, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: M + 0.2, y: y + 0.28, w: 6.0, h: 0.36, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });

  const qx = M + 6.6, qw = CW - 6.6;
  label(s, qx, ty, 6, 'In their own words');
  const quotes = [
    ['"Pesticides are sometimes put in soil, not on fruits. This makes them pesticide-free."', 'In-market intercept, Bengaluru'],
    ['"There is no such thing as Pesticide-Free. We have done enough research."', 'In-market intercept, Bengaluru'],
    ['"Pesticide-free means no use of pesticides at any stage of the lifecycle of the produce."', 'Organic farmer, Hyderabad — the most accurate definition in the sample'],
    ['"Testing information plays a very important role. Knowing the source and certifications matters most in rice and dal — they are staples."', 'Benifer Lewis, 45, Mumbai']
  ];
  quotes.forEach(([q, c], i) => {
    const y = ty + 0.3 + i * 0.75;
    card(s, qx, y, qw, 0.66, { r: 0.05, fill: SAND });
    s.addText(q, { x: qx + 0.2, y: y + 0.05, w: qw - 0.4, h: 0.4, fontFace: FB, fontSize: 9, italic: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(c, { x: qx + 0.2, y: y + 0.45, w: qw - 0.4, h: 0.18, fontFace: FB, fontSize: 7, color: TX3, margin: 0, valign: 'top' });
  });
  foot(s, 'Part 03 · The Consumer');
}

/* ═══════════ 11 · METHODOLOGY ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Quantitative research by 1Lattice, commissioned by DHF', 'How the survey was built, and who answered it.',
    'The survey was designed backwards from the analysis we intended to run — a 15-item attitude battery written specifically so factors could be extracted from it afterwards.');

  label(s, M, y0, 5, 'Instrument design');
  const meth = [
    ['~18 min', '50 questions across 10 topics and 4 food categories'],
    ['4 screens', 'Decision-maker role, purchase frequency, ≥2 of 4 categories, income — SEC D/E and sub-monthly buyers terminated'],
    ['15-item battery', 'Five-point Likert attitude statements, written for post-survey factor extraction'],
    ['2 trust grids', 'Six claims tested twice — once bare, once with an independent certificate attached']
  ];
  const mw = (6.1 - 0.24) / 2;
  meth.forEach(([v, d], i) => {
    const x = M + (i % 2) * (mw + 0.24);
    const y = y0 + 0.32 + Math.floor(i / 2) * 1.06;
    card(s, x, y, mw, 0.94);
    s.addText(v, { x: x + 0.18, y: y + 0.1, w: mw - 0.36, h: 0.28, fontFace: FD, fontSize: 12, color: BLUE, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.18, y: y + 0.4, w: mw - 0.36, h: 0.48, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  card(s, M, y0 + 2.5, 6.1, 1.62, { fill: SAND, line: SAND2 });
  label(s, M + 0.2, y0 + 2.62, 4, 'Fieldwork & governance');
  s.addText('Online panel, fielded by 1Lattice, 28–29 May 2026. n = 305 after quality screening. Report dated 12 June 2026.\nFive metros: Delhi NCR 31% · Bengaluru 21% · Mumbai 17% · Ahmedabad 15% · Pune 15%.\nCategory bases: rice n=253 · tur dal n=241 · red chilli n=164 · makhana n=58. Makhana is reported as directional only. Every segment claim rests on the full n=305 base, not on a category sub-base.', {
    x: M + 0.2, y: y0 + 2.9, w: 5.7, h: 1.14, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });

  const rx = M + 6.4, rw = CW - 6.4;
  label(s, rx, y0, 5, 'Consumer profile');
  const prof = [['78%', 'have a child under 12 and / or an elderly member at home'],
    ['82%', 'do the household grocery shopping entirely themselves'],
    ['63%', 'earn ₹1–2.5 Lakh per month'],
    ['58%', 'shop for groceries three or more times a week']];
  const pw = (rw - 0.2 * 3) / 4;
  prof.forEach(([v, l], i) => {
    const x = rx + i * (pw + 0.2);
    s.addText(v, { x, y: y0 + 0.3, w: pw, h: 0.36, fontFace: FD, fontSize: 17, color: GREEN, margin: 0, valign: 'top' });
    s.addText(l, { x, y: y0 + 0.68, w: pw, h: 0.62, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });
  label(s, rx, y0 + 1.42, 6, 'Where they shop  (% using, multi-select)');
  hBars(s, rx, y0 + 1.76, rw, [
    { label: 'Blinkit', value: 53, display: '53%', color: BLUE },
    { label: 'Swiggy Instamart', value: 43, display: '43%', color: BLUE },
    { label: 'Kirana', value: 41, display: '41%', color: BLUE2 },
    { label: 'BigBasket', value: 34, display: '34%', color: BLUE2 },
    { label: 'Amazon / JioMart', value: 30, display: '30%', color: BLUE2 },
    { label: 'Zepto', value: 29, display: '29%', color: BLUE },
    { label: 'Supermarkets', value: 10, display: '10%', color: GREY }
  ], 60, { rowH: 0.36, barH: 0.12 });
  box(s, rx, y0 + 4.36, rw, 0.62, null,
    'A quick-commerce-first, metro sample: the exact cohort DHF already sells to, and the cohort that will decide whether the category forms.', 'blue');
  foot(s, 'Part 03 · The Consumer');
}

/* ═══════════ 12 · FACTOR PIPELINE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The analytical pipeline', 'Factor analysis and k-means on 15 attitude statements.',
    'Rather than segment on age or income — poor predictors in this data — we let the attitudes group themselves.');
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
    card(s, x, y0, cw, 1.25);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y0 + 0.16, w: 0.32, h: 0.32, fill: { color: BLUESOFT }, line: { width: 0 } });
    s.addText(n, { x: x + 0.2, y: y0 + 0.16, w: 0.32, h: 0.32, fontFace: FD, fontSize: 9, color: BLUE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.2, y: y0 + 0.54, w: cw - 0.4, h: 0.36, fontFace: FB, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(d, { x: x + 0.2, y: y0 + 0.92, w: cw - 0.4, h: 0.3, fontFace: FB, fontSize: 7.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
  });

  const ay = y0 + 1.5;
  card(s, M, ay, CW, 0.7, { fill: INK, line: INK });
  s.addText('ADEQUACY — BOTH TESTS PASSED BEFORE EXTRACTION', { x: M + 0.25, y: ay, w: 4.4, h: 0.7, fontFace: FB, fontSize: 9, bold: true, color: GREEN3, charSpacing: 1.2, margin: 0, valign: 'middle' });
  [['KMO', '0.886', '"meritorious"'], ['BARTLETT', 'p < 0.001', 'sphericity rejected'], ['SILHOUETTE', '0.347', 'highest at k=4']].forEach(([k, v, n], i) => {
    const x = M + 5.05 + i * 2.45;
    s.addText(k, { x, y: ay + 0.08, w: 1.0, h: 0.26, fontFace: FB, fontSize: 7.5, bold: true, color: TXL2, charSpacing: 1, margin: 0, valign: 'middle' });
    s.addText(v, { x, y: ay + 0.3, w: 1.15, h: 0.32, fontFace: FD, fontSize: 12, color: WHITE, margin: 0, valign: 'middle' });
    s.addText(n, { x: x + 1.2, y: ay + 0.3, w: 1.2, h: 0.32, fontFace: FB, fontSize: 7.5, italic: true, color: TXL2, margin: 0, valign: 'middle' });
  });

  const fy = ay + 0.95;
  label(s, M, fy, 6, 'The three factors — and their defining statements');
  const factors = [
    ['F1 — Social & experiential trust', 'Trust is earned through people and events, not systems and symbols.', BLUE,
      [['Stopped buying after a news story', '0.68'], ['A doctor beats any pack logo', '0.62'], ['I trust a farmer I know by name', '0.59'], ['I prefer smaller brands', '0.53']]],
    ['F2 — System distrust & premium intent', 'The system is corrupt, and I will pay to exit it. This is the financial engine of premium food brands.', CLAY,
      [['Factories cannot be genuinely clean', '0.65'], ['Some adulteration is unavoidable', '0.50'], ['I would pay 20–30% more', '0.48'], ['The problem is proof, not cost', '0.47']]],
    ['F3 — Proof-demanding vigilance', 'I will check it myself. Show me the evidence.', GREEN,
      [['I will pay only if a test is shown', '0.64'], ['I need to verify proof myself', '0.60'], ['I can spot a genuine claim', '0.55'], ['Cost blocks me from safer food', '0.48']]]
  ];
  const fw = (CW - 0.3 * 2) / 3;
  factors.forEach(([t, d, c, rows], i) => {
    const x = M + i * (fw + 0.3);
    card(s, x, fy + 0.32, fw, 2.28);
    s.addShape(pres.ShapeType.rect, { x, y: fy + 0.32, w: fw, h: 0.05, fill: { color: c }, line: { width: 0 } });
    s.addText(t, { x: x + 0.2, y: fy + 0.46, w: fw - 0.4, h: 0.24, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: fy + 0.7, w: fw - 0.4, h: 0.4, fontFace: FB, fontSize: 8, italic: true, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    rows.forEach(([st, ld], k) => {
      const y = fy + 1.14 + k * 0.34;
      s.addText(st, { x: x + 0.2, y, w: fw - 0.9, h: 0.2, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });
      s.addText(ld, { x: x + fw - 0.7, y, w: 0.5, h: 0.2, fontFace: FB, fontSize: 8.5, bold: true, color: INK, align: 'right', margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + 0.2, w: fw - 0.4, h: 0.05, rectRadius: 0.025, fill: { color: SAND2 }, line: { width: 0 } });
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + 0.2, w: (fw - 0.4) * parseFloat(ld), h: 0.05, rectRadius: 0.025, fill: { color: c }, line: { width: 0 } });
    });
  });
  s.addNotes('The statistics did not create these groups; they revealed groups already in the data. At k=3, Guardians and Trusters merge into one unusable segment.');
  foot(s, 'Part 03 · The Consumer');
}

/* ═══════════ 13 · FOUR SEGMENTS ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Segmentation output', 'Four customer segments emerged from the research.',
    'Factor scores are standardised — 0 is the sample mean. Guardians are the only cluster positive on all three factors simultaneously.');

  const rows = [
    ['Segment', 'n (%)', 'F1 Social', 'F2 Distrust', 'F3 Vigilance', 'Trust in cert. claim', 'Would pay 11%+'],
    ['Proof-Hungry Guardians', '109  (36%)', '+0.46', '+0.47', '+0.69', '4.4 / 5', '54%'],
    ['Social Trusters', '62  (20%)', '+0.65', '+0.17', '−0.89', '3.6 / 5', '34%'],
    ['Passive Defaulters', '80  (26%)', '−0.39', '−1.05', '−0.34', '3.5 / 5', '6%'],
    ['System Fatalists', '54  (18%)', '−1.09', '+0.41', '+0.13', '3.6 / 5', '22%']
  ];
  const accent = [GREEN, BLUE, GREY, CLAY];
  const colX = [0, 3.0, 4.3, 5.5, 6.75, 8.05, 9.6];
  const colW = [3.0, 1.3, 1.2, 1.25, 1.3, 1.55, 1.4];
  const tw = 11.0;
  card(s, M, y0, tw, 0.42, { fill: SAND, line: SAND2, r: 0.04 });
  rows[0].forEach((h, c) => {
    s.addText(h.toUpperCase(), { x: M + colX[c] + 0.14, y: y0, w: colW[c] - 0.2, h: 0.42, fontFace: FB, fontSize: 7.5,
      bold: true, color: TX3, charSpacing: 0.8, align: c === 0 ? 'left' : 'right', margin: 0, valign: 'middle' });
  });
  rows.slice(1).forEach((r, i) => {
    const y = y0 + 0.42 + i * 0.44;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: tw, h: 0.44, fill: { color: i % 2 ? PAPER : WHITE }, line: { color: LINE, width: 0.4 } });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.05, h: 0.44, fill: { color: accent[i] }, line: { width: 0 } });
    r.forEach((cell, c) => {
      const isNeg = String(cell).indexOf('−') === 0;
      const isPos = String(cell).indexOf('+') === 0;
      s.addText(cell, { x: M + colX[c] + 0.14, y, w: colW[c] - 0.2, h: 0.44, fontFace: FB, fontSize: 9,
        bold: c === 0 || c === 6, color: isNeg ? CLAY : isPos ? GREEN : (c === 0 ? INK : TX2),
        align: c === 0 ? 'left' : 'right', margin: 0, valign: 'middle' });
    });
  });

  const cy = y0 + 0.42 + 4 * 0.44 + 0.22;
  label(s, M, cy, 4.9, '% of segment willing to pay 11%+');
  card(s, M, cy + 0.28, 4.9, 1.95);
  vBars(s, M + 0.4, cy + 0.44, 4.1, 1.62, [
    { label: 'Guardians', value: 54, display: '54%', color: GREEN },
    { label: 'Trusters', value: 34, display: '34%', color: BLUE },
    { label: 'Fatalists', value: 22, display: '22%', color: CLAY },
    { label: 'Defaulters', value: 6, display: '6%', color: GREY }
  ], 62, { gap: 0.22, labelH: 0.26 });

  const rx = M + 5.2, rw = CW - 5.2;
  label(s, rx, cy, 6, 'The trust wall, not the wallet wall');
  s.addText([
    { text: 'Roughly half of every category\'s buyers say they would pay nothing extra — and give the reason: they do not trust the claims.', options: { bullet: true, breakLine: true } },
    { text: '44% sit inside a +10–20% corridor; only 5% accept 21–30%.', options: { bullet: true, breakLine: true } },
    { text: 'Yet 60% say they would pay 20–30% more if someone they trusted had independently verified it.', options: { bullet: true } }
  ], { x: rx, y: cy + 0.28, w: rw, h: 0.88, fontFace: FB, fontSize: 9, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 4 });
  s.addShape(pres.ShapeType.line, { x: rx, y: cy + 1.2, w: rw, h: 0, line: { color: INK, width: 2 } });
  s.addText('Stated willingness to pay under distrust is a floor, not a ceiling.', {
    x: rx, y: cy + 1.28, w: rw, h: 0.44, fontFace: FD, fontSize: 12.5, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
  box(s, rx, cy + 1.76, rw, 0.62, null,
    'Premium willingness does not track income: it peaks in the ₹60K–1L band (71%) and falls to 32% in ₹1–1.5L. Delhi NCR 64% down to Ahmedabad 33% — the launch market on belief, not affluence.', 'gold');
  foot(s, 'Part 03 · The Consumer');
}

/* ═══════════ 14–15 · PERSONAS ═══════════ */
const PERSONAS = [
  ['Vandana Iyer', 'THE VERIFIER · 36%', 'Proof-Hungry Guardians', BLUE,
   '"The word organic on a label means nothing to me anymore. Show me the actual test report for this batch and I\'ll happily pay more."',
   '34–45 · postgraduate · senior professional · nuclear family with young children · ₹1.5–2.5L+/month · Tier-1 metro',
   'Batch-specific lab report by QR; "below detectable limits"; a specialist who has personally reviewed it',
   'No way to verify independently; greenwashing fatigue; a scan, not a research project',
   'n = 109   ·   Trust in certified claim 4.4/5   ·   Would pay 11%+ · 54%',
   'F1 +0.46   ·   F2 +0.47   ·   F3 +0.69'],
  ['Meera Nair', 'THE BELIEVER · 20%', 'Social Trusters', GREEN,
   '"If my doctor and my sister both say it\'s good for the family, that\'s all the proof I need. I\'m not going to scan codes and read reports."',
   '30–50 · graduate · homemaker or teacher · joint or extended family · ₹1–1.5L/month · Tier-1 and Tier-2',
   'Doctor and dietitian endorsement; a trusted person already using it; warm, relatable word of mouth',
   'Clinical, jargon-heavy messaging; conflicting opinions in her circle; nobody she trusts has vouched',
   'n = 62   ·   Trust in certified claim 3.6/5   ·   Would pay 11%+ · 34%',
   'F1 +0.65   ·   F2 +0.17   ·   F3 −0.89'],
  ['Karan Mehta', 'THE CRUISE-CONTROLLER · 26%', 'Passive Defaulters', '8A8474',
   '"Honestly, I just buy whatever brand I know that looks decent and isn\'t overpriced. Food safety isn\'t something I lose sleep over."',
   '26–38 · graduate · IT / sales / ops professional · DINK or small family · ₹80K–1.5L/month · heavy quick-commerce user',
   'Visible on the app he already uses; price parity with his usual brand; taste he notices',
   'Not stocked where he shops; a premium with no obvious reason; anything requiring effort to switch',
   'n = 80   ·   Trust in certified claim 3.5/5   ·   Would pay 11%+ · 6%',
   'F1 −0.39   ·   F2 −1.05   ·   F3 −0.34'],
  ['Sanjay Deshpande', 'THE SCEPTIC · 18%', 'System Fatalists', CLAY,
   '"Every brand says it\'s pure. Adulteration is everywhere, and no factory is truly clean. Prove me wrong — but don\'t insult me with marketing."',
   '38–55 · graduate to postgraduate · senior professional or business owner · established family · Tier-1 and Tier-2',
   'Unscripted farmer proof; independent, non-brand-paid verification; being shown what is imperfect',
   'Polished claims like everyone else\'s; certification with no visible teeth; anything that reads like a script',
   'n = 54   ·   Trust in certified claim 3.6/5   ·   Would pay 11%+ · 22%',
   'F1 −1.09   ·   F2 +0.41   ·   F3 +0.13']
];
[[0, 1], [2, 3]].forEach((pair, pi) => {
  const s = newSlide();
  const y0 = head(s, 'The buyer personas', pi === 0 ? 'Four people, four different definitions of proof.' : 'The two hardest segments to win — and how.',
    pi === 0 ? 'Each cluster was given a face, a household and a purchase story, so a marketer, a category manager and a farmer can all picture the same person.'
             : 'Defaulters need shelf presence and price parity. Fatalists need to be shown the imperfections before they will believe the perfections.');
  pair.forEach((idx, k) => {
    const p = PERSONAS[idx];
    const x = M + k * (CW / 2 + 0.15);
    const w = CW / 2 - 0.15;
    card(s, x, y0, w, 4.12);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y0 + 0.22, w: 0.62, h: 0.62, fill: { color: p[3] }, line: { width: 0 } });
    s.addText(p[0].charAt(0), { x: x + 0.25, y: y0 + 0.22, w: 0.62, h: 0.62, fontFace: FD, fontSize: 16, color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(p[0], { x: x + 1.0, y: y0 + 0.25, w: w - 1.25, h: 0.3, fontFace: FB, fontSize: 14, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(p[1], { x: x + 1.0, y: y0 + 0.55, w: w - 1.25, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true, color: p[3], charSpacing: 1.2, margin: 0, valign: 'middle' });
    s.addText(p[4], { x: x + 0.25, y: y0 + 0.98, w: w - 0.5, h: 0.72, fontFace: FB, fontSize: 11, italic: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
    s.addShape(pres.ShapeType.line, { x: x + 0.25, y: y0 + 1.78, w: w - 0.5, h: 0, line: { color: LINE, width: 0.6, dashType: 'dash' } });
    const secs = [['Profile', p[5]], ['What converts her / him', p[6]], ['What blocks the sale', p[7]]];
    const secCol = [TX3, GREEN, CLAY];
    secs.forEach(([t, d], j) => {
      const y = y0 + 1.82 + j * 0.58;
      label(s, x + 0.25, y, w - 0.5, t, secCol[j]);
      s.addText(d, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: 0.42, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
    });
    s.addShape(pres.ShapeType.line, { x: x + 0.25, y: y0 + 3.66, w: w - 0.5, h: 0, line: { color: LINE, width: 0.5, dashType: 'dash' } });
    s.addText(p[8] + '     |     ' + p[9], { x: x + 0.25, y: y0 + 3.72, w: w - 0.5, h: 0.32, fontFace: FB, fontSize: 8, bold: true, color: TX3, margin: 0, valign: 'middle' });
  });
  box(s, M, y0 + 4.24, CW, 0.62, null,
    pi === 0 ? 'Guardians convert fast on facts. Trusters need a voice of assurance — and the doctor endorsement bridges both segments at once.'
             : 'Guardians are 36% of decision-makers but hold roughly 60% of all stated premium-rupee intent. Win them first; the rest follow.', 'green');
  foot(s, 'Part 03 · The Consumer');
});

/* ═══════════ 16 · TARGETING ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The targeting decision', 'Where do we play first?',
    'Four segments, but not four campaigns. Sequencing matters more than coverage.');
  const tg = [
    ['PRIMARY', '36%', 'Proof-Hungry Guardians', 'Largest segment, highest willingness to pay, and the only one that responds to the proof DHF already generates.', GREEN],
    ['SECONDARY', '20%', 'Social Trusters', 'Activated by the Guardians\' verification becoming social proof. Doctor endorsement bridges both segments at once.', BLUE],
    ['DEFER', '26%', 'Passive Defaulters', 'Proof-heavy messaging misfires. Capture cheaply in phase two, once the category feels default.', GREY],
    ['SEQUENCE LAST', '18%', 'System Fatalists', 'Smallest and hardest. Needs a separate radical-transparency, farmer / founder-direct playbook.', CLAY]
  ];
  const cw = (CW - 0.28 * 3) / 4;
  tg.forEach(([tag, pct, nm, d, c], i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, y0, cw, 1.82);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 0.05, fill: { color: c }, line: { width: 0 } });
    s.addText(tag, { x: x + 0.2, y: y0 + 0.16, w: cw - 0.4, h: 0.22, fontFace: FB, fontSize: 8, bold: true, color: c, charSpacing: 1.2, margin: 0, valign: 'middle' });
    s.addText(pct, { x: x + 0.2, y: y0 + 0.38, w: cw - 0.4, h: 0.42, fontFace: FD, fontSize: 22, color: INK, margin: 0, valign: 'top' });
    s.addText(nm, { x: x + 0.2, y: y0 + 0.84, w: cw - 0.4, h: 0.24, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: y0 + 1.1, w: cw - 0.4, h: 0.7, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  });

  const cy = y0 + 2.0;
  label(s, M, cy, 6.2, 'What would make you try a new brand?  (% naming it top driver)');
  hBars(s, M, cy + 0.34, 6.2, [
    { label: 'Doctor / child-specialist endorsement', value: 44, display: '44%', color: GREEN },
    { label: '"Below detectable limits" + QR to lab report', value: 27, display: '27%', color: BLUE },
    { label: 'Farmer\'s name and village on pack', value: 12, display: '12%', color: BLUE2 },
    { label: 'Government certificate as the lead message', value: 8, display: '8%', color: GREY },
    { label: '"Tested for 200+ chemicals"', value: 6, display: '6%', color: CLAY },
    { label: 'Farm-visit invitations', value: 3, display: '3%', color: GREY },
    { label: 'Side-by-side residue comparison vs rivals', value: 1, display: '1%', color: GREY }
  ], 50, { rowH: 0.34, barH: 0.11 });

  const rx = M + 6.6, rw = CW - 6.6;
  box(s, rx, cy + 0.34, rw, 1.32, 'The uncomfortable finding',
    'DHF leads with the claim only 6% find convincing, and barely uses the endorsement 44% name first. Doctor endorsement wins in every segment — 55% of Trusters, 56% of Defaulters, 50% of Fatalists. Only Guardians rank the QR lab report first.', 'clay');
  card(s, rx, cy + 1.8, rw, 1.05, { fill: INK, line: INK });
  label(s, rx + 0.22, cy + 1.9, 3, 'The play', GREEN3);
  s.addText('Win Guardians with proof → convert their advocacy into the social proof that activates Trusters → ride the combined 56% into default category leadership.', {
    x: rx + 0.22, y: cy + 2.14, w: rw - 0.44, h: 0.62, fontFace: FB, fontSize: 9.5, color: TXL, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
  foot(s, 'Part 03 · The Consumer');
}

/* ═══════════ 17 · CLAIM CLUTTER ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 04 · Brand & Proof', 'Every shelf uses a different, often unverifiable claim.',
    'They contradict each other, none can be checked, and the shopper responds the only way she can — by discounting all of them equally. Generic language does not add trust; it adds noise.');

  label(s, M, y0, 6, 'The claims already on shelf');
  const claims = ['Farmer-face labelling', 'Naturally grown', 'Unpolished', 'Certification seal', 'Direct from farmer',
    '100% Natural', 'Personal provenance', 'Chemical-free', 'Farm fresh'];
  let cx = M, cy = y0 + 0.34;
  claims.forEach(t => {
    const w = 0.13 * t.length + 0.42;
    if (cx + w > M + 6.2) { cx = M; cy += 0.44; }
    s.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w, h: 0.36, rectRadius: 0.18,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75, dashType: 'dash' } });
    s.addText(t, { x: cx, y: cy, w, h: 0.36, fontFace: FB, fontSize: 9, color: TX2, align: 'center', margin: 0, valign: 'middle' });
    cx += w + 0.12;
  });

  const shelfY = cy + 0.62;
  label(s, M, shelfY, 6, 'The same claims, on the same aisle');
  ['shelf-jars.jpg', 'shelf-poha.jpg', 'shelf-twobrothers.jpg', 'shelf-tribalveda.jpg'].forEach((f, i) => {
    const x = M + i * 1.58;
    s.addImage({ path: A(f), x, y: shelfY + 0.3, w: 1.44, h: 0.95, sizing: { type: 'cover', w: 1.44, h: 0.95 } });
  });
  box(s, M, shelfY + 1.44, 6.2, 0.82, 'DHF\'s edge is specific.',
    'Not another adjective — a verifiable proof mechanism: a QR code, a batch, and a lab result the shopper can open in three seconds.', 'green');

  const rx = M + 6.6, rw = CW - 6.6;
  label(s, rx, y0, 6, 'Media is building the case for verified proof');
  const news = ['news-ndtv.jpg', 'news-ccpa.jpg', 'news-b.jpg', 'news-3.jpg', 'news-c.jpg', 'news-2.jpg'];
  const caps = ['Market growth, affordability gap', 'Regulatory crackdown', 'Pesticide safety alarm',
    'Policy & certification', 'Celebrity & consumer validation', 'The case for verified proof'];
  const nw = (rw - 0.2 * 2) / 3;
  news.forEach((f, i) => {
    const x = rx + (i % 3) * (nw + 0.2);
    const y = y0 + 0.34 + Math.floor(i / 3) * 1.6;
    s.addImage({ path: A(f), x, y, w: nw, h: 1.05, sizing: { type: 'cover', w: nw, h: 1.05 } });
    s.addText(caps[i], { x, y: y + 1.08, w: nw, h: 0.4, fontFace: FB, fontSize: 7.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.05 });
  });
  foot(s, 'Part 04 · Brand & Proof');
}

/* ═══════════ 18 · MANIFESTO ═══════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('spices-flatlay.jpg'), x: 9.4, y: 0, w: 3.933, h: H, sizing: { type: 'cover', w: 3.933, h: H } });
  s.addShape(pres.ShapeType.rect, { x: 8.2, y: 0, w: 5.133, h: H, fill: { color: INK, transparency: 25 }, line: { width: 0 } });
  const y0 = head(s, 'Brand manifesto', 'We believe', null, { light: true, titleSize: 34, titleH: 0.85, titleW: 8 });
  s.addText('The future of food isn\'t claimed on a label; it\'s proven in the field. Every seed we recommend, every practice we track, and every farmer we name is how we turn honesty into something you can verify, not just believe.', {
    x: M, y: y0, w: 7.6, h: 1.05, fontFace: FB, fontSize: 15, color: TXL, margin: 0, valign: 'top', lineSpacingMultiple: 1.16 });

  label(s, M, y0 + 1.2, 4, 'We stand for', GREEN3);
  const values = [
    ['Resilience', 'We meet uncertainty with patience and grit, learning from the land and adapting so farmers can thrive through seasons and shocks.'],
    ['Integrity', 'Transparency is a mechanism, not a promise to be broken. You can check batch data, farmer names and practices.'],
    ['Simplicity', 'We turn complex agri-data into one clear signal, so farmers can act with confidence and consumers can trust what they see instantly.'],
    ['Progress', 'Not progress for its own sake, but progress powered by DeHaat\'s own agri-tech, in service of tradition — not instead of it.'],
    ['Education & empowerment', 'We bridge Krishi wisdom and modern methods, so farming becomes more productive, profitable and sustainable.'],
    ['Connection', 'The farmer isn\'t a sourcing story we tell; they\'re the name on the batch, accountable and credited.']
  ];
  const vw = (7.6 - 0.24 * 2) / 3;
  values.forEach(([t, d], i) => {
    const x = M + (i % 3) * (vw + 0.24);
    const y = y0 + 1.52 + Math.floor(i / 3) * 1.28;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: vw, h: 1.16, rectRadius: 0.08,
      fill: { color: WHITE, transparency: 94 }, line: { color: 'FFFFFF', width: 0.6, transparency: 82 } });
    s.addText(t, { x: x + 0.16, y: y + 0.1, w: vw - 0.32, h: 0.34, fontFace: FD, fontSize: 9.5, color: WHITE, margin: 0, valign: 'top', lineSpacingMultiple: 1.0 });
    s.addText(d, { x: x + 0.16, y: y + 0.46, w: vw - 0.32, h: 0.62, fontFace: FB, fontSize: 7.5, color: TXL2, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });
  s.addText([{ text: 'We are Honest Farms. ', options: { italic: true, color: TXL } },
             { text: 'Verified in the fields, honest on the shelves.', options: { bold: true, color: GREEN3 } }], {
    x: M, y: y0 + 4.15, w: 7.6, h: 0.4, fontFace: FB, fontSize: 14, margin: 0, valign: 'middle' });
  foot(s, 'Part 04 · Brand & Proof', true);
}

/* ═══════════ 19 · PURPOSE ═══════════ */
{
  const s = newSlide(SAND);
  s.addImage({ path: A('sapling.jpg'), x: 7.9, y: 1.35, w: 4.9, h: 4.8, sizing: { type: 'cover', w: 4.9, h: 4.8 } });
  const y0 = head(s, 'Brand purpose', 'To nurture soil and skills, to do business honestly, and to prove it — batch by batch, farmer by farmer.',
    null, { titleSize: 27, titleH: 2.6, titleW: 6.9 });
  s.addText('A promise about the value delivered to the customer — not a claim about the company.', {
    x: M, y: y0 + 0.5, w: 6.9, h: 0.4, fontFace: FB, fontSize: 11, italic: true, color: TX2, margin: 0, valign: 'top' });
  foot(s, 'Part 04 · Brand & Proof');
}

/* ═══════════ 20 · FARMERS IN THE SPOTLIGHT ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Making back-end agri-tech rigour visible', 'Flip the script on QR traceability: put the farmer in the spotlight.',
    'Most traceability QR codes lead to a certificate — a document nobody reads. Ours should lead to a person.');
  const mechs = [
    ['QR to farmer', 'Scan the pack and land on a unique microsite of that farmer — know his village, harvest date, daily life, growth, consumer connects, and download the Pesticide-Free Certificate.'],
    ['Village / farm clusters on pack', 'Like most wine brands across the world — Bordeaux, Nice, Nashik, Napa Valley — prove provenance.'],
    ['Farmers as content creators', 'They play the lead role with unscripted reels, voice notes and live harvest streams. Rougher, less polished than a typical ad — which is exactly what signals "real" to a sceptical buyer.'],
    ['Hand-written farmer letters in pack', 'Rotating, handwritten-style notes from the actual farmer of that batch.'],
    ['Farmers send audit invitation', 'No need to give advance notice. Wins the "prove me wrong" archetype.'],
    ['Farmer-led sampling', 'The farmers, not agency promoters, make demos at flea markets or housing societies to drive trials.'],
    ['Consumer-to-farmer feedback loop', 'Get consumers to review the farmers and their fields\' produce, instead of the product purchased.']
  ];
  const mw = (8.2 - 0.24) / 2;
  mechs.forEach(([t, d], i) => {
    const x = M + (i % 2) * (mw + 0.24);
    const y = y0 + Math.floor(i / 2) * 1.06;
    card(s, x, y, mw, 0.94);
    s.addText('→  ' + t, { x: x + 0.18, y: y + 0.1, w: mw - 0.36, h: 0.24, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.18, y: y + 0.36, w: mw - 0.36, h: 0.52, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });
  const rx = M + 8.5, rw = CW - 8.5;
  s.addImage({ path: A('qr-scan.jpg'), x: rx, y: y0, w: rw, h: 1.9, sizing: { type: 'cover', w: rw, h: 1.9 } });
  s.addImage({ path: A('pack-range.jpg'), x: rx, y: y0 + 2.0, w: rw, h: 1.6, sizing: { type: 'cover', w: rw, h: 1.6 } });
  box(s, rx, y0 + 3.68, rw, 1.05, '4% → 22% full trust',
    'when the pesticide-free claim carries an independent certificate — a 5× uplift, the largest of any claim tested.', 'gold');
  foot(s, 'Part 04 · Brand & Proof');
}

/* ═══════════ 21 · BRAND ARCHITECTURE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Brand architecture', 'The only food brand in India that consumers verify, not just trust.',
    'Positioning at the top, benefits in the middle, and a specific meaning for each stakeholder at the bottom.');
  const arch = [
    ['Positioning', 'The only food brand in India that consumers verify, not just trust.'],
    ['Promise', 'Verified in the fields. Honest on the shelves.'],
    ['Role', 'An honest guide that leads with transparency, answers with proof, and never preaches.'],
    ['Belief', 'Progress moves from seed to plate, and every hand that touches it is named, not hidden.']
  ];
  arch.forEach(([t, d], i) => {
    const y = y0 + i * 0.82;
    card(s, M, y, 6.2, 0.72);
    label(s, M + 0.2, y + 0.08, 3, t, GREEN);
    s.addText(d, { x: M + 0.2, y: y + 0.3, w: 5.8, h: 0.36, fontFace: FD, fontSize: 11, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
  });
  const by = y0 + 4 * 0.82 + 0.1;
  const bw = (6.2 - 0.2 * 2) / 3;
  [['Functional', 'Verified safety.', 'No detectable residue.'],
   ['Emotional', 'Relief.', 'You\'re no longer the only one keeping watch.'],
   ['Experiential', 'Honest progress.', 'With every basket, from seed to plate.']].forEach(([t, b, d], i) => {
    const x = M + i * (bw + 0.2);
    card(s, x, by, bw, 1.05, { fill: SAND, line: SAND2 });
    label(s, x + 0.16, by + 0.08, bw - 0.3, t);
    s.addText(b, { x: x + 0.16, y: by + 0.3, w: bw - 0.32, h: 0.24, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.16, y: by + 0.54, w: bw - 0.32, h: 0.42, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });

  const rx = M + 6.5, rw = CW - 6.5;
  label(s, rx, y0, 6, 'What the promise means to each stakeholder');
  const stakes = [
    ['Farmers / FPOs', 'DeHaat trains farmers for productivity, profitability and sustainability with simplified agri-tech data to give clear signals to consumers. Winning trust with no hidden stories, no shortcuts.'],
    ['Q-comm, e-comm & MTs', 'Made to win Honest Farms\' brand trust by showing superiority in backend agri-tech, not just another category claim on apps and shelves.'],
    ['Consumers', 'Empowered to verify every batch, farmer, and agri practice before they add to cart and put food on the table.'],
    ['Employees', 'Hire and train to demonstrate the spirit of progress — bringing Krishi wisdom and modern methods to make farming more productive, profitable and sustainable.']
  ];
  const kw = (rw - 0.22) / 2;
  stakes.forEach(([t, d], i) => {
    const x = rx + (i % 2) * (kw + 0.22);
    const y = y0 + 0.34 + Math.floor(i / 2) * 1.72;
    card(s, x, y, kw, 1.56);
    label(s, x + 0.18, y + 0.12, kw - 0.36, t, BLUE);
    s.addText(d, { x: x + 0.18, y: y + 0.4, w: kw - 0.36, h: 1.05, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.12 });
  });
  box(s, rx, y0 + 3.8, rw, 1.0, 'PROMISE', 'Verified in the fields. Honest on the shelves.', 'green');
  foot(s, 'Part 04 · Brand & Proof');
}

/* ═══════════ 22 · NORTH STAR ═══════════ */
{
  const s = newSlide(INK);
  const y0 = head(s, 'The North Star', 'Be the only food brand in India that consumers verify, not just trust.',
    null, { light: true, titleSize: 30, titleH: 1.5, titleW: 10.5 });
  card(s, M, y0, CW, 1.0, { fill: INK2, line: '2B4258' });
  label(s, M + 0.25, y0 + 0.12, 5, 'How do we measure success?', GREEN3);
  s.addText('Verified Purchase Rate — the % of purchases where a consumer engages a real proof point (batch QR scan, farmer profile, lab report) before or after buying the product.', {
    x: M + 0.25, y: y0 + 0.4, w: CW - 0.5, h: 0.5, fontFace: FB, fontSize: 11.5, color: TXL, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });

  const vy = y0 + 1.25;
  const vpr = [['V', 'Vandana — The Verifier', 'Scans the batch QR; visits the microsite to engage with farmers.'],
    ['M', 'Meera — The Believer', 'Confirms it with her doctor or her circle of influence.'],
    ['K', 'Karan — The Cruise Controller', 'Notices it\'s on his app already; repeat-buys anyway.'],
    ['S', 'Sanjay — The Sceptic', 'Watches unscripted farm content; takes up an audit invite from the farmer.']];
  const vw = (CW - 0.28 * 3) / 4;
  vpr.forEach(([i0, t, d], i) => {
    const x = M + i * (vw + 0.28);
    s.addShape(pres.ShapeType.roundRect, { x, y: vy, w: vw, h: 1.5, rectRadius: 0.08,
      fill: { color: WHITE, transparency: 94 }, line: { color: 'FFFFFF', width: 0.6, transparency: 84 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: vy + 0.18, w: 0.42, h: 0.42, fill: { color: GREEN3 }, line: { width: 0 } });
    s.addText(i0, { x: x + 0.2, y: vy + 0.18, w: 0.42, h: 0.42, fontFace: FD, fontSize: 11, color: INK, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.2, y: vy + 0.68, w: vw - 0.4, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: WHITE, margin: 0, valign: 'top' });
    s.addText(d, { x: x + 0.2, y: vy + 0.94, w: vw - 0.4, h: 0.5, fontFace: FB, fontSize: 8.5, color: TXL2, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  });

  const wy = vy + 1.75;
  s.addShape(pres.ShapeType.line, { x: M, y: wy, w: CW, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 82 } });
  const why = ['It is the only metric that goes down if the proof mechanism breaks — brand awareness would not.',
    'It is measurable from day one, without a tracker study: scans, microsite sessions, report downloads, audit sign-ups.',
    'It is the one number a professor, a retailer and a farmer would all read the same way.'];
  why.forEach((t, i) => {
    const x = M + i * (CW / 3);
    s.addText(t, { x, y: wy + 0.18, w: CW / 3 - 0.35, h: 0.62, fontFace: FB, fontSize: 9, color: TXL2, margin: 0, valign: 'top', lineSpacingMultiple: 1.12, bullet: true });
  });
  s.addText('Revenue and share are outcomes. Verified Purchase Rate is the lever that sales, product and marketing teams continuously optimize.', {
    x: M, y: wy + 0.92, w: CW, h: 0.4, fontFace: FB, fontSize: 12, italic: true, color: WHITE, margin: 0, valign: 'middle' });
  foot(s, 'Part 04 · Brand & Proof', true);
}

/* ═══════════ 23 · PROOF ARCHITECTURE ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Proof architecture', 'One standard, four communication deliveries.',
    'The standard behind the pack never changes. What changes is who delivers the proof, through which channel, and how fast it converts.');
  const dl = [
    ['Vandana — The Verifier', 'PROOF-HUNGRY GUARDIANS · 36%', BLUE, '"Scan the pack. See exactly what\'s inside."',
      'QR to the batch-level lab report and the farmer\nDoctor or dietitian citation on pack, beside the farmer\'s view\nCertification carrying a live verification link',
      'QR code · D2C · Modern trade', 'Fast, once proof is visible. She does her own diligence.'],
    ['Meera — The Believer', 'SOCIAL TRUSTERS · 20%', GREEN, '"Ask your doctor. Then ask your sister. They\'ve approved us."',
      'Doctor and dietitian partnership programme\nReferral incentive for existing customers\nTestimonials from families she recognises',
      'Clinic tie-ups · Community WhatsApp · WOM', 'Medium. Needs one or two trusted validators, then sticks.'],
    ['Karan — The Cruise-Controller', 'PASSIVE DEFAULTERS · 26%', GREY, '"Same taste. Same price. Honestly, better choice."',
      'Priority placement in quick-commerce search\nPrice parity with the brand he already buys\nTaste-forward sampling, never health-forward',
      'Quick commerce · Modern trade endcaps', 'Fast to trial, low loyalty. Needs habitual reinforcement.'],
    ['Sanjay — The Sceptic', 'SYSTEM FATALISTS · 18%', CLAY, '"We\'ll show you the parts no brand talks about."',
      'Unscripted farmer and founder video content\nOpen invitations to audit or visit the farm\nIndependent verification nobody paid for',
      'Farmer-direct platforms · Founder-led content', 'Slowest — but becomes a vocal advocate once earned.']
  ];
  const cw = (CW - 0.26 * 3) / 4;
  dl.forEach(([n, seg, c, line, mech, ch, sp], i) => {
    const x = M + i * (cw + 0.26);
    card(s, x, y0, cw, 3.15);
    s.addShape(pres.ShapeType.rect, { x, y: y0, w: cw, h: 0.05, fill: { color: c }, line: { width: 0 } });
    s.addText(n, { x: x + 0.2, y: y0 + 0.14, w: cw - 0.4, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(seg, { x: x + 0.2, y: y0 + 0.38, w: cw - 0.4, h: 0.2, fontFace: FB, fontSize: 7, bold: true, color: TX3, charSpacing: 0.6, margin: 0, valign: 'top' });
    s.addText(line, { x: x + 0.2, y: y0 + 0.6, w: cw - 0.4, h: 0.5, fontFace: FB, fontSize: 9.5, italic: true, bold: true, color: c, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    label(s, x + 0.2, y0 + 1.14, cw - 0.4, 'The mechanism');
    s.addText(mech.split('\n').map((t, k, arr) => ({ text: t, options: { bullet: true, breakLine: k < arr.length - 1 } })), {
      x: x + 0.2, y: y0 + 1.36, w: cw - 0.4, h: 1.02, fontFace: FB, fontSize: 7.5, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 2 });
    label(s, x + 0.2, y0 + 2.4, cw - 0.4, 'Channel');
    s.addText(ch, { x: x + 0.2, y: y0 + 2.6, w: cw - 0.4, h: 0.3, fontFace: FB, fontSize: 8, bold: true, color: TX, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    label(s, x + 0.2, y0 + 2.88, cw - 0.4, 'Speed');
    s.addText(sp, { x: x + 0.2, y: y0 + 3.06, w: cw - 0.4, h: 0.24, fontFace: FB, fontSize: 7.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.0 });
  });

  const my = y0 + 3.28;
  label(s, M, my, 6, 'Trust is multi-dimensional for each archetype');
  const mrows = [
    ['', 'Vandana', 'Meera', 'Karan', 'Sanjay'],
    ['Trust lever', 'Verified data (QR + lab)', 'Human endorsement', 'Familiarity, shelf presence', 'Radical transparency'],
    ['Price perception', 'Premium OK, with proof', 'Modest premium if endorsed', 'Expects price parity', 'Suspicious of any premium'],
    ['Key to win', 'Batch proof + doctor review', 'Get her circle to vouch', 'Be visible and taste-led', 'Show the imperfect parts']
  ];
  const mcw = [2.0, 2.55, 2.55, 2.55, 2.55];
  mrows.forEach((r, ri) => {
    const y = my + 0.26 + ri * 0.31;
    if (ri === 0) s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: 0.31, fill: { color: SAND }, line: { width: 0 } });
    let x = M;
    r.forEach((cell, ci) => {
      s.addText(cell, { x: x + 0.12, y, w: mcw[ci] - 0.2, h: 0.31, fontFace: FB, fontSize: 8,
        bold: ri === 0 || ci === 0, color: ri === 0 ? TX3 : (ci === 0 ? TX3 : TX2), margin: 0, valign: 'middle' });
      x += mcw[ci];
    });
    if (ri > 0) s.addShape(pres.ShapeType.line, { x: M, y: y + 0.31, w: CW, h: 0, line: { color: LINE, width: 0.4 } });
  });
  foot(s, 'Part 04 · Brand & Proof');
}

/* ═══════════ 24 · PORTFOLIO REALITY ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 05 · The Growth Engine', 'Strategy says accessible-premium food brand. Portfolio says commodities.',
    'Eight half-years of audited revenue. The business is growing, but growing fastest in the block it talks about least — and depending on a single platform for a quarter of its income.');
  const sw = (CW - 0.26 * 3) / 4;
  [['₹90.9 Cr', 'Cumulative revenue audited across eight half-years; FY26 ≈ ₹53 Cr, up ~30% YoY', BLUE],
   ['+219%', 'Growth of the value-added block (makhana, jaggery, honey) = 29% of revenue, the real engine', GREEN],
   ['24%', 'Of revenue from a single account, Zepto — one rupee in four is at platform mercy', CLAY],
   ['~33%', 'Of revenue (≈₹30 Cr) has no channel attribution at all', CLAY]
  ].forEach(([v, l, c], i) => stat(s, M + i * (sw + 0.26), y0, sw, v, l, { color: c, h: 1.4 }));

  const cy = y0 + 1.72;
  label(s, M, cy, 7, 'Portfolio mix vs portfolio growth  (cumulative ₹ Cr, growth %)');
  card(s, M, cy + 0.32, 6.6, 2.5);
  hBars(s, M + 0.3, cy + 0.55, 6.0, [
    { label: 'Pulses · 56% of revenue', value: 50.4, display: '₹50.4 Cr · +113%', color: BLUE },
    { label: 'Value-Added · 29%', value: 26.0, display: '₹26.0 Cr · +219%', color: GREEN },
    { label: 'Spices · 12%', value: 10.9, display: '₹10.9 Cr · +185%', color: GOLD2 },
    { label: 'Oil & Ghee · 1%', value: 0.8, display: '₹0.8 Cr', color: GREY }
  ], 56, { rowH: 0.52, barH: 0.15 });

  const rx = M + 6.9, rw = CW - 6.9;
  label(s, rx, cy, rw, 'Three tension points that decide the strategy');
  const tens = [
    ['01', 'Revenue is anchored in the slowest-growing, lowest-margin block.', 'Pulses are 56% of revenue and grow below the portfolio average.'],
    ['02', 'Realisation is falling while volume rises.', 'Revenue per MT fell 4.3% in FY26-H2; a margin warning masked by tonnage.'],
    ['03', 'Proof is asserted, not demonstrated.', 'Seven simultaneous taglines, no hierarchy, and "230+ quality checks" stated but never explained.']
  ];
  tens.forEach(([n, t, d], i) => {
    const y = cy + 0.32 + i * 0.86;
    card(s, rx, y, rw, 0.76, { r: 0.05 });
    s.addShape(pres.ShapeType.rect, { x: rx, y, w: 0.045, h: 0.76, fill: { color: CLAY }, line: { width: 0 } });
    s.addText(n + '  ' + t, { x: rx + 0.2, y: y + 0.08, w: rw - 0.4, h: 0.32, fontFace: FB, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
    s.addText(d, { x: rx + 0.2, y: y + 0.4, w: rw - 0.4, h: 0.32, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.06 });
  });
  foot(s, 'Part 05 · The Growth Engine');
}

/* ═══════════ 25 · TRAJECTORY ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The growth ambition', '₹53 Cr today. ₹748 Cr by FY31.',
    'Fourteen times the base in five years — built bottom-up from SKU, channel and city plans rather than a top-down multiple.');
  card(s, M, y0, 8.0, 4.2);
  label(s, M + 0.3, y0 + 0.2, 5, 'Net revenue, ₹ Cr');
  vBars(s, M + 0.4, y0 + 0.6, 7.2, 3.3, [
    { label: 'FY26', value: 53, display: '₹53', color: BLUE2 },
    { label: 'FY27', value: 104, display: '₹104', color: BLUE2 },
    { label: 'FY28', value: 168, display: '₹168', color: BLUE },
    { label: 'FY29', value: 274, display: '₹274', color: GREEN2 },
    { label: 'FY30', value: 450, display: '₹450', color: GREEN2 },
    { label: 'FY31', value: 748, display: '₹748', color: GREEN }
  ], 830, { gap: 0.3, labelH: 0.3 });

  const rx = M + 8.3, rw = CW - 8.3;
  [['14.1×', 'On the FY26 base of ₹53 Cr'],
   ['64%', 'Net revenue CAGR, FY27 to FY31'],
   ['+5.8pp', 'Gross margin, 37.5% → 43.3%']].forEach(([v, l], i) => {
    stat(s, rx, y0 + i * 1.15, rw, v, l, { color: GREEN, h: 1.02, vs: 22 });
  });
  s.addImage({ path: A('value-added.jpg'), x: rx, y: y0 + 3.55, w: rw, h: 1.4, sizing: { type: 'cover', w: rw, h: 1.4 } });
  foot(s, 'Part 05 · The Growth Engine');
}

/* ═══════════ 26 · CATEGORY MIX ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Portfolio design', 'Pulses hold the volume base. Spices carry the margin.',
    'The revenue plan and the margin plan are two different stories. Almost the entire margin expansion comes from spices — a category DHF barely sells today.');
  card(s, M, y0, 7.9, 4.1);
  label(s, M + 0.3, y0 + 0.2, 6, 'Revenue by category, ₹ Cr — FY27 vs FY31');
  const mix = [['Pulses', 43, 228], ['Spices', 18, 202], ['Value-Added', 32, 169], ['Oil & Ghee', 9, 120], ['Processed', 2, 30]];
  const gx = M + 0.45, gw = 7.1, plotH = 2.85, gy = y0 + 0.6;
  const gmax = 250;
  s.addShape(pres.ShapeType.line, { x: gx, y: gy + plotH, w: gw, h: 0, line: { color: LINE, width: 0.75 } });
  const grpW = gw / mix.length;
  mix.forEach(([nm, a, b], i) => {
    const bx = gx + i * grpW;
    const bw2 = (grpW - 0.34) / 2;
    [[a, BLUE2, 0], [b, GREEN, 1]].forEach(([v, c, k]) => {
      const bh = Math.max(0.04, plotH * (v / gmax));
      const x = bx + 0.1 + k * (bw2 + 0.12);
      s.addShape(pres.ShapeType.roundRect, { x, y: gy + plotH - bh, w: bw2, h: bh, rectRadius: 0.05, fill: { color: c }, line: { width: 0 } });
      s.addText('₹' + v, { x: x - 0.1, y: gy + plotH - bh - 0.26, w: bw2 + 0.2, h: 0.24, fontFace: FB, fontSize: 8.5, bold: true, color: INK, align: 'center', margin: 0, valign: 'bottom' });
    });
    s.addText(nm, { x: bx, y: gy + plotH + 0.06, w: grpW, h: 0.26, fontFace: FB, fontSize: 8.5, color: TX2, align: 'center', margin: 0, valign: 'top' });
  });
  s.addShape(pres.ShapeType.rect, { x: gx, y: gy + plotH + 0.4, w: 0.16, h: 0.16, fill: { color: BLUE2 }, line: { width: 0 } });
  s.addText('FY27', { x: gx + 0.24, y: gy + plotH + 0.36, w: 0.7, h: 0.24, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });
  s.addShape(pres.ShapeType.rect, { x: gx + 1.05, y: gy + plotH + 0.4, w: 0.16, h: 0.16, fill: { color: GREEN }, line: { width: 0 } });
  s.addText('FY31', { x: gx + 1.29, y: gy + plotH + 0.36, w: 0.7, h: 0.24, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'middle' });

  const rx = M + 8.2, rw = CW - 8.2;
  [['11.2×', 'Spices, FY27 → FY31. Mix moves from 17% to 27% of revenue, at 51–58% gross margin.'],
   ['₹99.9 Cr', 'Makhana — the single largest SKU in the FY31 plan, and a realisation play, not a tonnage play.'],
   ['₹95.5 Cr', 'From four ground spice powders that do not exist today. Pure NPD, from a zero base.']
  ].forEach(([v, l], i) => stat(s, rx, y0 + i * 1.24, rw, v, l, { color: GREEN, h: 1.12, vs: 21 }));
  s.addShape(pres.ShapeType.line, { x: rx, y: y0 + 3.85, w: rw, h: 0, line: { color: CLAY, width: 2 } });
  s.addText('Spices deliver the entire +5.8pp of margin expansion. So, a slipped spice launch is a slipped P&L.', {
    x: rx, y: y0 + 3.95, w: rw, h: 0.6, fontFace: FD, fontSize: 12, color: CLAY, margin: 0, valign: 'top', lineSpacingMultiple: 1.04 });
  foot(s, 'Part 05 · The Growth Engine');
}

/* ═══════════ 27 · DISTRIBUTION ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The distribution roadmap', 'Earn the shelf. Then densify it.',
    '13.5× the selling points at 5× the revenue. The plan does not need better stores, it needs more of them, faster than the dilution.');
  const sw = (CW - 0.3 * 2) / 3;
  [['22,628', 'selling points by FY31, from 1,672 today'],
   ['110', 'offline cities, from 22 today'],
   ['40%', 'the ceiling on any single channel\'s share of revenue']
  ].forEach(([v, l], i) => stat(s, M + i * (sw + 0.3), y0, sw, v, l, { h: 1.18 }));

  const cy = y0 + 1.4;
  label(s, M, cy, 6, 'Channel mix at FY31, ₹ Cr');
  card(s, M, cy + 0.3, 6.6, 2.3);
  hBars(s, M + 0.3, cy + 0.52, 6.0, [
    { label: 'E-commerce & quick commerce', value: 304, display: '₹304 Cr', color: BLUE },
    { label: 'Regional & premium offline', value: 263, display: '₹263 Cr', color: GREEN },
    { label: 'National modern trade', value: 129, display: '₹129 Cr', color: BLUE2 },
    { label: 'Exports', value: 54, display: '₹54 Cr', color: GOLD2 }
  ], 340, { rowH: 0.48, barH: 0.15 });
  box(s, M, cy + 2.72, 6.6, 0.62, null,
    'No single channel above 40% — the ceiling is what stops the plan becoming a bet on one platform.', 'blue');

  const rx = M + 6.9, rw = CW - 6.9;
  label(s, rx, cy, rw, 'The sequence');
  [['Earn the metro shelf', 'Prove velocity where the Guardians already shop.'],
   ['Ride quick commerce into Tier 2 & 3', 'Distribution without the fixed cost of feet on street.'],
   ['Convert regional chains, state by state', 'Regional & premium offline is the second-largest pool at ₹263 Cr.'],
   ['Densify what is already open', 'Adding SKUs per store is cheaper than adding stores.']
  ].forEach(([t, d], i) => {
    const y = cy + 0.3 + i * 0.78;
    card(s, rx, y, rw, 0.7);
    s.addShape(pres.ShapeType.ellipse, { x: rx + 0.2, y: y + 0.15, w: 0.4, h: 0.4, fill: { color: BLUE }, line: { width: 0 } });
    s.addText(String(i + 1), { x: rx + 0.2, y: y + 0.15, w: 0.4, h: 0.4, fontFace: FD, fontSize: 10, color: WHITE, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: rx + 0.72, y: y + 0.08, w: rw - 0.92, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(d, { x: rx + 0.72, y: y + 0.34, w: rw - 0.92, h: 0.3, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', lineSpacingMultiple: 1.02 });
  });
  foot(s, 'Part 05 · The Growth Engine');
}

/* ═══════════ 28 · THE MOAT — WHAT DHF CONTROLS ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Part 06 · The Moat & The Ask', 'We don\'t test the harvest. We control the input.',
    'Every competitor can buy a certificate or commission a lab. None of them can decide what a farmer plants and sprays — because none of them run the agritech network the farmer already uses.');
  const sw = (CW - 0.3 * 2) / 3;
  [['10 Mn+', 'Farmers on the DeHaat network'], ['8', 'Sourcing clusters owned end to end'], ['230+', 'Pesticide checks on every batch']]
    .forEach(([v, l], i) => stat(s, M + i * (sw + 0.3), y0, sw, v, l, { color: GREEN, h: 1.1 }));

  const sy = y0 + 1.42;
  label(s, M, sy, 6, 'The five steps behind the claim');
  const stepW = (CW - 0.24 * 4) / 5;
  ['Clean cultivation', 'Direct sourcing', '230+ checks', 'Controlled processing', 'Traceable to source'].forEach((t, i) => {
    const x = M + i * (stepW + 0.24);
    card(s, x, sy + 0.3, stepW, 0.95);
    s.addShape(pres.ShapeType.ellipse, { x: x + stepW / 2 - 0.2, y: sy + 0.44, w: 0.4, h: 0.4, fill: { color: GREENSOFT }, line: { width: 0 } });
    s.addText(String(i + 1), { x: x + stepW / 2 - 0.2, y: sy + 0.44, w: 0.4, h: 0.4, fontFace: FD, fontSize: 10, color: GREEN, align: 'center', margin: 0, valign: 'middle' });
    s.addText(t, { x: x + 0.1, y: sy + 0.88, w: stepW - 0.2, h: 0.3, fontFace: FB, fontSize: 9, bold: true, color: TX, align: 'center', margin: 0, valign: 'middle' });
  });
  s.addText('BIHAR MAKHANA  ·  UTTARAKHAND JAGGERY  ·  GUJARAT JAVA PEANUT  ·  AND FIVE MORE, OWNED END-TO-END', {
    x: M, y: sy + 1.36, w: CW, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true, color: TX3, charSpacing: 0.9, margin: 0, valign: 'middle' });

  s.addImage({ path: A('team-field.jpg'), x: M, y: sy + 1.68, w: 7.4, h: 1.62, sizing: { type: 'cover', w: 7.4, h: 1.62 } });
  box(s, M + 7.7, sy + 1.68, CW - 7.7, 1.62, 'Proof comes from procurement control.',
    'Not from holding a certificate. AgriTech-embedded input control, continuous quality intelligence across 2M farms, and a farmer economic ecosystem earning 30 to 50% better returns — none of it is contractable by a competitor.', 'green');
  foot(s, 'Part 06 · The Moat & The Ask');
}

/* ═══════════ 29 · THE MOAT LADDER ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Competitive defence', 'The moat has to be visible by FY29.',
    'Five layers of defensibility, ordered by how long each survives a determined competitor. DHF sits at L1 — and only L3 and L4 survive imitation.');
  const rungs = [['L4', 'Farmer-direct transparency', 'structural', GREEN, GREENSOFT],
    ['L3', 'DeHaat input control', '5.5 yrs to copy', '4C8F3F', WHITE],
    ['L2', 'NPOP certification', 'parity', TX3, WHITE],
    ['L1', 'QR to the batch lab report', '1.2 yrs to copy', BLUE, BLUESOFT],
    ['L0', 'A label claim', '0.3 yrs to copy', CLAY, WHITE]];
  rungs.forEach(([l, t, n, c, f], i) => {
    const y = y0 + i * 0.66;
    card(s, M, y, 7.4, 0.56, { r: 0.05, fill: f, line: l === 'L1' ? BLUE : LINE, lw: l === 'L1' ? 1.5 : 0.75 });
    s.addText(l, { x: M + 0.2, y, w: 0.6, h: 0.56, fontFace: FD, fontSize: 13, color: c, margin: 0, valign: 'middle' });
    s.addText(t, { x: M + 0.9, y, w: 3.7, h: 0.56, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText((l === 'L1' ? 'DHF IS HERE  ·  ' : '') + n.toUpperCase(), {
      x: M + 4.6, y, w: 2.6, h: 0.56, fontFace: FB, fontSize: 8.5, bold: true, color: c,
      align: 'right', charSpacing: 0.7, margin: 0, valign: 'middle' });
  });

  const rx = M + 7.7, rw = CW - 7.7;
  box(s, rx, y0, rw, 1.28, 'Only L3 and L4 survive imitation.',
    'A label claim is copied in months. A QR to a lab report is copied in a year. Control of what a farmer plants takes five and a half — because it is a network, not a feature.', 'green');
  box(s, rx, y0 + 1.42, rw, 1.72, 'Roughly two years before it is worth attacking.',
    'The only asset that cannot be bought inside five years. ITC bought 24 Mantra; Wingreens bought Safe Harvest — DHF has roughly two years to build, certify and make this moat consumer-visible before ₹274 Cr makes it worth attacking.', 'clay');
  s.addImage({ path: A('makhana-farm.jpg'), x: rx, y: y0 + 3.28, w: rw, h: 1.42, sizing: { type: 'cover', w: rw, h: 1.42 } });
  s.addImage({ path: A('factory.jpg'), x: M, y: y0 + 3.44, w: 7.4, h: 1.26, sizing: { type: 'cover', w: 7.4, h: 1.26 } });
  s.addText('Eight sourcing clusters, owned end to end — the layer competitors cannot contract for.', {
    x: M, y: y0 + 3.14, w: 7.4, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true, color: TX3, charSpacing: 0.6, margin: 0, valign: 'middle' });
  foot(s, 'Part 06 · The Moat & The Ask');
}

/* ═══════════ 29 · THE ASK ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'The scale blueprint', '₹105 Cr buys breakeven by FY29.',
    'Losses for two years, then positive. Investment intensity falls from 38% to 30% of revenue — breakeven is not efficiency, it is the same rupees over more revenue.');

  label(s, M, y0, 6, 'The path to breakeven, ₹ Cr');
  const pnl = [['', 'FY27', 'FY28', 'FY29'], ['Revenue', '104', '168', '274'],
    ['Investable margin', '27.6', '50.2', '86.6'], ['EBITDA', '−12.4', '−7.9', '+4.7']];
  const pw = 6.5, colw = [2.6, 1.3, 1.3, 1.3];
  pnl.forEach((r, ri) => {
    const y = y0 + 0.32 + ri * 0.52;
    if (ri === 0) s.addShape(pres.ShapeType.rect, { x: M, y, w: pw, h: 0.52, fill: { color: SAND }, line: { width: 0 } });
    let x = M;
    r.forEach((cell, ci) => {
      const isE = ri === 3 && ci > 0;
      s.addText(cell, { x: x + 0.15, y, w: colw[ci] - 0.25, h: 0.52,
        fontFace: ri === 0 || ci === 0 ? FB : FD, fontSize: ri === 0 ? 8.5 : (ci === 0 ? 9 : 14),
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? TX3 : (ci === 0 ? TX3 : (isE ? (cell.indexOf('−') === 0 ? CLAY : GREEN) : INK)),
        align: ci === 0 ? 'left' : 'right', charSpacing: ri === 0 ? 0.8 : 0, margin: 0, valign: 'middle' });
      x += colw[ci];
    });
    if (ri > 0) s.addShape(pres.ShapeType.line, { x: M, y: y + 0.52, w: pw, h: 0, line: { color: LINE, width: 0.5 } });
  });
  s.addText('Investment intensity falls from 38% to 30% of revenue. Breakeven is not efficiency — it is the same rupees over more revenue.', {
    x: M, y: y0 + 2.5, w: pw, h: 0.4, fontFace: FB, fontSize: 8.5, color: TX3, margin: 0, valign: 'top', lineSpacingMultiple: 1.08 });
  box(s, M, y0 + 3.0, pw, 1.2, null,
    'DHF clears breakeven at ₹274 Cr only because a 43.1% gross margin buys ₹38 Cr that Farmley\'s 29% does not. No Indian clean-label brand between ₹75 and ₹400 Cr is EBITDA-positive today.', 'gold');

  const rx = M + 6.8, rw = CW - 6.8;
  card(s, rx, y0, rw, 3.0, { fill: INK, line: INK });
  label(s, rx + 0.25, y0 + 0.16, 4, 'The funding ask', GREEN3);
  s.addText('₹105 Cr', { x: rx + 0.25, y: y0 + 0.42, w: rw - 0.5, h: 0.72, fontFace: FD, fontSize: 32, color: WHITE, margin: 0, valign: 'top' });
  [['Operating losses', '₹20.3 Cr'], ['Capex', '₹29.5 Cr'], ['Working capital', '₹37.3 Cr'], ['Contingency', '₹17.4 Cr']]
    .forEach(([k, v], i) => {
      const y = y0 + 1.3 + i * 0.36;
      s.addText(k, { x: rx + 0.25, y, w: 2.6, h: 0.3, fontFace: FB, fontSize: 9.5, color: TXL2, margin: 0, valign: 'middle' });
      s.addText(v, { x: rx + rw - 1.6, y, w: 1.35, h: 0.3, fontFace: FB, fontSize: 9.5, bold: true, color: WHITE, align: 'right', margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.line, { x: rx + 0.25, y: y + 0.3, w: rw - 0.5, h: 0, line: { color: 'FFFFFF', width: 0.5, transparency: 84 } });
    });
  s.addText('Below every comparable in the set.', { x: rx + 0.25, y: y0 + 2.72, w: rw - 0.5, h: 0.24, fontFace: FB, fontSize: 8.5, italic: true, color: TXL2, margin: 0, valign: 'middle' });
  stat(s, rx, y0 + 3.2, rw, '22 → 98', 'People, FY26 to FY29, across six functions. Revenue per head reaches ₹2.80 Cr.', { h: 1.0, vs: 22 });
  foot(s, 'Part 06 · The Moat & The Ask');
}

/* ═══════════ 30 · CATEGORY LEADERSHIP ═══════════ */
{
  const s = newSlide();
  const y0 = head(s, 'Category leadership', 'Open the category to make it a proprietary eponym.',
    'A category only becomes large if others are allowed in. DeHaat Honest Farms wins not by owning the words, but by owning the standard, the proof, and the relevance in consumers\' lives.');
  const pillars = [
    ['01', 'Educate what pesticide-free means',
      'Pesticide-free call-out with QR to the farmer, carrying the Jaivik Bharat logo, on the front of pack\nInvite parents, teachers and children to the farm to see the process and meet the farmers\nBring the 56% core audience into cook-off sessions after the visit; give the 18% sceptics firsthand access\nWebinars and podcasts led by the farmers and doctors — the two voices the research says are believed\nOn-ground activation in schools and colleges, and with GPs, gastro specialists and nutritionists'],
    ['02', 'Out-proof everyone: certification visible',
      'Quick-commerce platforms like Zepto, Amazon — showcase the Pesticide-Free certificate for every product on the app (like Nykaa)\nThe copycat test: when an incumbent prints "Pesticide-free", DeHaat Honest Farms asks publicly — "Where is the batch certificate?"'],
    ['03', 'Vertical sourcing control: farm to fork',
      'Own the input decision, not just the output test. Control at sowing is what a competitor cannot contract for\nEmbed the brand in Indian routine until the habit forms: Think Pesticide-free, Think Honest Farms']
  ];
  const pwid = (CW - 0.28 * 2) / 3;
  pillars.forEach(([n, t, b], i) => {
    const x = M + i * (pwid + 0.28);
    card(s, x, y0, pwid, 2.5);
    s.addText(n, { x: x + 0.22, y: y0 + 0.16, w: 0.8, h: 0.3, fontFace: FD, fontSize: 14, color: GREEN, margin: 0, valign: 'top' });
    s.addText(t, { x: x + 0.22, y: y0 + 0.5, w: pwid - 0.44, h: 0.32, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0, valign: 'top' });
    s.addText(b.split('\n').map((li, k, arr) => ({ text: li, options: { bullet: true, breakLine: k < arr.length - 1 } })), {
      x: x + 0.22, y: y0 + 0.88, w: pwid - 0.44, h: 1.5, fontFace: FB, fontSize: 8, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 4 });
  });

  const gy = y0 + 2.8;
  label(s, M, gy, 8, 'Guardrails for communication, in line with industry bodies');
  const gw = 4.9;
  card(s, M, gy + 0.3, gw, 1.85, { fill: GREENSOFT, line: 'C6E3D3' });
  s.addText('✓  WHAT WE SAY', { x: M + 0.22, y: gy + 0.42, w: gw - 0.44, h: 0.24, fontFace: FB, fontSize: 9, bold: true, color: GREEN, charSpacing: 1, margin: 0, valign: 'middle' });
  s.addText(['"Tested for 230+ pesticides. None Detected."', '"No detectable pesticide residue, verified batch by batch."',
    '"Independently lab-tested. Scan to see this batch\'s report."', '"Stronger residue testing than the organic standard requires."']
    .map((t, k, arr) => ({ text: t, options: { bullet: true, breakLine: k < arr.length - 1 } })), {
    x: M + 0.22, y: gy + 0.7, w: gw - 0.44, h: 1.05, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 3 });

  card(s, M + gw + 0.3, gy + 0.3, gw, 1.85, { fill: CLAYSOFT, line: 'F0CDC2' });
  s.addText('✕  WHAT WE NEVER SAY', { x: M + gw + 0.52, y: gy + 0.42, w: gw - 0.44, h: 0.24, fontFace: FB, fontSize: 9, bold: true, color: CLAY, charSpacing: 1, margin: 0, valign: 'middle' });
  s.addText(['"100% pesticide-free" — or any absolute.', '"Chemical-free", "toxin-free", "100% pure".', '"Healthier than organic."',
    'Anything implying the product prevents disease.', 'Never win by attacking organic or conventional.']
    .map((t, k, arr) => ({ text: t, options: { bullet: true, breakLine: k < arr.length - 1 } })), {
    x: M + gw + 0.52, y: gy + 0.7, w: gw - 0.44, h: 1.05, fontFace: FB, fontSize: 8.5, color: TX2, margin: 0, valign: 'top', paraSpaceAfter: 3 });

  const lx = M + gw * 2 + 0.6;
  s.addImage({ path: A('jaivik.png'), x: lx + 0.2, y: gy + 0.42, w: 0.55, h: 0.57 });
  s.addImage({ path: A('fssai.png'), x: lx + 1.0, y: gy + 0.52, w: 0.75, h: 0.41 });
  s.addImage({ path: A('asci.png'), x: lx + 0.2, y: gy + 1.25, w: 0.85, h: 0.39 });
  foot(s, 'Part 06 · The Moat & The Ask');
}

/* ═══════════ 31 · CLOSE ═══════════ */
{
  const s = newSlide(INK);
  s.addImage({ path: A('team-field.jpg'), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
  s.addImage({ path: A('veil-radial.png'), x: 0, y: 0, w: W, h: H });
  s.addText('धन्यवाद', { x: 0, y: 2.05, w: W, h: 1.3, fontFace: 'Noto Sans Devanagari', fontSize: 50, color: WHITE, align: 'center', margin: 0, valign: 'middle' });
  s.addText('Verified in the fields. Honest on the shelves.', {
    x: 0, y: 3.45, w: W, h: 0.5, fontFace: FB, fontSize: 18, italic: true, color: GREEN3, align: 'center', margin: 0, valign: 'middle' });
  s.addImage({ path: A('logo.png'), x: W / 2 - 1.05, y: 4.3, w: 2.1, h: 0.78 });
  s.addText('TEAM 1  ·  ISB CGMO COHORT II', {
    x: 0, y: 5.35, w: W, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: GREEN3, align: 'center', charSpacing: 2.4, margin: 0, valign: 'middle' });
  s.addText('Sabika Mirza  ·  Sharon Batliwalla  ·  Syed Kashif Ali  ·  Sonu Adarsh  ·  Abhishek Nandan', {
    x: 0, y: 5.7, w: W, h: 0.32, fontFace: FB, fontSize: 12, color: TXL, align: 'center', margin: 0, valign: 'middle' });
}

pres.writeFile({ fileName: OUT }).then(() => console.log('wrote ' + OUT + '  (' + pres.slides.length + ' slides)'));
