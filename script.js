const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ============================================================
   PRELOADER
   ============================================================ */
const preloader      = document.getElementById('preloader');
const preloaderBar   = document.getElementById('preloaderBar');
const preloaderCount = document.getElementById('preloaderCount');

function finishLoading() {
  preloader.classList.add('done');
  document.body.classList.remove('is-loading');
  document.body.classList.add('loaded');
  setTimeout(startTyping, 900);
  setTimeout(typeCode, 700);
}

(function runPreloader() {
  if (reduceMotion) return finishLoading();
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(eased * 100);
    preloaderBar.style.width = val + '%';
    preloaderCount.textContent = val;
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(finishLoading, 200);
  }
  requestAnimationFrame(tick);
})();

/* ============================================================
   THEME – light / dark with a circular reveal
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
const themeMeta   = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeMeta.setAttribute('content', theme === 'light' ? '#f6f7fb' : '#07080c');
  try { localStorage.setItem('theme', theme); } catch (e) {}
  document.dispatchEvent(new CustomEvent('themechange'));
}

themeMeta.setAttribute('content', document.documentElement.dataset.theme === 'light' ? '#f6f7fb' : '#07080c');

themeToggle.addEventListener('click', (e) => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';

  if (!document.startViewTransition || reduceMotion) return applyTheme(next);

  // Expand a circle from the toggle button to the farthest corner
  const r = themeToggle.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document.startViewTransition(() => applyTheme(next)).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
});

/* ============================================================
   NAVBAR – scroll state, hide on scroll down, hamburger
   ============================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
let lastScroll  = 0;

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', (e) => { if (!navbar.contains(e.target)) closeMenu(); });

/* ============================================================
   SCROLL – progress bar, back-to-top ring, timeline fill
   ============================================================ */
const scrollProgress = document.getElementById('scrollProgress');
const backToTop      = document.getElementById('backToTop');
const progressRing   = document.getElementById('progressRing');
const timeline       = document.getElementById('timeline');
const timelineFill   = document.getElementById('timelineFill');
const tlItems        = document.querySelectorAll('.tl-item');
const RING_LENGTH    = 100.53;

