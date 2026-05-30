(function () {
  'use strict';

  /* ============================================
     Utilities
     ============================================ */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }
  function randomDelay() { return Math.floor(Math.random() * 300) + 200; }
  function now() { return new Date().toLocaleTimeString(); }

  /* ============================================
     Global Loader
     ============================================ */
  function showLoader(text) {
    const loader = $('#global-loader');
    if (!loader) return;
    loader.querySelector('.loader-text').textContent = text || 'Loading...';
    loader.classList.add('active');
  }
  function hideLoader() {
    const loader = $('#global-loader');
    if (loader) loader.classList.remove('active');
  }

  /* ============================================
     Audit Logger
     ============================================ */
  const auditLog = $('#audit-log');
  function audit(action, detail) {
    if (!auditLog) return;
    const li = document.createElement('li');
    li.innerHTML = '<span class="audit-ts">' + now() + '</span> ' + escapeHtml(action) + (detail ? ': ' + escapeHtml(detail) : '');
    auditLog.appendChild(li);
    auditLog.scrollTop = auditLog.scrollHeight;
  }
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============================================
     Audit Panel Toggle
     ============================================ */
  const auditToggle = $('#audit-toggle');
  const auditBody = $('#audit-body');
  if (auditToggle && auditBody) {
    auditToggle.addEventListener('click', () => {
      const collapsed = auditBody.classList.toggle('collapsed');
      auditToggle.textContent = collapsed ? '+' : '−';
      audit('AUDIT_PANEL_TOGGLE', collapsed ? 'collapsed' : 'expanded');
    });
  }

  /* ============================================
     Hero Slider
     ============================================ */
  const heroSlides = $$('.hero-slide');
  const heroDotsContainer = $('#hero-dots');
  let heroIndex = 0;
  if (heroSlides.length && heroDotsContainer) {
    heroSlides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.addEventListener('click', () => {
        setHeroSlide(i);
        audit('HERO_SLIDE_CLICK', 'Slide ' + (i + 1));
      });
      heroDotsContainer.appendChild(btn);
    });
    function setHeroSlide(i) {
      heroSlides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      const dots = $$('.hero-dot');
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      heroIndex = i;
    }
    setInterval(() => {
      heroIndex = (heroIndex + 1) % heroSlides.length;
      setHeroSlide(heroIndex);
    }, 5000);
  }

  /* ============================================
     Image Sliders (Residences, Pendry Way, Culture)
     ============================================ */
  function initSimpleSlider(containerSelector) {
    const container = $(containerSelector);
    if (!container) return;
    const slides = Array.from(container.children);
    if (!slides.length) return;
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 4500);
  }
  initSimpleSlider('#residences-slider');
  initSimpleSlider('#pendryway-slider');
  initSimpleSlider('#culture-slider');

  /* ============================================
     Mobile Menu
     ============================================ */
  const mobileToggle = $('#mobile-menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const mobileClose = $('#mobile-menu-close');
  function openMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    audit('MOBILE_MENU', 'opened');
  }
  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    audit('MOBILE_MENU', 'closed');
  }
  if (mobileToggle) mobileToggle.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => closeMobileMenu());
    });
  }

  /* ============================================
     Smooth Scroll + Active Nav
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        audit('NAV_CLICK', href);
      }
    });
  });

  const sections = $$('section[id]');
  const navLinks = $$('.main-nav a[href^="#"], .mobile-menu a[href^="#"]');
  function highlightNav() {
    let current = '';
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', highlightNav);
  highlightNav();

  /* ============================================
     Header Scroll Effect
     ============================================ */
  const header = $('#header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ============================================
     Form Handling — Inquiry
     ============================================ */
  const inquiryForm = $('#inquiry-form');
  const inquirySubmit = $('#inquiry-submit');
  const inquirySuccess = $('#inquiry-success');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      const data = {};
      inquiryForm.querySelectorAll('input[required]').forEach(inp => {
        data[inp.name] = inp.value.trim();
        if (!inp.value.trim()) {
          valid = false;
          inp.style.borderColor = '#e74c3c';
        } else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
          valid = false;
          inp.style.borderColor = '#e74c3c';
        } else {
          inp.style.borderColor = '#ddd';
        }
      });
      if (!valid) {
        audit('INQUIRY_FORM', 'validation_failed');
        return;
      }
      inquirySubmit.classList.add('loading');
      inquirySubmit.disabled = true;
      audit('INQUIRY_FORM', 'submit_started');
      setTimeout(() => {
        inquirySubmit.classList.remove('loading');
        inquirySubmit.disabled = false;
        inquiryForm.style.display = 'none';
        inquirySuccess.style.display = 'block';
        audit('INQUIRY_FORM', 'submit_success');
      }, randomDelay());
    });
    inquiryForm.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => { inp.style.borderColor = '#ddd'; });
    });
  }

  /* ============================================
     Form Handling — Register
     ============================================ */
  const registerForm = $('#register-form');
  const registerSubmit = $('#register-submit');
  const registerSuccess = $('#register-success');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      const name = registerForm.querySelector('input[name="name"]');
      const email = registerForm.querySelector('input[name="email"]');
      const password = registerForm.querySelector('input[name="password"]');
      [name, email, password].forEach(inp => {
        if (!inp.value.trim()) {
          valid = false;
          inp.style.borderColor = '#e74c3c';
        } else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
          valid = false;
          inp.style.borderColor = '#e74c3c';
        } else if (inp.type === 'password' && inp.value.trim().length < 6) {
          valid = false;
          inp.style.borderColor = '#e74c3c';
        } else {
          inp.style.borderColor = '#ddd';
        }
      });
      if (!valid) {
        audit('REGISTER_FORM', 'validation_failed');
        return;
      }
      registerSubmit.classList.add('loading');
      registerSubmit.disabled = true;
      audit('REGISTER_FORM', 'submit_started');
      setTimeout(() => {
        const session = {
          email: email.value.trim(),
          name: name.value.trim().split(' ')[0] || 'user',
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem('rvbr_session', JSON.stringify(session));
        registerSubmit.classList.remove('loading');
        registerSubmit.disabled = false;
        registerForm.style.display = 'none';
        registerSuccess.style.display = 'block';
        audit('REGISTER_FORM', 'submit_success — session created');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
      }, randomDelay());
    });
    registerForm.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => { inp.style.borderColor = '#ddd'; });
    });
  }

  /* ============================================
     Auth Session
     ============================================ */
  function getSession() {
    try {
      const raw = localStorage.getItem('rvbr_session');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function updateAuthUI() {
    const session = getSession();
    const registerLink = $('#register-link');
    const userIndicator = $('#user-indicator');
    const userName = $('#user-name');
    const mobileRegisterItem = $('#mobile-register-item');
    const mobileLogoutItem = $('#mobile-logout-item');
    if (session) {
      if (registerLink) registerLink.style.display = 'none';
      if (userIndicator) { userIndicator.style.display = 'flex'; userName.textContent = session.name; }
      if (mobileRegisterItem) mobileRegisterItem.style.display = 'none';
      if (mobileLogoutItem) mobileLogoutItem.style.display = 'block';
    } else {
      if (registerLink) registerLink.style.display = 'inline-flex';
      if (userIndicator) userIndicator.style.display = 'none';
      if (mobileRegisterItem) mobileRegisterItem.style.display = 'block';
      if (mobileLogoutItem) mobileLogoutItem.style.display = 'none';
    }
  }
  updateAuthUI();

  function doLogout() {
    showLoader('Cerrando sesión...');
    audit('LOGOUT', 'initiated');
    setTimeout(() => {
      localStorage.removeItem('rvbr_session');
      hideLoader();
      audit('LOGOUT', 'completed');
      window.location.reload();
    }, randomDelay());
  }
  $('#logout-btn')?.addEventListener('click', doLogout);
  $('#mobile-logout-btn')?.addEventListener('click', doLogout);

  /* ============================================
     Loading States for External / Contact Actions
     ============================================ */
  // WhatsApp
  const waBtn = $('#whatsapp-float');
  if (waBtn) {
    waBtn.addEventListener('click', function (e) {
      e.preventDefault();
      showLoader('Abriendo WhatsApp...');
      audit('WHATSAPP_CLICK', 'https://wa.me/525543716148');
      setTimeout(() => {
        hideLoader();
        window.open('https://wa.me/525543716148', '_blank', 'noopener');
      }, randomDelay());
    });
  }

  // Email links
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const addr = this.getAttribute('href').replace('mailto:', '');
      showLoader('Abriendo correo...');
      audit('EMAIL_CLICK', addr);
      setTimeout(() => {
        hideLoader();
        window.location.href = this.getAttribute('href');
      }, randomDelay());
    });
  });

  // Phone links
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const num = this.getAttribute('href').replace('tel:', '');
      showLoader('Iniciando llamada...');
      audit('PHONE_CLICK', num);
      setTimeout(() => {
        hideLoader();
        window.location.href = this.getAttribute('href');
      }, randomDelay());
    });
  });

  // External links on cards / offerings
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (link.classList.contains('whatsapp-float')) return;
    const href = link.getAttribute('href');
    if (href && href.startsWith('http')) {
      link.addEventListener('click', function (e) {
        if (this.closest('.inquiry-form') || this.closest('.register-form')) return;
        e.preventDefault();
        showLoader('Abriendo enlace...');
        audit('EXTERNAL_LINK_CLICK', href);
        setTimeout(() => {
          hideLoader();
          window.open(href, '_blank', 'noopener');
        }, randomDelay());
      });
    }
  });

  // CTA buttons with simulated async
  document.querySelectorAll('.cta-btn, .hero-cta').forEach(btn => {
    const href = btn.getAttribute('href');
    if (href && href.startsWith('#')) {
      btn.addEventListener('click', function (e) {
        audit('CTA_CLICK', href);
      });
    } else if (!href || href === '') {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const text = this.textContent.trim();
        showLoader('Processing...');
        audit('CTA_CLICK', text);
        setTimeout(() => {
          hideLoader();
        }, randomDelay());
      });
    }
  });

  /* ============================================
     Image Error Handling
     ============================================ */
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('onerror')) {
      img.addEventListener('error', function () {
        this.style.display = 'none';
        const parent = this.parentElement;
        if (parent) parent.classList.add('img-fallback');
      });
    }
  });

  /* ============================================
     Footer Policy Links (no-op with loading)
     ============================================ */
  document.querySelectorAll('.footer-col a[href="#"], .form-disclaimer a[href="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showLoader('Loading...');
      audit('POLICY_LINK_CLICK', this.textContent.trim());
      setTimeout(() => { hideLoader(); }, randomDelay());
    });
  });

})();
