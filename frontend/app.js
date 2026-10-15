const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data = {skills: [], projects: [], experience: [], education: [], certifications: []};

/* theme */
const root = document.documentElement;
let saved = null; try { saved = localStorage.getItem('theme-v2'); } catch (e) {}
const setTheme = (t) => { root.dataset.theme = t; $('#theme').textContent = t === 'dark' ? '\u2600' : '\u263E'; };
setTheme(saved || 'light');
$('#theme').onclick = () => { const t = root.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(t); try { localStorage.setItem('theme-v2', t); } catch (e) {} };
$('#yr').textContent = new Date().getFullYear();

/* mobile menu */
$('#menu').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', o); };
document.querySelectorAll('.links a').forEach((a) => a.addEventListener('click', () => $('#nav').classList.remove('open')));

/* typing */
const words = ['Terraform workflows', 'GitHub Actions pipelines', 'Docker deployments', 'AWS & Azure infrastructure', 'Prometheus dashboards'];
let w = 0, c = 0, del = false;
(function type() {
  const word = words[w];
  $('#typed').textContent = word.slice(0, c);
  c += del ? -1 : 1;
  if (c > word.length) { del = true; setTimeout(type, 1400); return; }
  if (c < 0) { del = false; w = (w + 1) % words.length; c = 0; }
  setTimeout(type, del ? 40 : 80);
})();

/* scroll reveal */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: 0.06});
  document.querySelectorAll('section').forEach((s) => { s.classList.add('reveal'); io.observe(s); });
}

/* helpers */
function countUp(el, to) {
  const t0 = performance.now();
  (function f(t) { const k = Math.min((t - t0) / 900, 1); el.textContent = Math.round(to * k); if (k < 1) requestAnimationFrame(f); })(t0);
}
const lines = (s) => String(s).split('\n').filter(Boolean);
const lis = (s) => lines(s).map((t) => `<li>${esc(t)}</li>`).join('');
const chips = (s, cls = '') => `<div class="chips ${cls}">${String(s).split('|').map((t) => `<span>${esc(t.trim())}</span>`).join('')}</div>`;

/* render */
function render() {
  
  $('#skillGrid').innerHTML = data.skills.map((s) => `<div class="card"><h3>${esc(s.category)}</h3>${chips(s.items, 'lg')}</div>`).join('');
  $('#projectGrid').innerHTML = data.projects.map((p) =>
    `<div class="card"><h3>${esc(p.title)}</h3><p class="psub">${esc(p.subtitle)}</p>${chips(p.stack)}<ul class="bul">${lis(p.details)}</ul>${p.link ? `<p><a href="${esc(p.link)}" target="_blank" rel="noopener">View on GitHub &rarr;</a></p>` : ''}</div>`).join('');
  $('#expList').innerHTML = data.experience.map((x, i) => {
    const now = /present/i.test(x.period);
    return `<div class="job${i === 0 ? ' open' : ''}"><button class="job-head" aria-expanded="${i === 0}"><span><b>${esc(x.role)}</b><em>${esc(x.company)}</em></span><span class="meta">${now ? '<span class="now">Current</span>' : ''}<small class="${now ? 'cur' : ''}">${esc(x.period)}</small><i class="chev"></i></span></button><div class="job-body"><div><ul>${lis(x.details)}</ul></div></div></div>`;
  }).join('');
  $('#eduList').innerHTML = data.education.map((e) =>
    `<div class="card"><h3>${esc(e.degree)}</h3><p class="psub">${esc(e.school)} &middot; ${esc(e.period)}</p><p>${esc(e.details)}</p></div>`).join('');
  $('#certGrid').innerHTML = data.certifications.map((k) => `<div class="card cert"><b>${esc(k.name)}</b><small>${esc(k.issued)}</small></div>`).join('');
}

/* API */
fetch('/api/profile').then((r) => r.json()).then((d) => { data = d; render(); })
  .catch(() => ($('#skillGrid').innerHTML = '<p class="empty">Could not load data from API.</p>'));

/* toast */
function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3200); }

/* contact form -> API -> email to Rahul */
$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target, btn = f.querySelector('button');
  btn.disabled = true; $('#status').textContent = 'Sending...';
  try {
    const r = await fetch('/api/contact', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(Object.fromEntries(new FormData(f)))});
    const msg = r.ok ? 'Thanks! Your message has been sent to Rahul.' : r.status === 429 ? 'Too many messages, please try again later.' : 'Please check your details.';
    $('#status').textContent = msg; toast(msg);
    if (r.ok) f.reset();
  } catch (err) { $('#status').textContent = 'Network error, try again.'; }
  btn.disabled = false;
});

