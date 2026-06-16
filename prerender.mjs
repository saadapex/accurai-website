// Accurai static prerender build.
// Reads the single-file SPA (src/index.html), renders every route with jsdom,
// and writes a static HTML file per URL into dist/ (plus assets + sitemap).
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const BASE = (process.env.SITE_URL || 'https://accurai.ca').replace(/\/$/, '');
const SRC = 'src/index.html';
const PUBLIC = 'public';
const OUT = 'dist';

const src = fs.readFileSync(SRC, 'utf8');

// --- discover routes from the data arrays in the source (so new posts/services auto-build) ---
const block = (name) => {
  const m = src.match(new RegExp('const ' + name + '=\\[([\\s\\S]*?)\\n\\];'));
  return m ? m[1] : '';
};
const slugs = (name) => [...block(name).matchAll(/\{slug:'([^']+)'/g)].map((x) => x[1]);
const serviceRoutes = slugs('services').map((s) => `/services/${s}`);
const industryRoutes = slugs('industries').map((s) => `/industries/${s}`);
const blogRoutes = slugs('blog').map((s) => `/blog/${s}`);
const staticRoutes = ['/', '/services', '/industries', '/pricing', '/process', '/about', '/contact', '/faq', '/resources', '/blog', '/privacy', '/terms'];
const routes = [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...blogRoutes];

// --- reset output + copy public assets ---
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
if (fs.existsSync(PUBLIC)) fs.cpSync(PUBLIC, OUT, { recursive: true });

// --- boot the SPA once in a headless DOM ---
const dom = new JSDOM(src, {
  url: BASE + '/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(w) {
    w.__PRERENDER = true;
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    w.scrollTo = () => {};
  },
});
const w = dom.window;

await new Promise((r) => setTimeout(r, 600)); // let DOMContentLoaded + initial render settle

if (typeof w.router !== 'function') {
  console.error('FATAL: router() not found — did the source change?');
  process.exit(1);
}

let bad = 0, ok = 0;
for (const route of routes) {
  try {
    dom.reconfigure({ url: BASE + route });
    w.router();
    const app = w.document.querySelector('#app').innerHTML;
    if (app.length < 150 || /\bundefined\b/.test(app) || app.includes('${')) {
      console.error('  ✗ render problem:', route);
      bad++;
      continue;
    }
    const html = '<!DOCTYPE html>\n' + w.document.documentElement.outerHTML;
    const dir = route === '/' ? OUT : path.join(OUT, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    ok++;
  } catch (e) {
    console.error('  ✗ threw:', route, e.message);
    bad++;
  }
}

// --- 404 page (Vercel serves this with a 404 status for unmatched paths) ---
dom.reconfigure({ url: BASE + '/__not_found__' });
w.router();
fs.writeFileSync(path.join(OUT, '404.html'), '<!DOCTYPE html>\n' + w.document.documentElement.outerHTML);

// --- sitemap ---
const today = new Date().toISOString().slice(0, 10);
const priority = (r) => (r === '/' ? '1.0' : (r.split('/').length > 2 ? '0.7' : '0.8'));
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes.map((r) => `  <url><loc>${BASE}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority(r)}</priority></url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

console.log(`Built ${ok}/${routes.length} pages into ${OUT}/  (sitemap: ${routes.length} urls, issues: ${bad})`);
process.exit(bad ? 1 : 0);
