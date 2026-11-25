// Seinokojii Project — главная, шестая версия (25.11.2026): появление, телефон с примерами и уведомлениями, страна и цены, заявка в Telegram
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---------- появление при прокрутке (по положению в кадре: надёжно для блоков со сдвигом)
  const seen = () => { const vh = innerHeight; $$('[data-in]:not(.in)').forEach(n => { const r = n.getBoundingClientRect(); if ((r.top < vh * .9 || r.bottom <= vh) && r.bottom > -40) n.classList.add('in'); }); };
  // ---------- шапка, плавающая кнопка
  const top = $('.top'), fab = $('.fab'), hero = $('.hero'), contact = $('#contact');
  const onScroll = () => { seen(); top.classList.toggle('sh', scrollY > 10);
    fab.classList.toggle('on', hero.getBoundingClientRect().bottom < 0 && contact.getBoundingClientRect().top > innerHeight * .6); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', seen); requestAnimationFrame(() => requestAnimationFrame(onScroll));
  // ---------- телефон: примеры по очереди, на каждый — своё уведомление
  const NOTES = JSON.parse($('#notes').textContent), imgs = $$('.scr img'), note = $('.note'), nt = $('[data-nt]'), ns = $('[data-ns]');
  let i = 0; const show = () => { const k = imgs[i].dataset.k; imgs.forEach((im, j) => im.classList.toggle('on', j === i));
    note.classList.remove('on'); setTimeout(() => { nt.textContent = NOTES[k][0]; ns.textContent = NOTES[k][1]; note.classList.add('on'); }, RM ? 0 : 900); };
  setTimeout(() => note.classList.add('on'), RM ? 0 : 1700);
  if (!RM) setInterval(() => { if (document.hidden) return; i = (i + 1) % imgs.length; show(); }, 3600);
  // ---------- страна: ?c= → прошлый выбор → часовой пояс → Кыргызстан. Россия — только боты (bot/)
  const REG = JSON.parse($('#reg').textContent);
  const byTz = () => { let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return /^Asia\/(Almaty|Qostanay|Aqtobe|Aqtau|Atyrau|Oral|Qyzylorda)$/.test(tz) ? 'kz' : /^Europe\/(Chisinau|Tiraspol)$/.test(tz) ? 'md' : 'kg'; };
  const saved = () => { try { return localStorage.getItem('cc'); } catch (e) { return null; } };
  const q = new URLSearchParams(location.search).get('c'); if (q === 'ru') { location.replace('bot/'); return; }
  let cc = [q, saved(), byTz()].find(k => k && REG[k]);
  const nb = v => String(v).replace(/ /g, ' ');
  const apply = () => { const g = REG[cc]; $$('[data-r]').forEach(el => { if (g[el.dataset.r] !== undefined) el.textContent = nb(g[el.dataset.r]); });
    $$('[data-cc]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cc === cc))); };
  apply();
  $$('[data-cc]').forEach(b => b.addEventListener('click', () => { cc = b.dataset.cc; try { localStorage.setItem('cc', cc); } catch (e) {} apply(); }));
  // ---------- Telegram (@CEOSeinokojii): на телефоне — той же вкладкой (иначе приложение не получит ссылку)
  const TG = 'https://t.me/CEOSeinokojii', mob = matchMedia('(pointer: coarse)').matches;
  const go = t => { const h = TG + (t ? '?text=' + encodeURIComponent(t) : ''); if (mob) location.href = h; else window.open(h, '_blank', 'noopener'); };
  if (mob) $$('a[href^="https://t.me/"]').forEach(a => a.removeAttribute('target'));
  // ---------- заявка: тариф, компания, адрес и имя обязательны; сайт ничего не хранит
  const form = $('.form'), err = $('.err', form), pick = $('.pick', form), val = n => form[n].value.trim(), tierEl = () => $('input[name="tier"]:checked', form);
  const text = () => { const t = tierEl(), g = REG[cc];
    return ['Здравствуйте! Хочу заказать сайт.', 'Тариф: ' + (t ? `${t.dataset.title} — ${g[t.dataset.rk]} ${g.curw}` : '…'), 'Страна: ' + g.name, 'Компания: ' + val('company'), 'Адрес: ' + val('address'), 'Меня зовут: ' + val('name')].join('\n'); };
  form.addEventListener('input', ev => { ev.target.classList.remove('bad'); pick.classList.remove('bad'); err.textContent = ''; });
  $$('[data-tier]').forEach(a => a.addEventListener('click', () => { const r = $(`input[name="tier"][value="${a.dataset.tier}"]`, form); if (r) r.checked = true; }));
  const need = [['company', 'Напишите название компании'], ['address', 'Напишите город и адрес'], ['name', 'Напишите, как к вам обращаться']];
  form.addEventListener('submit', ev => { ev.preventDefault();
    if (!tierEl()) { err.textContent = 'Выберите, какой сайт нужен'; pick.classList.remove('bad'); void pick.offsetWidth; pick.classList.add('bad'); return; }
    for (const [n, msg] of need) if (val(n).length < 2) { err.textContent = msg; form[n].classList.remove('bad'); void form[n].offsetWidth; form[n].classList.add('bad'); form[n].focus(); return; }
    const t = text(); try { navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}); } catch (e) {} go(t); });
  if (location.hash === '#works') requestAnimationFrame(() => $('#works').scrollIntoView());
})();
