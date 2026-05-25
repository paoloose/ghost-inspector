(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuToggle = document.getElementById('menuToggle');
  var mainMenu = document.getElementById('mainMenu');
  var headerLinks = document.querySelectorAll('.header__link');
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');
  var sections = document.querySelectorAll('section[id]');
  var pageLoader = document.getElementById('pageLoader');
  var authLink = document.getElementById('authLink');
  var userSession = document.getElementById('userSession');
  var userNameEl = document.getElementById('userName');
  var logoutBtn = document.getElementById('logoutBtn');

  // ---- Loading overlay helpers ----
  function showLoading(text) {
    if (!pageLoader) return;
    var label = pageLoader.querySelector('.page-loader__text');
    if (label && text) label.textContent = text;
    pageLoader.classList.add('page-loader--visible');
  }

  function hideLoading() {
    if (!pageLoader) return;
    pageLoader.classList.remove('page-loader--visible');
  }

  // ---- Button spinner helper ----
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
      btn.innerHTML = '<span class="page-loader__spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>' + btn.dataset.originalText;
    } else {
      btn.disabled = false;
      if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
      }
    }
  }

  // ---- Dummy session check ----
  function checkSession() {
    try {
      var raw = localStorage.getItem('rvbr_session');
      if (!raw) return;
      var session = JSON.parse(raw);
      if (authLink) authLink.style.display = 'none';
      if (userSession) userSession.style.display = 'flex';
      if (userNameEl) userNameEl.textContent = 'Hola, ' + (session.name || 'Usuario');
    } catch (e) {
      // ignore
    }
  }

  function clearSession() {
    localStorage.removeItem('rvbr_session');
    if (authLink) authLink.style.display = '';
    if (userSession) userSession.style.display = 'none';
    showLoading('Cerrando sesión...');
    setTimeout(function () {
      hideLoading();
      window.location.reload();
    }, 400);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      clearSession();
    });
  }

  checkSession();

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

  // ---- Contact form with loading and Ghost Shopper tracking ----
  if (contactForm) {
    var formSubmitTime = null;
    var submitBtn = document.getElementById('contactSubmit');
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

      setButtonLoading(submitBtn, true);
      showLoading('Enviando mensaje...');

      // Simulate async send (200-500ms)
      var delay = Math.floor(Math.random() * 301) + 200;
      setTimeout(function () {
        setButtonLoading(submitBtn, false);
        hideLoading();

        contactForm.style.display = 'none';
        if (contactSuccess) {
          contactSuccess.style.display = 'block';
          contactSuccess.innerHTML =
            '¡Gracias por tu mensaje! Nos pondremos en contacto contigo a la brevedad.' +
            '<br><small style="opacity:0.7">Formulario enviado a las ' +
            formSubmitTime.toLocaleTimeString('es-MX') + '</small>';
        }
      }, delay);
    });
  }

  // ---- Ghost Shopper: Solicitar visita handler ----
  window.handleVisitRequest = function (propertyName) {
    logInteraction('VISIT_REQUEST', 'Propiedad: ' + propertyName);

    // Find the clicked button and show loading
    var btns = document.querySelectorAll('.property-card__visit-btn');
    var clickedBtn = null;
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].textContent.indexOf('Cargando') === -1 && btns[i].getAttribute('onclick') && btns[i].getAttribute('onclick').indexOf(propertyName) > -1) {
        // rough match; in practice event.target is better but this works for inline onclick
        clickedBtn = btns[i];
        break;
      }
    }

    if (clickedBtn) {
      clickedBtn.disabled = true;
      clickedBtn.dataset.originalText = clickedBtn.dataset.originalText || clickedBtn.textContent;
      clickedBtn.textContent = 'Enviando...';
    }

    showLoading('Solicitando visita...');

    var delay = Math.floor(Math.random() * 301) + 200;
    setTimeout(function () {
      hideLoading();
      if (clickedBtn) {
        clickedBtn.disabled = false;
        clickedBtn.textContent = clickedBtn.dataset.originalText || 'Solicitar visita';
      }

      var toast = document.createElement('div');
      toast.className = 'gs-toast gs-toast--visible';
      toast.innerHTML = '<strong>Solicitud de visita enviada</strong><br>' +
        propertyName + ' — Un asesor te contactará pronto.';
      document.body.appendChild(toast);

      setTimeout(function () { toast.remove(); }, 4000);
    }, delay);
  };

  // ---- Ghost Shopper: WhatsApp click tracker ----
  window.trackWhatsApp = function (propertyName) {
    logInteraction('WHATSAPP_CLICK', 'Propiedad: ' + propertyName);
    showLoading('Abriendo WhatsApp...');
    setTimeout(function () {
      hideLoading();
    }, 400);
  };

  // ---- Track WhatsApp float button ----
  var whatsappFloat = document.querySelector('.whatsapp-float');
  if (whatsappFloat) {
    whatsappFloat.addEventListener('click', function () {
      logInteraction('WHATSAPP_FLOAT', 'Click en botón flotante de WhatsApp');
      showLoading('Abriendo WhatsApp...');
      setTimeout(function () {
        hideLoading();
      }, 400);
    });
  }

  // ---- Track email link clicks ----
  var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      logInteraction('EMAIL_CLICK', link.getAttribute('href'));
      showLoading('Abriendo correo...');
      setTimeout(function () {
        hideLoading();
      }, 400);
    });
  });

  // ---- Track phone link clicks ----
  var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      logInteraction('PHONE_CLICK', link.getAttribute('href'));
      showLoading('Iniciando llamada...');
      setTimeout(function () {
        hideLoading();
      }, 400);
    });
  });

  // ---- Track register link ----
  var registerLink = document.querySelector('a[href="register.html"]');
  if (registerLink) {
    registerLink.addEventListener('click', function () {
      logInteraction('REGISTER_NAV', 'Navegando a página de registro');
    });
  }

  // ---- Track service card clicks ----
  var serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var title = card.querySelector('.service-card__title');
      if (title) {
        logInteraction('SERVICE_CLICK', title.textContent.trim());
        showLoading('Cargando...');
        setTimeout(function () {
          hideLoading();
        }, 400);
      }
    });
  });

  // ---- Track info-importante link clicks ----
  var infoLinks = document.querySelectorAll('.info-importante__link');
  infoLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var text = link.querySelector('.info-importante__link-text');
      logInteraction('INFO_CLICK', text ? text.textContent.trim() : 'Link');
      showLoading('Cargando...');
      setTimeout(function () {
        hideLoading();
      }, 400);
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
