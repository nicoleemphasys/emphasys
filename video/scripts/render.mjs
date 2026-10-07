// Usage: node scripts/render.mjs --from 0 --to 2249 --scale 0.5 --name preview [--type png]
// Starts Vite, drives the headless render page in Chromium, writes frames to output/<name>/.
import {createServer} from 'vite';
import {chromium} from 'playwright-core';
import fs from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, a) => (v.startsWith('--') ? [...acc, [v.slice(2), a[i + 1]]] : acc), []),
);
const name = args.name ?? 'preview';
fs.rmSync(`output/${name}`, {recursive: true, force: true});

const server = await createServer({server: {port: Number(args.port ?? 9100), strictPort: true}, logLevel: 'error'});
await server.listen();
const url = `http://localhost:${server.config.server.port}/render.html?` +
  new URLSearchParams({from: args.from ?? 0, to: args.to ?? 2249, scale: args.scale ?? 0.5, name, type: args.type ?? 'jpeg'});

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const browser = await chromium.launch({executablePath: exe, args: ['--disable-gpu-vsync', '--disable-frame-rate-limit']});
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(url);
const t0 = Date.now();
let last = -1;
for (;;) {
  const s = await page.evaluate(() => window.renderState ?? {done: false, frame: -1});
  if (s.error) { console.error(s.error); break; }
  if (s.done) break;
  if (s.frame !== last && s.frame % 60 === 0) console.log(`frame ${s.frame}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  last = s.frame;
  await new Promise(r => setTimeout(r, 500));
}
await browser.close();
await server.close();
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
