#!/usr/bin/env node
'use strict';

const { chromium } = require('/tmp/vintage-lp-browser/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.LP_BASE_URL || 'http://127.0.0.1:3010';
const outDir = path.join(process.cwd(), 'docs/discovery/evidence/release-lp');
fs.mkdirSync(outDir, { recursive: true });

async function shoot(browser, name, viewport) {
  const errors = [];
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el
      ? { tag: el.tagName, href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 80) }
      : null;
  });
  const checks = await page.evaluate(() => {
    const clipped = [];
    const candidates = [
      ...document.querySelectorAll(
        'a, button, h1, h2, h3, .retro-btn, .nav-pill, .event-card-link, .brand-mark, .menu-mode-card, .feature-card, .event-card'
      ),
    ];
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      let node = el;
      let hiddenByClip = false;
      while (node && node !== document.body) {
        const s = getComputedStyle(node);
        if (s.clipPath && s.clipPath !== 'none') {
          const ar = node.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (cx < ar.left - 1 || cx > ar.right + 1 || cy < ar.top - 1 || cy > ar.bottom + 1) hiddenByClip = true;
        }
        if ((s.overflow === 'hidden' || s.overflowX === 'hidden') && node !== el) {
          const ar = node.getBoundingClientRect();
          if (r.right > ar.right + 2 || r.left < ar.left - 2) hiddenByClip = true;
        }
        node = node.parentElement;
      }
      if (hiddenByClip) clipped.push({ text: (el.textContent || '').trim().slice(0, 40), tag: el.tagName });
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasLogoImg: !!document.querySelector('img[src*="vintage-arcade-logo"]'),
      hasPedidoTeste: !!document.querySelector('a[href*="pedido-teste"]'),
      hasSelectDecor: [...document.querySelectorAll('*')].some(
        (n) => n.childNodes.length === 1 && n.textContent === 'SELECT →'
      ),
      brandStatus: [...document.querySelectorAll('[data-brand-status]')].map((n) => n.getAttribute('data-brand-status')),
      hoursCopy: [...document.querySelectorAll('p')].some((p) =>
        p.textContent.includes('Consulte nossos horários pelo WhatsApp.')
      ),
      menuCtas: [...document.querySelectorAll('a')].filter((a) => a.textContent.trim() === 'Cardápio pelo WhatsApp')
        .length,
      eventLinks: [...document.querySelectorAll('a.event-card-link')].map((a) => a.textContent.trim()),
      whatsappOk: [...document.querySelectorAll('a[href*="wa.me"]')].every((a) => a.href.includes('551733402000')),
      clipped,
    };
  });
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return { file: path.relative(process.cwd(), file), bytes: fs.statSync(file).size, focused, checks, page_errors: errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = await shoot(browser, 'vintage-lp-release-desktop.png', { width: 1380, height: 1000 });
  const mobile = await shoot(browser, 'vintage-lp-release-mobile.png', { width: 390, height: 844 });
  await browser.close();

  const notFoundPedido = await fetch(base + '/pedido-teste').then((r) => r.status);
  const notFoundApi = await fetch(base + '/api/vintage-test/catalog').then((r) => r.status);
  const report = {
    scope: 'lp_release_isolated',
    base,
    desktop,
    mobile,
    routes: { home_expected: 200, pedido_teste: notFoundPedido, vintage_test_catalog: notFoundApi },
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'lp-release-ui-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));

  const fail = [];
  if (notFoundPedido !== 404 || notFoundApi !== 404) fail.push('commerce-routes');
  for (const shot of [desktop, mobile]) {
    if (shot.page_errors.length) fail.push('console');
    if (shot.checks.scrollWidth > shot.checks.clientWidth + 1) fail.push('overflow');
    if (shot.checks.hasLogoImg || shot.checks.hasPedidoTeste || shot.checks.hasSelectDecor) fail.push('forbidden');
    if (!shot.checks.hoursCopy || shot.checks.menuCtas < 2) fail.push('copy');
    if (shot.checks.eventLinks.length !== 3 || shot.checks.eventLinks.some((t) => t !== 'Consultar evento')) fail.push('events');
    if (!shot.checks.whatsappOk) fail.push('whatsapp');
    if (!shot.checks.brandStatus.includes('text-fallback')) fail.push('brand');
    if (shot.checks.clipped.length) fail.push('clip');
  }
  if (fail.length) {
    console.error('LP_RELEASE_UI_FAIL', fail);
    process.exit(1);
  }
  console.log('LP_RELEASE_UI_PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