/* resume: normal link on the real site; save dialog inside the claude.ai preview */
$('#resumeBtn').addEventListener('click', async (e) => {
  if (!window.RESUME_B64) return;
  e.preventDefault();
  try {
    const dl = window.claude && (await claude.use('downloads'));
    if (!dl) { toast('Download is not available in this preview'); return; }
    const bin = atob(window.RESUME_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    await dl.save({filename: 'Rahul_Poddar_Resume.pdf', data: new Blob([buf], {type: 'application/pdf'})});
  } catch (err) { if (!err || err.code !== 'declined') toast('Could not start the download'); }
});

/* marquee */
const tools = ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana', 'Git', 'Linux', 'Nginx', 'Bash'];
$('#track').innerHTML = [...tools, ...tools].map((t) => `<span>${t}</span>`).join('');

/* experience accordion */
$('#expList').addEventListener('click', (e) => {
  const head = e.target.closest('.job-head'); if (!head) return;
  const job = head.parentElement, open = !job.classList.contains('open');
  document.querySelectorAll('.job').forEach((j) => { j.classList.remove('open'); j.firstChild.setAttribute('aria-expanded', 'false'); });
  job.classList.toggle('open', open); head.setAttribute('aria-expanded', open);
});

/* card spotlight */
document.addEventListener('pointermove', (e) => {
  const c = e.target.closest && e.target.closest('.grid .card'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
});

/* pipeline simulator: Automated Preview Environments */
const stages = [['PR opened', 'GitHub Actions'], ['Terraform plan', 'init + plan'], ['Provision', 'staging env'], ['Deploy & test', 'containers'], ['Review & merge', 'GitHub Flow'], ['Auto-destroy', 'no idle cost']];
const steps = ['Pull request opened - workflow triggered', 'terraform init && terraform plan ... plan ready', 'terraform apply ... preview environment provisioned', 'Containers deployed, health checks passed', 'Code review approved, PR merged', 'terraform destroy ... preview environment removed'];
const flow = $('#flow');
flow.innerHTML = stages.map(([n, s]) => `<div class="step"><i></i><b>${n}</b><small>${s}</small></div>`).join('');
const stepEls = [...flow.children];
const mark = (el, cls, icon = '') => { el.className = 'step ' + cls; el.firstChild.textContent = icon; };
let busy = false; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function runPipe(fail) {
  if (busy) return; busy = true;
  const log = $('#plog'); log.innerHTML = '<div class="dim">(simulation - demo only)</div>';
  stepEls.forEach((el) => mark(el, ''));
  const add = (t, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  for (let i = 0; i < stages.length; i++) {
    mark(stepEls[i], 'run'); add('> ' + stages[i][0] + ' started');
    await sleep(900);
    if (fail && i === 1) {
      mark(stepEls[i], 'fail', '\u2715'); stepEls.slice(i + 1).forEach((el) => mark(el, 'skip'));
      add('Terraform plan failed - pipeline stopped, no resources were created.', 'bad'); toast('Pipeline failed at Terraform plan'); busy = false; return;
    }
    mark(stepEls[i], 'ok', '\u2713'); add(steps[i]);
  }
  add('Pipeline finished successfully.'); toast('Pipeline succeeded'); busy = false;
}
$('#runPipe').onclick = () => runPipe(false);
$('#failPipe').onclick = () => runPipe(true);

/* command palette (Ctrl/Cmd + K) */
const go = (id) => document.getElementById(id).scrollIntoView({behavior: 'smooth'});
const items = [
  ...['about', 'skills', 'experience', 'projects', 'pipeline', 'education', 'contact'].map((id) => ['Go to ' + id[0].toUpperCase() + id.slice(1), 'section', () => go(id)]),
  ['Download resume', 'file', () => $('#resumeBtn').click()],
  ['Toggle theme', 'action', () => $('#theme').click()],
  ['Run CI/CD pipeline', 'demo', () => { go('pipeline'); setTimeout(() => runPipe(false), 600); }],
  ['Open GitHub', 'link', () => window.open('https://github.com/rahulpoddarcse2', '_blank', 'noopener')],
  ['Open LinkedIn', 'link', () => window.open('https://linkedin.com/in/rahul-poddar-devops', '_blank', 'noopener')],
];
let sel = 0, shown = items;
function drawPal() {
  const q = $('#pin').value.toLowerCase();
  shown = items.filter((x) => x[0].toLowerCase().includes(q)); sel = Math.min(sel, Math.max(shown.length - 1, 0));
  $('#plist').innerHTML = shown.map((x, i) => `<li class="${i === sel ? 'sel' : ''}" data-i="${i}">${esc(x[0])}<small>${x[1]}</small></li>`).join('') || '<li>No results</li>';
}
function togglePal(open) { $('#palette').hidden = !open; if (open) { $('#pin').value = ''; sel = 0; drawPal(); $('#pin').focus(); } }
function runItem(i) { const x = shown[i]; if (x) { togglePal(false); x[2](); } }
$('#kbd').onclick = () => togglePal(true);
$('#pin').addEventListener('input', () => { sel = 0; drawPal(); });
$('#pin').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); drawPal(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); drawPal(); e.preventDefault(); }
  if (e.key === 'Enter') runItem(sel);
});
$('#plist').addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) runItem(+li.dataset.i); });
$('#palette').addEventListener('click', (e) => { if (e.target.id === 'palette') togglePal(false); });
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); togglePal($('#palette').hidden); }
  if (e.key === 'Escape') togglePal(false);
});

/* scroll progress, active nav, back to top */
const secs = [...document.querySelectorAll('section')], navLinks = [...document.querySelectorAll('.links a[href^="#"]')];
function onScroll() {
  const h = document.documentElement;
  $('#progress').style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) * 100 + '%';
  $('#top').classList.toggle('show', h.scrollTop > 600);
  let cur = ''; secs.forEach((s) => { if (s.getBoundingClientRect().top < 120) cur = s.id; });
  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
addEventListener('scroll', onScroll, {passive: true}); onScroll();
$('#top').onclick = () => scrollTo({top: 0, behavior: 'smooth'});

/* system status (3-tier health) */
const setStat = (cls) => ['stApi', 'stDb'].forEach((id) => ($('#' + id).className = cls));
fetch('/api/health').then((r) => setStat(r.ok ? 'up' : 'down')).catch(() => setStat('down'));
