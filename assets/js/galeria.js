(function() {
  'use strict';

  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var images = [];
  var currentIndex = 0;
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var counter = document.getElementById('lightbox-counter');
  var closeBtn = document.querySelector('.lightbox-close');
  var prevBtn = document.querySelector('.lightbox-prev');
  var nextBtn = document.querySelector('.lightbox-next');

  function openLightbox(index) {
    if (!images.length) return;
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    var img = images[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.caption || 'Foto ' + (currentIndex + 1);
    if (counter) {
      counter.textContent = (currentIndex + 1) + ' / ' + images.length;
    }
    prevBtn.style.display = images.length > 1 ? '' : 'none';
    nextBtn.style.display = images.length > 1 ? '' : 'none';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox();
  }

  /* Event listeners */
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prevImage(); });
  if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); nextImage(); });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  /* Touch swipe */
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  });
  lightbox.addEventListener('touchend', function(e) {
    if (!lightbox.classList.contains('active')) return;
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  });

  /* Load gallery from manifest */
  fetch('content/data/galeria-manifest.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      images = data.images || [];
      if (images.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>A&uacute;n no hay fotos en la galer&iacute;a. Pronto estaremos publicando im&aacute;genes de nuestras actividades.</p></div>';
        return;
      }
      grid.innerHTML = '';
      images.forEach(function(img, index) {
        var imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.caption || 'Foto ' + (index + 1);
        imgEl.loading = 'lazy';
        imgEl.decoding = 'async';
        imgEl.addEventListener('click', function() { openLightbox(index); });
        imgEl.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); }
        });
        imgEl.setAttribute('tabindex', '0');
        imgEl.setAttribute('role', 'button');
        grid.appendChild(imgEl);
      });
    })
    .catch(function() {
      grid.innerHTML = '<div class="empty-state"><p>No se pudo cargar la galer&iacute;a. Por favor cont&aacute;ctanos para m&aacute;s informaci&oacute;n.</p></div>';
    });
})();
