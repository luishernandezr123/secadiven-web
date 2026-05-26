(function() {
  'use strict';

  /* === Header Loader === */
  function injectHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    /* Detect if we are on a subpage */
    var isSubpage = window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html');
    var basePath = isSubpage ? '/' : '';

    var navItems = [
      { href: basePath + 'index.html#inicio', text: 'Inicio' },
      { href: basePath + 'nosotros.html', text: 'Nosotros' },
      { href: basePath + 'programas.html', text: 'Programas' },
      { href: basePath + 'nucleos.html', text: 'Nucleos' },
      { href: basePath + 'index.html#contacto', text: 'Contacto' }
    ];

    var logoHtml = '<a href="' + basePath + 'index.html" class="logo"><img src="' + (isSubpage ? '/' : '') + 'assets/images/LOGO FINAL.png" alt="Secadiven Internacional"><span class="logo-text">Seminario Teologico<br>Secadiven Internacional</span></a>';
    var html = '<div class="container">' + logoHtml;
    html += '<button class="nav-toggle" aria-label="Abrir menú" id="nav-toggle"><span></span><span></span><span></span></button>';
    html += '<nav class="main-nav" id="main-nav" role="navigation" aria-label="Navegación principal">';
    navItems.forEach(function(item) {
      html += '<a href="' + item.href + '">' + item.text + '</a>';
    });
    html += '</nav></div>';
    header.innerHTML = html;

    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        nav.classList.toggle('open'); toggle.classList.toggle('active');
        var expanded = nav.classList.contains('open');
        toggle.setAttribute('aria-expanded', expanded);
        toggle.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = expanded ? 'hidden' : '';
      });
      nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          nav.classList.remove('open'); toggle.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
        });
      });
    }

    /* Active section tracking via IntersectionObserver */
    initActiveNav();
  }

  function initActiveNav() {
    var navLinks = document.querySelectorAll('.main-nav a');
    if (!navLinks.length) return;

    /* For subpages, highlight the current page in nav */
    var path = window.location.pathname;
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href) return;
      /* Remove anchor for matching */
      var hrefPage = href.split('#')[0].replace(/\/$/, '');
      var currentPage = path.replace(/\/$/, '');
      if (currentPage === '' || currentPage.endsWith('index.html')) currentPage = '/index.html';
      if (hrefPage && currentPage.endsWith(hrefPage.replace(/^\//, ''))) {
        link.classList.add('active');
      }
    });

    /* For index.html, scroll-based active tracking */
    if (path === '/' || path.endsWith('index.html')) {
      var sections = document.querySelectorAll('section[id]');
      if (!sections.length) return;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            link.classList.toggle('active', href && href.includes('#' + id));
          });
        });
      }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });
      sections.forEach(function(s) { observer.observe(s); });
    }
  }

  /* === Footer Loader === */
  function injectFooter() {
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    var y = new Date().getFullYear();
    var html = '<div class="container"><div class="footer-grid">';
    html += '<div class="footer-brand"><h3>Seminario Teológico<br>Secadiven Internacional</h3><p>Formación teológica con más de 40 años de trayectoria. "Sin Revelación no hay Teología."</p></div>';
    html += '<div class="footer-col"><h4>Secciones</h4><a href="' + basePath + 'nosotros.html">Nosotros</a><a href="' + basePath + 'programas.html">Programas</a><a href="' + basePath + 'nucleos.html">Nucleos</a><a href="' + basePath + 'index.html#contacto">Contacto</a></div>';
    html += '<div class="footer-col"><h4>Contacto</h4><a href="mailto:secadiven@gmail.com">secadiven@gmail.com</a><p style="color:rgba(255,255,255,0.5);font-size:0.85rem">Valencia, Carabobo<br>Venezuela</p></div>';
    html += '</div>';
    html += '<div class="footer-bottom"><span>&copy; ' + y + ' Seminario Teológico Secadiven Internacional</span><span class="footer-legal"><a href="/privacidad.html">Privacidad</a><a href="/terminos.html">Términos</a></span></div></div>';
    footer.innerHTML = html;
  }

  /* === WhatsApp === */
  function injectWhatsApp() {
    var btn = document.getElementById('whatsapp-float');
    if (!btn) return;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="30" height="30"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
    btn.href = 'https://wa.me/584127759653?text=' + encodeURIComponent('Hola, quisiera información sobre el Seminario Teológico Secadiven');
    btn.target = '_blank'; btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Contactar por WhatsApp');
  }

  /* === Header Scroll === */
  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* === Smooth Scroll for Anchor Links (same page only) === */
  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (href === '#') return;
      /* Only smooth scroll if we are on the same page */
      var currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
      var linkPath = currentPath;
      if (currentPath.endsWith('index.html')) linkPath = '/index.html';
      if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerH = document.getElementById('site-header');
      var offset = headerH ? headerH.offsetHeight : 76;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* === Cookie Consent === */
  function initCookieConsent() {
    if (localStorage.getItem('cookie-consent')) return;
    var banner = document.createElement('div');
    banner.className = 'cookie-banner'; banner.id = 'cookie-banner';
    banner.innerHTML = '<div class="container"><p>Usamos cookies para mejorar tu experiencia. Al continuar aceptas nuestra <a href="/privacidad.html">política de privacidad</a>.</p><div style="display:flex;gap:0.75rem"><button class="btn btn-primary btn-sm" id="cookie-accept" style="font-size:0.85rem;padding:0.5rem 1.5rem">Aceptar</button><button class="btn btn-ghost btn-sm" id="cookie-reject" style="font-size:0.85rem">Rechazar</button></div></div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function() { banner.classList.add('visible'); });
    document.getElementById('cookie-accept').addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted'); banner.classList.remove('visible');
      setTimeout(function() { banner.remove(); }, 400);
    });
    document.getElementById('cookie-reject').addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'rejected'); banner.classList.remove('visible');
      setTimeout(function() { banner.remove(); }, 400);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectHeader(); injectFooter(); injectWhatsApp();
    initHeaderScroll(); initSmoothScroll(); initCookieConsent();
  });
})();
