/* ============================================================
   Pendry Residences Mexico City – Static Clone JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Utilities ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const randDelay = () => Math.floor(Math.random() * 301) + 200; // 200–500 ms

  /* ── Ghost Shopper Audit ── */
  const ghostPanel = $('#ghostPanel');
  const ghostLog   = $('#ghostLog');
  const ghostToggle = $('#ghostToggle');

  function track(type, detail) {
    if (!ghostLog) return;
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const li = document.createElement('li');
    li.innerHTML = `<span class="ts">${ts}</span> <strong>${type}</strong>: ${detail}`;
    ghostLog.appendChild(li);
    ghostLog.scrollTop = ghostLog.scrollHeight;
  }

  if (ghostToggle) {
    ghostToggle.addEventListener('click', () => {
      const list = $('.ghost-log');
      if (list.style.display === 'none') {
        list.style.display = 'block';
        ghostToggle.textContent = '−';
      } else {
        list.style.display = 'none';
        ghostToggle.textContent = '+';
      }
      track('click', 'ghost-toggle');
    });
  }

  // Auto-track elements with data-track
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (!el) return;
    const type  = el.getAttribute('data-track');
    const detail = el.getAttribute('data-detail') || el.textContent.trim().slice(0, 40);
    track(type, detail);
  });

  /* ── Loading Overlay ── */
  const loadingOverlay = $('#loadingOverlay');
  const loadingText    = $('#loadingText');

  function showLoading(text = 'Cargando...') {
    if (!loadingOverlay) return;
    if (loadingText) loadingText.textContent = text;
    loadingOverlay.classList.add('visible');
  }

  function hideLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove('visible');
  }

  /* ── Button Loading State ── */
  function setButtonLoading(btn, text) {
    btn.classList.add('loading');
    const txtSpan = btn.querySelector('.btn-text');
    if (txtSpan) {
      btn.dataset.originalText = txtSpan.textContent;
      txtSpan.textContent = text;
    }
  }

  function resetButton(btn) {
    btn.classList.remove('loading');
    const txtSpan = btn.querySelector('.btn-text');
    if (txtSpan && btn.dataset.originalText) {
      txtSpan.textContent = btn.dataset.originalText;
    }
  }

  /* ── Header Scroll Effect ── */
  const header = $('#siteHeader');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile Menu ── */
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobileNav');
  const mobileOverlay = $('#mobileOverlay');

  function openMenu() {
    if (mobileNav) mobileNav.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', () => {
    if (mobileNav?.classList.contains('open')) closeMenu();
    else openMenu();
  });

  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => {
    setTimeout(closeMenu, 150);
  }));

  /* ── Smooth Scroll & Active Links ── */
  const sections = $$('section[id]');
  const navLinks = $$('.main-nav a[href^="#"]');

  function setActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 120;
    for (const sec of sections) {
      if (scrollPos >= sec.offsetTop) current = sec.getAttribute('id');
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  /* ── Hero Slider ── */
  const slides = $$('.hero-slide');
  let slideIdx = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[slideIdx].classList.remove('active');
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add('active');
    }, 5000);
  }

  /* ── Touch detection for cards ── */
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
    $$('.img-card').forEach(card => card.classList.add('touch-visible'));
  }

  /* ── Generic Form Handler ── */
  function handleForm(formId, successId, submitText, successCallback) {
    const form = $(formId);
    const successBox = $(successId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Reset errors
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));

      // Validate required fields
      form.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.required && !field.value.trim()) {
          valid = false;
          field.closest('.form-group')?.classList.add('invalid');
        }
        if (field.type === 'email' && field.value.trim()) {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(field.value.trim())) {
            valid = false;
            field.closest('.form-group')?.classList.add('invalid');
          }
        }
        if (field.type === 'password' && field.hasAttribute('minlength')) {
          const min = parseInt(field.getAttribute('minlength'), 10);
          if (field.value.length < min) {
            valid = false;
            field.closest('.form-group')?.classList.add('invalid');
          }
        }
      });

      if (!valid) {
        track('form-validation', 'failed ' + formId);
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) setButtonLoading(btn, submitText);

      const delay = randDelay();
      showLoading(submitText + '...');

      setTimeout(() => {
        hideLoading();
        if (btn) resetButton(btn);
        form.style.display = 'none';
        if (successBox) successBox.classList.add('visible');
        track('form-submit', 'success ' + formId);
        if (typeof successCallback === 'function') successCallback(form);
      }, delay);
    });
  }

  /* ── Inquiry Form ── */
  handleForm('#inquiryForm', '#formSuccess', 'Enviando');

  /* ── Register Form ── */
  handleForm('#registerForm', '#registerSuccess', 'Creando cuenta...', (form) => {
    const email = form.querySelector('#regEmail')?.value.trim() || 'user@example.com';
    const name  = form.querySelector('#regName')?.value.trim() || 'user';
    const session = {
      email: email,
      name: name,
      registeredAt: '2026-01-01T00:00:00.000Z'
    };
    localStorage.setItem('rvbr_session', JSON.stringify(session));
    track('auth', 'registered ' + email);

    setTimeout(() => {
      showLoading('Redirigiendo...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 400);
    }, 1200);
  });

  /* ── Session Management ── */
  const sessionRaw = localStorage.getItem('rvbr_session');
  const userIndicator = $('#userIndicator');
  const userNameSpan = $('#userName');
  const registerLinks = $$('.register-link');

  if (sessionRaw) {
    try {
      const session = JSON.parse(sessionRaw);
      registerLinks.forEach(el => el.style.display = 'none');
      if (userIndicator) userIndicator.style.display = 'flex';
      if (userNameSpan) userNameSpan.textContent = session.name || 'user';
      track('session', 'restored ' + session.email);
    } catch (e) {
      localStorage.removeItem('rvbr_session');
    }
  }

  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showLoading('Cerrando sesión...');
      track('auth', 'logout');
      setTimeout(() => {
        localStorage.removeItem('rvbr_session');
        window.location.reload();
      }, randDelay());
    });
  }

  /* ── Intercept contact links ── */
  function interceptContactLinks() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('a');
      if (!el) return;

      const href = el.getAttribute('href') || '';
      let text = null;
      let delay = 300;

      if (href.startsWith('https://wa.me/')) {
        e.preventDefault();
        text = 'Abriendo WhatsApp...';
      } else if (href.startsWith('mailto:')) {
        e.preventDefault();
        text = 'Abriendo correo...';
      } else if (href.startsWith('tel:')) {
        e.preventDefault();
        text = 'Iniciando llamada...';
      } else if (el.classList.contains('external-link') || el.classList.contains('btn-cta')) {
        // Brief flash for external / CTA buttons that aren't anchors
        if (href === '#' || !href.startsWith('#')) {
          text = 'Cargando...';
          delay = randDelay();
        }
      }

      if (text) {
        showLoading(text);
        setTimeout(() => {
          hideLoading();
          if (href && href !== '#') window.open(href, el.target || '_self');
        }, delay);
      }
    });
  }
  interceptContactLinks();

  /* ── Image Error Fallback ── */
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      const card = img.closest('.img-card, .media');
      if (card) {
        card.classList.add('img-fallback');
        if (!card.getAttribute('data-label')) {
          card.setAttribute('data-label', img.alt || 'Image');
        }
      }
      img.style.display = 'none';
    });
  });

  /* ── Ensure no console.error on load ── */
  window.addEventListener('error', (e) => {
    // Log to ghost shopper but suppress console noise
    track('js-error', e.message);
  });

})();
