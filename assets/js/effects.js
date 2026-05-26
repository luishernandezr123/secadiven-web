/* ===== Secadiven Effects ===== */
(function() {
  'use strict';

  /* === Parallax Hero (desktop only) === */
  function initParallax() {
    var bg = document.getElementById('hero-bg');
    if (!bg) return;
    if (window.innerWidth < 768) return; /* skip on mobile */
    window.addEventListener('scroll', function() {
      requestAnimationFrame(function() {
        var scroll = window.pageYOffset;
        bg.style.transform = 'translateY(' + scroll * 0.35 + 'px)';
      });
    }, { passive: true });
  }

  /* === Counter Animation === */
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = 0;
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          /* easeOutExpo */
          var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          var current = Math.floor(eased * target);
          el.textContent = current + '+';
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target + '+';
          }
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { observer.observe(el); });
  }

  /* === Scroll Reveal === */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  }

  /* === Programs Horizontal Scroll + Auto + Arrows === */
  function loadPrograms() {
    var container = document.getElementById('programs-container');
    if (!container) return;

    var programImages = {
      'tsu-teologia': 'prog-teologia.webp',
      'lic-teologia': 'prog-pastoral.webp',
      'maestria-teologia': 'prog-sistematica.webp',
      'doctorado-teologia': 'prog-consejeria.webp'
    };

    fetch('/content/data/programas.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        container.innerHTML = '';
        data.programas.forEach(function(p) {
          var imgName = programImages[p.id] || 'prog-teologia.webp';
          var card = document.createElement('div');
          card.className = 'program-card-h';
          card.innerHTML =
            '<img src="/assets/images/' + imgName + '" alt="' + p.titulo + '" loading="lazy">' +
            '<div class="program-card-body">' +
            '<span class="badge">' + p.modalidad + '</span>' +
            '<h3>' + p.titulo + '</h3>' +
            '<div class="duration">' + p.duracion + '</div>' +
            '<span class="btn-link">Solicitar info →</span>' +
            '</div>';
          card.addEventListener('click', function(e) {
            /* Don't fire click if user was scrolling */
            if (container._wasScrolling) return;
            window.open('https://wa.me/584127759653?text=' + encodeURIComponent('Me interesa: ' + p.titulo), '_blank');
          });
          container.appendChild(card);
        });

        /* Tilt effect */
        container.querySelectorAll('.program-card-h').forEach(function(card) {
          card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;
            card.style.transform = 'translateY(-8px) rotateY(' + ((x - 0.5) * 10) + 'deg) rotateX(' + ((0.5 - y) * 10) + 'deg)';
          });
          card.addEventListener('mouseleave', function() { card.style.transform = ''; });
        });

        initProgramSlider(container);
      })
      .catch(function() {
        container.innerHTML = '<p style="text-align:center;width:100%;padding:2rem;color:rgba(255,255,255,0.5)">No se pudieron cargar los programas.</p>';
      });
  }

  function initProgramSlider(container) {
    var speed = 1;
    var autoRAF;
    var paused = false;
    var lastProgrammaticScroll = 0;
    var scrollAmount = 360;

    function step() {
      if (paused) return;
      lastProgrammaticScroll = performance.now();
      container.scrollLeft += speed;
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 5) {
        container.scrollLeft = 0;
      }
      autoRAF = requestAnimationFrame(step);
    }

    function startAuto() {
      paused = false;
      if (autoRAF) cancelAnimationFrame(autoRAF);
      autoRAF = requestAnimationFrame(step);
    }

    function stopAuto() {
      paused = true;
      if (autoRAF) cancelAnimationFrame(autoRAF);
    }

    /* Pause on hover (desktop) and touch (mobile) */
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);
    container.addEventListener('touchstart', function() { stopAuto(); }, { passive: true });
    container.addEventListener('touchend', function() {
      clearTimeout(container._scrollTimeout);
      container._scrollTimeout = setTimeout(startAuto, 3000);
    }, { passive: true });

    var scrollTimeout;
    container.addEventListener('scroll', function() {
      if (performance.now() - lastProgrammaticScroll < 80) return;
      /* Mark that user is scrolling (to prevent card clicks) */
      container._wasScrolling = true;
      clearTimeout(container._clickTimeout);
      container._clickTimeout = setTimeout(function() { container._wasScrolling = false; }, 300);
      stopAuto();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(startAuto, 3000);
    }, { passive: true });

    /* Arrow navigation */
    var prev = document.getElementById('program-prev');
    var next = document.getElementById('program-next');

    function smoothScroll(dir) {
      stopAuto();
      var start = container.scrollLeft;
      var maxScroll = container.scrollWidth - container.clientWidth;
      var target = start + dir * scrollAmount;
      if (target < 0) target = 0;
      if (target > maxScroll) target = maxScroll;
      var distance = target - start;
      if (Math.abs(distance) < 2) { startAuto(); return; }

      var startTime = null;
      var duration = 400;

      function animate(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        lastProgrammaticScroll = performance.now();
        container.scrollLeft = start + distance * eased;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(startAuto, 3000);
        }
      }
      requestAnimationFrame(animate);
    }

    if (prev) {
      prev.addEventListener('click', function(e) {
        e.preventDefault();
        smoothScroll(-1);
      });
    }
    if (next) {
      next.addEventListener('click', function(e) {
        e.preventDefault();
        smoothScroll(1);
      });
    }

    startAuto();
  }

  /* === Testimonial Rotation === */
  function initTestimonials() {
    var cards = document.querySelectorAll('.testimonial-card');
    var dots = document.querySelectorAll('.testimonial-dots button');
    if (!cards.length) return;

    var current = 0;
    var total = cards.length;
    var interval;

    function show(index) {
      cards.forEach(function(c, i) {
        c.classList.toggle('active', i === index);
      });
      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === index);
      });
      current = index;
    }

    function next() {
      show((current + 1) % total);
    }

    function startAuto() {
      stopAuto();
      interval = setInterval(next, 5000);
    }

    function stopAuto() {
      if (interval) clearInterval(interval);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        show(idx);
        startAuto();
      });
    });

    /* Pause on hover */
    var container = document.getElementById('testimonial-container');
    if (container) {
      container.addEventListener('mouseenter', stopAuto);
      container.addEventListener('mouseleave', startAuto);
    }

    startAuto();
  }

  /* === Blog Highlights === */
  function loadBlogHighlights() {
    var container = document.getElementById('blog-highlights');
    if (!container) return;

    var posts = [
      { slug: 'bienvenida-nuevo-ciclo', file: '/content/blog/bienvenida-nuevo-ciclo.md' },
      { slug: 'graduacion-2026', file: '/content/blog/graduacion-2026.md' },
      { slug: 'conferencia-teologica', file: '/content/blog/conferencia-teologica.md' }
    ];

    var fetched = 0;
    var postData = [];

    posts.forEach(function(post) {
      fetch(post.file)
        .then(function(r) { return r.text(); })
        .then(function(text) {
          var match = text.match(/^---\s*\n([\s\S]*?)\n---/);
          var meta = {};
          if (match) {
            match[1].split('\n').forEach(function(line) {
              var ci = line.indexOf(':');
              if (ci === -1) return;
              var key = line.substring(0, ci).trim();
              var value = line.substring(ci + 1).trim().replace(/^["']|["']$/g, '');
              meta[key] = value;
            });
          }
          postData.push({
            slug: post.slug,
            titulo: meta.titulo || 'Sin título',
            fecha: meta.fecha || '',
            extracto: meta.extracto || ''
          });
        })
        .finally(function() {
          fetched++;
          if (fetched === posts.length) render();
        });
    });

    function render() {
      if (!postData.length) {
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--color-text-muted)">Próximamente publicaremos noticias.</p>';
        return;
      }
      postData.sort(function(a, b) { return b.fecha.localeCompare(a.fecha); });
      container.innerHTML = '';
      postData.forEach(function(post) {
        var months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        var parts = post.fecha.split('-');
        var dateStr = parts.length === 3 ? parseInt(parts[2]) + ' de ' + months[parseInt(parts[1]) - 1] + ' de ' + parts[0] : post.fecha;

        var card = document.createElement('article');
        card.className = 'blog-card';
        card.innerHTML =
          '<div style="height:180px;background:var(--color-bg-alt);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">&#9998;</div>' +
          '<div class="blog-card-body">' +
          '<time>' + dateStr + '</time>' +
          '<h3><a href="/blog/entrada.html?post=' + post.slug + '">' + post.titulo + '</a></h3>' +
          '<p>' + post.extracto + '</p>' +
          '</div>';
        container.appendChild(card);
      });
    }
  }

  /* === Init === */
  document.addEventListener('DOMContentLoaded', function() {
    initParallax();
    initScrollReveal();
    animateCounters();
    loadPrograms();
    initTestimonials();
    loadBlogHighlights();
  });
})();
