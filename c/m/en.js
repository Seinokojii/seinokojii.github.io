// Общий набор английских примеров (27.11.2026), поверх kit.js: шапка, «расцвет» фото, заливка слов по прокрутке,
// превью за курсором, горизонтальная галерея, модуль записи по конфигу (<script type="application/json" id="book-cfg">).
(() => {
  const $ = window.$, $$ = window.$$, RM = window.RM;
  // шапка: прозрачная над первым экраном, плотная дальше
  const nav = $('.nav'), hero = $('.hero');
  const ns = () => { if (!nav) return; const h = hero ? hero.offsetHeight - 80 : 60; nav.classList.toggle('solid', scrollY > Math.min(h, innerHeight * .8)); };
  addEventListener('scroll', ns, { passive: true }); ns();
  // заливка слов: [data-fill] — каждое слово темнеет, когда блок проходит середину экрана
  $$('[data-fill]').forEach((n) => {
    const words = n.textContent.trim().split(/\s+/); n.setAttribute('aria-label', n.textContent.trim()); n.textContent = '';
    words.forEach((w, i) => { const s = document.createElement('span'); s.textContent = w; s.setAttribute('aria-hidden', 'true'); n.append(s, ' '); });
    const sp = [...n.children];
    const up = () => { const r = n.getBoundingClientRect(), vh = innerHeight, p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      sp.forEach((s, i) => s.style.setProperty('--o', Math.min(1, Math.max(0, p * sp.length * 1.15 - i)).toFixed(3))); };
    addEventListener('scroll', up, { passive: true }); addEventListener('resize', up); up();
  });
  // превью за курсором: [data-peek] список, у пунктов data-img
  $$('[data-peek]').forEach((list) => {
    if (!matchMedia('(hover:hover)').matches) return;
    const f = document.createElement('figure'); f.className = 'peek'; f.setAttribute('aria-hidden', 'true'); document.body.append(f);
    let x = 0, y = 0, tx = 0, ty = 0, on = false;
    list.querySelectorAll('[data-img]').forEach((it) => {
      const im = new Image(); im.src = it.dataset.img; im.alt = ''; f.append(im);
      it.addEventListener('mouseenter', () => { on = true; f.classList.add('on'); f.querySelectorAll('img').forEach((i) => i.classList.toggle('on', i.src === im.src)); });
      it.addEventListener('mouseleave', () => { on = false; f.classList.remove('on'); });
    });
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { x += (tx - x) * .14; y += (ty - y) * .14; f.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) rotate(${(tx - x) * .04}deg)`; requestAnimationFrame(loop); })();
  });
  // горизонтальная галерея: .hs[data-p] > .hs-track — едет вбок от вертикальной прокрутки
  $$('.hs').forEach((h) => { const tr = h.querySelector('.hs-track'); const fit = () => h.style.setProperty('--hw', Math.max(0, tr.scrollWidth - innerWidth + 40) + 'px'); fit(); addEventListener('resize', fit); });

  // ---------- модуль записи (после скриптов страницы: они задают bookPrice / bookDone)
  addEventListener('DOMContentLoaded', () => {
  const cfgEl = $('#book-cfg'); if (!cfgEl) return;
  const C = JSON.parse(cfgEl.textContent), root = $('[data-book]'), st = {}, loc = C.locale || 'en-GB';
  const days = []; { const d = new Date(); d.setHours(12, 0, 0, 0); if (!C.today) d.setDate(d.getDate() + 1);
    while (days.length < (C.days || 10)) { if (!(C.closed || []).includes(d.getDay())) days.push(new Date(d)); d.setDate(d.getDate() + 1); } }
  const fd = (d, o) => d.toLocaleDateString(loc, o);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const steps = C.steps.map((s, si) => {
    const id = 'bk-' + s.key;
    let ctl = '';
    if (s.type === 'chips') ctl = `<div class="bk-chips pick" data-k="${s.key}">${s.options.map((o) => `<button type="button" data-v="${esc(o.v)}" aria-pressed="false"><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>`;
    if (s.type === 'people') ctl = `<div class="bk-people pick" data-k="${s.key}">${s.options.map((o) => `<button type="button" data-v="${esc(o.v)}" aria-pressed="false">${o.img ? `<img src="${o.img}" alt="">` : ''}<b>${esc(o.label)}</b><small>${esc(o.sub || '')}</small></button>`).join('')}</div>`;
    if (s.type === 'stepper') { st[s.key] = s.v; ctl = `<div class="bk-step" data-k="${s.key}"><button type="button" data-d="-1" aria-label="Less">−</button><output>${s.v}</output><button type="button" data-d="1" aria-label="More">+</button><span>${esc(s.unit || '')}</span></div>`; }
    if (s.type === 'range') { st[s.key] = s.v; ctl = `<div class="bk-range"><output>${s.v}${esc(s.unit || '')}</output><input type="range" data-k="${s.key}" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${s.v}" aria-label="${esc(s.label)}"></div>`; }
    if (s.type === 'days') ctl = `<div class="bk-days pick" data-k="${s.key}">${days.map((d, i) => `<button type="button" data-v="${i}" aria-pressed="false"><small>${fd(d, { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${fd(d, { month: 'short' })}</small></button>`).join('')}</div>`;
    if (s.type === 'times') ctl = `<div class="bk-times pick" data-k="${s.key}"><p class="bk-hint">Pick a day first</p></div>`;
    if (s.type === 'fields') ctl = `<div class="bk-fields">${s.fields.map((f) => `<label><span>${esc(f.label)}</span><input name="${f.name}" ${f.type ? `type="${f.type}"` : ''} ${f.auto ? `autocomplete="${f.auto}"` : ''} ${f.mode ? `inputmode="${f.mode}"` : ''} placeholder="${esc(f.ph || '')}" maxlength="${f.max || 80}"></label>`).join('')}</div>`;
    return `<div class="bk-s" data-r style="--d:${si * 40}ms"><h3 id="${id}">${esc(s.label)}</h3>${ctl}</div>`;
  }).join('');
  const sumRows = (C.summary || []).map(([k, l]) => `<li><span>${esc(l)}</span><b data-sum="${k}">—</b></li>`).join('');
  root.innerHTML = `<div class="bk-form">${steps}</div>
    <aside class="bk-card" aria-live="polite"><div class="bk-q"><p class="bk-k">${esc(C.cardTitle || 'Your booking')}</p><p class="bk-big" data-big>—</p><p class="bk-sub" data-sub></p>
      <ul>${sumRows}</ul><p class="bk-err" role="alert"></p><button type="button" class="bk-go">${esc(C.cta)}</button><p class="bk-fine">${esc(C.fine || '')}</p></div>
      <div class="bk-done"><div class="bk-seal">${C.seal ? document.getElementById(C.seal).innerHTML : ''}</div><p class="bk-k">${esc(C.doneKicker || 'Confirmed')}</p><h3 data-dt></h3><p data-dd></p><p class="bk-code" data-code></p></div></aside>`;
  const card = $('.bk-card', root);
  const label = (k) => { const s = C.steps.find((x) => x.key === k); if (!s) return st[k];
    if (s.type === 'days') return st[k] == null ? null : fd(days[st[k]], { weekday: 'short', day: 'numeric', month: 'short' });
    if (s.options) { const o = s.options.find((o) => o.v === st[k]); return o ? o.label : null; } return st[k]; };
  const opt = (k) => { const s = C.steps.find((x) => x.key === k); return s && s.options ? s.options.find((o) => o.v === st[k]) : null; };
  const api = { st, label, opt, days, fd };
  let shown = null;
  function sum() {
    (C.summary || []).forEach(([k]) => { const el = $(`[data-sum="${k}"]`, root); const v = window.bookRow ? window.bookRow(k, api) : undefined; el.textContent = v ?? label(k) ?? '—'; });
    const p = window.bookPrice ? window.bookPrice(api) : null; const big = $('[data-big]', root), sub = $('[data-sub]', root);
    if (p) { sub.textContent = p.sub || '';
      if (typeof p.n === 'number') { const from = shown ?? p.n, t0 = performance.now(); shown = p.n; (function run(t) { const k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3); big.textContent = p.fmt(Math.round(from + (p.n - from) * e)); if (k < 1) requestAnimationFrame(run); })(t0); }
      else big.textContent = p.text; }
  }
  function times(k) {
    const s = C.steps.find((x) => x.key === k), d = st[s.after || 'day'], box = $(`.bk-times[data-k="${k}"]`, root);
    if (d == null) return; st[k] = null;
    box.innerHTML = s.slots.map((t, j) => `<button type="button" data-v="${t}" aria-pressed="false" class="${((d + 1) * 7 + j * 3 + (st[s.seed] || '').length) % 5 === 1 ? 'x' : ''}">${t}</button>`).join('');
  }
  // выбор в группах модуля (kit.js вешает обработчик только на группы, что были при загрузке)
  root.addEventListener('click', (e) => { const b = e.target.closest('.pick [data-v]'); if (!b || b.classList.contains('x')) return; const g = b.closest('.pick');
    g.querySelectorAll('[data-v]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    g.dispatchEvent(new CustomEvent('pick', { detail: b.dataset.v, bubbles: true })); });
  root.addEventListener('pick', (e) => {
    const k = e.target.dataset.k; st[k] = /^\d+$/.test(e.detail) && C.steps.find((x) => x.key === k).type === 'days' ? +e.detail : e.detail;
    C.steps.filter((s) => s.type === 'times' && ((s.after || 'day') === k || s.seed === k)).forEach((s) => times(s.key));
    $('.bk-err', root).textContent = ''; sum();
  });
  root.addEventListener('click', (e) => { const b = e.target.closest('.bk-step button'); if (!b) return; const w = b.closest('.bk-step'), k = w.dataset.k, s = C.steps.find((x) => x.key === k);
    st[k] = Math.max(s.min, Math.min(s.max, st[k] + +b.dataset.d)); $('output', w).textContent = st[k]; sum(); });
  root.addEventListener('input', (e) => { const r = e.target; if (r.type === 'range') { const s = C.steps.find((x) => x.key === r.dataset.k); st[s.key] = +r.value; r.previousElementSibling.textContent = r.value + (s.unit || ''); r.style.setProperty('--f', ((r.value - s.min) / (s.max - s.min) * 100) + '%'); sum(); } else if (r.name) { st[r.name] = r.value.trim(); $('.bk-err', root).textContent = ''; } });
  $$('input[type=range]', root).forEach((r) => r.dispatchEvent(new Event('input', { bubbles: true })));
  $('.bk-go', root).addEventListener('click', () => {
    for (const s of C.steps) {
      if (s.optional) continue;
      if (s.type === 'fields') { for (const f of s.fields) { const v = st[f.name] || ''; if (!v || (f.re && !new RegExp(f.re).test(v))) { $('.bk-err', root).textContent = f.err; $(`[name="${f.name}"]`, root).focus({ preventScroll: true }); return; } } }
      else if (st[s.key] == null && !['stepper', 'range'].includes(s.type)) { $('.bk-err', root).textContent = s.err || 'Choose: ' + s.label.toLowerCase(); return; }
    }
    const [t, d] = window.bookDone(api); $('[data-dt]', root).textContent = t; $('[data-dd]', root).textContent = d;
    $('[data-code]', root).textContent = (C.codePrefix || 'REF') + '-' + String(Date.now()).slice(-5);
    card.classList.add('ok'); window.toast && toast(C.toast || t, d);
  });
  // ссылки «Book» с data-pre: предвыбор варианта и переход к записи
  $$('[data-pre]').forEach((a) => a.addEventListener('click', () => { const [k, v] = a.dataset.pre.split(':'); const b = $(`[data-k="${k}"] [data-v="${v}"]`, root); if (b) b.click(); }));
  sum();
  });
})();
