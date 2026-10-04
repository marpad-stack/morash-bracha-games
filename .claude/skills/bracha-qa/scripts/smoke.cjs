// smoke.cjs — בודק התפקוד: פותח כל חלק ב-320/390/1440, אוסף שגיאות, בקשות שנכשלו, גלילה אופקית,
// כפתורים קטנים, לוחץ על הכפתורים הגלויים, בודק שמירה. פלט: qa/out/smoke-results.json + צילומי מסך.
// גלילה אנכית: גלגלת (במחשב) והחלקת אצבע (במגע) בכל רוחב. WebKit ברוחב טלפון (iPhone 13) אם מותקן.
// שימוש: node smoke.cjs [--part=a,b] [--deep] [--no-webkit]   (דורש שרת: python -m http.server 8765 מהתיקייה הראשית)
const C = require('./_common.cjs');
const { fs, path, OUT, BASE, PARTS, EXTERNAL_OK } = C;
const deep = process.argv.includes('--deep');
const sel = C.only(process.argv);
const widths = [[320, 568], [390, 844], [1440, 900]];

// מדידת גלילה אנכית: סכום scrollY + scrollTop של כל המכלים הגלילים. מחזיר {needed, wheel, touch}.
const SCROLL_STATE = () => {
  const els = [document.scrollingElement || document.documentElement, ...document.querySelectorAll('body *')];
  let total = 0, maxGap = 0;
  for (const el of els) {
    const cs = getComputedStyle(el);
    const gap = el.scrollHeight - el.clientHeight;
    const root = el === document.scrollingElement || el === document.documentElement;
    if (gap > 4 && (root || /(auto|scroll)/.test(cs.overflowY)) && el.clientHeight > 80) { maxGap = Math.max(maxGap, gap); total += root ? window.scrollY : el.scrollTop; }
  }
  return { total: Math.round(total), maxGap: Math.round(maxGap) };
};
async function resetScroll(page) {
  await page.evaluate(() => { window.scrollTo(0, 0); for (const el of document.querySelectorAll('body *')) if (el.scrollTop) el.scrollTop = 0; }).catch(() => {});
}
async function checkVerticalScroll(page, w, h, touch) {
  const before = await page.evaluate(SCROLL_STATE).catch(() => null);
  if (!before) return { error: 'evaluate' };
  const out = { needed: before.maxGap > 4, gap: before.maxGap };
  if (!out.needed) return out;
  // גלגלת: עכבר באמצע המסך
  await resetScroll(page);
  await page.mouse.move(Math.round(w / 2), Math.round(h / 2)).catch(() => {});
  await page.mouse.wheel(0, 500).catch(() => {});
  await page.waitForTimeout(400);
  const afterWheel = await page.evaluate(SCROLL_STATE).catch(() => before);
  out.wheel = afterWheel.total > 0;
  // מגע: החלקה מלמטה למעלה (CDP בכרום; ב-WebKit — אירועי touch סינתטיים לא מגלגלים, לכן נמדד רק בכרום)
  if (touch) {
    await resetScroll(page);
    try {
      const cdp = await page.context().newCDPSession(page);
      const x = Math.round(w / 2), y0 = Math.round(h * 0.75), y1 = Math.round(h * 0.25);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
      for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: Math.round(y0 + (y1 - y0) * k / 8) }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
      const afterTouch = await page.evaluate(SCROLL_STATE).catch(() => before);
      out.touch = afterTouch.total > 0;
    } catch (e) { out.touch = 'n/a: ' + String(e).slice(0, 80); }
  }
  await resetScroll(page);
  return out;
}
async function webkitPass(pw, sel) {
  const out = { available: false, results: [] };
  let wk;
  try { wk = await pw.webkit.launch(); out.available = true; }
  catch (e) { out.reason = String(e).split('\n')[0].slice(0, 200); return out; }
  const dev = pw.devices['iPhone 13'];
  for (const [id, name, url] of PARTS) {
    if (sel && !sel.includes(id)) continue;
    const ctx = await wk.newContext({ ...dev, locale: 'he-IL' });
    const page = await ctx.newPage();
    const r = { id, name, width: dev.viewport.width, browser: 'webkit', errors: [] };
    page.on('pageerror', e => r.errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/.test(m.text())) r.errors.push(m.text().slice(0, 300)); });
    try {
      await page.goto(url.startsWith('http') ? url : BASE + url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(1200);
      Object.assign(r, await page.evaluate(() => ({ hOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth + 1, title: document.title })));
      r.scroll = await checkVerticalScroll(page, dev.viewport.width, dev.viewport.height, false);
      await page.screenshot({ path: path.join(OUT, `${id}-webkit-390.png`) }).catch(() => {});
    } catch (e) { r.fatal = String(e).slice(0, 300); }
    out.results.push(r);
    await ctx.close();
    process.stdout.write(`${id} webkit: err=${r.errors.length} overflow=${r.hOverflow} scroll=${JSON.stringify(r.scroll || {})} ${r.fatal ? 'FATAL' : ''}\n`);
  }
  await wk.close();
  return out;
}
(async () => {
  const pw = C.loadPlaywright();
  const browser = await C.launch(pw);
  const results = [];
  for (const [id, name, url] of PARTS) {
    if (sel && !sel.includes(id)) continue;
    for (const [w, h] of widths) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'he-IL', isMobile: w < 800, hasTouch: w < 800 });
      const page = await ctx.newPage();
      const r = { id, name, width: w, errors: [], warnings: [], failed: [], external: [], dialogs: [], navigations: [] };
      page.on('console', m => { if (m.type() === 'error' && /ERR_CERT_AUTHORITY_INVALID|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/.test(m.text())) r.external.push('סביבה: ' + m.text().slice(0, 100)); else if (m.type() === 'error') r.errors.push(m.text().slice(0, 300)); else if (m.type() === 'warning') r.warnings.push(m.text().slice(0, 200)); });
      page.on('pageerror', e => r.errors.push('pageerror: ' + String(e).slice(0, 300)));
      page.on('requestfailed', q => { const u = q.url(); if (EXTERNAL_OK.test(u)) r.external.push(u.slice(0, 120)); else r.failed.push(u.slice(0, 200) + ' :: ' + (q.failure() || {}).errorText); });
      page.on('response', s => { if (s.status() >= 400 && !EXTERNAL_OK.test(s.url())) r.failed.push(s.url().slice(0, 200) + ' :: HTTP ' + s.status()); });
      page.on('dialog', async d => { r.dialogs.push(d.type() + ': ' + d.message().slice(0, 120)); await d.dismiss().catch(() => {}); });
      page.on('framenavigated', f => { if (f === page.mainFrame() && !f.url().includes(url.split('?')[0].split('#')[0])) r.navigations.push(f.url().slice(0, 200)); });
      const t0 = Date.now();
      try {
        const full = url.startsWith('http') ? url : BASE + url;
        const resp = await page.goto(full, { waitUntil: 'load', timeout: 60000 });
        r.status = resp && resp.status();
        await page.waitForTimeout(1500);
        r.loadMs = Date.now() - t0;
        r.title = await page.title();
        const m = await page.evaluate(() => {
          const de = document.documentElement, b = document.body;
          const sw = Math.max(de.scrollWidth, b.scrollWidth), iw = window.innerWidth;
          const vis = el => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && rc.width > 0 && rc.height > 0; };
          const btns = [...document.querySelectorAll('button,[role=button],a[href]')].filter(vis);
          const small = btns.filter(el => { const rc = el.getBoundingClientRect(); return rc.width < 40 || rc.height < 40; }).map(el => ({ t: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }));
          const imgs = [...document.images]; const broken = imgs.filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => (i.getAttribute('src') || '').slice(0, 80));
          const vp = (document.querySelector('meta[name=viewport]') || {}).content || '';
          const zoomLocked = /maximum-scale\s*=\s*1(\.0)?\b|user-scalable\s*=\s*no/.test(vp);
          const hashLinks = [...document.querySelectorAll('a[href="#"]')].length;
          const extScripts = [...document.scripts].map(s => s.src).filter(s => s && !s.startsWith(location.origin));
          const fonts = [...new Set([...document.querySelectorAll('body *')].slice(0, 400).map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '')))].slice(0, 6);
          return { scrollWidth: sw, innerWidth: iw, hOverflow: sw > iw + 1, visibleButtons: btns.length, smallTargets: small, brokenImgs: broken, zoomLocked, viewport: vp, hashLinks, extScripts, lsKeys: Object.keys(localStorage).length, fonts, focusable: document.querySelectorAll('button:not([disabled]),a[href],input,select,textarea,[tabindex]').length, h1: document.querySelectorAll('h1').length, lang: de.lang, dir: de.dir, bodyText: (b.innerText || '').length };
        });
        Object.assign(r, m);
        r.scroll = await checkVerticalScroll(page, w, h, w < 800);
        if (w === 390 || w === 1440) await page.screenshot({ path: path.join(OUT, `${id}-${w}.png`) }).catch(() => {});
        if (w === 390) {
          const clicked = [];
          const n = Math.min(m.visibleButtons, 25);
          for (let k = 0; k < n; k++) {
            const ok = await page.evaluate((k) => {
              const vis = el => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && rc.width > 0 && rc.height > 0; };
              const btns = [...document.querySelectorAll('button,[role=button]')].filter(vis);
              const el = btns[k]; if (!el) return null; const label = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30); try { el.click(); } catch (e) { return 'ERR ' + label; } return label;
            }, k).catch(() => 'EVALERR');
            if (ok === null) break; clicked.push(ok);
            await page.waitForTimeout(250);
          }
          r.clicked = clicked;
          r.lsKeysAfter = await page.evaluate(() => Object.keys(localStorage).length).catch(() => -1);
          if (deep) await page.screenshot({ path: path.join(OUT, `${id}-390-deep.png`) }).catch(() => {});
          // רענון: האם המצב נשמר (מספר המפתחות לא ירד)
          await page.reload({ waitUntil: 'load' }).catch(() => {});
          r.lsKeysAfterReload = await page.evaluate(() => Object.keys(localStorage).length).catch(() => -1);
          r.errorsAfterClicks = r.errors.length;
        }
      } catch (e) { r.fatal = String(e).slice(0, 300); }
      results.push(r);
      await ctx.close();
      process.stdout.write(`${id} ${w}: err=${r.errors.length} failed=${r.failed.length} overflow=${r.hOverflow} btns=${r.visibleButtons} small=${(r.smallTargets || []).length} zoomLock=${r.zoomLocked} scroll=${JSON.stringify(r.scroll || {})} ${r.fatal ? 'FATAL' : ''}\n`);
    }
  }
  await browser.close();
  const webkit = process.argv.includes('--no-webkit') ? { available: false, reason: 'דולג (--no-webkit)' } : await webkitPass(pw, sel);
  if (!webkit.available) console.log('WebKit לא זמין: ' + webkit.reason);
  fs.writeFileSync(path.join(OUT, 'smoke-results.json'), JSON.stringify({ run: new Date().toISOString(), base: BASE, results, webkit }, null, 1));
  console.log('נשמר: qa/out/smoke-results.json');
})();
