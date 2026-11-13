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
  const norm = (p) => p.replace(/index\.html$/, '');
  const here = norm(window.location.pathname);
  document.querySelectorAll('.nav-links a').forEach(a => {
    const target = norm(new URL(a.href, window.location.href).pathname);
    const isArtigos = here.includes('/artigos/') && target.endsWith('/artigos/');
    if (isArtigos || target === here) a.classList.add('active');
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
    : `https://web.whatsapp.com/send?l=pt_BR&phone=${WZ_PHONE}`;

  document.querySelectorAll('.wz-link, .wz-float').forEach(el => {
    el.setAttribute('href', wzHref);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  /* ── Dynamic copyright year ── */
  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Contact form ──
     With a Web3Forms access key in data-web3forms-key the message is posted
     there; without one it opens the visitor's email app, pre-filled. */
  const form = document.getElementById('contactForm');
  if (form) {
    const btn    = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    const label  = btn.innerHTML;
    const say    = (msg, ok) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('is-error', !ok);
    };

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const key  = form.dataset.web3formsKey;

      if (!key) {
        const lines = [
          'Nome: ' + data.get('nome'),
          'Telefone: ' + (data.get('telefone') || '-'),
          'Email: ' + data.get('email'),
          'Área: ' + (data.get('area') || '-'),
          '',
          data.get('mensagem')
        ];
        window.location.href = 'mailto:contato@renatofacciolla.com.br'
          + '?subject=' + encodeURIComponent('Contato pelo site — ' + data.get('nome'))
          + '&body=' + encodeURIComponent(lines.join('\n'));
        say('Abrimos seu aplicativo de email com a mensagem pronta. Se nada abriu, escreva para contato@renatofacciolla.com.br.', true);
        return;
      }

      data.append('access_key', key);
      data.append('subject', 'Contato pelo site — ' + data.get('nome'));
      data.append('from_name', 'renatofacciolla.com.br');
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      try {
        const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        form.reset();
        say('Mensagem enviada. Retornaremos em breve.', true);
      } catch (err) {
        say('Não foi possível enviar agora. Tente pelo WhatsApp ou escreva para contato@renatofacciolla.com.br.', false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
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
