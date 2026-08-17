/**
 * Screenshots the HTML deck and reports any slide whose content spills the
 * 1280×720 stage. Stands in for eyeballing it in a browser.
 *
 *   node tools/shoot-deck.js [outdir] [slide numbers...]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join('/tmp', 'deckshots');
const ONLY = process.argv.slice(3).map(Number);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 2 });
  const url = 'file://' + path.join(ROOT, 'site', 'deck', 'index.html');
  const errors = [];
  page.on('pageerror', e => errors.push('JS: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const n = await page.evaluate(() => document.querySelectorAll('.frame').length);

  // measure every slide at full size, ignoring the scale transform
  const report = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.frame').forEach((f, i) => {
      f.style.display = 'block';
      const s = f.querySelector('.slide');
      const sr = s.getBoundingClientRect();
      const scale = sr.width / 1280 || 1;
      const spill = [];
      const body = s.querySelector('.body') || s;
      s.querySelectorAll('*').forEach(el => {
        if (el.tagName === 'IMG' || el.tagName === 'SVG') return;
        const r = el.getBoundingClientRect();
        const bottom = (r.bottom - sr.top) / scale;
        const right = (r.right - sr.left) / scale;
        if (bottom > 721 || right > 1281) {
          const t = (el.textContent || '').trim().slice(0, 46);
          spill.push(`${el.tagName}.${el.className || ''} → ${bottom.toFixed(0)}×${right.toFixed(0)} :: ${t}`);
        }
      });
      const over = (s.scrollHeight - s.clientHeight) > 1;
      const bodyOver = body.scrollHeight - body.clientHeight > 1;
      out.push({ i: i + 1, over, bodyOver, spill: spill.slice(0, 4), h: s.scrollHeight });
      f.style.display = '';
    });
    return out;
  });

  let bad = 0;
  report.forEach(r => {
    if (r.over || r.bodyOver || r.spill.length) {
      bad++;
      console.log(`slide ${String(r.i).padStart(2)}  ${r.over ? 'SLIDE-OVERFLOW ' : ''}${r.bodyOver ? 'BODY-OVERFLOW ' : ''}h=${r.h}`);
      r.spill.forEach(s => console.log('            ' + s));
    }
  });
  console.log(bad ? `\n${bad}/${n} slides overflow` : `\nAll ${n} slides fit the 1280×720 stage.`);
  if (errors.length) console.log('\nRuntime errors:\n  ' + errors.join('\n  '));

  // shots
  const want = ONLY.length ? ONLY : Array.from({ length: n }, (_, k) => k + 1);
  await page.setViewportSize({ width: 1320, height: 760 });
  for (const k of want) {
    const el = await page.$(`.frame[data-i="${k - 1}"] .slide`);
    await page.evaluate(i => {
      document.querySelector(`.frame[data-i="${i}"]`).scrollIntoView({ behavior: 'auto', block: 'center' });
    }, k - 1);
    await page.waitForTimeout(80);
    await el.screenshot({ path: path.join(OUT, 's' + String(k).padStart(2, '0') + '.png') });
  }
  console.log(`\nwrote ${want.length} shots to ${OUT}`);
  await browser.close();
})();
