(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuToggle = document.getElementById('menuToggle');
  var mainMenu = document.getElementById('mainMenu');
  var headerLinks = document.querySelectorAll('.header__link');
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');
  var sections = document.querySelectorAll('section[id]');

  // ---- Interaction tracking log (Ghost Shopper audit) ----
  var interactionLog = [];
  function logInteraction(type, detail) {
    var now = new Date();
    var entry = {
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString('es-MX'),
      type: type,
      detail: detail,
    };
    interactionLog.push(entry);
    console.log('[GhostShopper]', entry);
    updateTrackerUI();
  }

  function updateTrackerUI() {
    var panel = document.getElementById('gs-tracker-log');
    if (!panel) return;
    var html = '';
    interactionLog.slice().reverse().forEach(function (e) {
      html += '<div class="gs-log-entry">' +
        '<span class="gs-log-time">' + e.time + '</span> ' +
        '<span class="gs-log-type">' + e.type + '</span> ' +
        '<span class="gs-log-detail">' + e.detail + '</span>' +
        '</div>';
    });
    panel.innerHTML = html;

    var counter = document.getElementById('gs-interaction-count');
    if (counter) counter.textContent = interactionLog.length;
  }

  // ---- Track page load ----
  logInteraction('PAGE_LOAD', 'Página cargada');

  // ---- Mobile menu toggle ----
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('header__menu-toggle--active');
      mainMenu.classList.toggle('header__menu--open');
    });

    headerLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('header__menu-toggle--active');
        mainMenu.classList.remove('header__menu--open');
      });
    });
  }

  // ---- Header scroll effect ----
  var ticking = false;
  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  // ---- Active nav link on scroll ----
  var navTicking = false;
  function updateActiveLink() {
    var scrollPos = window.scrollY + 100;
    var current = '';

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    headerLinks.forEach(function (link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href && href.substring(1) === current) {
        link.classList.add('active');
      }
    });

    navTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!navTicking) {
      requestAnimationFrame(updateActiveLink);
      navTicking = true;
    }
  });

  // ---- Contact form with Ghost Shopper tracking ----
  if (contactForm) {
    var formSubmitTime = null;
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formSubmitTime = new Date();

      var name = contactForm.querySelector('input[placeholder="Nombre"]');
      var email = contactForm.querySelector('input[placeholder="Email"]');
      var phone = contactForm.querySelector('input[placeholder="Teléfono"]');
      var message = contactForm.querySelector('textarea');

      var detail = 'Nombre: ' + (name ? name.value : 'N/A') +
        ' | Email: ' + (email ? email.value : 'N/A') +
        ' | Tel: ' + (phone ? phone.value : 'N/A');

      logInteraction('FORM_SUBMIT', detail);

      contactForm.style.display = 'none';
      if (contactSuccess) {
        contactSuccess.style.display = 'block';
        contactSuccess.innerHTML =
          '¡Gracias por tu mensaje! Nos pondremos en contacto contigo a la brevedad.' +
          '<br><small style="opacity:0.7">Formulario enviado a las ' +
          formSubmitTime.toLocaleTimeString('es-MX') + '</small>';
      }
    });
  }

  // ---- Ghost Shopper: Solicitar visita handler ----
  window.handleVisitRequest = function (propertyName) {
    logInteraction('VISIT_REQUEST', 'Propiedad: ' + propertyName);

    var toast = document.createElement('div');
    toast.className = 'gs-toast gs-toast--visible';
    toast.innerHTML = '<strong>Solicitud de visita enviada</strong><br>' +
      propertyName + ' — Un asesor te contactará pronto.';
    document.body.appendChild(toast);

    setTimeout(function () { toast.remove(); }, 4000);
  };

  // ---- Ghost Shopper: WhatsApp click tracker ----
  window.trackWhatsApp = function (propertyName) {
    logInteraction('WHATSAPP_CLICK', 'Propiedad: ' + propertyName);
  };

  // ---- Track WhatsApp float button ----
  var whatsappFloat = document.querySelector('.whatsapp-float');
  if (whatsappFloat) {
    whatsappFloat.addEventListener('click', function () {
      logInteraction('WHATSAPP_FLOAT', 'Click en botón flotante de WhatsApp');
    });
  }

  // ---- Track email link clicks ----
  var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      logInteraction('EMAIL_CLICK', link.getAttribute('href'));
    });
  });

  // ---- Track phone link clicks ----
  var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      logInteraction('PHONE_CLICK', link.getAttribute('href'));
    });
  });

  // ---- Track login link ----
  var loginLink = document.querySelector('a[href="login.html"]');
  if (loginLink) {
    loginLink.addEventListener('click', function () {
      logInteraction('LOGIN_NAV', 'Navegando a página de login');
    });
  }

  // ---- Track service card clicks ----
  var serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var title = card.querySelector('.service-card__title');
      if (title) {
        logInteraction('SERVICE_CLICK', title.textContent.trim());
      }
    });
  });

  // ---- Expose for browser_use agent ----
  window.__ghostShopper = {
    getLog: function () { return interactionLog; },
    getSummary: function () {
      var types = {};
      interactionLog.forEach(function (e) {
        types[e.type] = (types[e.type] || 0) + 1;
      });
      return {
        total: interactionLog.length,
        byType: types,
        firstEvent: interactionLog.length > 0 ? interactionLog[0].timestamp : null,
        lastEvent: interactionLog.length > 0 ? interactionLog[interactionLog.length - 1].timestamp : null,
      };
    },
    reset: function () { interactionLog = []; updateTrackerUI(); },
  };

})();
