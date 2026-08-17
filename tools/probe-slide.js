const { chromium } = require('playwright');
const path=require('path');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1400,height:820}});
await p.goto('file://'+path.join(__dirname,'..','site','deck','index.html'),{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
for(const n of process.argv.slice(2).map(Number)){
const r=await p.evaluate(n=>{
  const f=document.querySelectorAll('.frame')[n-1]; f.style.display='block';
  const s=f.querySelector('.slide'); const sc=s.getBoundingClientRect().width/1280 || 1;
  const g=e=>e?Math.round(e.getBoundingClientRect().height/sc):null;
  const body=s.querySelector('.body');
  const out={n, slideScroll:s.scrollHeight, head:g(s.querySelector('.head')), body:g(body),
    bodyScroll:body?Math.round(body.scrollHeight):null, foot:g(s.querySelector('.foot'))};
  if(body) out.blocks=[...body.children].map(c=>(c.className||'?')+' = '+g(c)+' (scroll '+c.scrollHeight+')');
  const sp=s.querySelector('.split');
  if(sp) out.cols=[...sp.children].map(c=>'col h='+g(c)+' :: '+[...c.children].map(x=>(x.className||x.tagName)+':'+g(x)).join(' | '));
  f.style.display='';
  return out;
},n);
console.log(JSON.stringify(r,null,1));
}
await b.close();})();
