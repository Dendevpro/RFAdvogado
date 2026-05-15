/* ==========================================================================
   RF ADVOGADOS — main.js
   ========================================================================== */

(function () {
  'use strict';

  /* ── Navbar: scroll → solid ── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav toggle ── */
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Active nav link ── */
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const isArtigos = path.includes('/artigos') && href.includes('artigos');
    const isHome    = (page === '' || page === 'index.html') && href === 'index.html';
    const isMatch   = href === page;
    if (isArtigos || isHome || isMatch) a.classList.add('active');
  });

  /* ── IntersectionObserver: unified animation handler ── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.dataset.delay || 0);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
  );

  // All animation targets
  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
    io.observe(el);
  });

  // Staggered auto-animate for grid items
  document.querySelectorAll(
    '.area-card, .value-item, .contact-card, .svc-item, .phil-item, .testi-card, .why-col, .practice-card, .blog-card, .stat-card'
  ).forEach((el, i) => {
    if (!el.classList.contains('fade-in') &&
        !el.classList.contains('fade-in-left') &&
        !el.classList.contains('fade-in-right') &&
        !el.classList.contains('scale-in')) {
      el.classList.add('fade-in');
      el.dataset.delay = i * 70;
      io.observe(el);
    }
  });

  /* ── Counter animation for .stat-number[data-count] ── */
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (counters.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const end    = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const dur    = 1400;
          const start  = performance.now();
          const tick   = (now) => {
            const t    = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(ease * end) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(c => counterIO.observe(c));
  }

  /* ── WhatsApp: desktop vs mobile ── */
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const WZ_PHONE = '5571981227345';
  const wzHref   = isMobile
    ? `https://wa.me/${WZ_PHONE}`
    : `https://web.whatsapp.com/send?1=pt_BR&phone=${WZ_PHONE}`;

  document.querySelectorAll('.wz-link, .wz-float').forEach(el => {
    el.setAttribute('href', wzHref);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  /* ── Dynamic copyright year ── */
  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Contact form: feedback ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function () {
      const btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Enviando…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Enviar Mensagem';
        btn.disabled = false;
      }, 2000);
    });
  }

  /* ── Smooth parallax tilt on hero (desktop only) ── */
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(min-width: 1024px)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      hero.style.backgroundPositionY = `calc(50% + ${y * 0.28}px)`;
    }, { passive: true });
  }

})();
