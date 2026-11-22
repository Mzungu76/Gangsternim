/**
 * Crea una versione dell'app in UN SOLO FILE HTML (dist-standalone/gangster-nim.html):
 * stesso motore e stesse pagine, navigazione tramite ancora (#), CSS e font incorporati,
 * Web Worker incorporato come blob. Richiede prima `npm run build` (per il CSS compilato).
 * Uso: npm run build && npm run build:standalone
 */
import { build } from 'esbuild';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const outDir = path.join(root, 'dist-standalone');

async function bundle(entry: string, alias: Record<string, string>) {
  const r = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    jsx: 'automatic',
    alias: { '@': src, ...alias },
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '""' },
    logLevel: 'error',
    charset: 'ascii',
  });
  return r.outputFiles[0].text;
}

async function main() {
  const shim = {
    'next/link': path.join(src, 'standalone/next-link.tsx'),
    'next/navigation': path.join(src, 'standalone/next-navigation.ts'),
  };
  const workerJs = await bundle(path.join(src, 'lib/game.worker.ts'), shim);
  const appJs = await bundle(path.join(src, 'standalone/main.tsx'), shim);

  // CSS compilato da Next (Tailwind) con i font incorporati come data URI
  const cssDir = path.join(root, '.next/static/chunks');
  const mediaDir = path.join(root, '.next/static/media');
  let css = readdirSync(cssDir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(path.join(cssDir, f), 'utf8'))
    .join('\n');
  css = css.replace(/url\(([^)]*?\/media\/([^)"']+?))\)/g, (_m, _full, file: string) => {
    const clean = file.replace(/["']/g, '');
    const data = readFileSync(path.join(mediaDir, clean)).toString('base64');
    const type = clean.endsWith('.woff2') ? 'font/woff2' : clean.endsWith('.woff') ? 'font/woff' : 'application/octet-stream';
    return `url(data:${type};base64,${data})`;
  });

  const esc = (s: string) => s.replace(/<\/script/gi, '<\\/script');
  const html = `<meta charset="utf-8">
<title>Gangster Nim</title>
<meta name="description" content="Gioco strategico di carte per 2-4 giocatori ispirato al Nim, tra i gangster degli anni '20 e '30.">
<meta name="theme-color" content="#17110c">
<style>:root{color-scheme:dark}html,body{background:#17110c;color:#f7f0dd;margin:0}</style>
<style>${css}</style>
<div id="gn-root"></div>
<script id="gn-worker-src" type="text/plain">${esc(workerJs)}</script>
<script>
try {
  var code = document.getElementById('gn-worker-src').textContent;
  window.__GN_WORKER_URL__ = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
} catch (e) {}
</script>
<script>${esc(appJs)}</script>
`;
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'gangster-nim.html');
  writeFileSync(out, html);
  console.log(`Scritto ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
