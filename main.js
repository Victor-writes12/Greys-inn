/* ============================================================
   GRAYS INN HOTEL — MAIN.JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === PRELOADER ===
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 900);
    });
    // fallback in case 'load' already fired
    setTimeout(() => preloader.classList.add('hidden'), 2200);
  }

  // === HERO PARTICLES ===
  const particleField = document.querySelector('.hero-particles');
  if (particleField) {
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 12) + 's';
      p.style.bottom = '-10px';
      particleField.appendChild(p);
    }
  }

  // === HERO ENTRANCE ===
  document.querySelectorAll('.hero-content > *, .page-hero-content > *').forEach((el, i) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(36px)';
    setTimeout(() => {
      el.style.transition = 'opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1)';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 350 + i * 160);
  });

  // === NAVBAR SCROLL STATE ===
  const navbar = document.querySelector('.navbar');
  const toTopBtn = document.querySelector('.to-top');
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar && navbar.classList.add('scrolled');
      toTopBtn && toTopBtn.classList.add('show');
    } else {
      navbar && navbar.classList.remove('scrolled');
      toTopBtn && toTopBtn.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // === MOBILE MENU ===
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }));
  }

  // === SCROLL REVEAL ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // === ANIMATED COUNTERS ===
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.count.includes('.') ? 1 : 0;
      let current = 0;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = target * eased;
        el.textContent = current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObserver.observe(el));

  // === TESTIMONIAL CAROUSEL ===
  const testiCards = document.querySelectorAll('.testi-card');
  const testiDotsWrap = document.querySelector('.testi-dots');
  if (testiCards.length) {
    let active = 0;
    testiCards.forEach((c, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showTesti(i));
      testiDotsWrap && testiDotsWrap.appendChild(dot);
    });
    const dots = testiDotsWrap ? testiDotsWrap.querySelectorAll('button') : [];
    function showTesti(i) {
      testiCards[active].classList.remove('active');
      dots[active] && dots[active].classList.remove('active');
      active = i;
      testiCards[active].classList.add('active');
      dots[active] && dots[active].classList.add('active');
    }
    testiCards[0].classList.add('active');
    setInterval(() => showTesti((active + 1) % testiCards.length), 5500);
  }

  // === GALLERY LIGHTBOX ===
  const galleryItems = document.querySelectorAll('.g-item img');
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    const lbImg = lightbox.querySelector('img');
    let idx = 0;
    const sources = Array.from(galleryItems).map(img => img.src);
    const open = (i) => {
      idx = i;
      lbImg.src = sources[idx];
      lightbox.classList.add('active');
    };
    galleryItems.forEach((img, i) => img.addEventListener('click', () => open(i)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => open((idx + 1) % sources.length));
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => open((idx - 1 + sources.length) % sources.length));
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') lightbox.classList.remove('active');
      if (e.key === 'ArrowRight') open((idx + 1) % sources.length);
      if (e.key === 'ArrowLeft') open((idx - 1 + sources.length) % sources.length);
    });
  }

  // === BOOKING / CONTACT FORM — sends real email via Web3Forms ===
  document.querySelectorAll('form[data-inquiry]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector('.form-success') || form.querySelector('.form-success');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';

      // Skip actual sending if no access key has been configured yet
      const accessKeyField = form.querySelector('input[name="access_key"]');
      if (!accessKeyField || !accessKeyField.value || accessKeyField.value.includes('YOUR_')) {
        if (success) {
          success.classList.add('show');
          success.style.borderLeftColor = '#c0392b';
          success.textContent = 'Booking form is not yet connected to email — add your Web3Forms access key in the HTML to activate it.';
        }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        const response = await fetch(form.action || 'https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        const result = await response.json();
        if (success) {
          success.classList.add('show');
          if (result.success) {
            success.style.borderLeftColor = 'var(--gold)';
            success.textContent = 'Thank you — your request has been received. Our reservations team will confirm shortly.';
            form.reset();
          } else {
            success.style.borderLeftColor = '#c0392b';
            success.textContent = 'Something went wrong sending your request — please call or email us directly instead.';
          }
        }
      } catch (err) {
        if (success) {
          success.classList.add('show');
          success.style.borderLeftColor = '#c0392b';
          success.textContent = 'Could not send your request — check your connection, or call/email us directly.';
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
      }
    });
  });

  // === COUNTDOWN (offers page) ===
  document.querySelectorAll('.countdown').forEach(cd => {
    const end = new Date();
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59);
    const dEl = cd.querySelector('[data-d]');
    const hEl = cd.querySelector('[data-h]');
    const mEl = cd.querySelector('[data-m]');
    const sEl = cd.querySelector('[data-s]');
    const tick = () => {
      const diff = Math.max(0, end - new Date());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    };
    tick();
    setInterval(tick, 1000);
  });

  // === PREFILL BOOKING FORM FROM HOMEPAGE QUICK BAR ===
  const params = new URLSearchParams(location.search);
  const prefillMap = { arrival: 'c-arrival', departure: 'c-departure', adults: 'c-guests' };
  Object.entries(prefillMap).forEach(([param, fieldId]) => {
    const value = params.get(param);
    const field = document.getElementById(fieldId);
    if (value && field) field.value = value;
  });

  // === ACTIVE NAV LINK ===
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // === SMOOTH PAGE TRANSITION ON INTERNAL LINKS ===
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', (e) => {
      if (link.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity .35s ease';
      document.body.style.opacity = 0;
      setTimeout(() => { location.href = href; }, 320);
    });
  });

});