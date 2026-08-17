const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const target = process.argv[2] || ('file://' + path.join(__dirname, '..', 'site', 'deck', 'index.html'));
  await p.goto(target, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);

  const snap = await p.evaluate(() => {
    const st = document.getElementById('stage'), cs = getComputedStyle(st);
    return { snap: cs.scrollSnapType, overflowY: cs.overflowY, scrollH: st.scrollHeight, clientH: st.clientHeight,
             frames: document.querySelectorAll('.frame').length, hint: !!document.getElementById('hint') };
  });
  console.log('stage:', JSON.stringify(snap));
  console.log('scrolls a full deck:', snap.scrollH > snap.clientH * 20);

  // wheel down three slides
  await p.mouse.move(700, 400);
  for (let k = 0; k < 3; k++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(450); }
  let st = await p.evaluate(() => ({ n: document.getElementById('count').textContent, hash: location.hash,
    hintGone: document.getElementById('hint').classList.contains('gone') }));
  console.log('after wheel x3:', JSON.stringify(st));

  // keyboard
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(600);
  st = await p.evaluate(() => document.getElementById('count').textContent);
  console.log('after ArrowDown:', st);
  await p.keyboard.press('ArrowUp'); await p.waitForTimeout(600);
  console.log('after ArrowUp:', await p.evaluate(() => document.getElementById('count').textContent));

  // snap alignment: the visible slide should be centred, not straddling
  const align = await p.evaluate(() => {
    const st = document.getElementById('stage');
    const off = st.scrollTop % st.clientHeight;
    return { off: Math.round(Math.min(off, st.clientHeight - off)) };
  });
  console.log('distance from a snap point (px):', align.off);

  // overview round trip
  await p.keyboard.press('g'); await p.waitForTimeout(400);
  const ov = await p.evaluate(() => ({ overview: document.getElementById('stage').classList.contains('overview'),
    visible: [...document.querySelectorAll('.frame')].filter(f => f.getBoundingClientRect().width > 40).length }));
  console.log('overview:', JSON.stringify(ov));
  await p.evaluate(() => document.querySelector('.frame[data-i="17"]').click()); await p.waitForTimeout(600);
  console.log('click thumbnail →', await p.evaluate(() => document.getElementById('count').textContent));

  // edit mode still works while scrolled
  await p.keyboard.press('e'); await p.waitForTimeout(200);
  const ed = await p.evaluate(() => {
    const st = getComputedStyle(document.getElementById('stage'));
    const el = document.querySelector('.frame[data-i="17"] h2[data-e]');
    return { snapOff: st.scrollSnapType, editable: el && el.getAttribute('contenteditable') === 'true' };
  });
  console.log('edit mode:', JSON.stringify(ed));

  await p.screenshot({ path: '/tmp/deckshots/scroll-mid.png' });
  console.log(errs.length ? 'JS ERRORS: ' + errs.join(' | ') : 'no js errors');
  await b.close();
})();
