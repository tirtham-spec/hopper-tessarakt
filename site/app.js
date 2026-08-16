/* ═══════════════════════════════════════════════
   DeHaat Honest Farms — page runtime
   scroll spy · progress · parallax · reveals · counters
   accordions · personas · SVG charts
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const C = {
    ink:'#0C1A2B', navy:'#2E4E85', blue:'#3A5D97', blue2:'#6688BE',
    green:'#177A46', green2:'#2FA362', green3:'#5FC28C',
    gold:'#9E7220', gold2:'#C8922E', clay:'#9E3A24', clay2:'#C4553B',
    grey:'#B5AD9C', sand:'#EDE4D4', line:'#E5DCCB', tx2:'#54606F', tx3:'#8B95A2'
  };

  /* ═══════════ HEADER: progress, stuck state, scroll spy ═══════════ */
  const hdr = $('#hdr'), prog = $('#prog'), totop = $('#totop');
  const navLinks = $$('#nav a');
  const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    hdr.classList.toggle('is-stuck', y > 8);
    totop.classList.toggle('on', y > window.innerHeight * 0.9);

    // scroll spy — last section whose top is above the fold line
    const line = y + window.innerHeight * 0.32;
    let active = -1;
    sections.forEach((s, i) => { if (s.offsetTop <= line) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('on', i === active));

    parallax(y);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ═══════════ PARALLAX ═══════════ */
  const paraEls = $$('[data-para]');
  function parallax(y) {
    if (reduce) return;
    paraEls.forEach(el => {
      const host = el.parentElement;
      const r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const centre = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = 'translate3d(0,' + (-centre * parseFloat(el.dataset.para)).toFixed(1) + 'px,0)';
    });
  }

  /* ═══════════ MOBILE DRAWER ═══════════ */
  const burger = $('#burger'), drawer = $('#drawer');
  function closeDrawer() { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    open ? closeDrawer() : (drawer.hidden = false, burger.setAttribute('aria-expanded', 'true'));
  });
  $$('#drawer a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ═══════════ REVEAL ═══════════ */
  const revealIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv').forEach(el => revealIO.observe(el));

  /* ═══════════ COUNTERS ═══════════ */
  function fmt(v, dec) {
    return dec ? v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })
               : Math.round(v).toLocaleString('en-IN');
  }
  const countIO = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; countIO.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (reduce || isNaN(target)) { el.textContent = pre + fmt(target, dec) + suf; return; }
      const dur = 1150, t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = pre + fmt(target * (1 - Math.pow(1 - p, 3)), dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.45 });
  $$('.num[data-count]').forEach(el => countIO.observe(el));

  /* ═══════════ PHASES ACCORDION ═══════════ */
  $$('#phases .phase').forEach(p => {
    const hd = $('.phase__hd', p);
    hd.addEventListener('click', () => {
      const open = p.classList.contains('is-open');
      $$('#phases .phase').forEach(x => {
        x.classList.remove('is-open');
        $('.phase__hd', x).setAttribute('aria-expanded', 'false');
      });
      if (!open) { p.classList.add('is-open'); hd.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ═══════════ TAM ═══════════ */
  $$('#tam .tam__b').forEach(b => b.addEventListener('click', () => {
    $$('#tam .tam__b').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on');
    $$('#tamNote p').forEach(p => { p.hidden = p.dataset.tam !== b.dataset.tam; });
  }));

  /* ═══════════ QUOTES ═══════════ */
  const quotes = $$('#quotes .q'), qDots = $('#qDots');
  if (quotes.length) {
    let qi = 0;
    quotes.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'qd' + (i === 0 ? ' on' : '');
      d.setAttribute('aria-label', 'Quote ' + (i + 1));
      d.addEventListener('click', () => show(i));
      qDots.appendChild(d);
    });
    function show(i) {
      qi = (i + quotes.length) % quotes.length;
      quotes.forEach((q, k) => q.classList.toggle('is-on', k === qi));
      $$('.qd', qDots).forEach((d, k) => d.classList.toggle('on', k === qi));
    }
    $('#qNext').addEventListener('click', () => show(qi + 1));
    $('#qPrev').addEventListener('click', () => show(qi - 1));
  }

  /* ═══════════ LADDER ═══════════ */
  $$('#ladder .rung').forEach(b => b.addEventListener('click', () => {
    $$('#ladder .rung').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on');
  }));

  /* ═══════════ PERSONAS ═══════════ */
  const PERSONAS = [
    {
      quote: 'The word organic on a label means nothing to me anymore. Show me the actual test report for this batch and I\'ll happily pay more.',
      seg: 'Proof-Hungry Guardians', share: '36%',
      profile: '34–45 · postgraduate · senior professional · nuclear family with young children · ₹1.5–2.5L+/month · Tier-1 metro',
      converts: 'Batch-specific lab report by QR; "below detectable limits"; a specialist who has personally reviewed it.',
      blocks: 'No way to verify independently; greenwashing fatigue; a scan that turns into a research project.',
      meta: ['n = 109', 'Trust in certified claim 4.4/5', 'Would pay 11%+ · 54%'],
      f: [['F1 Social', '+0.46', 'pos'], ['F2 Distrust', '+0.47', 'pos'], ['F3 Vigilance', '+0.69', 'pos']]
    },
    {
      quote: 'If my doctor and my sister both say it\'s good for the family, that\'s all the proof I need. I\'m not going to scan codes and read reports.',
      seg: 'Social Trusters', share: '20%',
      profile: '30–50 · graduate · homemaker or teacher · joint or extended family · ₹1–1.5L/month · Tier-1 and Tier-2',
      converts: 'Doctor and dietitian endorsement; a trusted person already using it; warm, relatable word of mouth.',
      blocks: 'Clinical, jargon-heavy messaging; conflicting opinions in her circle; nobody she trusts has vouched.',
      meta: ['n = 62', 'Trust in certified claim 3.6/5', 'Would pay 11%+ · 34%'],
      f: [['F1 Social', '+0.65', 'pos'], ['F2 Distrust', '+0.17', 'pos'], ['F3 Vigilance', '−0.89', 'neg']]
    },
    {
      quote: 'Honestly, I just buy whatever brand I know that looks decent and isn\'t overpriced. Food safety isn\'t something I lose sleep over.',
      seg: 'Passive Defaulters', share: '26%',
      profile: '26–38 · graduate · IT / sales / ops professional · DINK or small family · ₹80K–1.5L/month · heavy quick-commerce user',
      converts: 'Visible on the app he already uses; price parity with his usual brand; taste he notices.',
      blocks: 'Not stocked where he shops; a premium with no obvious reason; anything requiring effort to switch.',
      meta: ['n = 80', 'Trust in certified claim 3.5/5', 'Would pay 11%+ · 6%'],
      f: [['F1 Social', '−0.39', 'neg'], ['F2 Distrust', '−1.05', 'neg'], ['F3 Vigilance', '−0.34', 'neg']]
    },
    {
      quote: 'Every brand says it\'s pure. Adulteration is everywhere, and no factory is truly clean. Prove me wrong — but don\'t insult me with marketing.',
      seg: 'System Fatalists', share: '18%',
      profile: '38–55 · graduate to postgraduate · senior professional or business owner · established family · Tier-1 and Tier-2',
      converts: 'Unscripted farmer proof; independent, non-brand-paid verification; being shown what is imperfect.',
      blocks: 'Polished claims like everyone else\'s; certification with no visible teeth; anything that reads like a script.',
      meta: ['n = 54', 'Trust in certified claim 3.6/5', 'Would pay 11%+ · 22%'],
      f: [['F1 Social', '−1.09', 'neg'], ['F2 Distrust', '+0.41', 'pos'], ['F3 Vigilance', '+0.13', 'pos']]
    }
  ];
  const ppanel = $('#ppanel');
  function renderPersona(i) {
    const p = PERSONAS[i];
    ppanel.innerHTML =
      '<div class="pp">' +
        '<div>' +
          '<p class="pp__q">' + p.quote + '</p>' +
          '<div class="pp__meta">' + p.meta.map(m => '<span class="pmeta">' + m + '</span>').join('') + '</div>' +
          '<div class="pp__f">' + p.f.map(f => '<div><span>' + f[0] + '</span><b class="' + f[2] + '">' + f[1] + '</b></div>').join('') + '</div>' +
        '</div>' +
        '<div class="pp__c">' +
          '<div class="psec"><span>Profile</span><p>' + p.profile + '</p></div>' +
          '<div class="psec psec--c"><span>What converts them</span><p>' + p.converts + '</p></div>' +
        '</div>' +
        '<div class="pp__c">' +
          '<div class="psec psec--b"><span>What blocks the sale</span><p>' + p.blocks + '</p></div>' +
          '<div class="psec"><span>Segment</span><p>' + p.seg + ' — ' + p.share + ' of decision-makers.</p></div>' +
        '</div>' +
      '</div>';
  }
  if (ppanel) {
    renderPersona(0);
    $$('#ptabs .ptab').forEach(b => b.addEventListener('click', () => {
      $$('#ptabs .ptab').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      renderPersona(parseInt(b.dataset.p, 10));
    }));
  }

  /* ═══════════ CHART TOOLKIT ═══════════ */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) if (a[k] != null) n.setAttribute(k, a[k]); return n; };
  const txt = (s, a) => { const n = el('text', a); n.textContent = s; return n; };
  function svgFor(host, w, h) {
    host.innerHTML = '';
    const s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet' });
    host.appendChild(s);
    return s;
  }
  function bindTip(host, node, html) {
    let tip = host.querySelector('.tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; host.appendChild(tip); }
    const show = ev => {
      tip.innerHTML = html;
      const r = host.getBoundingClientRect();
      tip.style.left = (ev.clientX - r.left) + 'px';
      tip.style.top = (ev.clientY - r.top) + 'px';
      tip.classList.add('on');
    };
    node.addEventListener('mouseenter', show);
    node.addEventListener('mousemove', show);
    node.addEventListener('mouseleave', () => tip.classList.remove('on'));
  }
  function grow(node, attr, to, delay) {
    if (reduce) { node.setAttribute(attr, to); return; }
    setTimeout(() => {
      node.style.transition = 'all .9s cubic-bezier(.16,1,.3,1)';
      node.setAttribute(attr, to);
    }, delay);
  }
  function wrapLbl(label, max) {
    const words = String(label).split(' '); const lines = []; let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function hBars(host, data, opt) {
    opt = opt || {};
    const W = 600, rowH = opt.rowH || 40, H = data.length * rowH + 2;
    const s = svgFor(host, W, H);
    const max = opt.max || Math.max.apply(null, data.map(d => d.value));
    data.forEach((d, i) => {
      const y = i * rowH;
      s.appendChild(txt(d.label, { x: 0, y: y + 12, class: 'c-lbl' }));
      s.appendChild(txt(d.display, { x: W, y: y + 12, class: 'c-val', 'text-anchor': 'end', fill: d.color }));
      s.appendChild(el('rect', { x: 0, y: y + 19, width: W, height: 9, rx: 4.5, fill: C.sand }));
      const bar = el('rect', { x: 0, y: y + 19, width: 0, height: 9, rx: 4.5, fill: d.color });
      s.appendChild(bar);
      grow(bar, 'width', Math.max(4, W * (d.value / max)), 90 + i * 70);
      if (d.tip) { const hit = el('rect', { x: 0, y: y, width: W, height: rowH - 4, fill: 'transparent' }); s.appendChild(hit); bindTip(host, hit, d.tip); }
    });
  }

  function vBars(host, data, opt) {
    opt = opt || {};
    const W = 600, H = opt.h || 300, top = 36, bottom = 22 + (opt.lines || 1) * 13;
    const s = svgFor(host, W, H);
    const ph = H - top - bottom;
    const max = opt.max || Math.max.apply(null, data.map(d => d.value)) * 1.15;
    const n = data.length, gap = opt.gap || 14, bw = (W - gap * (n - 1)) / n;

    if (opt.band) {
      const y1 = top + ph * (1 - opt.band[1] / max), y2 = top + ph * (1 - opt.band[0] / max);
      s.appendChild(el('rect', { x: 0, y: y1, width: W, height: y2 - y1, class: 'c-band', rx: 5 }));
      s.appendChild(txt(opt.bandLabel, { x: 5, y: y1 + 14, class: 'c-bandlbl' }));
    }
    s.appendChild(el('line', { x1: 0, y1: top + ph, x2: W, y2: top + ph, class: 'c-axis' }));

    data.forEach((d, i) => {
      const x = i * (bw + gap), h = ph * (d.value / max), y = top + ph - h;
      const bar = el('rect', { x: x, y: top + ph, width: bw, height: 0, rx: 5, fill: d.color });
      s.appendChild(bar);
      grow(bar, 'height', h, 100 + i * 65);
      grow(bar, 'y', y, 100 + i * 65);
      s.appendChild(txt(d.display, { x: x + bw / 2, y: y - 8, class: 'c-val', 'text-anchor': 'middle' }));
      wrapLbl(d.label, opt.wrapAt || 13).forEach((ln, k) => {
        s.appendChild(txt(ln, { x: x + bw / 2, y: top + ph + 15 + k * 12, class: 'c-lbl', 'text-anchor': 'middle' }));
      });
      if (d.tip) { const hit = el('rect', { x: x, y: top, width: bw, height: ph, fill: 'transparent' }); s.appendChild(hit); bindTip(host, hit, d.tip); }
    });
  }

  /* ═══════════ CHART DEFINITIONS ═══════════ */
  const charts = {};

  charts.chartPrice = host => vBars(host, [
    { label: 'Vedaka', value: 136, color: C.blue2, display: '₹136', tip: '<b>₹136 / kg</b>Vedaka — retailer private label' },
    { label: 'Fortune', value: 145, color: C.blue2, display: '₹145', tip: '<b>₹145 / kg</b>Fortune — conventional national packaged' },
    { label: 'Tata Sampann', value: 156, color: C.blue, display: '₹156', tip: '<b>₹156 / kg</b>Tata Sampann — nutrition-led' },
    { label: 'BB Royal Organic', value: 157, color: C.gold2, display: '₹157', tip: '<b>₹157 / kg</b>BB Royal Organic — squeezing the corridor from below' },
    { label: 'Organic Tattva', value: 255, color: C.green, display: '₹255', tip: '<b>₹255 / kg</b>Organic Tattva — certified organic' },
    { label: 'Tata Sampann Organic', value: 257, color: C.green, display: '₹257', tip: '<b>₹257 / kg</b>Tata Sampann Organic' },
    { label: '24 Mantra Organic', value: 306, color: C.green, display: '₹306', tip: '<b>₹306 / kg</b>24 Mantra Organic — top of the ladder' }
  ], { h: 340, max: 345, band: [150, 250], bandLabel: 'Accessible-premium corridor · ₹150–250', wrapAt: 11, lines: 3 });

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
    const W = 600, rowH = 31, H = rows.length * rowH + 4, max = 70;
    const s = svgFor(host, W, H);
    rows.forEach((r, i) => {
      const y = i * rowH;
      s.appendChild(txt(r.label, { x: 0, y: y + 11, class: 'im-lbl' }));
      s.appendChild(txt(r.disp, { x: W, y: y + 11, class: 'im-val', 'text-anchor': 'end', fill: r.color }));
      s.appendChild(el('rect', { x: 0, y: y + 16, width: W, height: 7, rx: 3.5, fill: C.sand }));
      const bar = el('rect', { x: 0, y: y + 16, width: 0, height: 7, rx: 3.5, fill: r.color });
      s.appendChild(bar);
      grow(bar, 'width', Math.max(5, W * (r.v / max)), 80 + i * 55);
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
  ], { h: 250, max: 62, gap: 28 });

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
    { label: 'Oil & ghee · 1%', value: 0.8, color: C.grey, display: '₹0.8 Cr', tip: '<b>₹0.8 Cr</b>1% of revenue' }
  ], { rowH: 42, max: 56 });

  charts.chartChannelMix = host => hBars(host, [
    { label: 'E-commerce & quick commerce', value: 304, color: C.blue, display: '₹304 Cr', tip: '<b>₹304 Cr</b>39% of FY31 revenue — just under the 40% ceiling' },
    { label: 'Regional & premium offline', value: 263, color: C.green, display: '₹263 Cr', tip: '<b>₹263 Cr</b>Converted state by state' },
    { label: 'National modern trade', value: 129, color: C.blue2, display: '₹129 Cr', tip: '<b>₹129 Cr</b>The earned metro shelf' },
    { label: 'Exports', value: 54, color: C.gold2, display: '₹54 Cr', tip: '<b>₹54 Cr</b>Optional upside, not the plan' }
  ], { rowH: 42, max: 340 });

  charts.chartRevenue = host => {
    const d = [
      { y: 'FY26', v: 53,  note: 'Base year · roughly 30% YoY' },
      { y: 'FY27', v: 104, note: 'EBITDA −12.4 Cr' },
      { y: 'FY28', v: 168, note: 'EBITDA −7.9 Cr' },
      { y: 'FY29', v: 274, note: 'Breakeven · EBITDA +4.7 Cr' },
      { y: 'FY30', v: 450, note: 'Scale phase' },
      { y: 'FY31', v: 748, note: '14.1× the FY26 base' }
    ];
    const W = 600, H = 320, L = 8, R = 8, T = 34, B = 32;
    const s = svgFor(host, W, H);
    const pw = W - L - R, ph = H - T - B, max = 820;
    const X = i => L + pw * (i / (d.length - 1));
    const Y = v => T + ph * (1 - v / max);

    [0, 200, 400, 600, 800].forEach(g => {
      s.appendChild(el('line', { x1: L, y1: Y(g), x2: W - R, y2: Y(g), class: 'c-grid' }));
      if (g) s.appendChild(txt('₹' + g, { x: L, y: Y(g) - 5, class: 'c-lbl', 'font-size': 9, fill: C.tx3 }));
    });

    const defs = el('defs'), lg = el('linearGradient', { id: 'revg', x1: 0, y1: 0, x2: 0, y2: 1 });
    lg.appendChild(el('stop', { offset: '0%', 'stop-color': C.green2, 'stop-opacity': .34 }));
    lg.appendChild(el('stop', { offset: '100%', 'stop-color': C.green2, 'stop-opacity': .02 }));
    defs.appendChild(lg); s.appendChild(defs);

    let line = '', area = 'M ' + L + ' ' + Y(0) + ' ';
    d.forEach((p, i) => { const c = X(i) + ' ' + Y(p.v) + ' '; line += (i ? 'L ' : 'M ') + c; area += 'L ' + c; });
    area += 'L ' + (W - R) + ' ' + Y(0) + ' Z';

    s.appendChild(el('path', { d: area, fill: 'url(#revg)' }));
    const path = el('path', { d: line, fill: 'none', stroke: C.green, 'stroke-width': 2.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    s.appendChild(path);
    if (!reduce && path.getTotalLength) {
      const len = path.getTotalLength();
      path.setAttribute('stroke-dasharray', len);
      path.setAttribute('stroke-dashoffset', len);
      path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => path.setAttribute('stroke-dashoffset', 0), 150);
    }

    d.forEach((p, i) => {
      s.appendChild(el('circle', { cx: X(i), cy: Y(p.v), r: 4.8, fill: '#fff', stroke: C.green, 'stroke-width': 2.4 }));
      s.appendChild(txt('₹' + p.v, {
        x: X(i), y: Y(p.v) - 13, class: 'c-val',
        'text-anchor': i === 0 ? 'start' : (i === d.length - 1 ? 'end' : 'middle'),
        fill: i === d.length - 1 ? C.green : C.ink
      }));
      s.appendChild(txt(p.y, { x: X(i), y: H - 10, class: 'c-lbl', 'text-anchor': 'middle' }));
      const hit = el('rect', { x: X(i) - pw / (d.length * 2), y: T, width: pw / d.length, height: ph, fill: 'transparent' });
      s.appendChild(hit);
      bindTip(host, hit, '<b>' + p.y + ' · ₹' + p.v + ' Cr</b>' + p.note);
    });
  };

  const MIX = [
    { label: 'Pulses', a: 43, b: 228 },
    { label: 'Spices', a: 18, b: 202 },
    { label: 'Value-added', a: 32, b: 169 },
    { label: 'Oil & ghee', a: 9, b: 120 },
    { label: 'Processed', a: 2, b: 30 }
  ];
  function drawMix(host, mode) {
    const key = mode ? 'b' : 'a', col = mode ? C.green : C.blue2, yr = mode ? 'FY31' : 'FY27';
    vBars(host, MIX.map(m => ({
      label: m.label, value: m[key], color: col, display: '₹' + m[key],
      tip: '<b>' + yr + ' · ₹' + m[key] + ' Cr</b>' + m.label
    })), { h: 280, max: (mode ? 228 : 43) * 1.2, gap: 20, wrapAt: 11 });
  }
  charts.chartMix = host => drawMix(host, 0);

  const mixToggle = $('#mixToggle');
  if (mixToggle) {
    $$('.toggle__b', mixToggle).forEach(b => b.addEventListener('click', () => {
      $$('.toggle__b', mixToggle).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      drawMix($('#chartMix'), parseInt(b.dataset.year, 10));
    }));
  }

  /* render each chart the first time it scrolls into view */
  const chartIO = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      chartIO.unobserve(e.target);
      const fn = charts[e.target.id];
      if (fn) fn(e.target);
    });
  }, { threshold: 0.15 });
  Object.keys(charts).forEach(id => { const h = document.getElementById(id); if (h) chartIO.observe(h); });

  onScroll();
})();
