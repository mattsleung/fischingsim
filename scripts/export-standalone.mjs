import { readFile, writeFile } from 'node:fs/promises';

// Vite's production bundle has no external application dependencies.
// Inline its script and stylesheet so this export also works over file://.
let html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
html = await replaceAsset(html, /<script\b[^>]*src="([^"]+)"[^>]*><\/script>/, 'script');
html = await replaceAsset(html, /<link\b[^>]*href="([^"]+\.css)"[^>]*>/, 'style');
const output = new URL('../dist/stillwater.html', import.meta.url);
await writeFile(output, html);
console.log('Playable offline export: dist/stillwater.html');

async function replaceAsset(document, expression, tag) {
  const match = document.match(expression);
  if (!match) throw new Error(`Missing built ${tag} asset; run npm run build first.`);
  const path = match[1].replace(/^\/fischingsim\//, '').replace(/^\//, '');
  const source = await readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
  const safeSource = source.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);
  const attributes = tag === 'script' ? ' type="module"' : '';
  return document.replace(expression, () => `<${tag}${attributes}>${safeSource}</${tag}>`);
}
