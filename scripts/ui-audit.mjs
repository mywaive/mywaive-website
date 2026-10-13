/**
 * UI/UX audit — checks the built site against the ui-ux-pro-max rule priorities
 * (target size, focus, forms, CLS, typography, nav, motion) plus the project's
 * own design-system constraints in /context.
 */
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4400';
const PAGES = ['/', '/about', '/product', '/contact', '/for-industries/pension-providers', '/for-industries/corporates', '/for-industries/partners', '/legal/privacy-policy'];
const out = [];
const add = (sev, cat, page, vp, msg) => out.push({ sev, cat, page, vp, msg });

const b = await chromium.launch();
for (const path of PAGES) {
  for (const [vp, size] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
    const ctx = await b.newContext({ viewport: size });
    await ctx.addInitScript(() => { try { localStorage.setItem('mw-cookie-ok', '1'); } catch {} });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);

    const r = await p.evaluate(() => {
      const res = { small: [], tiny: [], noDim: [], headings: [], hitGaps: 0, rawImg: 0, longLine: [] };
      // WCAG 2.5.8 target size (24x24 min) for web pointer targets
      document.querySelectorAll('a, button, input:not([type=hidden]), select, textarea, [role="tab"]').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return;
        // WCAG 2.5.8 exempts links inline in a sentence
        const inline = el.tagName === 'A' && el.closest('p, label, li.bullets, .prose, blockquote');
        if (inline) return;
        const label = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 34);
        if (b.width < 24 || b.height < 24) res.tiny.push(`${label} ${Math.round(b.width)}×${Math.round(b.height)}`);
        // 44px is native-app guidance; on web flag only real buttons and primary CTAs
        else if (b.height < 44 && (el.tagName === 'BUTTON' || el.classList.contains('btn'))) res.small.push(`${label} ${Math.round(b.width)}×${Math.round(b.height)}`);
      });
      // CLS: images must reserve space
      document.querySelectorAll('img').forEach((img) => {
        if (!img.getAttribute('width') || !img.getAttribute('height')) res.noDim.push(img.currentSrc.split('/').pop() || img.src);
        if (/\.(png|jpg|jpeg)(\?|$)/i.test(img.currentSrc) && !img.srcset) res.rawImg++;
      });
      // Heading order
      let last = 0;
      document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
        const lvl = +h.tagName[1];
        if (last && lvl > last + 1) res.headings.push(`${h.tagName} "${h.textContent.trim().slice(0, 30)}" after H${last}`);
        last = lvl;
      });
      // Body measure (readability): paragraphs wider than ~90ch
      document.querySelectorAll('p').forEach((el) => {
        const w = el.getBoundingClientRect().width;
        if (el.textContent.trim().length < 120) return;
        // Measure a real '0' glyph — an em-based estimate is wrong for DM Sans
        const probe = document.createElement('span');
        probe.textContent = '0'; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
        el.appendChild(probe); const chPx = probe.getBoundingClientRect().width; probe.remove();
        const ch = Math.round(w / chPx);
        if (ch > 90) res.longLine.push(`${ch}ch "${el.textContent.trim().slice(0, 30)}"`);
      });
      return res;
    });

    if (r.tiny.length) add('HIGH', 'Target size', path, vp, `${r.tiny.length} target(s) under 24×24: ${[...new Set(r.tiny)].slice(0, 3).join(' | ')}`);
    if (r.small.length) add('MED', 'Target size', path, vp, `${r.small.length} control(s) under 44px tall: ${[...new Set(r.small)].slice(0, 3).join(' | ')}`);
    if (r.noDim.length) add('HIGH', 'CLS', path, vp, `${r.noDim.length} image(s) without width/height: ${[...new Set(r.noDim)].slice(0, 2).join(', ')}`);
    if (r.rawImg) add('MED', 'Image format', path, vp, `${r.rawImg} raster image(s) served without srcset`);
    if (r.headings.length) add('MED', 'Heading order', path, vp, r.headings.slice(0, 2).join(' | '));
    if (r.longLine.length) add('LOW', 'Line length', path, vp, `${r.longLine.length} paragraph(s) over 90ch: ${r.longLine.slice(0, 1)}`);
    await ctx.close();
  }
}

// Focus visibility + form behaviour (desktop only)
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('mw-cookie-ok', '1'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/contact', { waitUntil: 'networkidle' });
  // Tab through and confirm every stop has a visible focus indicator
  let noRing = 0, stops = 0;
  for (let i = 0; i < 25; i++) {
    await p.keyboard.press('Tab');
    const ok = await p.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none', tag: el.tagName };
    });
    if (!ok) continue; stops++; if (!ok.ring) noRing++;
  }
  if (noRing) add('HIGH', 'Focus visible', '/contact', 'desktop', `${noRing} of ${stops} tab stops had no visible focus ring`);

  // Submit invalid form: does focus move to an error summary? are fields linked?
  await p.locator('button[type=submit]').click();
  await p.waitForTimeout(300);
  const form = await p.evaluate(() => {
    const err = document.querySelector('[data-form-error]');
    const a = document.activeElement;
    return {
      errShown: err && !err.hidden,
      errText: err?.textContent?.trim().slice(0, 60),
      focusMoved: a?.matches('[data-form-error], [data-form-error] *, :invalid'),
      focusTag: a?.tagName + (a?.id ? '#' + a.id : ''),
      linksToFields: !!document.querySelector('[data-form-error] a'),
      invalidMarked: document.querySelectorAll('[aria-invalid="true"]').length,
      describedBy: document.querySelectorAll('input[aria-describedby], select[aria-describedby]').length,
    };
  });
  if (form.errShown && !form.linksToFields) add('HIGH', 'Form errors', '/contact', 'desktop', `Error summary is not a focusable list linking to each invalid field (focus went to ${form.focusTag})`);
  if (form.errShown && form.invalidMarked === 0) add('MED', 'Form errors', '/contact', 'desktop', 'Invalid fields are not marked with aria-invalid, and no per-field error text is tied via aria-describedby');
  await ctx.close();
}

// Reduced motion
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const moving = await p.evaluate(() => [...document.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el);
    return (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0.05) || parseFloat(cs.transitionDuration) > 0.05;
  }).length);
  if (moving > 0) add('LOW', 'Reduced motion', '/', 'desktop', `${moving} element(s) still declare transitions/animations over 50ms under prefers-reduced-motion`);
  await ctx.close();
}
await b.close();

const order = { HIGH: 0, MED: 1, LOW: 2 };
out.sort((a, b) => order[a.sev] - order[b.sev]);
if (!out.length) console.log('UI audit: no findings');
for (const f of out) console.log(`[${f.sev}] ${f.cat} — ${f.page} (${f.vp}): ${f.msg}`);
