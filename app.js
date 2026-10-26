// Seinokojii Project, пятая версия (19.10.2026) — пиксельная, как Instagram. Заставка (логотип из пикселей → название печатается → экран рассыпается квадратами),
// звёзды, первый экран «из пикселя в сайт» (логотип разбегается от курсора и проявляется в примеры), примеры проявляются из крупных блоков,
// сцена «Как это работает» (живой «Кайчы» в телефоне — перенесена из четвёртой версии без изменений логики), полоса загрузки, слово в подвале, заявка в WhatsApp.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, k) => a + (b - a) * k;
  const now = () => (window.__ft !== undefined ? window.__ft : performance.now());        // при съёмке ролика время двигает сценарий
  const INK = '#F4F4EF', BG = '#0A0A0F', LINE = '#24242C', LINE2 = '#3A3A45';
  // логотип — та же карта, что в сторис Instagram (reels-v2/src/px/Stories.tsx)
  const LOGO = ['..wwwwwwwwwwww..', '.w............w.', 'w..............w', 'w.w.w.w........w', 'wwwwwwwwwwwwwwww', 'w..............w', 'w..wwwww.......w',
    'w..............w', 'w..www...wwwww.w', 'w........wwwww.w', 'w........wwwww.w', 'w........wwwww.w', '.w............w.', '..wwwwwwwwwwww..'];
  const cells = m => { const out = []; m.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') out.push([x, y]); })); return out; };
  const seeded = sd => () => (sd = (sd * 16807) % 2147483647) / 2147483647;     // свой генератор с зерном: один и тот же рисунок при каждой перенастройке холста
  const hidpi = (cv, w, h) => { const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(w * d); cv.height = Math.round(h * d); const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.imageSmoothingEnabled = false; return c; };
  const fontsReady = () => Promise.race([Promise.all([document.fonts.load('8px PS2P', 'SEINOKOJII'), document.fonts.load('800 40px Handjet', 'Project')]), new Promise(r => setTimeout(r, 1200))]).catch(() => {});

  // ---------- картинка крупными блоками: n блоков по ширине; серая, пока блоки крупные
  const off = document.createElement('canvas'), oc = off.getContext('2d');
  const pixelate = (c, img, n, W, H, gray) => {
    const w = Math.max(1, Math.round(n)), h = Math.max(1, Math.round(n * H / W)); off.width = w; off.height = h; oc.imageSmoothingEnabled = true; oc.drawImage(img, 0, 0, w, h);
    c.save(); c.imageSmoothingEnabled = false; if (gray) c.filter = 'grayscale(1) contrast(1.15) brightness(1.05)'; c.drawImage(off, 0, 0, W, H); c.restore(); };

  // ---------- страна (23.10.2026): цены в сомах, рублях, тенге или леях. Выбор: ?c=ru → прошлый выбор на этом устройстве → часовой пояс → Кыргызстан.
  // Числа и подписи с data-r / data-rc меняются на месте, язык один — русский.
  const REG = JSON.parse($('#reg').textContent), RU_TZ = /^(Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Saratov|Ulyanovsk|Astrakhan|Kirov|Simferopol)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr))$/;
  const byTz = () => { let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return tz === 'Asia/Bishkek' ? 'kg' : /^Asia\/(Almaty|Qostanay|Aqtobe|Aqtau|Atyrau|Oral|Qyzylorda)$/.test(tz) ? 'kz' : /^Europe\/(Chisinau|Tiraspol)$/.test(tz) ? 'md' : RU_TZ.test(tz) ? 'ru' : 'kg'; };
  const saved = () => { try { return localStorage.getItem('cc'); } catch (e) { return null; } };
  let cc = [new URLSearchParams(location.search).get('c'), saved(), byTz()].find(k => k && REG[k]);
  const nb = v => v.replace(/ /g, '\u00a0');
  const applyReg = () => { const g = REG[cc];
    $$('[data-r]').forEach(el => { el.textContent = nb(g[el.dataset.r]); });
    $$('[data-rc]').forEach(el => { el.dataset.count = g[el.dataset.rc]; });
    $$('[data-cc]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cc === cc)));
    // (26.10.2026) примеры, профиль в сцене «Как это работает» и подсказка в заявке — свои у каждой страны
    $$('[data-set]').forEach(el => { el.hidden = el.dataset.set !== cc; });
    const co = $('input[name="company"]'); if (co && co.dataset.ph) co.placeholder = 'Например: ' + JSON.parse(co.dataset.ph)[cc];
    document.dispatchEvent(new CustomEvent('cc', { detail: cc })); };
  applyReg();

  // ---------- заставка: логотип из пикселей → печатается название → (23.10.2026) «Выберите страну»: логотип уезжает вверх, кнопки стран проявляются
  // ступеньками; после выбора экран рассыпается квадратами ОТ нажатой кнопки. Если страна уже в ссылке (?c=ru) — без вопроса, как раньше.
  // При «меньше движения» вопрос тот же, но без анимации. При возврате из примера («К работам») — ни заставки, ни вопроса.
  const intro = $('.intro'), ask = $('.ask'), fromEx = root.classList.contains('from-ex'), asking = !fromEx && !REG[new URLSearchParams(location.search).get('c')];
  const hasIntro = !root.classList.contains('no-intro') || (asking && calm);
  clearTimeout(window.__it);                                                       // страховка из <head> нужна, только если app.js не загрузился
  const ready = () => { root.classList.remove('intro-on'); root.classList.add('ready'); intro && intro.remove(); };
  // ждём нажатия; возвращает точку, откуда рассыпать экран
  const choose = () => new Promise(res => { const bs = $$('.ask-b', ask);
    bs.forEach(b => { b.classList.toggle('near', b.dataset.pick === cc);
      b.addEventListener('click', () => { if (ask.classList.contains('done')) return; ask.classList.add('done'); b.classList.add('hit'); setCC(b.dataset.pick, true);
        const r = b.getBoundingClientRect(); setTimeout(() => res([r.left + r.width / 2, r.top + r.height / 2]), calm ? 0 : 380); }); });
    ask.hidden = false; requestAnimationFrame(() => { ask.classList.add('on'); if (fine) setTimeout(() => (bs.find(b => b.dataset.pick === cc) || bs[0]).focus({ preventScroll: true }), calm ? 0 : 700); }); });
  async function playIntro() {
    const cv = $('.intro-c'), W = innerWidth, H = innerHeight, c = hidpi(cv, W, H); await fontsReady();
    const S = Math.floor(Math.min(W * (W < 700 ? .36 : .2) / 16, H * (asking ? .17 : .24) / 14)), lx = Math.round((W - 16 * S) / 2), ly = Math.round(H * .42 - 14 * S), px = cells(LOGO), rnd = seeded(2026);
    const at = px.map(() => rnd() * .75), fs = Math.round(clamp(W * .04, 16, asking ? 32 : 40) / 4) * 4, word = 'SEINOKOJII', ty = ly + 14 * S + fs * 1.6;
    const CELL = Math.ceil(Math.max(W, H) / 22), cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL), noise = Array.from({ length: cols * rows }, () => rnd());
    // куда уехать логотипу, чтобы логотип + вопрос стояли по центру экрана
    let dy = 0; if (asking) { ask.hidden = false; const top = ty + fs * 2.8, gap = Math.max(24, H * .05), h = top - ly + gap + ask.offsetHeight, y0 = Math.max(16, (H - h) / 2);
      dy = y0 - ly; ask.style.setProperty('--ask-y', Math.round(y0 + top - ly + gap) + 'px'); ask.hidden = true; }
    let order = noise, T_OUT = asking ? Infinity : 2.05, t0 = performance.now(), asked = false;
    const T_TYPE = .85, T_UP = 1.9, ease = k => 1 - Math.pow(1 - clamp(k), 3);
    const tick = () => { const t = (performance.now() - t0) / 1000, T_END = T_OUT + .6; c.fillStyle = BG; c.fillRect(0, 0, W, H);
      c.save(); c.translate(0, Math.round(dy * (calm ? 1 : ease((t - T_UP) / .5))));
      c.fillStyle = INK; px.forEach(([x, y], i) => { if (t > at[i]) c.fillRect(lx + x * S, ly + y * S, S, S); });
      const n = clamp(Math.floor((t - T_TYPE) / .07), 0, word.length); c.font = `${fs}px PS2P`; c.textBaseline = 'top'; c.textAlign = 'left';
      const tw = c.measureText(word).width, tx = Math.round((W - tw) / 2); c.fillText(word.slice(0, n), tx, ty);
      if (t > T_TYPE && t < T_UP && Math.floor(t * 5) % 2 === 0) c.fillRect(tx + c.measureText(word.slice(0, n)).width + fs * .2, ty, fs * .7, fs);
      if (t > T_TYPE + .75) { c.font = `600 ${Math.round(fs * .9)}px Handjet`; c.fillStyle = '#A2A2AB'; c.textAlign = 'center'; try { c.letterSpacing = (fs * .5) + 'px'; } catch (e) {} c.fillText('PROJECT', W / 2 + fs * .25, ty + fs * 1.8); try { c.letterSpacing = '0px'; } catch (e) {} }
      c.restore();
      if (asking && !asked && t > T_UP + .35) { asked = true;
        choose().then(([cx, cy]) => { const md = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));   // волна квадратов от кнопки
          order = noise.map((r, i) => Math.hypot((i % cols + .5) * CELL - cx, (Math.floor(i / cols) + .5) * CELL - cy) / md * .8 + r * .2);
          T_OUT = (performance.now() - t0) / 1000; ask.classList.add('out'); }); }
      if (t > T_OUT) { const k = (t - T_OUT) / (T_END - T_OUT); if (!root.classList.contains('ready')) root.classList.add('ready');
        for (let i = 0; i < order.length; i++) if (order[i] < k * 1.05) c.clearRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL); }
      if (t < T_END) requestAnimationFrame(tick); else ready(); };
    requestAnimationFrame(tick);
  }
  if (hasIntro) { scrollTo(0, 0); addEventListener('load', () => scrollTo(0, 0), { once: true });       // заставка всегда открывает сайт с самого начала (QR с визитки, ссылка из Instagram)
    if (calm) { root.classList.add('intro-on'); choose().then(ready); }
    else { playIntro().catch(ready); if (!asking) setTimeout(() => { if (!root.classList.contains('ready') || $('.intro')) ready(); }, 4500); } }
  else { intro && intro.remove(); requestAnimationFrame(() => root.classList.add('ready')); }

  // ---------- звёзды: редкие пиксели на фоне, мигают ступеньками три раза в секунду. Перенастройка только при смене ширины окна:
  // на телефоне прячущаяся адресная строка меняет высоту — если на это пересоздавать рисунок, звёзды прыгают.
  const sky = $('.stars'); let skyW = 0, stars = [], sc;
  const skySize = () => { if (innerWidth === skyW) return; skyW = innerWidth; const H = Math.max(innerHeight, screen.height || 0); sc = hidpi(sky, skyW, H); sky.style.height = H + 'px'; const r = seeded(77);
    stars = Array.from({ length: Math.round(skyW * H / 16000) }, () => ({ x: Math.floor(r() * skyW / 2) * 2, y: Math.floor(r() * H / 2) * 2, s: r() < .12 ? 3 : 2, a: .08 + r() * .22, ph: r() })); };
  const skyDraw = t => { sc.clearRect(0, 0, sky.width, sky.height); for (const s of stars) { const on = calm ? 1 : (Math.floor(t * 3 + s.ph * 7) % 5 === 0 ? 2.4 : 1); sc.fillStyle = `rgba(244,244,239,${Math.min(.75, s.a * on)})`; sc.fillRect(s.x, s.y, s.s, s.s); } };
  skySize(); skyDraw(0); addEventListener('resize', () => { skySize(); skyDraw(now() / 1000); });
  if (!calm) setInterval(() => skyDraw(now() / 1000), 333);

  // ---------- первый экран: «из пикселя в сайт». Логотип из пикселей (каждый — четыре кусочка) пружинит и разбегается от курсора.
  // Раз в несколько секунд кусочки разлетаются по экрану, на их месте проявляется пример: блоки мельчают, серый становится цветным. Потом обратно в логотип.
  // Пока виден пример, вокруг курсора — «пиксельная лупа»: картинка там снова крупными блоками.
  const forge = $('.forge'), hostEl = $('[data-host]'), modeEl = $('[data-mode]'), WORKS_BY = JSON.parse(forge.dataset.works);
  // набор примеров выбранной страны; картинки грузятся, когда страна выбрана впервые
  const imgOf = {}, pic = k => imgOf[k] || (imgOf[k] = Object.assign(new Image(), { decoding: 'async', src: `img/${k}-d.webp` }));
  let WORKS = WORKS_BY[cc] || WORKS_BY.kg, imgs = WORKS.map(([k]) => pic(k));
  document.addEventListener('cc', e => { WORKS = WORKS_BY[e.detail] || WORKS_BY.kg; imgs = WORKS.map(([k]) => pic(k)); wi = Math.min(wi, WORKS.length - 1); });
  let fc, FW = 0, FH = 0, parts = [], S = 0, fOn = true, fm = { x: -1e4, y: -1e4, on: false };
  const forgeSize = () => { const w = forge.clientWidth; if (!w || w === FW) return; FW = w; FH = forge.clientHeight; fc = hidpi(forge, FW, FH);
    S = Math.floor(Math.min(FW * .58 / 16, FH * .66 / 14) / 2) * 2; const ox = Math.round((FW - 16 * S) / 2), oy = Math.round((FH - 14 * S) / 2), h = S / 2, r = seeded(11);
    parts = []; cells(LOGO).forEach(([x, y]) => { for (let k = 0; k < 4; k++) { const hx = ox + x * S + (k % 2) * h, hy = oy + y * S + (k >> 1) * h; parts.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, rx: Math.floor(r() * FW / h) * h, ry: Math.floor(r() * FH / h) * h, d: r() }); } }); };
  forgeSize(); addEventListener('resize', forgeSize); addEventListener('load', forgeSize);
  new IntersectionObserver(es => { fOn = es[0].isIntersecting; }).observe(forge);
  const fmove = ev => { const r = forge.getBoundingClientRect(); fm.x = ev.clientX - r.left; fm.y = ev.clientY - r.top; fm.on = true; };
  forge.addEventListener('pointermove', fmove); forge.addEventListener('pointerdown', fmove); forge.addEventListener('pointerleave', () => { fm.on = false; fm.x = fm.y = -1e4; });
  // сценарий: logo → burst → resolve → hold → coarsen → gather → logo; длительности в секундах
  const PH = { logo: 3.4, burst: .55, resolve: .9, hold: 2.8, coarsen: .5, gather: .75 }, ORDER = ['logo', 'burst', 'resolve', 'hold', 'coarsen', 'gather'], STEPS = [5, 8, 13, 21, 34, 55, 90, 150, 0];
  let ph = 'logo', phAt = now(), wi = -1, last = now();
  const setMode = (host, mode) => { if (hostEl.textContent !== host) hostEl.textContent = host; if (modeEl.textContent !== mode) modeEl.textContent = mode; };
  const ease = k => 1 - Math.pow(1 - k, 3);
  const drawGrid = () => { fc.fillStyle = '#16161D'; const g = S / 2; for (let y = g / 2; y < FH; y += g) for (let x = g / 2; x < FW; x += g) fc.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); };
  const forgeFrame = () => {
    if (!fOn || !fc || !root.classList.contains('ready')) return;
    const t = now(), dt = Math.min(.05, (t - last) / 1000); last = t; let k = (t - phAt) / 1000 / PH[ph];
    if (k >= 1 && !(ph === 'logo' && calm)) { ph = ORDER[(ORDER.indexOf(ph) + 1) % ORDER.length]; phAt = t; k = 0; if (ph === 'burst') wi = (wi + 1) % WORKS.length;
      if (ph === 'burst' && !(imgs[wi].complete && imgs[wi].naturalWidth)) { ph = 'logo'; phAt = t - PH.logo * 600; } }
    const img = imgs[Math.max(0, wi)], h = S / 2, gap = Math.max(1, Math.round(h * .1));
    fc.fillStyle = BG; fc.fillRect(0, 0, FW, FH);
    if (ph === 'logo' || ph === 'gather' || ph === 'burst') {
      drawGrid(); setMode('seinokojii.project', 'логотип');
      if (ph === 'burst' && k > .4) { fc.globalAlpha = clamp((k - .4) * 2.5); pixelate(fc, img, STEPS[0], FW, FH, true); fc.globalAlpha = 1; }    // под разлетающимися кусочками уже проступает пример
      fc.fillStyle = INK;
      for (const p of parts) {
        if (ph === 'logo') { // пружина к своему месту + отталкивание от курсора
          let ax = (p.hx - p.x) * 90, ay = (p.hy - p.y) * 90; const dx = p.x + h / 2 - fm.x, dy = p.y + h / 2 - fm.y, d2 = dx * dx + dy * dy, R = S * 3.2;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 26000; ax += dx / d * f; ay += dy / d * f; }
          p.vx = (p.vx + ax * dt) * Math.pow(.0009, dt); p.vy = (p.vy + ay * dt) * Math.pow(.0009, dt); p.x += p.vx * dt; p.y += p.vy * dt;
        } else { const q = ease(clamp((ph === 'burst' ? k : 1 - k) * 1.3 - p.d * .3)); p.x = lerp(p.hx, p.rx, q); p.y = lerp(p.hy, p.ry, q); p.vx = p.vy = 0; }
        const sz = ph === 'burst' ? h * (1 - ease(k) * .5) : ph === 'gather' ? h * (.5 + ease(k) * .5) : h;
        fc.globalAlpha = ph === 'burst' ? 1 - clamp(k * 1.4 - .4) : ph === 'gather' ? clamp(k * 3) : 1;
        fc.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, Math.max(2, sz - gap), Math.max(2, sz - gap));
      }
      fc.globalAlpha = 1; return;
    }
    setMode(WORKS[wi][1] + '.com', 'пример');
    if (ph === 'resolve' || ph === 'coarsen') { const kk = ph === 'resolve' ? k : 1 - k, i = Math.min(STEPS.length - 1, Math.floor(kk * STEPS.length)), n = STEPS[i];
      if (n) pixelate(fc, img, n, FW, FH, i < 4); else fc.drawImage(img, 0, 0, FW, FH); return; }
    fc.drawImage(img, 0, 0, FW, FH);
    if (fm.on) { const L = Math.round(Math.min(FW, FH) * .2), x = clamp(fm.x - L, 0, FW - 2 * L), y = clamp(fm.y - L, 0, FH - 2 * L);   // пиксельная лупа
      fc.save(); fc.beginPath(); fc.rect(x, y, 2 * L, 2 * L); fc.clip(); pixelate(fc, img, 24, FW, FH, true); fc.restore();
      fc.strokeStyle = INK; fc.lineWidth = 3; fc.strokeRect(x + 1.5, y + 1.5, 2 * L - 3, 2 * L - 3); phAt += dt * 1000 * .7; }    // пока лупа на картинке, пример держится дольше
  };

  // ---------- живая матрица за первым экраном (21.10.2026): тусклая сетка пикселей во весь фон. Курсор или палец оставляет светящийся след,
  // касание пускает волну, а сама волна раз в несколько секунд расходится от цены — на телефоне эффект виден, даже если ничего не трогать.
  // Яркость клетки — четыре ступени, как у 8-бит. Сетка строится заново только при смене ширины (адресная строка телефона меняет высоту — не реагируем).
  const hero = $('.hero'), fcv = $('.field'), priceEl = $('.hero h1 em');
  const TONES = ['#1E1E27', '#34343F', '#5A5A66', '#9A9AA3'];
  let gc, gW = 0, gH = 0, G = 16, gcols = 0, grows = 0, en = new Float32Array(0), base = null, gOn = true, waves = [], gPt = null, gLast = now(), nextWave = 0;
  const fieldSize = () => { const w = hero.clientWidth; if (!w || w === gW) return; gW = w; gH = Math.max(hero.clientHeight, innerHeight); G = w < 700 ? 14 : 16;
    gc = hidpi(fcv, gW, gH); gcols = Math.ceil(gW / G); grows = Math.ceil(gH / G); en = new Float32Array(gcols * grows);
    base = document.createElement('canvas'); const bc = hidpi(base, gW, gH); bc.fillStyle = '#1B1B23';
    for (let y = 0; y < grows; y++) for (let x = 0; x < gcols; x++) bc.fillRect(x * G + G / 2 - 1, y * G + G / 2 - 1, 2, 2); };
  fieldSize(); addEventListener('resize', fieldSize); addEventListener('load', fieldSize);
  new IntersectionObserver(es => { gOn = es[0].isIntersecting; }).observe(hero);
  const heroXY = (cx, cy) => { const r = hero.getBoundingClientRect(); return [(cx - r.left) / G, (cy - r.top) / G]; };
  const wave = (x, y, power = 1) => { if (waves.length < 6) waves.push({ x, y, t: now(), p: power }); };
  const fromPrice = () => { const r = priceEl.getBoundingClientRect(); return heroXY(r.left + r.width / 2, r.top + r.height / 2); };
  const trail = (cx, cy) => { const p = heroXY(cx, cy); if (gPt) { const n = Math.ceil(Math.hypot(p[0] - gPt[0], p[1] - gPt[1]) * 2);   // по пути между событиями — чтобы след был сплошным
      for (let i = 1; i <= n; i++) lit(lerp(gPt[0], p[0], i / n), lerp(gPt[1], p[1], i / n)); } else lit(p[0], p[1]); gPt = p; };
  const lit = (fx, fy) => { const R = 1.9; for (let y = Math.floor(fy - R); y <= fy + R; y++) for (let x = Math.floor(fx - R); x <= fx + R; x++) {
      if (x < 0 || y < 0 || x >= gcols || y >= grows) continue; const d = Math.hypot(x + .5 - fx, y + .5 - fy) / R; if (d < 1) { const i = y * gcols + x; en[i] = Math.max(en[i], 1 - d * .7); } } };
  if (!calm) {
    hero.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse') trail(ev.clientX, ev.clientY); });
    hero.addEventListener('pointerleave', () => { gPt = null; });
    hero.addEventListener('pointerdown', ev => { const p = heroXY(ev.clientX, ev.clientY); wave(p[0], p[1]); gPt = null; });
    hero.addEventListener('touchmove', ev => { const t = ev.touches[0]; if (t) trail(t.clientX, t.clientY); }, { passive: true });
    hero.addEventListener('touchend', () => { gPt = null; }, { passive: true });
  }
  const fieldFrame = () => {
    if (!gOn || !gc || !root.classList.contains('ready')) return;
    const t = now(), dt = Math.min(.05, (t - gLast) / 1000); gLast = t;
    if (!calm && t > nextWave) { if (nextWave) { const p = fromPrice(); wave(p[0], p[1], .72); } nextWave = t + (nextWave ? 4200 : 1400); }
    const fade = Math.pow(.002, dt);
    for (let i = 0; i < en.length; i++) en[i] *= fade;
    waves = waves.filter(w => { const age = (t - w.t) / 1000, life = 2.4; if (age > life) return false;
      const rad = age * (gW < 700 ? 15 : 24), k = (1 - age / life) * w.p, y0 = Math.max(0, Math.floor(w.y - rad - 1)), y1 = Math.min(grows - 1, Math.ceil(w.y + rad + 1));
      for (let y = y0; y <= y1; y++) for (let x = 0; x < gcols; x++) { const d = Math.abs(Math.hypot(x + .5 - w.x, y + .5 - w.y) - rad); if (d < 1.1) { const i = y * gcols + x; en[i] = Math.max(en[i], k * (1 - d / 1.1 * .5)); } }
      return true; });
    gc.clearRect(0, 0, gW, gH); gc.drawImage(base, 0, 0, gW, gH);
    for (let lv = 0; lv < 4; lv++) { gc.fillStyle = TONES[lv]; const lo = (lv + 1) * .2;
      for (let i = 0; i < en.length; i++) { const e = en[i]; if (e < lo || (lv < 3 && e >= lo + .2)) continue; const x = i % gcols, y = (i - x) / gcols; gc.fillRect(x * G + 2, y * G + 2, G - 4, G - 4); } }
  };

  // ---------- цены — счёт как в аркаде: от «00 000» до цены ступеньками, в конце плашка дважды мигает. Без JS и при «меньше движения» — сразу цена.
  const fmt = (v, len) => String(v).padStart(len, '0').replace(/\B(?=(\d{3})+$)/g, ' ');
  const counters = $$('[data-count]').map(el => { const c = { el, done: calm }, html = el.innerHTML.includes('gap');
    c.set = () => { c.to = +el.dataset.count.replace(/\D/g, ''); c.len = String(c.to).length; };
    c.show = v => { const s = fmt(v, c.len); if (html) el.innerHTML = s.replace(' ', "<i class='gap'></i>"); else el.textContent = s.replace(' ', ' '); };
    c.set(); if (!calm) c.show(0); return c; });
  const countUp = c => { if (c.done) return; c.done = true; const N = 22; let i = 0;
    const id = setInterval(() => { i++; const k = 1 - Math.pow(1 - i / N, 2.4); c.show(i >= N ? c.to : Math.round(c.to * k / 100) * 100);
      if (i >= N) { clearInterval(id); c.el.classList.add('hit'); } }, 48); };
  const heroCount = counters.find(c => c.el === priceEl);
  // смена страны: подписи сразу, цены пересчитываются заново (уже показанные — с начала, ещё не показанные ждут прокрутки)
  function setCC(k, keep) { if (keep) try { localStorage.setItem('cc', k); } catch (e) {}
    if (k === cc) return; cc = k;
    const shown = counters.filter(c => c.done && !calm); applyReg(); counters.forEach(c => { c.set(); c.el.classList.remove('hit'); c.show(calm ? c.to : 0); });
    shown.forEach(c => { c.done = false; countUp(c); }); form.dispatchEvent(new Event('input')); }
  $$('[data-cc]').forEach(b => b.addEventListener('click', () => setCC(b.dataset.cc, true)));
  const waitReady = setInterval(() => { if (root.classList.contains('ready')) { clearInterval(waitReady); setTimeout(() => heroCount && countUp(heroCount), 650); } }, 100);

  // ---------- примеры: картинка проявляется из крупных блоков, когда карточка на экране; при наведении — ещё раз, быстро
  const runPix = (cv, img, steps, ms) => { const r = cv.getBoundingClientRect(), c = hidpi(cv, r.width, r.height); cv.classList.remove('gone'); let i = 0; clearInterval(cv._t);
    const go = () => { if (i >= steps.length) { clearInterval(cv._t); cv.classList.add('gone'); return; } pixelate(c, img, steps[i], r.width, r.height, i < steps.length * .45); i++; };
    go(); cv._t = setInterval(go, ms); };
  $$('.pxl').forEach(cv => { const img = cv.nextElementSibling; if (calm) { cv.classList.add('gone'); return; }
    const ok = () => img.complete && img.naturalWidth ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); img.loading = 'eager'; ok().then(() => setTimeout(() => runPix(cv, img, [4, 7, 11, 17, 26, 40, 62, 96, 150, 240], 85), 250)); }, { threshold: .35 });
    io.observe(cv);
    if (fine) cv.closest('.work').addEventListener('pointerenter', () => { if (img.naturalWidth && cv.classList.contains('gone')) runPix(cv, img, [18, 30, 52, 90, 160], 55); }); });

  // ---------- появление блоков (ступенчатая шторка в CSS) и полоса загрузки под шагами. Не IntersectionObserver: Chrome считает видимость с учётом clip-path
  // самого блока, а закрытый шторкой блок — это нулевая полоска у его верхнего края; если перейти по ссылке в середину высокого блока, он бы так и не появился.
  // getBoundingClientRect шторку не учитывает — блок открывается, как только его верх поднялся выше 92% окна (в том числе если он уже выше экрана).
  let pending = $$('.rv');
  const fill = el => { let v = 0; const bar = $('i', el), id = setInterval(() => { v = Math.min(1, v + 1 / 18); bar.style.setProperty('--lp', v.toFixed(3)); if (v >= 1) { clearInterval(id); el.classList.add('full'); } }, calm ? 1 : 85); };
  const reveal = vh => { if (!pending.length) return; pending = pending.filter(el => { if (el.getBoundingClientRect().top > vh * .92) return true; el.classList.add('in'); if (el.classList.contains('load')) fill(el);
    const cn = counters.find(c => el.contains(c.el)); if (cn) setTimeout(() => countUp(cn), 450); return false; }); };

  // ---------- сцена «Как это работает»: прокрутка выбирает шаг (s1–s4). В телефоне клиента — НАСТОЯЩИЙ сайт «Кайчы» (тот же адрес, что в примерах),
  // и «палец» нажимает в нём настоящие кнопки: услугу, время, «Записаться». Выбранное попадает в уведомление на телефоне владельца.
  const story = $('[data-story]'), scr = $('.cli .scr', story), tap = $('.tap', story), fr = $('.site iframe', story);
  let beat = 0, run = 0, dirty = false, loaded = null, pos = ['70%', '92%'];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const load = () => loaded || (loaded = new Promise(res => { fr.addEventListener('load', () => setTimeout(res, 500), { once: true }); fr.src = fr.dataset.src; }));
  new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '900px 0px' }).observe(story);
  // страна сменилась — в телефоне клиента барбершоп этой страны; если сайт уже был загружен, грузим новый и проигрываем шаг заново
  const srcs = JSON.parse(fr.dataset.srcs || '{}'), pickSrc = k => { const src = srcs[k] || srcs.kg; if (!src || fr.dataset.src === src) return;
    fr.dataset.src = src; if (loaded) { loaded = null; dirty = false; load(); } beat = 0; };
  pickSrc(cc); document.addEventListener('cc', e => pickSrc(e.detail));
  const fd = () => fr.contentDocument, fw = () => fr.contentWindow;
  // палец едет к точке (в долях экрана телефона) и нажимает
  const tapAt = async (x, y, id, press = true) => { const to = [x.toFixed(1) + '%', y.toFixed(1) + '%'];
    tap.style.opacity = 1; await tap.animate([{ left: pos[0], top: pos[1] }, { left: to[0], top: to[1] }], { duration: calm ? 1 : 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished;
    pos = to; tap.style.left = to[0]; tap.style.top = to[1]; if (id !== run) return false;
    if (press) await tap.animate([{ scale: 1 }, { scale: .75 }, { scale: 1 }], { duration: 300, easing: 'steps(2)' }).finished; return id === run; };
  // нажать на элемент внутри сайта: сначала прокрутить страницу сайта так, чтобы он был на экране, потом подвести палец
  const tapEl = async (el, id) => { if (!el) return false; const w = fw(), H = 852, r0 = el.getBoundingClientRect();
    if (r0.top < 90 || r0.bottom > H - 70) { w.scrollTo({ top: w.scrollY + r0.top - H * .45, behavior: calm ? 'auto' : 'smooth' }); await wait(calm ? 50 : 900); if (id !== run) return false; }
    const r = el.getBoundingClientRect(); if (!await tapAt((r.left + r.width / 2) / 390 * 100, (r.top + r.height / 2) / H * 100, id)) return false; el.click(); return true; };
  const reset = async () => { if (!dirty) return; dirty = false; await load(); fw().location.reload(); loaded = new Promise(res => fr.addEventListener('load', () => setTimeout(res, 400), { once: true })); await loaded; };
  const act = async (b, id) => {
    if (b === 1) { tap.style.opacity = 0; await reset(); if (id !== run) return; const a = $('.ig:not([hidden]) .ig-bio a', scr), r = a.getBoundingClientRect(), s = scr.getBoundingClientRect(); await wait(500); await tapAt((r.left + r.width / 2 - s.left) / s.width * 100, (r.top + r.height / 2 - s.top) / s.height * 100, id); return; }
    await load(); if (id !== run) return; const d = fd(), $f = sel => d.querySelector(sel);
    if (b === 2) { await wait(2000); if (dirty) await reset(); if (id !== run) return; dirty = true;
      await tapEl($f('[data-svc] button:nth-child(3)'), id); return; }           // «Борода»
    if (b === 3) { if (!dirty) { dirty = true; $f('[data-svc] button:nth-child(3)').click(); }
      const t = [...d.querySelectorAll('[data-times] button')].find(x => !x.disabled); if (!await tapEl(t, id)) return; await wait(400);
      if (!await tapEl($f('[data-go]'), id)) return; await wait(700); const sl = $f('[data-slip]'); if (sl) { const w = fw(), r = sl.getBoundingClientRect(); w.scrollTo({ top: w.scrollY + r.top - 852 * .3, behavior: 'smooth' }); } return; }
    if (b === 4) { tap.style.opacity = 0; const s1 = $f('[data-s1]').textContent, s3 = $f('[data-s3]').textContent, tm = s3.split(', ').pop();
      if (s3 !== '—') { $('[data-nt]', story).textContent = `${s1} · ${s3}`; $$('[data-nt2]', story).forEach(el => el.textContent = tm); $$('[data-nt3]', story).forEach(el => el.textContent = `${s1} · с сайта`); } }
  };
  const paintStory = vh => { const r = story.getBoundingClientRect(), span = story.offsetHeight - vh, p = span > 0 ? clamp(-r.top / span) : 1, b = calm ? 4 : Math.min(4, 1 + Math.floor(p * 4.02));
    if (r.top > vh || r.bottom < 0 || b === beat) return; beat = b; story.classList.remove('s1', 's2', 's3', 's4'); void story.offsetWidth; story.classList.add('s' + b); act(b, ++run).catch(() => {}); };
  // телефоны рисуются в одном размере (290×612) и целиком масштабируются под место — содержимое не разваливается на узком экране
  const phones = $('.phones', story), fit = () => { const W = innerWidth, H = innerHeight, w = W <= 1000 ? phones.clientHeight / 640 * 290 : Math.min(clamp(W * .2, 220, 320), H * .37);
    phones.style.setProperty('--z', (w / 290).toFixed(3)); };
  fit(); addEventListener('resize', fit); addEventListener('load', fit);

  // ---------- слово в подвале: SEINOKOJII шрифтом 8×8, каждый пиксель буквы — блок. Блоки загораются в случайном (но всегда одном) порядке
  // по мере прокрутки; у самого низа страницы закрашены ВСЕ — слово целиком белое.
  const wcv = $('.word'); let wc, wpx = [], wcols = 80, wrows = 8, wW = 0, wp = -1;
  const wordSize = () => { const w = wcv.clientWidth; if (!w || w === wW) return; wW = w; wc = hidpi(wcv, w, w * wrows / wcols); wp = -1; };
  fontsReady().then(() => { const o = document.createElement('canvas'), c = o.getContext('2d'); o.width = 100; o.height = 12; c.font = '8px PS2P'; c.textBaseline = 'top'; c.fillStyle = '#fff'; c.fillText('SEINOKOJII', 0, 0);
    const d = c.getImageData(0, 0, 100, 12).data, pts = []; let mx = 0, my = 0;
    for (let y = 0; y < 12; y++) for (let x = 0; x < 100; x++) if (d[(y * 100 + x) * 4 + 3] > 120) { pts.push([x, y]); mx = Math.max(mx, x); my = Math.max(my, y); }
    if (pts.length < 40) return; wcols = mx + 1; wrows = my + 1; wcv.style.aspectRatio = `${wcols} / ${wrows}`; const r = seeded(19);
    wpx = pts.map(p => [p[0], p[1], r()]).sort((a, b) => a[2] - b[2]).map((p, i, a) => [p[0], p[1], (i + 1) / a.length]); wW = 0; wordSize(); });
  addEventListener('resize', wordSize);
  const wordDraw = p => { if (!wc || !wpx.length || p === wp) return; wp = p; const cs = wW / wcols, g = Math.max(1, cs * .08);
    wc.clearRect(0, 0, wW, wW); for (const [x, y, th] of wpx) { if (th <= p) { wc.fillStyle = INK; wc.fillRect(x * cs, y * cs, cs - g, cs - g); } else { wc.strokeStyle = LINE2; wc.lineWidth = 1; wc.strokeRect(x * cs + .5, y * cs + .5, cs - g - 1, cs - g - 1); } } };

  // ---------- общий кадр
  const top = $('.top'), fl = $('.float'), contact = $('#contact'), read = $('.read');
  let lastY = scrollY;
  const frame = () => {
    const y = scrollY, vh = innerHeight, doc = root.scrollHeight - vh, down = y > lastY + 2, up = y < lastY - 2; lastY = y;
    top.classList.toggle('solid', y > 30); if (down && y > vh) top.classList.add('hide'); else if (up || y < vh) top.classList.remove('hide');
    read.style.setProperty('--read', clamp(y / doc).toFixed(4)); const sr = story.getBoundingClientRect(); fl.classList.toggle('off', y < vh * .6 || contact.getBoundingClientRect().top < vh * .8 || (sr.top < vh * .5 && sr.bottom > vh * .5));
    paintStory(vh); reveal(vh);
    wordDraw(calm || doc - y < 3 ? 1 : Math.round(clamp((1 - (doc - y) / (vh * .6)) * 1.15) * 400) / 400);
    forgeFrame(); fieldFrame();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ссылка с визитки (#works) при возврате из примера — сразу к работам
  if (location.hash === '#works') { root.style.scrollBehavior = 'auto'; requestAnimationFrame(() => { $('#works').scrollIntoView(); root.style.scrollBehavior = ''; }); }

  // ---------- заявка: тариф, компания, адрес и имя обязательны; текст собирается на глазах и открывается в WhatsApp; сайт ничего не хранит.
  // Кнопки «Хочу визитку» / «Хочу сайт с записью» в ценах ведут сюда с уже выбранным тарифом.
  const form = $('.contact .form'), err = $('.err', form), prev = $('[data-preview]'), pick = $('.pick', form);
  const tierEl = () => $('input[name="tier"]:checked', form), val = n => form[n].value.trim();
  const text = () => { const t = tierEl(), lines = ['Здравствуйте! Хочу заказать сайт.'];
    lines.push('Тариф: ' + (t ? `${t.dataset.title} — ${REG[cc][t.dataset.rk]} ${REG[cc].curw}` : '…'), 'Страна: ' + REG[cc].name, 'Компания: ' + (val('company') || '…'), 'Адрес: ' + (val('address') || '…'));
    if (val('biz')) lines.push('Чем занимаемся: ' + val('biz')); lines.push('Меня зовут: ' + (val('name') || '…')); return lines.join('\n'); };
  const upd = () => { prev.textContent = text(); }; form.addEventListener('input', ev => { ev.target.classList.remove('bad'); err.textContent = ''; if (ev.target.name === 'tier') pick.classList.remove('bad'); upd(); }); upd();
  $$('[data-tier]').forEach(a => a.addEventListener('click', () => { const r = $(`input[name="tier"][value="${a.dataset.tier}"]`, form); r.checked = true; pick.classList.remove('bad'); upd(); }));
  const need = [['company', 'Напишите название компании'], ['address', 'Напишите адрес: город и улицу'], ['name', 'Напишите, как к вам обращаться']];
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!tierEl()) { err.textContent = 'Выберите, какой сайт нужен: визитка или с записью'; pick.classList.remove('bad'); void pick.offsetWidth; pick.classList.add('bad'); $('input[name="tier"]', form).focus(); return; }
    for (const [n, msg] of need) if (val(n).length < 2) { err.textContent = msg; form[n].classList.remove('bad'); void form[n].offsetWidth; form[n].classList.add('bad'); form[n].focus(); return; }
    err.textContent = ''; window.open('https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(text()), '_blank', 'noopener');
  });
  $('[data-vcf]').addEventListener('click', ev => { const v = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Seinokojii Project', 'ORG:Seinokojii Project', 'TITLE:Сайты для бизнеса', 'TEL;TYPE=CELL:' + ev.currentTarget.dataset.tel, 'URL:' + location.origin, 'END:VCARD'].join('\r\n'), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' })); a.download = 'Seinokojii Project.vcf'; document.body.append(a); a.click(); a.remove(); });
})();