function onScroll() {
  const y   = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p   = max > 0 ? y / max : 0;

  navbar.classList.toggle('scrolled', y > 40);
  navbar.classList.toggle('hidden', y > lastScroll && y > 400 && !navLinks.classList.contains('open'));
  lastScroll = y;

  scrollProgress.style.transform = `scaleX(${p})`;
  backToTop.classList.toggle('visible', y > 500);
  progressRing.style.strokeDashoffset = RING_LENGTH * (1 - p);

  // Timeline fill follows the middle of the viewport
  const rect = timeline.getBoundingClientRect();
  const mid  = window.innerHeight * 0.55;
  const fill = Math.min(Math.max((mid - rect.top) / rect.height, 0), 1);
  timelineFill.style.height = (fill * 100) + '%';
  tlItems.forEach(item => {
    item.classList.toggle('active', item.getBoundingClientRect().top + 36 < mid);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   ACTIVE NAV LINK
   ============================================================ */
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('section[id]').forEach(sec => observerNav.observe(sec));

/* ============================================================
   REVEAL ON SCROLL (staggered among siblings)
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal'));
    const idx = Math.max(siblings.indexOf(entry.target), 0);
    entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
    entry.target.classList.add('visible');
    // Remove the delay once revealed so hover transitions stay snappy
    setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1400);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   TYPING EFFECT – hero role
   ============================================================ */
const roles = [
  'Développeur Full Stack',
  'Étudiant Ingénieur – Développement Web',
  'React · Node.js · Express.js',
  'Spring Boot · Angular · Microservices',
  'SaaS multi-tenant · Stripe · Supabase',
  'À la recherche d\'un Stage PFE',
];
const typingEl = document.getElementById('typingText');
let roleIndex = 0, charIndex = 0, isDeleting = false;

function startTyping() {
  if (reduceMotion) { typingEl.textContent = roles[0]; return; }
  type();
}

function type() {
  const current = roles[roleIndex];
  charIndex += isDeleting ? -1 : 1;
  typingEl.textContent = current.slice(0, charIndex);

  let delay = isDeleting ? 35 : 70;
  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    delay = 1900;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 350;
  }
  setTimeout(type, delay);
}

/* ============================================================
   MINI IDE – tabs, syntax-highlighted typing, terminal
   ============================================================ */
const ideFiles = {
  profile: {
    name: 'profile.ts', lang: 'TypeScript',
    code:
`import { Developer } from "@/types";

export const ala: Developer = {
  name: "Ala Ben Daoud",
  role: "Full Stack Developer",
  school: "ESPRIT – Ingénieur Web",
  experience: 5, // stages
  lookingFor: "Stage PFE · 6 mois",
  available: new Date("2027-01-01"),
};`,
  },
  stack: {
    name: 'stack.json', lang: 'JSON',
    code:
`{
  "frontend": ["React", "Angular", "Tailwind"],
  "backend":  ["Node.js", "Express", "Spring Boot"],
  "database": ["PostgreSQL", "MongoDB", "Supabase"],
  "archi":    ["REST", "Microservices", "RabbitMQ"],
  "devops":   ["Docker", "Git", "GitHub"]
}`,
  },
  experience: {
    name: 'experience.ts', lang: 'TypeScript',
    code:
`// 5 stages en entreprise
export const experience = {
  2026: "VCLOW — SaaS multi-tenant",
  2025: "Designet — ProductFlow",
  2024: "Zahou-Tech — Supadata",
  2023: "Designet — Perfect Translation",
  2022: "Designet — Molka Delivery",
};`,
  },
};

const ideOrder      = Object.keys(ideFiles);
const codeBlock     = document.getElementById('codeBlock');
const ideGutter     = document.getElementById('ideGutter');
const ideBreadcrumb = document.getElementById('ideBreadcrumb');
const ideLang       = document.getElementById('ideLang');
const ideTabs       = document.querySelectorAll('.ide-tab');
const terminalEl    = document.getElementById('terminal');
let ideRun = 0, ideAuto = true, ideTimer = null, terminalStarted = false;

const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Tiny highlighter: comments, strings (object keys too), keywords, numbers, keys, types
const TOKEN_RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)(?=(\s*:)?)|\b(import|from|export|const|new)\b|\b(\d+)\b|\b([a-z_]\w*)(?=\s*:)|\b([A-Z]\w*)\b/g;

function highlightLine(line) {
  return escapeHtml(line).replace(TOKEN_RE, (m, com, str, colon, kw, num, key, type) => {
    if (com)  return `<span class="tk-c">${m}</span>`;
    if (str)  return `<span class="${colon ? 'tk-key' : 'tk-s'}">${m}</span>`;
    if (kw)   return `<span class="tk-k">${m}</span>`;
    if (num)  return `<span class="tk-n">${m}</span>`;
    if (key)  return `<span class="tk-key">${m}</span>`;
    if (type) return `<span class="tk-t">${m}</span>`;
    return m;
  });
}

function renderCode(text, withCaret) {
  const lines = text.split('\n');
  const last  = lines.length - 1;
  codeBlock.innerHTML = lines.map((l, i) =>
    `<span class="ln${i === last ? ' cur' : ''}">${highlightLine(l)}${i === last && withCaret ? '<span class="caret"></span>' : ''}${l || i === last ? '' : ' '}</span>`
  ).join('');
  ideGutter.innerHTML = lines.map((_, i) => `<span${i === last ? ' class="cur"' : ''}>${i + 1}</span>`).join('');
}

function openFile(key, { animate = true } = {}) {
  const file = ideFiles[key];
  const run  = ++ideRun;
  clearTimeout(ideTimer);

  ideTabs.forEach(t => t.classList.toggle('active', t.dataset.file === key));
  ideBreadcrumb.textContent = file.name;
  ideLang.textContent = file.lang;

  if (!animate || reduceMotion) {
    renderCode(file.code, true);
    return onFileTyped(key, run);
  }

  let i = 0;
  (function step() {
    if (run !== ideRun) return;
    i++;
    renderCode(file.code.slice(0, i), true);
    if (i < file.code.length) {
      const ch = file.code[i - 1];
      setTimeout(step, ch === '\n' ? 70 : 14 + Math.random() * 20);
    } else {
      onFileTyped(key, run);
    }
  })();
}

function onFileTyped(key, run) {
  if (!terminalStarted) { terminalStarted = true; runTerminal(); }
  if (!ideAuto || reduceMotion) return;
  ideTimer = setTimeout(() => {
    if (run !== ideRun) return;
    const next = ideOrder[(ideOrder.indexOf(key) + 1) % ideOrder.length];
    openFile(next);
  }, 4500);
}

ideTabs.forEach(tab => tab.addEventListener('click', () => {
  ideAuto = false; // the visitor took control
  openFile(tab.dataset.file, { animate: false });
}));

function runTerminal() {
  const prompt = '<span class="term-prompt">➜</span> <span class="term-path">~/ala-ben-daoud</span> ';
  const command = 'npm run hire';
  const output = [
    '<span class="term-muted">&gt; compiling profile…</span>',
    '<span class="term-ok">✔</span> 5 stages · 8 projets · 3 langues <span class="term-muted">(0.42s)</span>',
    '<span class="term-info">➜</span> <span class="term-hl">Disponible le 01/01/2027 — Stage PFE (6 mois)</span>',
  ];

  const cmdLine = document.createElement('div');
  cmdLine.className = 'term-line';
  terminalEl.appendChild(cmdLine);

  if (reduceMotion) {
    cmdLine.innerHTML = prompt + command;
    output.forEach(addTermLine);
    return;
  }

  let i = 0;
  (function typeCmd() {
    cmdLine.innerHTML = prompt + command.slice(0, i) + '<span class="caret"></span>';
    if (i++ < command.length) return setTimeout(typeCmd, 55);
    cmdLine.innerHTML = prompt + command;
    output.forEach((line, k) => setTimeout(() => addTermLine(line), 450 + k * 650));
  })();
}

function addTermLine(html) {
  const line = document.createElement('div');
  line.className = 'term-line';
  line.innerHTML = html;
  terminalEl.appendChild(line);
}

function typeCode() { openFile('profile'); }

/* ============================================================
   HERO CANVAS – interactive dot-grid wave
   ============================================================ */
(function dotGrid() {
  const canvas  = document.getElementById('heroCanvas');
  const ctx     = canvas.getContext('2d');
  const hero    = document.getElementById('hero');
  const mouse   = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  const GAP     = 30;     // distance between dots
  const RADIUS  = 190;    // cursor influence radius
  const VIOLET  = [139, 92, 246];
  const CYAN    = [34, 211, 238];
  let dots = [], w = 0, h = 0, dpr = 1, running = true, rafId = null;
  let dotRgb = '200, 200, 230';

  function readThemeColors() {
    dotRgb = getComputedStyle(document.documentElement).getPropertyValue('--particle').trim() || dotRgb;
  }
  readThemeColors();
  document.addEventListener('themechange', () => { readThemeColors(); if (reduceMotion) draw(0); });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.offsetWidth; h = hero.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const cx = w / 2, cy = h * 0.45;
    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        dots.push({ x, y, d: Math.hypot(x - cx, y - cy) });
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // ease the cursor position for a fluid feel
    mouse.x += (mouse.tx - mouse.x) * 0.12;
    mouse.y += (mouse.ty - mouse.y) * 0.12;

    for (const p of dots) {
      // slow radial wave travelling outward from the centre
      const wave = (Math.sin(p.d * 0.018 - t * 0.0016) + 1) / 2;

      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const md = Math.hypot(dx, dy);
      const inf = md < RADIUS ? Math.pow(1 - md / RADIUS, 2) : 0;

      // dots are pushed away from the cursor
      const x = p.x + (md ? (dx / md) * inf * 14 : 0);
      const y = p.y + (md ? (dy / md) * inf * 14 : 0) + wave * 2;

      const r = 0.8 + wave * 0.5 + inf * 2.2;

      if (inf > 0) {
        const k = Math.min(Math.max(p.x / w, 0), 1);
        const c = VIOLET.map((v, i) => Math.round(v + (CYAN[i] - v) * k));
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.35 + inf * 0.65})`;
      } else {
        ctx.fillStyle = `rgba(${dotRgb}, ${0.1 + wave * 0.22})`;
      }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    if (running && !reduceMotion) rafId = requestAnimationFrame(draw);
  }

  hero.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
    if (mouse.x < -1000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  });
  hero.addEventListener('mouseleave', () => { mouse.tx = mouse.ty = mouse.x = mouse.y = -9999; });

  // Pause the animation when the hero is off-screen
  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running && !reduceMotion) { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw); }
  }).observe(hero);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(0); }, 150);
  });

  resize();
  draw(0);
})();

/* ============================================================
   CUSTOM CURSOR (desktop only)
   ============================================================ */
if (finePointer && !reduceMotion) {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    document.body.classList.add('cursor-ready');
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));

  (function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll('a, button, .chip, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ============================================================
   3D TILT
   ============================================================ */
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform 0.1s ease-out';
      el.style.transform = `perspective(900px) rotateX(${-py * 8}deg) rotateY(${px * 10}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
    });
  });
}

