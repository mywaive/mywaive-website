// QA harness: screenshots, interaction checks and axe scans against the dev server.
import * as pw from 'playwright';
// BROWSER=chromium|firefox|webkit (default chromium); CHANNEL=chrome|msedge to drive an installed branded browser.
const engine = pw[process.env.BROWSER ?? 'chromium'];
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.PORT ?? 'http://localhost:3000';
const OUT = process.env.OUT ?? '/tmp/qa';
const pages = ['/', '/about', '/product', '/contact', '/for-industries/pension-providers', '/for-industries/corporates', '/for-industries/partners', '/legal/privacy-policy', '/404'];

const browser = await engine.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});
console.log(`engine: ${process.env.BROWSER ?? 'chromium'}${process.env.CHANNEL ? ' / ' + process.env.CHANNEL : ''} ${browser.version()}`);
const problems = [];

for (const path of pages) {
  for (const [name, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
    // Pass 1: real CSP — catch any policy violation or JS error the site itself causes.
    {
      const strict = await browser.newContext({ viewport: vp });
      const sp = await strict.newPage();
      const cspErrors = [];
      sp.on('console', (m) => m.type() === 'error' && /Content Security Policy|Refused to/.test(m.text()) && cspErrors.push(m.text().slice(0, 160)));
      sp.on('pageerror', (e) => cspErrors.push(e.message));
      await sp.goto(BASE + path, { waitUntil: 'networkidle' });
      if (cspErrors.length) problems.push(`${path} ${name}: CSP/JS errors: ${cspErrors.join(' | ')}`);
      await strict.close();
    }
    // Pass 2: CSP bypassed so axe can be injected.
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', bypassCSP: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !(path === '/404' && /404/.test(m.text())) && errors.push(m.text()));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => { try { localStorage.setItem('mw-cookie-ok', '1'); } catch {} document.querySelector('[data-cookie]')?.setAttribute('hidden', ''); });
    await page.evaluate(() => document.fonts.ready);

    // horizontal overflow check
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problems.push(`${path} ${name}: horizontal overflow ${overflow}px`);

    // axe
    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
    for (const v of axe.violations) problems.push(`${path} ${name}: [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target?.join(' ')}`);
    if (errors.length) problems.push(`${path} ${name}: JS errors: ${errors.join(' | ')}`);

    const slug = (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-'));
    await page.screenshot({ path: `${OUT}/${slug}-${name}.png`, fullPage: true });
    await ctx.close();
  }
}

// Interaction checks on home
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, bypassCSP: true });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('[data-cookie]')?.setAttribute('hidden', ''));
  const toggle = page.locator('[data-menu-toggle]');
  const box = await toggle.boundingBox();
  if (!box || box.width < 40) problems.push(`mobile: menu toggle not visible (${JSON.stringify(box)})`);
  await toggle.click();
  const navVisible = await page.locator('#primary-nav').isVisible();
  if (!navVisible) problems.push('mobile: nav did not open');
  await page.screenshot({ path: `${OUT}/home-mobile-menu-open.png` });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // interaction checks run under the real CSP
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('[data-cookie]')?.setAttribute('hidden', ''));
  // Cookie banner dismiss must hide it and persist across reload
  await page.evaluate(() => { try { localStorage.removeItem('mw-cookie-ok'); } catch {} });
  await page.reload({ waitUntil: 'networkidle' });
  if (!(await page.locator('[data-cookie]').isVisible())) problems.push('cookie banner not shown on first visit');
  await page.locator('[data-cookie-accept]').click();
  await page.waitForTimeout(100);
  if (await page.locator('[data-cookie]').isVisible()) problems.push('cookie banner still visible after OK');
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.locator('[data-cookie]').isVisible()) problems.push('cookie banner reappeared after reload');

  // Dropdown: hover trigger, then move onto a menu item — it must stay open and be clickable
  const trigger = page.locator('[data-dropdown] > button');
  await trigger.hover();
  await page.waitForTimeout(150);
  if (!(await page.locator('#menu-industries').isVisible())) problems.push('desktop: dropdown did not open on hover');
  const tb = (await trigger.boundingBox());
  await page.mouse.move(tb.x + 20, tb.y + tb.height + 4); // into the gap
  await page.waitForTimeout(100);
  await page.locator('#menu-industries a').nth(1).hover();
  await page.waitForTimeout(150);
  if (!(await page.locator('#menu-industries').isVisible())) problems.push('desktop: dropdown closed when moving onto a menu item');
  await page.screenshot({ path: `${OUT}/home-dropdown-open.png` });
  await page.locator('#menu-industries a').nth(1).click();
  await page.waitForLoadState('networkidle');
  if (!page.url().includes('/for-industries/corporates')) problems.push(`desktop: dropdown item click did not navigate (${page.url()})`);
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('[data-cookie]')?.setAttribute('hidden', ''));
  await page.keyboard.press('Escape');
  // Tab count varies by page, so derive the indices rather than hard-coding them
  const tabCount = await page.locator('[role="tab"]').count();
  const last = tabCount - 1;
  await page.locator(`#features-tab-${last}`).click();
  const pLast = await page.locator(`#features-panel-${last}`).isVisible();
  const p0 = await page.locator('#features-panel-0').isVisible();
  if (!pLast || p0) problems.push(`desktop: tabs broken (last panel visible=${pLast}, panel0 visible=${p0})`);
  await page.locator(`#features-tab-${last}`).press('ArrowDown'); // wraps to the first
  if (!(await page.locator('#features-panel-0').isVisible())) problems.push('desktop: tab arrow-key navigation broken');
  await page.locator('#features').screenshot({ path: `${OUT}/home-tabs-panel3.png` });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 600); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/home-scrolled-header.png`, clip: { x: 0, y: 0, width: 1440, height: 120 } });
  await ctx.close();
}
await browser.close();
console.log(problems.length ? problems.join('\n') : 'QA: no problems found');
