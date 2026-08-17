const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1400,height:820},deviceScaleFactor:2});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.argv[2],{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
const info=await p.evaluate(()=>({slides:document.querySelectorAll('.frame').length,
  imgsBroken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,
  editable:document.querySelectorAll('[data-e]').length, hud:!!document.getElementById('hud')}));
console.log(JSON.stringify(info), errs.length?('ERRORS: '+errs.join(' | ')):'no js errors');
// exercise: go to slide 12, toggle edit, type, reload-persist check
await p.evaluate(()=>{location.hash='#12'});
await p.keyboard.press('e');
const ok=await p.evaluate(()=>{const el=document.querySelector('.frame.on [data-e]'); return el && el.getAttribute('contenteditable')==='true';});
console.log('edit mode arms contenteditable:', ok);
await p.evaluate(()=>{const el=document.querySelector('.frame.on h2[data-e]'); el.innerHTML='EDITED HEADLINE'; el.dispatchEvent(new Event('input',{bubbles:true}));});
await p.waitForTimeout(500);
const saved=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('dhf-deck-edits-v1')||'{}')).length);
console.log('edits persisted to localStorage:', saved);
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(400);
const restored=await p.evaluate(()=>document.body.innerHTML.includes('EDITED HEADLINE'));
console.log('edit survives reload:', restored);
await p.screenshot({path:'/tmp/deckshots/bundle-check.png'});
await b.close();})();