/* ============================================================
   SPOTLIGHT – mouse position for the card glow
   ============================================================ */
document.querySelectorAll('.spotlight').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ============================================================
   COUNTERS
   ============================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1400;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const stats = document.querySelector('.stats');
if (stats) statsObserver.observe(stats);

/* ============================================================
   SMOOTH ANCHOR SCROLL (with navbar offset)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ============================================================
   CONTACT FORM – sends an e-mail to alabendawed@gmail.com
   via FormSubmit (https://formsubmit.co), no backend needed
   ============================================================ */
const contactForm  = document.getElementById('contactForm');
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/alabendawed@gmail.com';
const submitBtn    = contactForm.querySelector('.form-submit');
const submitLabel  = submitBtn.innerHTML;

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const field   = (id) => contactForm.querySelector(`#${id}`).value.trim();
  const name    = field('name');
  const email   = field('email');
  const phone   = field('phone');
  const subject = field('subject') || 'Nouveau message depuis le portfolio';
  const message = field('message');

  if (!name || !email || !message) {
    showToast('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Adresse e-mail invalide.', 'error');
    return;
  }
  if (phone && !/^\+?[\d\s().-]{6,20}$/.test(phone)) {
    showToast('Numéro de téléphone invalide.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Envoi en cours…</span>';

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // Keys become the row labels of the e-mail table, in this order
      body: JSON.stringify({
        'Nom': name,
        'Email': email,
        'Téléphone': phone || '—',
        'Sujet': subject,
        'Message': message,
        _subject: `[Portfolio] ${subject}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
        _honey: contactForm.querySelector('[name="_honey"]').value,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === 'false' || data.success === false) throw new Error(data.message || res.status);

    submitBtn.classList.add('is-success');
    submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Message envoyé !</span>';
    showToast('Merci ! Votre message a bien été envoyé.', 'success');
    contactForm.reset();
  } catch (err) {
    showToast("Échec de l'envoi. Écrivez-moi directement à alabendawed@gmail.com", 'error');
    submitBtn.innerHTML = submitLabel;
  } finally {
    submitBtn.disabled = false;
    setTimeout(() => {
      submitBtn.classList.remove('is-success');
      submitBtn.innerHTML = submitLabel;
    }, 4000);
  }
});

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = 'success') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i><span></span>`;
  toast.querySelector('span').textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();
