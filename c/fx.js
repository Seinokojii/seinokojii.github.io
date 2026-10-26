/* FX — общий слой эффектов для примеров по странам (26.10.2026: Россия, Казахстан, Молдова).
   FX.gl(canvas, { tex: [картинки], frag: 'тело шейдера', trail: {...}, u: { имя: () => число } }) — фото через WebGL со своим шейдером.
   В шейдере есть: uv (0..1, y вверх), R (размер в px), T (время, с), M (указатель над холстом, 0..1), S (прокрутка блока, 0..1),
   V (скорость прокрутки, сглаженная, ±), H (указатель над холстом: 0/1, плавно), t0..t3 + a0..a3 (картинки и их размеры), tr (след указателя, .r),
   cover(uv, a0) — «object-fit: cover» для картинки, noise(), fbm(), hash().
   След (trail): указатель рисует мягкие круги, они гаснут со скоростью decay. auto: true — если указателя нет, след рисует «призрак» (видно на телефоне и на снимках).
   Без WebGL холст получает фон из первой картинки — страница не ломается. При «уменьшить движение» кадр рисуется один раз. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, list = [];
  const P = { x: -1, y: -1, t: 0, on: false };
  const mv = e => { P.x = e.clientX; P.y = e.clientY; P.t = performance.now(); P.on = true; };
  addEventListener('pointermove', mv, { passive: true }); addEventListener('pointerdown', mv, { passive: true });
  document.addEventListener('pointerleave', () => { P.on = false; });
  let lastY = scrollY, vel = 0;
  const HEAD = `precision highp float;
uniform vec2 R, M, a0, a1, a2, a3; uniform float T, S, V, H; uniform sampler2D t0, t1, t2, t3, tr; varying vec2 uv;
vec2 cover(vec2 p, vec2 ts) { float r = R.x / R.y, ir = ts.x / ts.y; vec2 s = r > ir ? vec2(1., ir / r) : vec2(r / ir, 1.); return (p - .5) * s + .5; }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), f.x), f.y); }
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
`;
  const VS = 'attribute vec2 p; varying vec2 uv; void main() { uv = p * .5 + .5; gl_Position = vec4(p, 0, 1); }';

  function gl(cv, o) {
    const imgs = (o.tex || []).map(src => { const im = new Image(); im.decoding = 'async'; im.src = src; return im; });
    const fallback = () => { cv.style.background = `url(${(o.tex || [])[0]}) center / cover`; cv.classList.add('fx-off'); };
    const g = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!g) { fallback(); return null; }
    const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
    const pr = g.createProgram();
    try { g.attachShader(pr, sh(g.VERTEX_SHADER, VS)); g.attachShader(pr, sh(g.FRAGMENT_SHADER, HEAD + o.frag)); } catch (e) { console.error(e); fallback(); return null; }
    g.linkProgram(pr); g.useProgram(pr);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = n => g.getUniformLocation(pr, n);
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
    const mkTex = (unit, name) => { const t = g.createTexture(); g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, t);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, 1, 1, 0, g.RGBA, g.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255])); g.uniform1i(U(name), unit); return t; };
    const texs = imgs.map((im, i) => { const t = mkTex(i, 't' + i);
      const up = () => { g.activeTexture(g.TEXTURE0 + i); g.bindTexture(g.TEXTURE_2D, t); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, im); g.uniform2f(U('a' + i), im.naturalWidth, im.naturalHeight); me.loaded++; me.dirty = true; };
      im.complete && im.naturalWidth ? Promise.resolve().then(up) : im.addEventListener('load', up, { once: true }); return t; });   // из кеша — после того, как me создан
    for (let i = 0; i < 4; i++) g.uniform2f(U('a' + i), 1, 1);
    // след указателя — обычный 2D-холст, его кадр уходит в шейдер текстурой
    let trc, tx, trT, tw = 0, th = 0, last = null;
    if (o.trail) { trc = document.createElement('canvas'); tx = trc.getContext('2d'); trT = mkTex(4, 'tr'); }
    const tro = Object.assign({ decay: .03, size: .09, auto: false, until: Infinity }, o.trail || {});
    const me = { clearTrail() { if (trc) { tx.globalCompositeOperation = 'source-over'; tx.fillStyle = '#000'; tx.fillRect(0, 0, tw, th); } }, cv, g, loaded: 0, dirty: true, on: true, t0: performance.now(), h: 0, u: o.u || {}, w: 0, hh: 0,
      draw(now) {
        const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, o.dpr || 1.5), W = Math.round(r.width * dpr), Hh = Math.round(r.height * dpr);
        if (!W || !Hh) return;
        if (W !== me.w || Hh !== me.hh) { me.w = cv.width = W; me.hh = cv.height = Hh; g.viewport(0, 0, W, Hh);
          if (trc) { tw = trc.width = 256; th = trc.height = Math.max(32, Math.round(256 * r.height / r.width)); tx.fillStyle = '#000'; tx.fillRect(0, 0, tw, th); } }
        const inside = P.on && P.x >= r.left && P.x <= r.right && P.y >= r.top && P.y <= r.bottom, fresh = now - P.t < 2500;
        const mx = inside ? (P.x - r.left) / r.width : .5, my = inside ? 1 - (P.y - r.top) / r.height : .5;
        me.h += ((inside ? 1 : 0) - me.h) * .08;
        const t = (now - me.t0) / 1000, vh = innerHeight, s = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        if (trc) {
          tx.globalCompositeOperation = 'source-over'; tx.fillStyle = `rgba(0,0,0,${tro.decay})`; tx.fillRect(0, 0, tw, th);
          let px = null, py = null;
          if (inside && fresh) { px = mx * tw; py = (1 - my) * th; me.touched = true; }
          else if (tro.auto && !calm && !me.touched && t < tro.until && !(P.on && fresh)) { const k = t * .55; px = (.5 + .36 * Math.sin(k * 1.3) * Math.cos(k * .4)) * tw; py = (.5 + .3 * Math.sin(k * 1.9 + 1)) * th; }
          if (px !== null) { const rad = tro.size * tw, from = last || [px, py], n = Math.max(1, Math.ceil(Math.hypot(px - from[0], py - from[1]) / (rad * .25)));
            tx.globalCompositeOperation = 'lighter';
            for (let k = 1; k <= n; k++) { const x = from[0] + (px - from[0]) * k / n, y = from[1] + (py - from[1]) * k / n, gr = tx.createRadialGradient(x, y, 0, x, y, rad);
              gr.addColorStop(0, `rgba(255,255,255,${tro.alpha || .35})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); tx.fillStyle = gr; tx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
            last = [px, py]; } else last = null;
          g.activeTexture(g.TEXTURE4); g.bindTexture(g.TEXTURE_2D, trT); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, trc);
        }
        g.uniform2f(U('R'), W, Hh); g.uniform1f(U('T'), calm ? 2 : t); g.uniform2f(U('M'), mx, my); g.uniform1f(U('S'), s); g.uniform1f(U('V'), vel); g.uniform1f(U('H'), me.h);
        for (const k in me.u) g.uniform1f(U(k), +me.u[k]());
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4); me.dirty = false;
      } };
    new IntersectionObserver(es => { me.on = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(cv);
    list.push(me); return me;
  }
  const loop = now => {
    const y = scrollY; vel += ((y - lastY) - vel) * .12; lastY = y;
    for (const m of list) if (m.on && (!calm || m.dirty)) m.draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  // прогресс прокрутки липкого блока: 0 — верх блока у верха экрана, 1 — низ блока у низа экрана
  const prog = el => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : (r.top < 0 ? 1 : 0); };
  window.FX = { gl, prog, calm, vel: () => vel, P, fmt: n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') };
})();
