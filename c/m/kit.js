// общий код монохромных примеров: появление, буквы, выбор в группах, тост, прогресс прокрутки, плавный указатель
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-split]').forEach((n) => {
    const t = n.textContent; n.textContent = ''; n.classList.add('split'); n.setAttribute('aria-label', t);
    let i = 0; t.split(/(\s+)/).forEach((wd) => { if (!wd) return; if (/^\s+$/.test(wd)) { n.append(' '); i++; return; }
      const w = document.createElement('span'); w.className = 'wd'; w.setAttribute('aria-hidden', 'true');
      [...wd].forEach((c) => { const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i++); w.append(s); }); n.append(w); });
  });
  // появление: проверка по положению в кадре (надёжнее IntersectionObserver у блоков с transform)
  const seen = () => { const vh = innerHeight; document.querySelectorAll('[data-r]:not(.in),.split:not(.in)').forEach((n) => { const r = n.getBoundingClientRect(); if ((r.top < vh * .9 || r.bottom <= vh) && r.bottom > -50) n.classList.add('in'); }); };
  addEventListener('scroll', seen, { passive: true }); addEventListener('resize', seen); requestAnimationFrame(() => requestAnimationFrame(seen));
  document.querySelectorAll('.pick').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b || b.classList.contains('x') || !g.contains(b)) return;
    g.querySelectorAll('[data-v]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    g.dispatchEvent(new CustomEvent('pick', { detail: b.dataset.v, bubbles: true }));
  }));
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  let tt; window.toast = (title, sub) => {
    let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.innerHTML = `<i>${CHECK}</i><p><b></b><small></small></p>`; t.querySelector('b').textContent = title; t.querySelector('small').textContent = sub || '';
    requestAnimationFrame(() => t.classList.add('on')); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 4200);
  };
  // прогресс прокрутки блока: --p от 0 (верх блока у низа экрана) до 1 (низ блока у верха)
  const prog = [...document.querySelectorAll('[data-p]')];
  const P = () => { const vh = innerHeight; prog.forEach((n) => { const r = n.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh))); n.style.setProperty('--p', p.toFixed(4)); const st = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh))); n.style.setProperty('--s', st.toFixed(4)); }); };
  if (prog.length) { addEventListener('scroll', P, { passive: true }); addEventListener('resize', P); P(); }
  // плавный указатель: window.ptr = {x,y} (0..1 по окну), сглаженный
  const ptr = window.ptr = { x: .5, y: .5, tx: .5, ty: .5, moved: false };
  addEventListener('pointermove', (e) => { ptr.tx = e.clientX / innerWidth; ptr.ty = e.clientY / innerHeight; ptr.moved = true; }, { passive: true });
  (function loop() { ptr.x += (ptr.tx - ptr.x) * .08; ptr.y += (ptr.ty - ptr.y) * .08; requestAnimationFrame(loop); })();
  window.RM = RM;
  window.$ = (s, r = document) => r.querySelector(s); window.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  // числа «бегут» к значению
  window.countTo = (el, to, fmt = (v) => Math.round(v).toLocaleString('ru-RU').replace(/,/g, ' ')) => {
    const from = +(el.dataset.v || 0), t0 = performance.now(), D = RM ? 1 : 650; el.dataset.v = to;
    const st = () => { const k = Math.min(1, (performance.now() - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(st); }; st();
  };
})();
