const $ = selector => document.querySelector(selector);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motionPreference.matches;
const motion = $('#motion'), theme = $('#theme'), menu = $('.menu');
for (const button of [motion, theme, menu, $('#copy-email')]) button.hidden = false;
$('.nav').classList.add('js-menu');
function setMotion(value) {
  reduced = value; document.documentElement.dataset.motion = value ? 'reduced' : 'full';
  motion.setAttribute('aria-pressed', String(value)); motion.setAttribute('aria-label', value ? 'Ativar animações' : 'Reduzir animações');
  if (value) document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}
motion.addEventListener('click', () => setMotion(!reduced));
motionPreference.addEventListener('change', e => setMotion(e.matches)); setMotion(reduced);
function setTheme(dark) { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; theme.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro'); theme.textContent = dark ? '☀' : '☾'; $('meta[name="theme-color"]').content = dark ? '#111d25' : '#f5f4ef'; }
try { setTheme(localStorage.getItem('murilo-theme') === 'dark'); } catch { setTheme(false); }
theme.addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; setTheme(dark); try { localStorage.setItem('murilo-theme', dark ? 'dark' : 'light'); } catch {} });
function closeMenu() { $('#nav-links').classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; $('#nav-links').classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
$('#nav-links').addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.about-grid,.section-title,.project-card,.skill-grid,.timeline article,.contact h2').forEach(el => { if(!reduced) { el.classList.add('reveal'); observer.observe(el); } });
}
const filters = $('.filters'); filters.hidden = false;
filters.addEventListener('click', e => { const button = e.target.closest('[data-filter]'); if(!button) return; const filter = button.dataset.filter; let count = 0;
  document.querySelectorAll('.project-card').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; if(!card.hidden) { count++; card.classList.add('visible'); } });
  filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('#filter-status').textContent = `${count} projeto(s) encontrado(s).`;
});
let scheduled = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--reading', String(range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0));
  let active = ''; document.querySelectorAll('main > section[id]').forEach(section => { if(section.getBoundingClientRect().top < 200) active = section.id; });
  document.querySelectorAll('#nav-links a').forEach(a => { if(a.hash === `#${active}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); scheduled = false;
}
addEventListener('scroll', () => { if(!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true }); addEventListener('resize', updateScroll); updateScroll();
document.addEventListener('focusin', e => e.target.closest('.reveal')?.classList.add('visible'));
$('#copy-email').addEventListener('click', async () => { try { await navigator.clipboard.writeText('murilosiqueiratoledo@gmail.com'); $('#copy-feedback').textContent = 'E-mail copiado!'; } catch { $('#copy-feedback').textContent = 'murilosiqueiratoledo@gmail.com'; } });
$('#grade-form').addEventListener('submit', e => { e.preventDefault(); const tokens = $('#grades').value.split(';').map(x => x.trim()); const values = tokens.map(x => /^\d+(?:[.,]\d+)?$/.test(x) ? Number(x.replace(',', '.')) : NaN); const output = $('#grade-result'); if(!values.length || values.length > 1000 || values.some(v => !Number.isFinite(v) || v < 0 || v > 10)) { output.textContent = 'Informe notas de 0 a 10 separadas por ponto e vírgula.'; output.classList.add('error'); $('#grades').focus(); return; } const format = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }); output.classList.remove('error'); output.textContent = `Média: ${format(values.reduce((sum,v) => sum+v, 0) / values.length)} · Maior: ${format(Math.max(...values))} · Menor: ${format(Math.min(...values))}`; });
