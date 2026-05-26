(function() {
  'use strict';

  /* === Form Validation === */
  var form = document.getElementById('contact-form');
  if (!form) return;

  function showError(fieldId, groupId) {
    var group = document.getElementById(groupId);
    if (group) group.classList.add('error');
  }

  function clearError(groupId) {
    var group = document.getElementById(groupId);
    if (group) group.classList.remove('error');
  }

  function validateField(field) {
    var value = field.value.trim();
    var valid = true;

    if (field.id === 'nombre') {
      valid = value.length >= 2;
      valid ? clearError('group-nombre') : showError('nombre', 'group-nombre');
    } else if (field.id === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      valid ? clearError('group-email') : showError('email', 'group-email');
    } else if (field.id === 'asunto') {
      valid = field.value !== '';
      valid ? clearError('group-asunto') : showError('asunto', 'group-asunto');
    } else if (field.id === 'mensaje') {
      valid = value.length >= 10;
      valid ? clearError('group-mensaje') : showError('mensaje', 'group-mensaje');
    }

    return valid;
  }

  /* Add input listeners */
  form.querySelectorAll('input, textarea').forEach(function(field) {
    field.addEventListener('input', function() {
      if (field.closest('.form-group').classList.contains('error')) {
        validateField(field);
      }
    });
  });

  /* Submit handler */
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var fields = [
      form.querySelector('#nombre'),
      form.querySelector('#email'),
      form.querySelector('#asunto'),
      form.querySelector('#mensaje')
    ];

    var allValid = true;
    fields.forEach(function(f) {
      if (!validateField(f)) allValid = false;
    });

    if (!allValid) return;

    var submitBtn = document.getElementById('submit-btn');
    var feedback = document.getElementById('form-feedback');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

    var formData = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      asunto: form.asunto.value.trim(),
      mensaje: form.mensaje.value.trim()
    };

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(function(response) {
      return response.json().then(function(data) {
        return { status: response.status, data: data };
      });
    })
    .then(function(result) {
      if (result.status === 200 && result.data.ok) {
        feedback.style.display = 'block';
        feedback.className = 'alert alert-success';
        feedback.innerHTML = '&#10003; Mensaje enviado con &eacute;xito. Te contactaremos pronto.';
        form.reset();
      } else if (result.status === 429) {
        feedback.style.display = 'block';
        feedback.className = 'alert alert-error';
        feedback.innerHTML = 'Demasiados intentos. Por favor espera un momento y vuelve a intentar.';
      } else {
        feedback.style.display = 'block';
        feedback.className = 'alert alert-error';
        feedback.innerHTML = 'Error al enviar. Por favor intenta de nuevo o cont&aacute;ctanos por WhatsApp.';
      }
    })
    .catch(function() {
      feedback.style.display = 'block';
      feedback.className = 'alert alert-error';
      feedback.innerHTML = 'Error de conexi&oacute;n. Verifica tu internet o escr&iacute;benos directamente a secadiven@gmail.com';
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar mensaje';
    });
  });

  /* === Map === */
  var mapEl = document.getElementById('map');
  if (mapEl) {
    var seminaryLat = 10.4806;
    var seminaryLng = -66.9036;

    var map = L.map('map').setView([seminaryLat, seminaryLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    var marker = L.marker([seminaryLat, seminaryLng]).addTo(map);
    marker.bindPopup('<strong>Seminario Teol&oacute;gico Secadiven Internacional</strong><br>Formaci&oacute;n teol&oacute;gica superior');
  }
})();
