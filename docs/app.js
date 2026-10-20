const form = document.querySelector('#grade-form');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main > section[id]')];
const sectionLinks = [...document.querySelectorAll('nav a[href^="#"]')];
let framePending = false;
function updateReading() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
  document.documentElement.style.setProperty('--reading', String(progress));
  const threshold = Math.min(window.innerHeight * 0.35, 260);
  let current = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) current = section.id;
  }
  if (progress > 0.99) current = sections.at(-1)?.id;
  for (const link of sectionLinks) {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  framePending = false;
}
function requestReadingUpdate() {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateReading);
  }
}
window.addEventListener('scroll', requestReadingUpdate, {passive:true});
window.addEventListener('resize', requestReadingUpdate);
document.addEventListener('toggle', requestReadingUpdate, true);
updateReading();
if ('ResizeObserver' in window) new ResizeObserver(requestReadingUpdate).observe(document.body);
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.03,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.main-project,.study-project,.education,.about-grid,.skill-table>div,.contact').forEach(element => {
    element.classList.add('reveal-item');
    if (element.getBoundingClientRect().top > window.innerHeight - 30) {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    }
  });
  const revealAll = () => {
    document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
    revealObserver.disconnect();
  };
  motionPreference.addEventListener('change', event => { if(event.matches) revealAll(); });
  document.addEventListener('focusin', event => event.target.closest('.reveal-pending')?.classList.remove('reveal-pending'));
  window.addEventListener('beforeprint', revealAll);
}
function openCase() {
  if (location.hash === '#case-painel') document.querySelector('#case-painel').open = true;
}
window.addEventListener('hashchange', openCase);
document.querySelectorAll('a[href="#case-painel"]').forEach(link => {
  link.addEventListener('click', () => { document.querySelector('#case-painel').open = true; });
});
openCase();
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const output = document.querySelector('#grade-result');
  const parts = document.querySelector('#grades').value.split(';').map((value) => value.trim());
  const validFormat = parts.every((value) => /^\d+(?:[.,]\d+)?$/.test(value));
  const notes = parts.map((value) => Number(value.replace(',', '.')));
  if (!validFormat || notes.some((value) => !Number.isFinite(value) || value < 0 || value > 10)) {
    output.classList.add('error');
    output.textContent = 'Use notas de 0 a 10, separadas por ponto e vírgula. Exemplo: 7,5; 8; 9.';
    return;
  }
  const format = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const average = notes.reduce((sum, value) => sum + value, 0) / notes.length;
  output.classList.remove('error');
  output.textContent = `Média: ${format(average)} · Maior: ${format(Math.max(...notes))} · Menor: ${format(Math.min(...notes))}`;
});
document.querySelector('#copy-email').addEventListener('click', async () => {
  const feedback = document.querySelector('#copy-feedback');
  const email = 'murilosiqueiratoledo@gmail.com';
  try {
    await navigator.clipboard.writeText(email);
    feedback.textContent = 'E-mail copiado!';
  } catch {
    feedback.textContent = email;
  }
});
