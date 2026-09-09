/* ============================================================
   NAVBAR – scroll effect + hamburger
   ============================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ============================================================
   ACTIVE NAV LINK on scroll
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => observerNav.observe(sec));

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger delay based on position among siblings
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let idx = 0;
      siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
      entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ============================================================
   TYPING EFFECT
   ============================================================ */
const roles = [
  'Développeur Full Stack',
  'Ingénieur Web',
  'React & Node.js Dev',
  'Passionné SaaS & Cloud',
  'Spring Boot Developer',
  'À la recherche d\'un PFE',
];

let roleIndex  = 0;
let charIndex  = 0;
let isDeleting = false;
const typingEl = document.getElementById('typingText');

function type() {
  const current = roles[roleIndex];

  if (isDeleting) {
    typingEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typingEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 50 : 90;

  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    delay = 1800; // pause at end
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex  = (roleIndex + 1) % roles.length;
    delay = 300;
  }

  setTimeout(type, delay);
}

// Start typing after a short delay
setTimeout(type, 1000);

/* ============================================================
   BACK TO TOP
   ============================================================ */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   SMOOTH ANCHOR SCROLL (for older browsers fallback)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   CONTACT FORM – simple validation & feedback
   ============================================================ */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('.form-submit');
  const name    = contactForm.querySelector('#name').value.trim();
  const email   = contactForm.querySelector('#email').value.trim();
  const message = contactForm.querySelector('#message').value.trim();

  if (!name || !email || !message) {
    showToast('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }

  // Simulate send (replace with real backend / EmailJS / Formspree)
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
    btn.style.background = 'linear-gradient(135deg, #34d399, #059669)';
    showToast('Message envoyé avec succès !', 'success');
    contactForm.reset();

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le message';
      btn.style.background = '';
    }, 4000);
  }, 1500);
});

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '2rem',
    left:         '50%',
    transform:    'translateX(-50%) translateY(20px)',
    background:   type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
    border:       `1px solid ${type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
    color:        type === 'success' ? '#6ee7b7' : '#fca5a5',
    padding:      '0.75rem 1.5rem',
    borderRadius: '99px',
    display:      'flex',
    alignItems:   'center',
    gap:          '0.5rem',
    fontSize:     '0.88rem',
    fontWeight:   '600',
    backdropFilter: 'blur(12px)',
    zIndex:       '9999',
    opacity:      '0',
    transition:   'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace:   'nowrap',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ============================================================
   COUNTER ANIMATION for stats
   ============================================================ */
function animateCounter(el, target, suffix = '+') {
  let count = 0;
  const duration = 1200;
  const step = target / (duration / 16);

  const timer = setInterval(() => {
    count += step;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(count) + suffix;
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNums = entry.target.querySelectorAll('.stat-num');
      statNums.forEach(el => {
        const val = parseInt(el.textContent);
        if (!isNaN(val)) animateCounter(el, val);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about-stats');
if (aboutSection) statsObserver.observe(aboutSection);

/* ============================================================
   PARALLAX on hero glow
   ============================================================ */
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  const g1 = document.querySelector('.glow-1');
  const g2 = document.querySelector('.glow-2');
  if (g1) g1.style.transform = `translate(${x}px, ${y}px)`;
  if (g2) g2.style.transform = `translate(${-x}px, ${-y}px)`;
});
