#!/usr/bin/env node
'use strict';

const { chromium } = require('/tmp/vintage-lp-browser/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.LP_BASE_URL || 'http://127.0.0.1:3010';
const outDir = path.join(process.cwd(), 'docs/discovery/evidence/release-lp');
fs.mkdirSync(outDir, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844, file: 'vintage-lp-release-390.png' },
  { name: 'tablet-768', width: 768, height: 1024, file: 'vintage-lp-release-768.png' },
  { name: 'laptop-1024', width: 1024, height: 900, file: 'vintage-lp-release-1024.png' },
  { name: 'desktop-1380', width: 1380, height: 1000, file: 'vintage-lp-release-desktop.png' },
];

async function shoot(browser, viewport) {
  const errors = [];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
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
    const contentSelector =
      'a, button, h1, h2, h3, p, .retro-btn, .nav-pill, .event-card-link, .brand-mark, .menu-mode-card, .feature-card, .event-card';

    function clipPathValue(style) {
      return style.clipPath || style.webkitClipPath || 'none';
    }

    function hasClippingAncestor(el) {
      let node = el;
      while (node && node !== document.documentElement) {
        const s = getComputedStyle(node);
        const clip = clipPathValue(s);
        if (clip && clip !== 'none') {
          return {
            tag: node.tagName,
            className: typeof node.className === 'string' ? node.className.slice(0, 120) : '',
            clipPath: clip.slice(0, 160),
          };
        }
        node = node.parentElement;
      }
      return null;
    }

    const clippedByPolygon = [];
    const candidates = [...document.querySelectorAll(contentSelector)];
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const hit = hasClippingAncestor(el);
      if (hit) {
        clippedByPolygon.push({
          text: (el.textContent || '').trim().slice(0, 60),
          tag: el.tagName,
          ancestor: hit,
        });
      }
    }

    const playerCard = [...document.querySelectorAll('.feature-card, .menu-mode-card')].find((card) =>
      (card.textContent || '').includes('Comer e jogar no mesmo lugar')
    );
    const playerCardAudit = playerCard
      ? (() => {
          const title = playerCard.querySelector('h2, h3, h4, h5') || playerCard;
          const textNode = [...title.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
          let firstGlyph = null;
          if (textNode) {
            const range = document.createRange();
            const start = textNode.textContent.search(/\S/);
            range.setStart(textNode, Math.max(0, start));
            range.setEnd(textNode, Math.max(1, start + 1));
            const gr = range.getBoundingClientRect();
            firstGlyph = { left: gr.left, right: gr.right, width: gr.width, top: gr.top };
          }
          const r = playerCard.getBoundingClientRect();
          const clippingAncestor = hasClippingAncestor(playerCard);
          const glyphClipped =
            !firstGlyph ||
            firstGlyph.width < 1 ||
            firstGlyph.left < r.left - 0.5 ||
            firstGlyph.right > r.right + 0.5;
          return {
            text: (playerCard.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            clippingAncestor,
            glyphClipped,
            firstGlyph,
            rect: { left: r.left, right: r.right, width: r.width, top: r.top },
          };
        })()
      : null;

    const panelHosts = ['marquee-panel', 'screen-bezel', 'control-panel'].map((cls) => {
      const el = document.querySelector('.' + cls);
      if (!el) return { className: cls, present: false };
      const s = getComputedStyle(el);
      return {
        className: cls,
        present: true,
        hostClipPath: clipPathValue(s),
        hostPointerEvents: s.pointerEvents,
      };
    });

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasLogoImg: !!document.querySelector('img[src*="vintage-arcade-logo"]'),
      hasPedidoTeste: !!document.querySelector('a[href*="pedido-teste"]'),
      hasSelectDecor: [...document.querySelectorAll('*')].some(
        (n) => n.childNodes.length === 1 && n.textContent === 'SELECT →'
      ),
      brandStatus: [...document.querySelectorAll('[data-brand-status]')].map((n) =>
        n.getAttribute('data-brand-status')
      ),
      hoursCopy: [...document.querySelectorAll('p')].some((p) =>
        p.textContent.includes('Consulte nossos horários pelo WhatsApp.')
      ),
      menuCtas: [...document.querySelectorAll('a')].filter(
        (a) => a.textContent.trim() === 'Cardápio pelo WhatsApp'
      ).length,
      eventLinks: [...document.querySelectorAll('a.event-card-link')].map((a) => a.textContent.trim()),
      whatsappOk: [...document.querySelectorAll('a[href*="wa.me"]')].every((a) =>
        a.href.includes('551733402000')
      ),
      clippedByPolygon,
      playerCardAudit,
      panelHosts,
    };
  });

  const cardShot = path.join(outDir, viewport.file.replace('.png', '-player1-card.png'));
  const player = page
    .locator('.feature-card, .menu-mode-card', { hasText: 'Comer e jogar no mesmo lugar' })
    .first();
  if ((await player.count()) > 0) {
    await player.scrollIntoViewIfNeeded();
    await player.screenshot({ path: cardShot });
  }

  const file = path.join(outDir, viewport.file);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return {
    name: viewport.name,
    viewport: { width: viewport.width, height: viewport.height },
    file: path.relative(process.cwd(), file),
    card_file: fs.existsSync(cardShot) ? path.relative(process.cwd(), cardShot) : null,
    bytes: fs.statSync(file).size,
    focused,
    checks,
    page_errors: errors,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const shots = [];
  for (const vp of VIEWPORTS) {
    shots.push(await shoot(browser, vp));
  }
  await browser.close();

  const desktop = shots.find((s) => s.name === 'desktop-1380');
  const mobile = shots.find((s) => s.name === 'mobile-390');

  const notFoundPedido = await fetch(base + '/pedido-teste').then((r) => r.status);
  const notFoundApi = await fetch(base + '/api/vintage-test/catalog').then((r) => r.status);
  const report = {
    scope: 'lp_release_isolated',
    base,
    shots,
    desktop,
    mobile,
    routes: { home_expected: 200, pedido_teste: notFoundPedido, vintage_test_catalog: notFoundApi },
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'lp-release-ui-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));

  const fail = [];
  if (notFoundPedido !== 404 || notFoundApi !== 404) fail.push('commerce-routes');
  for (const shot of shots) {
    if (shot.page_errors.length) fail.push(shot.name + ':console');
    if (shot.checks.scrollWidth > shot.checks.clientWidth + 1) fail.push(shot.name + ':overflow');
    if (shot.checks.hasLogoImg || shot.checks.hasPedidoTeste || shot.checks.hasSelectDecor) {
      fail.push(shot.name + ':forbidden');
    }
    if (!shot.checks.hoursCopy || shot.checks.menuCtas < 2) fail.push(shot.name + ':copy');
    if (
      shot.checks.eventLinks.length !== 3 ||
      shot.checks.eventLinks.some((t) => t !== 'Consultar evento')
    ) {
      fail.push(shot.name + ':events');
    }
    if (!shot.checks.whatsappOk) fail.push(shot.name + ':whatsapp');
    if (!shot.checks.brandStatus.includes('text-fallback')) fail.push(shot.name + ':brand');
    if (shot.checks.clippedByPolygon.length) fail.push(shot.name + ':clip-path-ancestor');
    if (!shot.checks.playerCardAudit || shot.checks.playerCardAudit.clippingAncestor) {
      fail.push(shot.name + ':player1-clip');
    }
    if (shot.checks.playerCardAudit && shot.checks.playerCardAudit.glyphClipped) {
      fail.push(shot.name + ':player1-glyph-clip');
    }
    for (const host of shot.checks.panelHosts) {
      if (!host.present) fail.push(shot.name + ':missing-' + host.className);
      else if (host.hostClipPath && host.hostClipPath !== 'none') {
        fail.push(shot.name + ':host-clip-' + host.className);
      }
    }
    if (!shot.card_file || !fs.existsSync(path.join(process.cwd(), shot.card_file))) {
      fail.push(shot.name + ':card-screenshot');
    } else if (fs.statSync(path.join(process.cwd(), shot.card_file)).size < 500) {
      fail.push(shot.name + ':card-screenshot-tiny');
    }
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
