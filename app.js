// Seinokojii Project (четвёртая версия, 16.10.2026): заставка из частиц, смена примеров в «устройствах», сцена записи (живой сайт «Кайчы» в телефоне клиента и уведомление владельцу),
// сцена сборки сайта от прокрутки, линии по течению, колода примеров с живой пробой, курсор, магнитные кнопки, наклон, заявка в WhatsApp. Примерка, проба кабинета и калькуляторы убраны.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, k) => a + (b - a) * k;
  const now = () => (window.__ft !== undefined ? window.__ft : performance.now());        // при съёмке ролика время двигает сценарий
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // ---------- счётчики (цена)
  function count(el) {
    const to = +el.dataset.count; if (calm || el.dataset.done) { el.textContent = fmt(to); return; } el.dataset.done = 1;
    const t0 = now(), dur = 1500, tick = () => { const k = clamp((now() - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  // ---------- заставка: знак рисуется, слово поднимается по буквам, занавес уходит вверх; первый экран появляется уже под уходящим занавесом.
  // Всё движение — transform и opacity (плюс короткая дорисовка тонких линий), поэтому идёт на частоте экрана. По ссылке с якорем (QR → #works) заставки нет.
  const intro = $('.intro'), hasIntro = intro && !root.classList.contains('no-intro'), start = wait => setTimeout(() => { root.classList.add('ready'); setTimeout(() => $$('.hero [data-count]').forEach(count), 350); }, wait);
  // Заставка из частиц. Знак и слово рисуются на обычном холсте (он же потом проявляется поверх чёткой надписью), с него снимаются точки-цели.
  // Весь полёт считает вершинный шейдер по одному числу — времени: слёт по завихрению → дрожащий контур → унос течением вправо. JS каждый кадр только передаёт время.
  const glIntro = async () => {
    const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1), gc = $('.intro-g'), xc = $('.intro-x'), gl = gc.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true }); if (!gl) throw new Error('no webgl');
    if (document.fonts && document.fonts.load) await Promise.race([Promise.all([document.fonts.load('900 80px Unbounded', 'Seinokojii'), document.fonts.load('500 20px JBMono', 'PROJECT')]), new Promise(r => setTimeout(r, 900))]);
    xc.width = W * dpr; xc.height = H * dpr; const c = xc.getContext('2d', { willReadFrequently: true }); c.scale(dpr, dpr);
    const fs = clamp(W * (W < 700 ? .14 : .1), 42, 144), ms = clamp(W * .074, 58, 104), ps = clamp(W * .019, 13.5, 24), by = H * .47 + fs * .36, GR = [[0, '#8FE0C2'], [.45, '#9CC8EC'], [1, '#B9A5F2']];
    c.font = `900 ${fs}px Unbounded, sans-serif`; try { c.letterSpacing = (-.05 * fs) + 'px'; } catch (e) {} const tw = c.measureText('Seinokojii').width, x0 = (W - tw) / 2, g = c.createLinearGradient(x0, 0, x0 + tw, 0); GR.forEach(s => g.addColorStop(s[0], s[1]));
    c.fillStyle = g; c.fillText('Seinokojii', x0, by);
    const k = ms / 40; c.save(); c.translate(W / 2 - ms / 2, by - fs * .8 - ms * 1.34); c.scale(k, k); c.lineWidth = 3; c.strokeStyle = c.fillStyle = '#E9E6EA'; c.beginPath(); c.roundRect(3, 5, 34, 30, 7); c.moveTo(3, 14); c.lineTo(37, 14); c.stroke(); c.beginPath(); c.arc(10, 9.6, 1.6, 0, 7); c.fill(); c.fillStyle = '#84A8CD'; c.beginPath(); c.roundRect(20, 19, 12, 11, 2.5); c.fill(); c.restore();
    c.font = `500 ${ps}px JBMono, monospace`; try { c.letterSpacing = (.62 * ps) + 'px'; } catch (e) {} c.fillStyle = '#84A8CD'; c.textAlign = 'center'; c.fillText('PROJECT', W / 2 + .31 * ps, by + fs * .3 + ps);
    const lw = Math.min(W * .46, 420), lg = c.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0); GR.forEach(s => lg.addColorStop(s[0], s[1])); c.fillStyle = lg; c.fillRect(W / 2 - lw / 2, by + fs * .3 + ps * 2.1, lw, 2);
    // точки-цели: каждый закрашенный пиксель с шагом; цвет точки — цвет пикселя
    const img = c.getImageData(0, 0, xc.width, xc.height).data, step = Math.max(1, Math.round((W < 700 ? 1.5 : 2) * dpr)), pts = [];
    for (let y = 0; y < xc.height; y += step) for (let x = 0; x < xc.width; x += step) { const i = (y * xc.width + x) * 4; if (img[i + 3] > 110) pts.push(x / dpr, y / dpr, img[i] / 255, img[i + 1] / 255, img[i + 2] / 255); }
    const all = pts.length / 5, N = Math.min(all, W < 700 ? 11000 : 24000), buf = new Float32Array(N * 9); if (N < 500) throw new Error('no text');
    for (let n = 0; n < N; n++) { const s = (all === N ? n : Math.floor(Math.random() * all)) * 5, o = n * 9; buf[o] = pts[s] + (Math.random() - .5) * step / dpr; buf[o + 1] = pts[s + 1] + (Math.random() - .5) * step / dpr; buf[o + 2] = Math.random(); buf[o + 3] = Math.random(); buf[o + 4] = Math.random(); buf[o + 5] = Math.random(); buf[o + 6] = pts[s + 2]; buf[o + 7] = pts[s + 3]; buf[o + 8] = pts[s + 4]; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }, pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, `precision highp float; attribute vec2 aT; attribute vec4 aR; attribute vec3 aC; uniform float uT, uOut, uDim, uDpr; uniform vec2 uRes; varying vec4 vC;
      void main() { float a = clamp((uT - aR.x * .5) / .95, 0., 1.); a = 1. - pow(1. - a, 3.); float w = 1. - a;
        vec2 s = vec2(aR.y * 1.5 - .75, aR.z) * uRes + vec2(0., sin(aR.y * 9. + aR.w * 6.283) * uRes.y * .12);
        vec2 p = mix(s, aT, a) + vec2(sin(aT.y * .011 + uT * 2.2 + aR.w * 6.283), cos(aT.x * .009 + uT * 1.8 + aR.y * 6.283)) * w * (40. + aR.z * 120.);
        p += vec2(sin(uT * 3.1 + aR.w * 40.), cos(uT * 2.7 + aR.z * 40.)) * (.7 + aR.x * 1.3) * a;
        float e = clamp((uT - uOut - aR.y * .32) / .95, 0., 1.), ee = e * e;
        p += vec2(uRes.x * (.45 + aR.x * .9), (sin(aT.x * .007 + aR.w * 6.283) * .2 + (aR.z - .5) * .34) * uRes.y) * ee; p.y += sin(p.x * .006 + aR.w * 6.283) * 46. * e;
        gl_Position = vec4(p.x / uRes.x * 2. - 1., 1. - p.y / uRes.y * 2., 0., 1.); gl_PointSize = (1.1 + aR.w * 1.9) * uDpr * (1. + ee * 1.6 + w * 1.2);
        vC = vec4(aC, a * (1. - e) * mix(uDim, 1., max(w, min(1., e * 4.))) * (.72 + aR.z * .28)); }`));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision mediump float; varying vec4 vC; void main() { float m = smoothstep(.5, .08, length(gl_PointCoord - .5)) * vC.a; gl_FragColor = vec4(vC.rgb * m, m); }`));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link'); gl.useProgram(pr);
    gc.width = W * dpr; gc.height = H * dpr; gl.viewport(0, 0, gc.width, gc.height); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    [['aT', 2, 0], ['aR', 4, 8], ['aC', 3, 24]].forEach(([n, size, off]) => { const l = gl.getAttribLocation(pr, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 36, off); });
    const U = n => gl.getUniformLocation(pr, n), uT = U('uT'), uDim = U('uDim'), OUT = 2.15; gl.uniform2f(U('uRes'), W, H); gl.uniform1f(U('uDpr'), dpr); gl.uniform1f(U('uOut'), OUT); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.clearColor(0, 0, 0, 0);
    intro.classList.add('gl', 'go'); start((OUT + .1) * 1000); setTimeout(() => intro.remove(), 5200);      // страховка: на медленном телефоне кадры могут идти реже — заставка всё равно уйдёт
    const t0 = performance.now(); let on = false, off = false;
    const tick = () => { const t = (performance.now() - t0) / 1000;
      if (!on && t > 1.05) { on = true; xc.classList.add('on'); } if (!off && t > OUT - .05) { off = true; xc.classList.add('off'); intro.classList.add('out'); }
      gl.uniform1f(uT, t); gl.uniform1f(uDim, 1 - clamp((t - 1.1) / .5) * .62); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.POINTS, 0, N);
      if (t < OUT + 1.35) requestAnimationFrame(tick); else { const x = gl.getExtension('WEBGL_lose_context'); x && x.loseContext(); intro.remove(); } };
    requestAnimationFrame(tick);
  };
  if (hasIntro) { scrollTo(0, 0); addEventListener('load', () => scrollTo(0, 0), { once: true });      // заставка всегда открывает сайт с самого начала, даже если браузер помнил место или в ссылке был якорь
    const go = () => { if (intro.classList.contains('go')) return; intro.classList.add('go'); start(1750); setTimeout(() => intro.remove(), 3000); };      // запасной вариант без WebGL
    glIntro().catch(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go))); }
  else { intro && intro.remove(); requestAnimationFrame(() => start(0)); }

  // ---------- появление блоков
  const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; en.target.classList.add('in'); $$('[data-count]', en.target).forEach(count); io.unobserve(en.target); }), { rootMargin: '0px 0px -8% 0px', threshold: .1 });
  $$('.rv').forEach(el => io.observe(el));

  // ---------- первый экран: работы сменяют друг друга в ноутбуке и телефоне
  const big = $$('.frame.big .shots img', $('.stage')), small = $$('.mob.big .shots img'), nameEl = $('.now [data-name]'), hostEl = $('.stage [data-host]');
  let shot = 0, shotAt = now();
  const nextShot = () => { shot = (shot + 1) % big.length; big.forEach((im, i) => im.classList.toggle('on', i === shot)); small.forEach((im, i) => im.classList.toggle('on', i === shot)); nameEl.textContent = big[shot].dataset.name; hostEl.textContent = big[shot].dataset.host; };

  // ---------- сцена сборки сайта: общий прогресс p делится на три отрезка — каркас (a), дизайн (b), запуск (c)
  const how = $('[data-pin="how"]'), steps = $$('.step', how); let hp = 0, stepOn = -1;
  const paintHow = () => {
    const a = clamp(hp / .3), b = clamp((hp - .3) / .3), c = clamp((hp - .64) / .3);
    how.style.setProperty('--p', hp.toFixed(4)); how.style.setProperty('--a', a.toFixed(3)); how.style.setProperty('--b', b.toFixed(3)); how.style.setProperty('--c', c.toFixed(3));
    const i = hp < .3 ? 0 : hp < .64 ? 1 : 2; if (i !== stepOn) { stepOn = i; steps.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); }); }
  };

  // ---------- линии по течению: длинные струи идут через весь экран по плавному полю направлений; поле медленно меняется — струи колышутся,
  // а по каждой бегут светящиеся импульсы (штрих со сдвигом). Каждый кадр линии строятся заново, поэтому следов и дымки не остаётся.
  const hero = $('.hero'); let mx = innerWidth * .7, my = innerHeight * .4; const flows = [];
  function flow(cv, pal, dir, amp) {
    const host = cv.parentElement, ctx = cv.getContext('2d'), STEP = 9; let W = 0, H = 0, dpr = 1, lines = [], grad = null, on = false;
    // Линии задаются один раз и одним и тем же «случайным» рядом: при повторной настройке холста рисунок не перескакивает.
    // На телефоне адресная строка браузера при прокрутке прячется и меняет высоту окна — это событие resize. Раньше холст на каждое такое
    // событие пересоздавался с новыми линиями, и они дёргались. Теперь холст перенастраивается только при смене ШИРИНЫ (поворот экрана, окно).
    const small = () => W < 700;
    const build = () => { let sd = 20261011; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, n = Math.round(clamp(H / (small() ? 20 : 11), 22, 96));
      lines = Array.from({ length: n }, (_, k) => ({ y: (k + rnd() * .8) / n * 1.5 - .25, w: .6 + rnd() * 1.3, a: .1 + rnd() * .22, sp: 60 + rnd() * 130, dash: 40 + rnd() * 110, gap: 380 + rnd() * 700, ph: rnd() * 2000 })); };
    const size = force => { const w = cv.clientWidth, h = cv.clientHeight; if (!force && w === W) return;
      dpr = Math.min(small() ? 2 : 1.5, devicePixelRatio || 1); W = w; H = h; cv.style.height = h + 'px'; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; build();
      grad = ctx.createLinearGradient(0, 0, W, 0); pal.forEach((c, k) => grad.addColorStop(k / (pal.length - 1), `rgb(${c})`)); };
    size(true); addEventListener('load', () => { cv.style.height = ''; size(true); }); addEventListener('resize', () => { cv.style.height = ''; size(false); if (!cv.style.height) cv.style.height = H + 'px'; }); new IntersectionObserver(es => { on = es[0].isIntersecting; }, { rootMargin: '80px' }).observe(host);
    const ang = (x, y, t) => dir + (Math.sin(x * .0016 + t * .16) * .34 + Math.cos(y * .0027 - t * .11 + x * .0006) * .4 + Math.sin((x * .55 + y) * .0013 + t * .07) * .3) * amp * (W < 700 ? .42 : 1);      // на узком экране течение положе: иначе струи идут почти отвесно и похожи на дождь
    flows.push(() => {
      if (!on) return; const t = now() / 1000, r = host.getBoundingClientRect(), cx = mx - r.left, cy = my - r.top, max = Math.ceil((W + 160) / STEP * 1.25);
      ctx.clearRect(0, 0, W, H); ctx.strokeStyle = grad;
      for (const l of lines) {
        let x = -60, y = l.y * H; ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < max && x < W + 60; k++) {
          let a = ang(x, y, t); const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
          if (fine && d2 < 48000) a += (1 - d2 / 48000) * .9 * (dy > 0 ? 1 : -1);          // у курсора течение расступается, как у камня в ручье
          x += Math.cos(a) * STEP; y += Math.sin(a) * STEP; ctx.lineTo(x, y);
        }
        ctx.setLineDash([]); ctx.globalAlpha = l.a; ctx.lineWidth = l.w; ctx.stroke();
        ctx.setLineDash([l.dash, l.gap]); ctx.lineDashOffset = -(t * l.sp + l.ph); ctx.globalAlpha = Math.min(1, l.a * 3.4); ctx.lineWidth = l.w + .7; ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.setLineDash([]);
    });
  }
  if (!calm) { const PAL = { hero: ['96,140,190', '132,168,205', '185,165,242', '242,179,125'], foot: ['143,224,194', '150,200,230', '185,165,242'] };
    $$('[data-flow]').forEach(cv => { const h = cv.dataset.flow === 'hero'; flow(cv, PAL[cv.dataset.flow], h ? -.06 : 0, h ? 1 : .4); }); }
  const draw = () => { if (!root.classList.contains('ready')) return; flows.forEach(f => f()); };      // пока идёт заставка, линии под ней не рисуются — кадры достаются заставке

  // ---------- колода работ: карточка, на которую наезжает следующая, уменьшается и темнеет. «Попробовать прямо здесь» ставит в рамку живой сайт
  // (страница 1440×900, уменьшенная до ширины рамки); проба закрывается сама, когда карточку перекрыли или она ушла с экрана.
  const works = $$('.work'), wide = matchMedia('(min-width: 1001px)');
  const shut = w => { if (!w.classList.contains('trying')) return; w.classList.remove('trying'); const f = $('iframe', w); f && f.remove(); };
  works.forEach(w => { const v = $('.view', w);
    $('.touch', w).addEventListener('click', () => { works.forEach(shut); const f = document.createElement('iframe'); f.src = v.dataset.live; f.title = 'Живой концепт'; f.loading = 'eager'; v.style.setProperty('--k', (v.clientWidth / 1440).toFixed(4)); v.append(f); w.classList.add('trying'); });
    $('.shut', w).addEventListener('click', () => shut(w)); });
  addEventListener('resize', () => works.forEach(w => { const v = $('.view', w); v.style.setProperty('--k', (v.clientWidth / 1440).toFixed(4)); }));
  const deck = vh => { if (!wide.matches) return; works.forEach((w, i) => { const r = w.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) { shut(w); return; }
    const n = works[i + 1], q = n ? clamp(1 - n.getBoundingClientRect().top / vh) : 0, st = $('.work-in', w).style; st.setProperty('--s', (1 - q * .07).toFixed(4)); st.setProperty('--d', (1 - q * .6).toFixed(3)); if (q > .45) shut(w); }); };

  // ---------- сцена «Как это работает»: прокрутка выбирает шаг (s1–s4). В телефоне клиента — НАСТОЯЩИЙ сайт «Кайчы» (тот же адрес, что в примерах),
  // и «палец» нажимает в нём настоящие кнопки: услугу, время, «Записаться». Выбранное попадает в уведомление на телефоне владельца.
  const story = $('[data-story]'), scr = $('.cli .scr', story), tap = $('.tap', story), fr = $('.site iframe', story), K = 390 / 272;   // 390 — ширина страницы в окне, 272 — экран телефона
  let beat = 0, run = 0, dirty = false, loaded = null, pos = ['70%', '92%'];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const load = () => loaded || (loaded = new Promise(res => { fr.addEventListener('load', () => setTimeout(res, 500), { once: true }); fr.src = fr.dataset.src; }));
  new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '900px 0px' }).observe(story);
  const fd = () => fr.contentDocument, fw = () => fr.contentWindow;
  // палец едет к точке (в долях экрана телефона) и нажимает
  const tapAt = async (x, y, id, press = true) => { const to = [x.toFixed(1) + '%', y.toFixed(1) + '%'];
    tap.style.opacity = 1; await tap.animate([{ left: pos[0], top: pos[1] }, { left: to[0], top: to[1] }], { duration: calm ? 1 : 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished;
    pos = to; tap.style.left = to[0]; tap.style.top = to[1]; if (id !== run) return false;
    if (press) await tap.animate([{ scale: 1 }, { scale: .68 }, { scale: 1 }], { duration: 320 }).finished; return id === run; };
  // нажать на элемент внутри сайта: сначала прокрутить страницу сайта так, чтобы он был на экране, потом подвести палец
  const tapEl = async (el, id) => { if (!el) return false; const w = fw(), H = 852, r0 = el.getBoundingClientRect();
    if (r0.top < 90 || r0.bottom > H - 70) { w.scrollTo({ top: w.scrollY + r0.top - H * .45, behavior: calm ? 'auto' : 'smooth' }); await wait(calm ? 50 : 900); if (id !== run) return false; }
    const r = el.getBoundingClientRect(); if (!await tapAt((r.left + r.width / 2) / 390 * 100, (r.top + r.height / 2) / H * 100, id)) return false; el.click(); return true; };
  const reset = async () => { if (!dirty) return; dirty = false; await load(); fw().location.reload(); loaded = new Promise(res => fr.addEventListener('load', () => setTimeout(res, 400), { once: true })); await loaded; };
  const act = async (b, id) => {
    if (b === 1) { tap.style.opacity = 0; await reset(); if (id !== run) return; const a = $('.ig-bio a', scr), r = a.getBoundingClientRect(), s = scr.getBoundingClientRect(); await wait(500); await tapAt((r.left + r.width / 2 - s.left) / s.width * 100, (r.top + r.height / 2 - s.top) / s.height * 100, id); return; }
    await load(); if (id !== run) return; const d = fd(), $f = sel => d.querySelector(sel);
    if (b === 2) { await wait(2000); if (dirty) await reset(); if (id !== run) return; dirty = true;
      await tapEl($f('[data-svc] button:nth-child(3)'), id); return; }           // «Борода»
    if (b === 3) { if (!dirty) { dirty = true; $f('[data-svc] button:nth-child(3)').click(); }
      const t = [...d.querySelectorAll('[data-times] button')].find(x => !x.disabled); if (!await tapEl(t, id)) return; await wait(400);
      if (!await tapEl($f('[data-go]'), id)) return; await wait(700); const sl = $f('[data-slip]'); if (sl) { const w = fw(), r = sl.getBoundingClientRect(); w.scrollTo({ top: w.scrollY + r.top - 852 * .3, behavior: 'smooth' }); } return; }
    if (b === 4) { tap.style.opacity = 0; const s1 = $f('[data-s1]').textContent, s3 = $f('[data-s3]').textContent, tm = s3.split(', ').pop();
      if (s3 !== '—') { $('[data-nt]', story).textContent = `${s1} · ${s3}`; $('[data-nt2]', story).textContent = tm; $('[data-nt3]', story).textContent = `${s1} · с сайта`; } }
  };
  const aim = () => {};
  const paintStory = vh => { const r = story.getBoundingClientRect(), span = story.offsetHeight - vh, p = span > 0 ? clamp(-r.top / span) : 1, b = calm ? 4 : Math.min(4, 1 + Math.floor(p * 4.02));
    if (r.top > vh || r.bottom < 0 || b === beat) return; beat = b; story.classList.remove('s1', 's2', 's3', 's4'); void story.offsetWidth; story.classList.add('s' + b); act(b, ++run).catch(() => {}); };

  // телефоны в сцене рисуются в одном размере (290×612) и целиком масштабируются под место — содержимое не разваливается на узком экране
  const phones = $('.phones', story), fit = () => { const W = innerWidth, H = innerHeight, w = W <= 1000 ? phones.clientHeight / 612 * 290 : Math.min(clamp(W * .21, 230, 330), H * .39);
    phones.style.setProperty('--z', (w / 290).toFixed(3)); };
  fit(); addEventListener('resize', fit); addEventListener('load', fit);

  // ---------- общий кадр
  const top = $('.top'), fl = $('.float'), contact = $('#contact'), read = $('.read'), footW = $('.foot-w span'), stageIn = $('.stage-in'), cursor = $('.cursor');
  let lastY = scrollY, cx = mx, cy = my;
  if (fine && !calm) {
    addEventListener('pointermove', ev => { mx = ev.clientX; my = ev.clientY; }, { passive: true });
    document.addEventListener('pointerover', ev => { const lab = ev.target.closest('[data-cur]'), act = ev.target.closest('a, button, .pick label'); cursor.classList.toggle('lbl', !!lab); cursor.classList.toggle('big', !lab && !!act); $('span', cursor).textContent = lab ? lab.dataset.cur : ''; });
    $$('.mag').forEach(b => {
      b.addEventListener('pointermove', ev => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((ev.clientX - r.left - r.width / 2) * .24).toFixed(1) + 'px'); b.style.setProperty('--my', ((ev.clientY - r.top - r.height / 2) * .34).toFixed(1) + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    $$('[data-tilt]').forEach(el => {
      const k = +el.dataset.tilt || 5, host = el === stageIn ? hero : el;
      host.addEventListener('pointermove', ev => { const r = el.getBoundingClientRect(), x = clamp((ev.clientX - r.left) / r.width, -.6, 1.6) - .5, y = clamp((ev.clientY - r.top) / r.height, -.6, 1.6) - .5;
        el.style.setProperty('--ry', (x * k).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * k).toFixed(2) + 'deg'); el.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%'); el.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%'); });
      host.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }
  const frame = () => {
    const y = scrollY, vh = innerHeight, doc = root.scrollHeight - vh, down = y > lastY + 2, up = y < lastY - 2; lastY = y;
    top.classList.toggle('solid', y > 30); if (down && y > vh) top.classList.add('hide'); else if (up || y < vh) top.classList.remove('hide');
    read.style.setProperty('--read', clamp(y / doc).toFixed(4)); fl.classList.toggle('off', y < vh * .6 || contact.getBoundingClientRect().top < vh * .8);
    const r = how.getBoundingClientRect(), span = how.offsetHeight - vh, target = span > 0 ? clamp(-r.top / span) : 1;
    hp = calm ? target : lerp(hp, target, .14); if (Math.abs(hp - target) < .0005) hp = target; paintHow(); paintStory(vh);
    if (!calm) {
      if (y < vh * 1.2) stageIn.style.setProperty('--py', (y * -.06).toFixed(1) + 'px');
      footW.style.setProperty('--fp', doc - y < 3 ? 1 : clamp((1 - (doc - y) / (vh * .55)) * 1.18).toFixed(3));        // слово в подвале заливается целиком чуть раньше конца страницы; у самого низа — всегда ровно 1
      deck(vh);
      if (fine) { cx = lerp(cx, mx, .25); cy = lerp(cy, my, .25); cursor.style.setProperty('--x', cx.toFixed(1) + 'px'); cursor.style.setProperty('--y', cy.toFixed(1) + 'px'); }
      if (now() - shotAt > 3400 && y < vh) { shotAt = now(); nextShot(); }
      draw && draw();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ссылка с визитки (#works) — сразу к работам, без плавной прокрутки через весь первый экран
  if (location.hash === '#works') { root.style.scrollBehavior = 'auto'; requestAnimationFrame(() => { $('#works').scrollIntoView(); root.style.scrollBehavior = ''; }); }

  // ---------- заявка: текст собирается на глазах и открывается в WhatsApp; сайт ничего не хранит
  const form = $('.contact .form'), err = $('.err', form), prev = $('[data-preview]');
  const text = () => { const n = form.name.value.trim(), b = form.biz.value.trim(); return `Здравствуйте! ${n ? 'Меня зовут ' + n + '. ' : ''}Хочу сайт${b ? ': ' + b : ''}.`; };
  const upd = () => { prev.textContent = text(); }; form.addEventListener('input', upd); upd();
  form.addEventListener('submit', ev => {
    ev.preventDefault(); if (form.name.value.trim().length < 2) { err.textContent = 'Напишите, как к вам обращаться'; form.name.focus(); return; }
    err.textContent = ''; window.open('https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(text()), '_blank', 'noopener');
  });
  $('[data-vcf]').addEventListener('click', ev => { const v = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Seinokojii Project', 'ORG:Seinokojii Project', 'TITLE:Сайты для бизнеса', 'TEL;TYPE=CELL:' + ev.currentTarget.dataset.tel, 'URL:' + location.origin, 'END:VCARD'].join('\r\n'), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' })); a.download = 'Seinokojii Project.vcf'; document.body.append(a); a.click(); a.remove(); });
})();
