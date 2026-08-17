/** Dumps the rendered HTML deck as per-slide text, for the fidelity audit. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
  await p.goto('file://' + path.join(__dirname, '..', 'site', 'deck', 'index.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const out = await p.evaluate(() => {
    const SEL = 'h1,h2,h3,h4,p,li,td,th,figcaption,b,span,em,strong';
    return [...document.querySelectorAll('.frame')].map(f => {
      const s = f.querySelector('.slide');
      const leaves = [...s.querySelectorAll(SEL)]
        .filter(n => n.textContent.trim() && !n.querySelector(SEL))
        .map(n => ({ t: n.textContent.replace(/\s+/g, ' ').trim(), cls: n.className || n.tagName.toLowerCase() }));
      return { i: +f.dataset.i + 1, texts: leaves };
    });
  });
  fs.writeFileSync('/tmp/html-deck.json', JSON.stringify(out, null, 1));
  console.log('dumped', out.length, 'slides ·', out.reduce((a, s) => a + s.texts.length, 0), 'text nodes');
  await b.close();
})();
