// Seinokojii — English page (26.11.2026): появление, телефон с примерами и уведомлениями, заявка в Telegram (как site.js, без выбора страны)
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = () => { const vh = innerHeight; $$('[data-in]:not(.in)').forEach(n => { const r = n.getBoundingClientRect(); if ((r.top < vh * .9 || r.bottom <= vh) && r.bottom > -40) n.classList.add('in'); }); };
  const top = $('.top'), fab = $('.fab'), hero = $('.hero'), contact = $('#contact');
  const onScroll = () => { seen(); top.classList.toggle('sh', scrollY > 10);
    fab.classList.toggle('on', hero.getBoundingClientRect().bottom < 0 && contact.getBoundingClientRect().top > innerHeight * .6); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', seen); requestAnimationFrame(() => requestAnimationFrame(onScroll));
  const NOTES = JSON.parse($('#notes').textContent), imgs = $$('.scr img'), note = $('.note'), nt = $('[data-nt]'), ns = $('[data-ns]');
  let i = 0; const show = () => { const k = imgs[i].dataset.k; imgs.forEach((im, j) => im.classList.toggle('on', j === i));
    note.classList.remove('on'); setTimeout(() => { nt.textContent = NOTES[k][0]; ns.textContent = NOTES[k][1]; note.classList.add('on'); }, RM ? 0 : 900); };
  setTimeout(() => note.classList.add('on'), RM ? 0 : 1700);
  if (!RM) setInterval(() => { if (document.hidden) return; i = (i + 1) % imgs.length; show(); }, 3600);
  const TG = 'https://t.me/CEOSeinokojii', mob = matchMedia('(pointer: coarse)').matches;
  const go = t => { const h = TG + (t ? '?text=' + encodeURIComponent(t) : ''); if (mob) location.href = h; else window.open(h, '_blank', 'noopener'); };
  if (mob) $$('a[href^="https://t.me/"]').forEach(a => a.removeAttribute('target'));
  const form = $('.form'), err = $('.err', form), pick = $('.pick', form), val = n => form[n].value.trim(), tierEl = () => $('input[name="tier"]:checked', form);
  const text = () => { const t = tierEl();
    return ['Hi! I would like a website.', 'Website: ' + (t ? `${t.dataset.title}, $${t.dataset.price}` : '…'), 'Business: ' + val('company'), 'Town and country: ' + val('address'), 'My name: ' + val('name')].join('\n'); };
  form.addEventListener('input', ev => { ev.target.classList.remove('bad'); pick.classList.remove('bad'); err.textContent = ''; });
  $$('[data-tier]').forEach(a => a.addEventListener('click', () => { const r = $(`input[name="tier"][value="${a.dataset.tier}"]`, form); if (r) r.checked = true; }));
  const need = [['company', 'Add your business name'], ['address', 'Add your town and country'], ['name', 'Add your name']];
  let via = 'mail'; $$('[data-via]').forEach(b => b.addEventListener('click', () => { via = b.dataset.via; }));
  form.addEventListener('submit', ev => { ev.preventDefault();
    if (!tierEl()) { err.textContent = 'Choose which website you need'; pick.classList.remove('bad'); void pick.offsetWidth; pick.classList.add('bad'); return; }
    for (const [n, msg] of need) if (val(n).length < 2) { err.textContent = msg; form[n].classList.remove('bad'); void form[n].offsetWidth; form[n].classList.add('bad'); form[n].focus(); return; }
    const t = text(); try { navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}); } catch (e) {}
    if (via === 'mail') location.href = 'mailto:mahmudovadyl40@gmail.com?subject=' + encodeURIComponent('Website for ' + val('company')) + '&body=' + encodeURIComponent(t); else go(t); });
  if (location.hash === '#works') requestAnimationFrame(() => $('#works').scrollIntoView());
})();
