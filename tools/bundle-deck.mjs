/**
 * Bundles site/deck into a single self-contained file.
 *
 *   node tools/bundle-deck.mjs out.html            # full standalone page
 *   node tools/bundle-deck.mjs out.html --fragment # body-only (for an Artifact)
 *
 * Fonts, images, CSS and JS are inlined as data URIs, so the result renders
 * from a file:// path, an email attachment, or a host with a strict CSP.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DECK = path.join(ROOT, 'site', 'deck');
const OUT = process.argv[2] || path.join(ROOT, 'DHF-Honest-Farms-Deck.html');
const FRAGMENT = process.argv.includes('--fragment');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp'
};

const cache = new Map();
function dataURI(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const file = path.join(DECK, rel);
  const buf = fs.readFileSync(file);
  const uri = `data:${MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'};base64,${buf.toString('base64')}`;
  cache.set(rel, uri);
  return uri;
}

let css = fs.readFileSync(path.join(DECK, 'deck.css'), 'utf8');
css = css.replace(/url\('(\.\.\/[^']+)'\)/g, (_, p) => `url('${dataURI(p)}')`);

let js = fs.readFileSync(path.join(DECK, 'deck.js'), 'utf8');

let html = fs.readFileSync(path.join(DECK, 'index.html'), 'utf8');
html = html.replace(/(src|href)="(\.\.\/assets\/[^"]+)"/g, (_, a, p) => `${a}="${dataURI(p)}"`);

// pull out the body markup
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
  .replace(/<script src="deck\.js"><\/script>\s*/, '');

const TITLE = FRAGMENT
  ? 'DeHaat Honest Farms Deck'
  : 'DeHaat Honest Farms — Category Creation &amp; Scale Acceleration';

let out;
if (FRAGMENT) {
  // an Artifact page: no html/head/body wrapper, and the stage is pinned to the
  // viewport rather than to a body whose height the host controls
  out = `<title>${TITLE}</title>
<style>
html,body{height:100%;margin:0;padding:0;max-width:none}
#stage{position:fixed!important}
${css}
</style>
${body}
<script>
${js}
</script>
`;
} else {
  out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${TITLE}</title>
<style>
${css}
</style>
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>
`;
}

fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`wrote ${OUT}  (${(Buffer.byteLength(out) / 1048576).toFixed(2)} MB, ${cache.size} assets inlined)`);
