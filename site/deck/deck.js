/* ══════════════════════════════════════════════════════════════════
   DeHaat Honest Farms — deck runtime
   navigation · overview · in-place text editing with local persistence
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var frames = [].slice.call(stage.querySelectorAll('.frame'));
  var N = frames.length;
  var i = 0;
  var overview = false;
  var editing = false;

  var KEY = 'dhf-deck-edits-v1';
  var $ = function (id) { return document.getElementById(id); };

  /* ── scaling ────────────────────────────────────────────────── */
  function fit() {
    if (overview) {
      var cols = window.innerWidth > 1500 ? 4 : window.innerWidth > 1050 ? 3 : window.innerWidth > 700 ? 2 : 1;
      var w = (stage.clientWidth - 44 - (cols - 1) * 16) / cols;
      stage.style.setProperty('--s', Math.max(0.09, w / 1280));
    } else {
      var pad = window.innerWidth < 760 ? 12 : 26;
      var s = Math.min((window.innerWidth - pad * 2) / 1280,
                       (stage.clientHeight - pad * 2) / 720);
      stage.style.setProperty('--s', Math.max(0.1, s));
    }
  }

  /* ── navigation: the deck is one long scroll that snaps ─────── */
  function mark(n) {
    if (n === i) return;
    i = n;
    frames.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    $('count').textContent = (i + 1) + ' / ' + N;
    $('bar').style.width = ((i + 1) / N * 100) + '%';
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }

  function show(n, smooth) {
    n = Math.max(0, Math.min(N - 1, n));
    frames[n].scrollIntoView({ behavior: smooth === false ? 'auto' : 'smooth', block: 'center' });
    mark(n);
  }
  var go = function (d) { if (!overview) show(i + d); };

  function setOverview(on) {
    overview = on;
    stage.classList.toggle('overview', on);
    $('grid').classList.toggle('on', on);
    fit();
    requestAnimationFrame(function () {
      frames[i].scrollIntoView({ behavior: 'auto', block: on ? 'center' : 'center' });
    });
  }

  /* ── editing ────────────────────────────────────────────────── */
  var SEL = 'h1,h2,h3,h4,p,li,td,th,figcaption,b,span,em,strong';
  var SKIP = { SVG: 1, PATH: 1, RECT: 1, IMG: 1, I: 1, S: 1, HR: 1 };
  var editable = [];

  function collect() {
    frames.forEach(function (f, si) {
      var slide = f.querySelector('.slide');
      var nodes = [].slice.call(slide.querySelectorAll(SEL)).filter(function (n) {
        if (SKIP[n.tagName]) return false;
        if (!n.textContent.trim()) return false;
        return !n.querySelector(SEL);          // leaf text nodes only
      });
      nodes.forEach(function (n, k) {
        n.setAttribute('data-e', si + '.' + k);
        editable.push(n);
      });
    });
  }

  function load() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { raw = {}; }
    var n = 0;
    editable.forEach(function (el) {
      var v = raw[el.getAttribute('data-e')];
      if (typeof v === 'string') { el.innerHTML = v; n++; }
    });
    document.body.classList.toggle('has-edits', n > 0);
    if (n) $('editedDot').textContent = n + ' edit' + (n === 1 ? '' : 's') + ' · saved in this browser';
    return n;
  }

  var saveTimer;
  function stash(el) {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { raw = {}; }
    raw[el.getAttribute('data-e')] = el.innerHTML;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(raw));
        document.body.classList.add('has-edits');
        var n = Object.keys(raw).length;
        $('editedDot').textContent = n + ' edit' + (n === 1 ? '' : 's') + ' · saved in this browser';
      } catch (e) { toast('Could not save — browser storage is full'); }
    }, 260);
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('editing', on);
    $('edit').classList.toggle('on', on);
    editable.forEach(function (el) {
      if (on) { el.setAttribute('contenteditable', 'true'); el.spellcheck = false; }
      else { el.removeAttribute('contenteditable'); }
    });
    if (on) {
      toast('Edit mode — click any text and type. Press E or Esc to finish.');
      if (!$('reset')) {
        var b = document.createElement('button');
        b.id = 'reset'; b.textContent = 'Reset';
        b.title = 'Discard every edit';
        b.onclick = function () {
          if (!confirm('Discard every edit and restore the original text?')) return;
          localStorage.removeItem(KEY); location.reload();
        };
        $('hud').insertBefore(b, $('save'));
      }
      $('reset').style.display = '';
    } else if ($('reset')) {
      $('reset').style.display = 'none';
    }
  }

  /* ── export ─────────────────────────────────────────────────── */
  function buildHTML() {
    var doc = document.documentElement.cloneNode(true);
    doc.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
    var b = doc.querySelector('body');
    if (b) b.className = '';
    var st = doc.querySelector('#stage');
    if (st) { st.classList.remove('overview'); st.removeAttribute('style'); }
    var r = doc.querySelector('#reset'); if (r) r.remove();
    return '<!doctype html>\n' + doc.outerHTML;
  }

  function saveBlob(html) {
    var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'DHF-Honest-Farms-Deck.html';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast('Downloaded — your edits are baked into the copy');
  }

  function download() {
    var html = buildHTML();
    // inside the claude.ai artifact viewer the page cannot start a download
    // itself; the host mediates it through the downloads capability instead
    var use = window.claude && window.claude.use;
    if (!use) { saveBlob(html); return; }
    Promise.resolve(window.claude.use('downloads')).catch(function () { return null; })
      .then(function (dl) {
        if (!dl) { saveBlob(html); return; }
        return dl.save({ filename: 'DHF-Honest-Farms-Deck.html', data: html })
          .then(function () { toast('Saved — your edits are baked into the copy'); })
          .catch(function (e) {
            var code = e && e.code;
            if (code === 'declined' || code === 'rate_limited') return;
            toast('This viewer cannot save files — use the hosted copy to download');
          });
      });
  }

  /* ── toast ──────────────────────────────────────────────────── */
  var tTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(tTimer);
    tTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ── wiring ─────────────────────────────────────────────────── */
  collect();
  load();

  $('prev').onclick = function () { go(-1); };
  $('next').onclick = function () { go(1); };
  $('grid').onclick = function () { setOverview(!overview); };
  $('edit').onclick = function () { if (overview) setOverview(false); setEditing(!editing); };
  $('save').onclick = download;
  $('ask').onclick = function () { $('help').classList.toggle('show'); };
  $('help').onclick = function (e) { if (e.target === $('help')) $('help').classList.remove('show'); };
  $('full').onclick = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(function () {});
  };

  stage.addEventListener('input', function (e) {
    var el = e.target.closest('[data-e]');
    if (el) stash(el);
  });

  stage.addEventListener('click', function (e) {
    if (!overview) return;
    var f = e.target.closest('.frame');
    if (f) { mark(+f.dataset.i); setOverview(false); }
  });

  // whichever slide owns the middle of the viewport is the current one
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      });
      if (best) mark(+best.target.dataset.i);
    }, { root: stage, threshold: [0.5, 0.75] });
    frames.forEach(function (f) { io.observe(f); });
  } else {
    stage.addEventListener('scroll', function () {
      mark(Math.round(stage.scrollTop / stage.clientHeight));
    }, { passive: true });
  }

  var hintGone = false;
  stage.addEventListener('scroll', function () {
    if (hintGone) return;
    hintGone = true;
    var h = $('hint'); if (h) h.classList.add('gone');
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    var typing = editing && e.target.isContentEditable;
    if (e.key === 'Escape') {
      if ($('help').classList.contains('show')) { $('help').classList.remove('show'); return; }
      if (editing) { if (e.target.blur) e.target.blur(); setEditing(false); return; }
      if (overview) { setOverview(false); return; }
      return;
    }
    if (typing) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        if (!overview) { e.preventDefault(); go(1); } break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        if (!overview) { e.preventDefault(); go(-1); } break;
      case 'Home': e.preventDefault(); show(0); break;
      case 'End': e.preventDefault(); show(N - 1); break;
      case 'g': case 'G': setOverview(!overview); break;
      case 'e': case 'E': if (overview) setOverview(false); setEditing(!editing); break;
      case 'f': case 'F': $('full').click(); break;
      case '?': $('help').classList.toggle('show'); break;
    }
  });

  window.addEventListener('resize', function () {
    fit();
    if (!overview) frames[i].scrollIntoView({ behavior: 'auto', block: 'center' });
  });
  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= N && n - 1 !== i) show(n - 1);
  });

  var start = parseInt(location.hash.slice(1), 10);
  fit();
  requestAnimationFrame(function () { show(start >= 1 && start <= N ? start - 1 : 0, false); });

  // let the HUD announce itself once, then fade back
  $('hud').classList.add('show');
  setTimeout(function () { $('hud').classList.remove('show'); }, 2600);
})();
