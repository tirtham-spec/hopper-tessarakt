/**
 * Bundle site/ into a single self-contained HTML file.
 *
 *   node tools/bundle.mjs [outfile]
 *
 * Inlines the stylesheet, the script, every woff2 and every image as data
 * URIs, so the result opens from a file:// path, an email attachment, or a
 * host with a strict CSP that blocks all external requests.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const out = process.argv[2] || join(root, 'honest-farms-deck.html');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp'
};

const cache = new Map();
function dataURI(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const file = join(site, rel);
  if (!existsSync(file)) throw new Error('missing asset: ' + rel);
  const mime = MIME[extname(rel).toLowerCase()];
  if (!mime) throw new Error('unknown mime for ' + rel);
  const uri = `data:${mime};base64,${readFileSync(file).toString('base64')}`;
  cache.set(rel, uri);
  return uri;
}

/* The bundle must survive being served without a charset header, so every
   non-ASCII character is escaped in the syntax of its own language. */
const escCSS  = s => s.replace(/[^\x00-\x7F]/gu, c => '\\' + c.codePointAt(0).toString(16).padStart(6, '0'));
const escHTML = s => s.replace(/[^\x00-\x7F]/gu, c => '&#' + c.codePointAt(0) + ';');
const escJS   = s => s.replace(/[^\x00-\x7F]/g,  c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

let css = readFileSync(join(site, 'styles.css'), 'utf8');
css = escCSS(css.replace(/\/\*[\s\S]*?\*\//g, ''));
css = css.replace(/url\((fonts\/[^)]+)\)/g, (_, p) => `url(${dataURI(p)})`);

const js = escJS(readFileSync(join(site, 'app.js'), 'utf8'));

let html = readFileSync(join(site, 'index.html'), 'utf8');

// keep only what lives inside <body>; the artifact host supplies the shell
const title = process.env.BUNDLE_TITLE || html.match(/<title>([\s\S]*?)<\/title>/)[1];
html = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));

html = escHTML(html.replace(/<script src="app\.js"><\/script>/, ''))
  .replace(/(?:src|href)="(assets\/[^"]+)"/g, (m, p) => m.replace(p, dataURI(p)))
  .replace(/url\('(assets\/[^']+)'\)/g, (_, p) => `url('${dataURI(p)}')`);

const bundle = `<meta charset="utf-8">
<title>${escHTML(title)}</title>
<style>
${css}
</style>
${html}
<script>
${js}
<\/script>
`;

writeFileSync(out, bundle);
console.log(`${out} — ${(Buffer.byteLength(bundle) / 1024 / 1024).toFixed(2)} MB`);
