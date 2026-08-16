/* ═══════════════════════════════════════════════
   DeHaat Honest Farms — deck runtime
   Navigation · reveal · counters · interactions · charts
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const deck   = $('#deck');
  const slides = $$('.slide', deck);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── Palette ─────────── */
  const C = {
    ink:'#0D1B2A', navy:'#2C4A7C', blue:'#3A5D97', blue2:'#5D7FB8', blueSoft:'#E9EFF8',
    green:'#1B804A', green2:'#2FA362', greenSoft:'#E4F1E9',
    gold:'#A9791F', gold2:'#C8922E',
    clay:'#A63E28', clay2:'#C4553B',
    grey:'#B8B0A0', sand:'#F2EBDF', line:'#E4DACA', tx2:'#55606E', tx3:'#8C95A1'
  };

  /* ═══════════ NAVIGATION ═══════════ */
  let current = 0;
  const numEl = $('#slideNum'), chapEl = $('#chapterLabel'), fillEl = $('#progressFill');
  $('#slideTotal').textContent = slides.length;

  const rail = $('#rail');
  slides.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'rail__dot';
    d.setAttribute('data-label', (i + 1) + '. ' + s.dataset.title);
    d.setAttribute('aria-label', 'Go to ' + s.dataset.title);
    d.addEventListener('click', () => goTo(i));
    rail.appendChild(d);
  });
  const dots = $$('.rail__dot', rail);

  function setCurrent(i) {
    if (i === current) return;
    current = i;
    paint();
  }
  function paint() {
    const s = slides[current];
    numEl.textContent = String(current + 1).padStart(2, '0');
    chapEl.innerHTML = s.dataset.chapter;
    fillEl.style.width = ((current + 1) / slides.length * 100) + '%';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    document.body.classList.toggle('on-dark', s.classList.contains('dark'));
    $$('.gitem').forEach((g, i) => g.classList.toggle('is-active', i === current));
  }
  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setCurrent(i);
  }

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) setCurrent(slides.indexOf(e.target));
    });
  }, { root: deck, threshold: [0.5, 0.75] });
  slides.forEach(s => spy.observe(s));

  $('#btnNext').addEventListener('click', () => goTo(current + 1));
  $('#btnPrev').addEventListener('click', () => goTo(current - 1));

  /* keyboard */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown':
        e.preventDefault(); goTo(current + 1); break;
      case ' ':
        if (!gridOpen && !helpOpen) { e.preventDefault(); goTo(current + 1); } break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); goTo(current - 1); break;
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(slides.length - 1); break;
      case 'g': case 'G': toggleGrid(); break;
      case '?': toggleHelp(); break;
      case 'Escape': closeOverlays(); break;
    }
  });

  /* touch swipe (vertical deck, horizontal gesture = nav) */
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => {
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ═══════════ OVERLAYS ═══════════ */
  const gridOv = $('#gridOverlay'), helpOv = $('#helpOverlay');
  let gridOpen = false, helpOpen = false;

  const gridItems = $('#gridItems');
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'gitem';
    b.innerHTML = '<span class="gitem__n">' + String(i + 1).padStart(2, '0') + '</span>' +
                  '<span class="gitem__t">' + s.dataset.title + '</span>' +
                  '<span class="gitem__c">' + s.dataset.chapter + '</span>';
    b.addEventListener('click', () => { closeOverlays(); goTo(i); });
    gridItems.appendChild(b);
  });

  function toggleGrid() { gridOpen ? closeOverlays() : (helpOv.hidden = true, helpOpen = false, gridOv.hidden = false, gridOpen = true, paint()); }
  function toggleHelp() { helpOpen ? closeOverlays() : (gridOv.hidden = true, gridOpen = false, helpOv.hidden = false, helpOpen = true); }
  function closeOverlays() { gridOv.hidden = true; helpOv.hidden = true; gridOpen = helpOpen = false; }

  $('#btnGrid').addEventListener('click', toggleGrid);
  $('#btnGridClose').addEventListener('click', closeOverlays);
  $('#btnHelp').addEventListener('click', toggleHelp);
  $('#btnHelpClose').addEventListener('click', closeOverlays);
  helpOv.addEventListener('click', e => { if (e.target === helpOv) closeOverlays(); });

  /* ═══════════ REVEAL + COUNTERS ═══════════ */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { root: deck, threshold: 0.15 });
  $$('.reveal').forEach(el => revealIO.observe(el));

  function fmt(v, dec) {
    return dec ? v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })
               : Math.round(v).toLocaleString('en-IN');
  }
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; countIO.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (reduce || isNaN(target)) { el.textContent = pre + fmt(target, dec) + suf; return; }
      const dur = 1050, t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const e2 = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(target * e2, dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { root: deck, threshold: 0.4 });
  $$('.num[data-count]').forEach(el => countIO.observe(el));

  /* ═══════════ SMALL INTERACTIONS ═══════════ */
  /* phases */
  $$('#phases .phase').forEach(b => b.addEventListener('click', () => {
    $$('#phases .phase').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
  }));

  /* TAM / SAM / SOM */
  $$('#tamGrid .tam').forEach(b => b.addEventListener('click', () => {
    $$('#tamGrid .tam').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    $$('#tamNote p').forEach(p => { p.hidden = p.dataset.tam !== b.dataset.tam; });
  }));

  /* quotes carousel */
  const quotes = $$('#quotes .quote'), qDots = $('#quoteDots');
  if (quotes.length) {
    quotes.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'qdot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'Quote ' + (i + 1));
      d.addEventListener('click', ev => { ev.stopPropagation(); showQuote(i); });
      qDots.appendChild(d);
    });
    let qi = 0;
    function showQuote(i) {
      qi = (i + quotes.length) % quotes.length;
      quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
      $$('.qdot', qDots).forEach((d, k) => d.classList.toggle('is-active', k === qi));
    }
    $('#quotes').addEventListener('click', () => showQuote(qi + 1));
  }

  /* values */
  $$('#values .value').forEach(b => b.addEventListener('click', () => {
    $$('#values .value').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
  }));

  /* moat ladder */
  $$('#ladder .rung').forEach(b => b.addEventListener('click', () => {
    $$('#ladder .rung').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
  }));

  /* ═══════════ PERSONAS ═══════════ */
  const PERSONAS = [
    {
      name: 'Vandana Iyer', role: 'The Verifier', seg: 'Proof-Hungry Guardians', share: '36%', n: 109,
      quote: 'The word organic on a label means nothing to me anymore. Show me the actual test report for this batch and I\'ll happily pay more.',
      profile: '34–45 · postgraduate · senior professional · nuclear family with young children · ₹1.5–2.5L+/month · Tier-1 metro',
      converts: 'Batch-specific lab report by QR; "below detectable limits"; a specialist who has personally reviewed it.',
      blocks: 'No way to verify independently; greenwashing fatigue; a scan that turns into a research project.',
      meta: ['n = 109', 'Trust in certified claim 4.4/5', 'Would pay 11%+ · 54%'],
      f: [['F1 Social', '+0.46', 'pos'], ['F2 Distrust', '+0.47', 'pos'], ['F3 Vigilance', '+0.69', 'pos']]
    },
    {
      name: 'Meera Nair', role: 'The Believer', seg: 'Social Trusters', share: '20%', n: 62,
      quote: 'If my doctor and my sister both say it\'s good for the family, that\'s all the proof I need. I\'m not going to scan codes and read reports.',
      profile: '30–50 · graduate · homemaker or teacher · joint or extended family · ₹1–1.5L/month · Tier-1 and Tier-2',
      converts: 'Doctor and dietitian endorsement; a trusted person already using it; warm, relatable word of mouth.',
      blocks: 'Clinical, jargon-heavy messaging; conflicting opinions in her circle; nobody she trusts has vouched.',
      meta: ['n = 62', 'Trust in certified claim 3.6/5', 'Would pay 11%+ · 34%'],
      f: [['F1 Social', '+0.65', 'pos'], ['F2 Distrust', '+0.17', 'pos'], ['F3 Vigilance', '−0.89', 'neg']]
    },
    {
      name: 'Karan Mehta', role: 'The Cruise-Controller', seg: 'Passive Defaulters', share: '26%', n: 80,
      quote: 'Honestly, I just buy whatever brand I know that looks decent and isn\'t overpriced. Food safety isn\'t something I lose sleep over.',
      profile: '26–38 · graduate · IT / sales / ops professional · DINK or small family · ₹80K–1.5L/month · heavy quick-commerce user',
      converts: 'Visible on the app he already uses; price parity with his usual brand; taste he notices.',
      blocks: 'Not stocked where he shops; a premium with no obvious reason; anything requiring effort to switch.',
      meta: ['n = 80', 'Trust in certified claim 3.5/5', 'Would pay 11%+ · 6%'],
      f: [['F1 Social', '−0.39', 'neg'], ['F2 Distrust', '−1.05', 'neg'], ['F3 Vigilance', '−0.34', 'neg']]
    },
    {
      name: 'Sanjay Deshpande', role: 'The Sceptic', seg: 'System Fatalists', share: '18%', n: 54,
      quote: 'Every brand says it\'s pure. Adulteration is everywhere, and no factory is truly clean. Prove me wrong — but don\'t insult me with marketing.',
      profile: '38–55 · graduate to postgraduate · senior professional or business owner · established family · Tier-1 and Tier-2',
      converts: 'Unscripted farmer proof; independent, non-brand-paid verification; being shown what is imperfect.',
      blocks: 'Polished claims like everyone else\'s; certification with no visible teeth; anything that reads like a script.',
      meta: ['n = 54', 'Trust in certified claim 3.6/5', 'Would pay 11%+ · 22%'],
      f: [['F1 Social', '−1.09', 'neg'], ['F2 Distrust', '+0.41', 'pos'], ['F3 Vigilance', '+0.13', 'pos']]
    }
  ];
  const pPanel = $('#personaPanel');
  function renderPersona(i) {
    const p = PERSONAS[i];
    pPanel.innerHTML =
      '<div class="ppanel">' +
        '<div>' +
          '<p class="ppanel__quote">' + p.quote + '</p>' +
          '<div class="ppanel__meta">' + p.meta.map(m => '<span class="pmeta">' + m + '</span>').join('') + '</div>' +
          '<div class="pfactors">' + p.f.map(f =>
            '<div class="pfactor"><span>' + f[0] + '</span><b class="' + f[2] + '">' + f[1] + '</b></div>').join('') +
          '</div>' +
        '</div>' +
        '<div class="ppanel__sec">' +
          '<div class="psec"><span>Profile</span><p>' + p.profile + '</p></div>' +
          '<div class="psec psec--conv"><span>What converts them</span><p>' + p.converts + '</p></div>' +
        '</div>' +
        '<div class="ppanel__sec">' +
          '<div class="psec psec--block"><span>What blocks the sale</span><p>' + p.blocks + '</p></div>' +
          '<div class="psec"><span>Segment</span><p>' + p.seg + ' — ' + p.share + ' of decision-makers.</p></div>' +
        '</div>' +
      '</div>';
  }
  if (pPanel) {
    renderPersona(0);
    $$('#personaTabs .ptab').forEach(b => b.addEventListener('click', () => {
      $$('#personaTabs .ptab').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      renderPersona(parseInt(b.dataset.p, 10));
    }));
  }

  /* ═══════════ CHART TOOLKIT ═══════════ */
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txt(t, attrs) { const n = el('text', attrs); n.textContent = t; return n; }
  function svgFor(host, w, h) {
    host.innerHTML = '';
    const s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet', role: 'presentation' });
    host.appendChild(s);
    return s;
  }
  function tipFor(host) {
    let t = host.querySelector('.charttip');
    if (!t) { t = document.createElement('div'); t.className = 'charttip'; host.appendChild(t); }
    return t;
  }
  function bindTip(host, node, html) {
    const tip = tipFor(host);
    const show = ev => {
      tip.innerHTML = html;
      const r = host.getBoundingClientRect();
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
      tip.classList.add('is-on');
    };
    node.addEventListener('mouseenter', show);
    node.addEventListener('mousemove', show);
    node.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
  }
  function grow(node, attr, from, to, delay) {
    if (reduce) { node.setAttribute(attr, to); return; }
    node.setAttribute(attr, from);
    setTimeout(() => {
      node.style.transition = 'all .85s cubic-bezier(.16,1,.3,1)';
      node.setAttribute(attr, to);
    }, delay);
  }
  function wrap(label, max) {
    const words = String(label).split(' '); const lines = []; let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  /* horizontal bars: [{label, value, color, display}] */
  function hBars(host, data, opt) {
    opt = opt || {};
    const W = 600, rowH = opt.rowH || 40, pad = 2;
    const H = data.length * rowH + pad;
    const s = svgFor(host, W, H);
    const max = opt.max || Math.max.apply(null, data.map(d => d.value));
    const barW = W - 4;
    data.forEach((d, i) => {
      const y = i * rowH;
      s.appendChild(txt(d.label, { x: 0, y: y + 12, class: 'c-lbl' }));
      const v = txt(d.display || d.value + (opt.suffix || ''), { x: W, y: y + 12, class: 'c-val', 'text-anchor': 'end' });
      if (opt.valColor) v.setAttribute('fill', d.color || opt.valColor);
      s.appendChild(v);
      s.appendChild(el('rect', { x: 0, y: y + 19, width: barW, height: 9, rx: 4.5, fill: C.sand }));
      const w = Math.max(3, barW * (d.value / max));
      const bar = el('rect', { x: 0, y: y + 19, width: 0, height: 9, rx: 4.5, fill: d.color || C.blue, class: 'c-bar' });
      s.appendChild(bar);
      grow(bar, 'width', 0, w, 90 + i * 70);
      if (d.tip) {
        const hit = el('rect', { x: 0, y: y, width: W, height: rowH - 4, fill: 'transparent' });
        s.appendChild(hit); bindTip(host, hit, d.tip);
      }
    });
  }

  /* vertical bars */
  function vBars(host, data, opt) {
    opt = opt || {};
    const W = 600, H = opt.h || 300, top = 34, bottom = 22 + (opt.labelLines || 1) * 13;
    const s = svgFor(host, W, H);
    const plotH = H - top - bottom;
    const max = opt.max || Math.max.apply(null, data.map(d => d.value)) * 1.12;
    const n = data.length, gap = opt.gap || 12;
    const bw = (W - gap * (n - 1)) / n;

    if (opt.band) {
      const y1 = top + plotH * (1 - opt.band[1] / max), y2 = top + plotH * (1 - opt.band[0] / max);
      s.appendChild(el('rect', { x: 0, y: y1, width: W, height: y2 - y1, class: 'c-band', rx: 4 }));
      s.appendChild(txt(opt.bandLabel || '', { x: 4, y: y1 + 13, class: 'c-bandlbl', 'text-anchor': 'start' }));
    }
    s.appendChild(el('line', { x1: 0, y1: top + plotH, x2: W, y2: top + plotH, class: 'c-axis' }));

    data.forEach((d, i) => {
      const x = i * (bw + gap);
      const h = plotH * (d.value / max);
      const y = top + plotH - h;
      const bar = el('rect', { x: x, y: top + plotH, width: bw, height: 0, rx: 4, fill: d.color || C.blue, class: 'c-bar' });
      s.appendChild(bar);
      grow(bar, 'height', 0, h, 100 + i * 65);
      grow(bar, 'y', top + plotH, y, 100 + i * 65);
      s.appendChild(txt(d.display || d.value, { x: x + bw / 2, y: y - 7, class: 'c-val', 'text-anchor': 'middle' }));
      wrap(d.label, opt.wrapAt || 13).forEach((ln, k) => {
        s.appendChild(txt(ln, { x: x + bw / 2, y: top + plotH + 14 + k * 12, class: 'c-lbl', 'text-anchor': 'middle' }));
      });
      if (d.tip) { const hit = el('rect', { x: x, y: top, width: bw, height: plotH, fill: 'transparent' }); s.appendChild(hit); bindTip(host, hit, d.tip); }
    });
  }

  /* ═══════════ CHART DATA + RENDER ═══════════ */
  const charts = {};

  charts.chartPrice = host => vBars(host, [
    { label: 'Vedaka', value: 136, color: C.blue2, display: '₹136', tip: '<b>₹136 / kg</b>Vedaka — retailer private label' },
    { label: 'Fortune', value: 145, color: C.blue2, display: '₹145', tip: '<b>₹145 / kg</b>Fortune — conventional national' },
    { label: 'Tata Sampann', value: 156, color: C.blue, display: '₹156', tip: '<b>₹156 / kg</b>Tata Sampann — nutrition-led' },
    { label: 'BB Royal Organic', value: 157, color: C.gold2, display: '₹157', tip: '<b>₹157 / kg</b>BB Royal Organic — squeezing the corridor from below' },
    { label: 'Organic Tattva', value: 255, color: C.green, display: '₹255', tip: '<b>₹255 / kg</b>Organic Tattva — certified organic' },
    { label: 'Tata Sampann Organic', value: 257, color: C.green, display: '₹257', tip: '<b>₹257 / kg</b>Tata Sampann Organic' },
    { label: '24 Mantra Organic', value: 306, color: C.green, display: '₹306', tip: '<b>₹306 / kg</b>24 Mantra Organic — top of the ladder' }
  ], { h: 330, max: 345, band: [150, 250], bandLabel: 'Accessible-premium corridor · ₹150–250', wrapAt: 11, labelLines: 3 });

  charts.chartImitation = host => {
    const rows = [
      { label: 'Pesticide-Free label claim', v: 0, disp: 'already copied', color: C.clay },
      { label: '200+ SKU breadth', v: 4.5, disp: '3–6 months', color: C.clay2 },
      { label: 'Quick-commerce presence', v: 9, disp: '6–12 months', color: C.gold2 },
      { label: '230+ quality checkpoints', v: 15, disp: '12–18 months', color: C.gold2 },
      { label: 'QR batch traceability', v: 15, disp: '12–18 months', color: C.blue2 },
      { label: 'Farm-level residue testing', v: 21, disp: '18–24 months', color: C.blue },
      { label: 'Curated 5,000-farmer cohort', v: 30, disp: '24–36 months', color: C.green2 },
      { label: 'Farmer margin model', v: 48, disp: '3–5 years', color: C.green },
      { label: 'DeHaat agritech input control', v: 66, disp: '5+ years', color: C.green }
    ];
    const W = 600, rowH = 30, H = rows.length * rowH + 4;
    const s = svgFor(host, W, H);
    const max = 70;
    rows.forEach((r, i) => {
      const y = i * rowH;
      s.appendChild(txt(r.label, { x: 0, y: y + 11, class: 'im-lbl' }));
      s.appendChild(txt(r.disp, { x: W, y: y + 11, class: 'im-val', 'text-anchor': 'end', fill: r.color }));
      s.appendChild(el('rect', { x: 0, y: y + 16, width: W, height: 7, rx: 3.5, fill: C.sand }));
      const bar = el('rect', { x: 0, y: y + 16, width: 0, height: 7, rx: 3.5, fill: r.color });
      s.appendChild(bar);
      grow(bar, 'width', 0, Math.max(4, W * (r.v / max)), 80 + i * 55);
      const hit = el('rect', { x: 0, y: y, width: W, height: rowH - 3, fill: 'transparent' });
      s.appendChild(hit);
      bindTip(host, hit, '<b>' + r.disp + '</b>' + r.label);
    });
  };

  charts.chartChannels = host => hBars(host, [
    { label: 'Blinkit', value: 53, color: C.blue, display: '53%' },
    { label: 'Swiggy Instamart', value: 43, color: C.blue, display: '43%' },
    { label: 'Kirana', value: 41, color: C.blue2, display: '41%' },
    { label: 'BigBasket', value: 34, color: C.blue2, display: '34%' },
    { label: 'Amazon / JioMart', value: 30, color: C.blue2, display: '30%' },
    { label: 'Zepto', value: 29, color: C.blue, display: '29%' },
    { label: 'Supermarkets', value: 10, color: C.grey, display: '10%' }
  ], { rowH: 34, max: 60 });

  charts.chartWTP = host => vBars(host, [
    { label: 'Guardians', value: 54, color: C.green, display: '54%', tip: '<b>54%</b>Proof-Hungry Guardians · 36% of sample' },
    { label: 'Trusters', value: 34, color: C.blue, display: '34%', tip: '<b>34%</b>Social Trusters · 20% of sample' },
    { label: 'Fatalists', value: 22, color: C.clay, display: '22%', tip: '<b>22%</b>System Fatalists · 18% of sample' },
    { label: 'Defaulters', value: 6, color: C.grey, display: '6%', tip: '<b>6%</b>Passive Defaulters · 26% of sample' }
  ], { h: 250, max: 62, gap: 26 });

  charts.chartTriggers = host => hBars(host, [
    { label: 'Doctor / child-specialist endorsement', value: 44, color: C.green, display: '44%' },
    { label: '"Below detectable limits" + QR to lab report', value: 27, color: C.blue, display: '27%' },
    { label: "Farmer's name and village on pack", value: 12, color: C.blue2, display: '12%' },
    { label: 'Government certificate as the lead message', value: 8, color: C.grey, display: '8%' },
    { label: '"Tested for 200+ chemicals"', value: 6, color: C.clay, display: '6%' },
    { label: 'Farm-visit invitations', value: 3, color: C.grey, display: '3%' },
    { label: 'Side-by-side residue comparison vs rivals', value: 1, color: C.grey, display: '1%' }
  ], { rowH: 34, max: 50 });

  charts.chartPortfolio = host => hBars(host, [
    { label: 'Pulses · 56% of revenue', value: 50.4, color: C.blue, display: '₹50.4 Cr · +113%', tip: '<b>₹50.4 Cr</b>56% of revenue, +113% growth — the slowest block' },
    { label: 'Value-added · 29%', value: 26.0, color: C.green, display: '₹26.0 Cr · +219%', tip: '<b>₹26.0 Cr</b>Makhana, jaggery, honey — +219%, the real engine' },
    { label: 'Spices · 12%', value: 10.9, color: C.gold2, display: '₹10.9 Cr · +185%', tip: '<b>₹10.9 Cr</b>+185% growth, and the future margin engine' },
    { label: 'Oil &amp; ghee · 1%', value: 0.8, color: C.grey, display: '₹0.8 Cr', tip: '<b>₹0.8 Cr</b>1% of revenue' },
    { label: 'NPD', value: 0.3, color: C.grey, display: '—', tip: '<b>New product development</b>Not yet material' }
  ], { rowH: 40, max: 56 });

  charts.chartChannelMix = host => hBars(host, [
    { label: 'E-commerce &amp; quick commerce', value: 304, color: C.blue, display: '₹304 Cr', tip: '<b>₹304 Cr</b>39% of FY31 revenue — just under the 40% ceiling' },
    { label: 'Regional &amp; premium offline', value: 263, color: C.green, display: '₹263 Cr', tip: '<b>₹263 Cr</b>Converted state by state' },
    { label: 'National modern trade', value: 129, color: C.blue2, display: '₹129 Cr', tip: '<b>₹129 Cr</b>Earned metro shelf' },
    { label: 'Exports', value: 54, color: C.gold2, display: '₹54 Cr', tip: '<b>₹54 Cr</b>Optional upside, not the plan' }
  ], { rowH: 40, max: 340 });

  /* revenue trajectory — area + line */
  charts.chartRevenue = host => {
    const d = [
      { y: 'FY26', v: 53,  note: 'Base year · ≈30% YoY' },
      { y: 'FY27', v: 104, note: 'EBITDA −12.4' },
      { y: 'FY28', v: 168, note: 'EBITDA −7.9' },
      { y: 'FY29', v: 274, note: 'Breakeven · EBITDA +4.7' },
      { y: 'FY30', v: 450, note: 'Scale phase' },
      { y: 'FY31', v: 748, note: '14.1× the FY26 base' }
    ];
    const W = 600, H = 320, L = 6, R = 6, T = 34, B = 34;
    const s = svgFor(host, W, H);
    const pw = W - L - R, ph = H - T - B, max = 820;
    const X = i => L + pw * (i / (d.length - 1));
    const Y = v => T + ph * (1 - v / max);

    [0, 200, 400, 600, 800].forEach(g => {
      s.appendChild(el('line', { x1: L, y1: Y(g), x2: W - R, y2: Y(g), class: 'c-grid' }));
      if (g) s.appendChild(txt('₹' + g, { x: L, y: Y(g) - 5, class: 'c-lbl', 'font-size': 9, fill: C.tx3 }));
    });

    const defs = el('defs');
    const lg = el('linearGradient', { id: 'revg', x1: 0, y1: 0, x2: 0, y2: 1 });
    lg.appendChild(el('stop', { offset: '0%', 'stop-color': C.green2, 'stop-opacity': .34 }));
    lg.appendChild(el('stop', { offset: '100%', 'stop-color': C.green2, 'stop-opacity': .02 }));
    defs.appendChild(lg); s.appendChild(defs);

    let line = '', area = 'M ' + L + ' ' + Y(0) + ' ';
    d.forEach((p, i) => { const c = X(i) + ' ' + Y(p.v) + ' '; line += (i ? 'L ' : 'M ') + c; area += 'L ' + c; });
    area += 'L ' + (W - R) + ' ' + Y(0) + ' Z';

    s.appendChild(el('path', { d: area, fill: 'url(#revg)' }));
    const path = el('path', { d: line, fill: 'none', stroke: C.green, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    s.appendChild(path);
    if (!reduce) {
      const len = path.getTotalLength ? path.getTotalLength() : 1200;
      path.setAttribute('stroke-dasharray', len);
      path.setAttribute('stroke-dashoffset', len);
      path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => path.setAttribute('stroke-dashoffset', 0), 140);
    }

    d.forEach((p, i) => {
      s.appendChild(el('circle', { cx: X(i), cy: Y(p.v), r: 4.5, fill: '#fff', stroke: i === d.length - 1 ? C.green : C.green2, 'stroke-width': 2.4 }));
      s.appendChild(txt('₹' + p.v, {
        x: X(i), y: Y(p.v) - 12, class: 'c-val', 'text-anchor': i === 0 ? 'start' : (i === d.length - 1 ? 'end' : 'middle'),
        fill: i === d.length - 1 ? C.green : C.ink
      }));
      s.appendChild(txt(p.y, { x: X(i), y: H - 12, class: 'c-lbl', 'text-anchor': 'middle' }));
      const hit = el('rect', { x: X(i) - pw / (d.length * 2), y: T, width: pw / d.length, height: ph, fill: 'transparent' });
      s.appendChild(hit);
      bindTip(host, hit, '<b>' + p.y + ' · ₹' + p.v + ' Cr</b>' + p.note);
    });
  };

  /* category mix — grouped bars with year toggle */
  const MIX = [
    { label: 'Pulses',       a: 43, b: 228 },
    { label: 'Spices',       a: 18, b: 202 },
    { label: 'Value-added',  a: 32, b: 169 },
    { label: 'Oil & ghee',   a: 9,  b: 120 },
    { label: 'Processed',    a: 2,  b: 30  }
  ];
  function drawMix(host, mode) {
    const W = 600, H = 300, T = 30, B = 34;
    const s = svgFor(host, W, H);
    const peak = mode === 0 ? 43 : 228;
    const max = peak * 1.18;
    const ph = H - T - B, n = MIX.length, gap = 18;
    const gw = (W - gap * (n - 1)) / n;
    s.appendChild(el('line', { x1: 0, y1: T + ph, x2: W, y2: T + ph, class: 'c-axis' }));
    MIX.forEach((m, i) => {
      const gx = i * (gw + gap);
      const series = mode === 0 ? [['a', C.blue2, 'FY27']] : mode === 1 ? [['b', C.green, 'FY31']] : [['a', C.blue2, 'FY27'], ['b', C.green, 'FY31']];
      const bw = series.length === 2 ? (gw - 6) / 2 : gw * 0.72;
      series.forEach((sr, k) => {
        const v = m[sr[0]];
        const h = ph * (v / max);
        const x = series.length === 2 ? gx + k * (bw + 6) : gx + (gw - bw) / 2;
        const bar = el('rect', { x: x, y: T + ph, width: bw, height: 0, rx: 4, fill: sr[1], class: 'c-bar' });
        s.appendChild(bar);
        grow(bar, 'height', 0, h, 60 + i * 55 + k * 30);
        grow(bar, 'y', T + ph, T + ph - h, 60 + i * 55 + k * 30);
        s.appendChild(txt('₹' + v, { x: x + bw / 2, y: T + ph - h - 6, class: 'c-val', 'text-anchor': 'middle', 'font-size': 11 }));
        const hit = el('rect', { x: x, y: T, width: bw, height: ph, fill: 'transparent' });
        s.appendChild(hit);
        bindTip(host, hit, '<b>' + sr[2] + ' · ₹' + v + ' Cr</b>' + m.label);
      });
      s.appendChild(txt(m.label, { x: gx + gw / 2, y: T + ph + 15, class: 'c-lbl', 'text-anchor': 'middle' }));
    });
  }
  charts.chartMix = host => drawMix(host, 0);

  /* render on first view */
  const chartIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const host = e.target; chartIO.unobserve(host);
      const fn = charts[host.id];
      if (fn) fn(host);
    });
  }, { root: deck, threshold: 0.2 });
  Object.keys(charts).forEach(id => { const h = document.getElementById(id); if (h) chartIO.observe(h); });

  const mixToggle = $('#mixToggle');
  if (mixToggle) {
    $$('.toggle__b', mixToggle).forEach(b => b.addEventListener('click', () => {
      $$('.toggle__b', mixToggle).forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      drawMix($('#chartMix'), parseInt(b.dataset.year, 10));
    }));
  }

  /* redraw on resize (debounced) — SVGs are viewBox-scaled, so only mix needs state */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const active = mixToggle && $('.toggle__b.is-active', mixToggle);
      if (active && $('#chartMix').querySelector('svg')) drawMix($('#chartMix'), parseInt(active.dataset.year, 10));
    }, 200);
  });

  paint();
})();
