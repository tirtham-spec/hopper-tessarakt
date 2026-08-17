/** Reports any picture the layout is cropping. */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
  await p.goto('file://' + path.join(__dirname, '..', 'site', 'deck', 'index.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const rows = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.frame').forEach(f => {
      const n = +f.dataset.i + 1;
      f.querySelectorAll('img').forEach(img => {
        const r = img.getBoundingClientRect();
        if (!r.width || !img.naturalWidth) return;
        const fit = getComputedStyle(img).objectFit;
        const box = r.width / r.height, nat = img.naturalWidth / img.naturalHeight;
        let lost = 0;
        if (fit === 'cover') lost = box > nat ? 1 - nat / box : 1 - box / nat;
        const src = img.src.split('/').pop().split('?')[0];
        out.push({ n, src: decodeURIComponent(src).slice(0, 34), fit, lost: +(lost * 100).toFixed(1),
                   up: +(r.width / img.naturalWidth).toFixed(2) });
      });
    });
    return out;
  });
  const cropped = rows.filter(r => r.lost > 1);
  const blurry = rows.filter(r => r.up > 1.6 && !r.src.startsWith('veil'));
  console.log(`${rows.length} pictures placed`);
  console.log(`\ncropped (>1% of the frame lost): ${cropped.length}`);
  cropped.forEach(r => console.log(`  slide ${String(r.n).padStart(2)}  ${r.src.padEnd(30)} ${r.fit}  −${r.lost}%`));
  console.log(`\nupscaled past 1.6×: ${blurry.length}`);
  blurry.forEach(r => console.log(`  slide ${String(r.n).padStart(2)}  ${r.src.padEnd(30)} ${r.up}×`));
  await b.close();
})();
