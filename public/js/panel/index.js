// index.js - Unificado, limpio y seguro
document.addEventListener("DOMContentLoaded", () => {

  /* --------------------------
     Helpers
  -------------------------- */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
  const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };

  /* --------------------------
     Tema: claro / oscuro
  -------------------------- */
  (function themeModule() {
    const toggleBtn = $('#theme-toggle');

    function setDark(on, save = true) {
      if (on) {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
        if (save) localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '🌙';
        if (save) localStorage.setItem('theme', 'light');
      }
    }

    // Inicializar: prioridad localStorage -> prefers-color-scheme -> default light
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') setDark(true, false);
    else if (stored === 'light') setDark(false, false);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true, false);
    } else {
      setDark(false, false);
    }

    if (!toggleBtn) return; // si no existe, no hacemos más
    toggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      setDark(isDark, true);
    });
  })();

  /* --------------------------
     Sidebar / menu toggle / nav
  -------------------------- */
  (function sidebarModule() {
    const menuToggle = $('#menu-toggle');
    const sidebar = $('#sidebar');
    const secciones = $$('.seccion');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // manejador de navegación por data-seccion
    $$('.sidebar [data-seccion]').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.seccion;
        // Oculta todas las secciones
        secciones.forEach(sec => sec.style.display = 'none');
        // Muestra la correspondiente
        const activa = document.getElementById(id);
        if (activa) activa.style.display = 'block';
        // cierra sidebar en mobile
        if (sidebar) sidebar.classList.remove('active');
      });
    });

    // submenú toggle (mobile)
    $$('.has-submenu').forEach(item => {
      item.addEventListener('click', () => item.classList.toggle('open'));
    });

    // active class en sidebar items (visual)
    $$('.sidebar li[data-seccion]').forEach(li => {
      li.addEventListener('click', () => {
        $$('.sidebar li[data-seccion]').forEach(i => i.classList.remove('active'));
        li.classList.add('active');
      });
    });
  })();

  /* --------------------------
     Notificaciones (campana)
  -------------------------- */
  (function notifModule() {
    const bellBtn = $('#bellBtn');
    const notifMenu = $('#notifMenu');

    if (!bellBtn || !notifMenu) return;

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('show');
    });

    // cerrar si clic fuera
    document.addEventListener('click', (e) => {
      if (!bellBtn.contains(e.target) && !notifMenu.contains(e.target)) {
        notifMenu.classList.remove('show');
      }
    });
  })();

  /* --------------------------
     Calendario
  -------------------------- */
  (function calendarioModule() {
    const diasEl = $('#dias');
    const mesAnioEl = $('#mes-anio');
    const prevBtn = $('#prev');
    const nextBtn = $('#next');
    const modal = $('#modal');
    const cerrarModal = $('#cerrar-modal');
    const form = $('#form-actividad');
    const fechaSel = $('#fecha-seleccionada');
    const listaActividades = $('#lista-actividades');

    if (!diasEl || !mesAnioEl) return; // calendario no presente

    let actividades = JSON.parse(localStorage.getItem('actividades')) || [];
    let fechaSeleccionada = null;
    let fechaActual = new Date();

    function renderCalendario() {
      const año = fechaActual.getFullYear();
      const mes = fechaActual.getMonth();

      mesAnioEl.textContent = fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

      const primerDia = new Date(año, mes, 1);
      const ultimoDia = new Date(año, mes + 1, 0);
      const diaInicio = primerDia.getDay();
      const totalDias = ultimoDia.getDate();

      diasEl.innerHTML = '';

      // Ajuste para que la semana comience en Lunes (según tu lógica previa)
      const placeholders = (diaInicio === 0 ? 6 : diaInicio - 1);
      for (let i = 0; i < placeholders; i++) diasEl.appendChild(document.createElement('div'));

      for (let d = 1; d <= totalDias; d++) {
        const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const diaEl = document.createElement('div');
        diaEl.classList.add('dia');

        const num = document.createElement('div');
        num.classList.add('dia-num');
        num.textContent = d;
        diaEl.appendChild(num);

        const eventos = actividades.filter(a => a.fecha === fecha);
        eventos.forEach(ev => {
          const eventoEl = document.createElement('div');
          eventoEl.classList.add('evento');
          eventoEl.textContent = ev.titulo;
          diaEl.appendChild(eventoEl);
        });

        diaEl.addEventListener('click', () => abrirModal(fecha));
        diasEl.appendChild(diaEl);
      }
    }

    function abrirModal(fecha) {
      fechaSeleccionada = fecha;
      if (fechaSel) fechaSel.textContent = fecha;
      renderListaActividades();
      if (modal) modal.style.display = 'flex';
    }

    function renderListaActividades() {
      if (!listaActividades) return;
      listaActividades.innerHTML = '';
      const eventos = actividades.filter(a => a.fecha === fechaSeleccionada);
      if (eventos.length === 0) {
        listaActividades.innerHTML = '<li>(Sin actividades)</li>';
        return;
      }
      eventos.forEach((ev, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${ev.hora}</strong> - ${ev.titulo}<br><small>${ev.descripcion || ''}</small>`;
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = '✖';
        btnEliminar.addEventListener('click', () => eliminarActividad(idx, fechaSeleccionada));
        li.appendChild(btnEliminar);
        listaActividades.appendChild(li);
      });
    }

    function eliminarActividad(index, fecha) {
      const eventos = actividades.filter(a => a.fecha === fecha);
      const globalIndex = actividades.findIndex(a => a === eventos[index]);
      if (globalIndex !== -1) actividades.splice(globalIndex, 1);
      localStorage.setItem('actividades', JSON.stringify(actividades));
      renderListaActividades();
      renderCalendario();
    }

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const hora = $('#hora') ? $('#hora').value : '';
        const titulo = $('#titulo') ? $('#titulo').value : '';
        const descripcion = $('#descripcion') ? $('#descripcion').value : '';
        actividades.push({ fecha: fechaSeleccionada, hora, titulo, descripcion });
        localStorage.setItem('actividades', JSON.stringify(actividades));
        form.reset();
        renderListaActividades();
        renderCalendario();
      });
    }

    if (cerrarModal) cerrarModal.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    if (prevBtn) prevBtn.addEventListener('click', () => { fechaActual.setMonth(fechaActual.getMonth() - 1); renderCalendario(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { fechaActual.setMonth(fechaActual.getMonth() + 1); renderCalendario(); });

    // Inicial
    renderCalendario();
  })();

  /* --------------------------
     Mails (captura)
  -------------------------- */
  (function mailsModule() {
    const addMailBtn = $('#add-mail-btn');
    const mailInput = $('#new-mail');
    const clasificacionInput = $('#clasificacion');
    const mailListContainer = $('.mail-list') || $('#mail-list') || null;
    const copyBtn = $('#copy-mails');
    const copyConfirm = $('#copy-confirm');
    const openGmailBtn = $('#open-gmail');
    const selectionType = $('#selection-type');
    const clasificacionSelector = $('#clasificacion-selector');
    const clasificacionSelect = $('#clasificacion-select');
    const multiSelector = $('#multi-clasificacion-selector');
    const multiList = $('#multi-clasificacion-list');

    if (!addMailBtn || !mailInput || !clasificacionInput || !mailListContainer) return;

    function getOrCreateList(clasificacion) {
      let existingSection = mailListContainer.querySelector(`[data-clasificacion="${clasificacion.toLowerCase()}"]`);
      if (!existingSection) {
        const section = document.createElement('div');
        section.classList.add('mail-section');
        section.dataset.clasificacion = clasificacion.toLowerCase();

        const title = document.createElement('h3');
        title.textContent = clasificacion;

        const ul = document.createElement('ul');
        ul.classList.add('mail-group');

        section.appendChild(title);
        section.appendChild(ul);
        mailListContainer.appendChild(section);

        return ul;
      }
      return existingSection.querySelector('ul');
    }

    function actualizarClasificaciones() {
      if (!clasificacionSelect) return;
      const secciones = mailListContainer.querySelectorAll('.mail-section');
      clasificacionSelect.innerHTML = '';
      secciones.forEach(section => {
        const nombre = section.dataset.clasificacion;
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        clasificacionSelect.appendChild(option);
      });
    }

    function actualizarMultiClasificaciones() {
      if (!multiList) return;
      const secciones = mailListContainer.querySelectorAll('.mail-section');
      multiList.innerHTML = '';
      secciones.forEach(section => {
        const nombre = section.dataset.clasificacion;
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = nombre;
        const label = document.createElement('label');
        label.textContent = ' ' + nombre.charAt(0).toUpperCase() + nombre.slice(1);
        li.appendChild(checkbox);
        li.appendChild(label);
        multiList.appendChild(li);
      });
    }

    if (selectionType) {
      selectionType.addEventListener('change', () => {
        if (selectionType.value === 'clasificacion') {
          if (clasificacionSelector) clasificacionSelector.style.display = 'block';
          if (multiSelector) multiSelector.style.display = 'none';
          actualizarClasificaciones();
        } else if (selectionType.value === 'multi') {
          if (clasificacionSelector) clasificacionSelector.style.display = 'none';
          if (multiSelector) multiSelector.style.display = 'block';
          actualizarMultiClasificaciones();
        } else {
          if (clasificacionSelector) clasificacionSelector.style.display = 'none';
          if (multiSelector) multiSelector.style.display = 'none';
        }
      });
    }

    addMailBtn.addEventListener('click', () => {
      const mail = mailInput.value.trim();
      const clasificacion = clasificacionInput.value.trim();
      if (!mail || !clasificacion) return alert('Por favor completa la clasificación y el mail.');
      if (!/\S+@\S+\.\S+/.test(mail)) return alert('Por favor ingresa un mail válido.');

      const ul = getOrCreateList(clasificacion);
      const existingMail = Array.from(ul.querySelectorAll('li')).some(li => li.dataset.mail === mail.toLowerCase());
      if (existingMail) return alert('Ese mail ya está en esta clasificación.');

      const li = document.createElement('li');
      li.dataset.mail = mail.toLowerCase();
      li.textContent = mail;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '❌';
      deleteBtn.classList.add('delete-mail');
      deleteBtn.addEventListener('click', () => li.remove());

      li.appendChild(deleteBtn);
      ul.appendChild(li);
      mailInput.value = '';
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const mails = Array.from(document.querySelectorAll('.mail-group li')).map(li => li.dataset.mail);
        if (mails.length === 0) return alert('No hay mails para copiar.');
        navigator.clipboard.writeText(mails.join(', '));
        if (copyConfirm) { copyConfirm.style.display = 'block'; setTimeout(() => (copyConfirm.style.display = 'none'), 2000); }
      });
    }

    if (openGmailBtn) {
      openGmailBtn.addEventListener('click', () => {
        let mails = [];
        const allMails = Array.from(document.querySelectorAll('.mail-group li')).map(li => li.dataset.mail);
        if (!selectionType || selectionType.value === 'todos') mails = [...new Set(allMails)];
        else if (selectionType.value === 'clasificacion' && clasificacionSelect) {
          const clasifElegida = clasificacionSelect.value.toLowerCase();
          const section = document.querySelector(`[data-clasificacion="${clasifElegida}"]`);
          if (section) mails = Array.from(section.querySelectorAll('li')).map(li => li.dataset.mail);
        } else if (selectionType.value === 'multi' && multiList) {
          const checks = multiList.querySelectorAll('input[type="checkbox"]:checked');
          let mailsTemp = [];
          checks.forEach(chk => {
            const section = document.querySelector(`[data-clasificacion="${chk.value.toLowerCase()}"]`);
            if (section) mailsTemp = mailsTemp.concat(Array.from(section.querySelectorAll('li')).map(li => li.dataset.mail));
          });
          mails = [...new Set(mailsTemp)];
        }

        if (mails.length === 0) return alert('No hay mails seleccionados.');
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(mails.join(','))}`;
        window.open(gmailURL, '_blank');
      });
    }
  })();

  /* --------------------------
     Logout
  -------------------------- */
  (function logoutModule() {
    const logoutBtn = $('#logoutBtn');
    const logoutMsg = $('#logoutMsg');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        if (res.ok) window.location.href = '/login';
        else showLogoutError();
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
        showLogoutError();
      }
    });

    function showLogoutError() {
      if (logoutMsg) {
        logoutMsg.textContent = 'No pudimos cerrar tu sesión. Intentá nuevamente.';
        setTimeout(() => (logoutMsg.textContent = ''), 3000);
      } else {
        alert('No pudimos cerrar tu sesión. Intentá nuevamente.');
      }
    }
  })();

  /* --------------------------
     Galería (subir archivos local preview)
  -------------------------- */
  (function galeriaModule() {
    const input = $('#imagen');
    const contenedor = $('#galeria-container');
    if (!input || !contenedor) return;

    input.addEventListener('change', (event) => {
      const archivos = event.target.files;
      for (let archivo of archivos) {
        const lector = new FileReader();
        lector.onload = (e) => {
          const div = document.createElement('div');
          div.classList.add('galeria-item');

          const img = document.createElement('img');
          img.src = e.target.result;

          const btn = document.createElement('button');
          btn.classList.add('borrar-btn');
          btn.textContent = '×';
          btn.addEventListener('click', () => div.remove());

          div.appendChild(img);
          div.appendChild(btn);
          contenedor.appendChild(div);
        };
        lector.readAsDataURL(archivo);
      }
      input.value = '';
    });
  })();

  /* --------------------------
     Donaciones
  -------------------------- */
  (function donacionesModule() {
    const montoSelect = $('#monto-select');
    const linkInput = $('#donacion-link');
    const aliasGlobalInput = $('#alias-global');
    const addBtn = $('#add-donacion-btn');
    const listContainer = $('#donaciones-ul');
    if (!montoSelect || !linkInput || !addBtn || !listContainer) return;

    let aliasGlobal = '';
    const donaciones = {};

    aliasGlobalInput && aliasGlobalInput.addEventListener('input', e => aliasGlobal = e.target.value.trim());

    function renderDonaciones() {
      listContainer.innerHTML = '';
      for (const monto in donaciones) {
        const link = donaciones[monto];
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${monto === 'personalizado' ? 'Personalizado' : '$' + monto}</strong> 
          - <a href="${link}" target="_blank">${link}</a>
          <button class="editar" data-monto="${monto}">✏️ Editar</button>
          <button class="borrar" data-monto="${monto}">❌</button>
        `;
        listContainer.appendChild(li);
      }
    }

    addBtn.addEventListener('click', () => {
      const monto = montoSelect.value;
      const link = linkInput.value.trim();
      if (!link) return alert('Por favor ingresá un link de pago.');
      donaciones[monto] = link;
      renderDonaciones();
      linkInput.value = '';
    });

    listContainer.addEventListener('click', (e) => {
      const target = e.target;
      const monto = target.dataset.monto;
      if (target.classList.contains('editar')) {
        linkInput.value = donaciones[monto];
        montoSelect.value = monto;
      }
      if (target.classList.contains('borrar')) {
        delete donaciones[monto];
        renderDonaciones();
      }
    });
  })();

  /* --------------------------
     Mapa (iframe embed + guardar)
  -------------------------- */
  (function mapaModule() {
    const addressInput = $('#addressInput');
    const mapFrame = $('#mapFrame');
    const showMapBtn = $('#showMapBtn');
    const saveMapBtn = $('#saveMapBtn');

    if (showMapBtn && addressInput && mapFrame) {
      showMapBtn.addEventListener('click', () => {
        const address = addressInput.value.trim();
        if (!address) return alert('Escribí una dirección!');
        const encoded = encodeURIComponent(address);
        mapFrame.src = `https://www.google.com/maps?q=${encoded}&output=embed`;
      });
    }

    if (saveMapBtn && addressInput) {
      saveMapBtn.addEventListener('click', () => {
        const address = addressInput.value.trim();
        if (!address) return alert('No podés guardar una dirección vacía.');
        localStorage.setItem('savedMapAddress', address);
        alert('Dirección guardada correctamente ✔️');
      });
    }

    // Cargar dirección guardada si existe
    const saved = localStorage.getItem('savedMapAddress');
    if (saved && addressInput && mapFrame) {
      addressInput.value = saved;
      mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(saved)}&output=embed`;
    }
  })();

  /* --------------------------
     Plugin Redes Sociales
  -------------------------- */
  (function redesModule() {
    const redesForm = $('#redes-form');
    if (!redesForm) return;

    function cargarRedes() {
      const data = JSON.parse(localStorage.getItem('plugin_redes')) || {};
      redesForm.instagram && (redesForm.instagram.value = data.instagram || '');
      redesForm.x && (redesForm.x.value = data.x || '');
      redesForm.facebook && (redesForm.facebook.value = data.facebook || '');
      redesForm['whatsapp'] && (redesForm['whatsapp'].value = data.whatsapp || '');
      redesForm.tiktok && (redesForm.tiktok.value = data.tiktok || '');
      redesForm.youtube && (redesForm.youtube.value = data.youtube || '');
      redesForm.linkedin && (redesForm.linkedin.value = data.linkedin || '');
    }

    cargarRedes();

    redesForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = {
        instagram: redesForm.instagram ? redesForm.instagram.value.trim() : '',
        x: redesForm.x ? redesForm.x.value.trim() : '',
        facebook: redesForm.facebook ? redesForm.facebook.value.trim() : '',
        whatsapp: redesForm.whatsapp ? redesForm.whatsapp.value.trim() : '',
        tiktok: redesForm.tiktok ? redesForm.tiktok.value.trim() : '',
        youtube: redesForm.youtube ? redesForm.youtube.value.trim() : '',
        linkedin: redesForm.linkedin ? redesForm.linkedin.value.trim() : '',
      };
      localStorage.setItem('plugin_redes', JSON.stringify(data));
      alert('Redes sociales guardadas correctamente.');
    });

    // funciones auxiliares
    window.eliminarRedes = () => {
      if (confirm('¿Seguro que querés eliminar todas las redes sociales?')) {
        localStorage.removeItem('plugin_redes');
        redesForm.reset();
        alert('Redes sociales eliminadas.');
      }
    };
  })();

  /* --------------------------
     Links externos
  -------------------------- */
  (function linksExternosModule() {
    const paginaInput = $('#pagina');
    const urlInput = $('#url');
    const btnGuardar = $('#guardarLink');
    const btnCancelar = $('#cancelarEdicion');
    const listaLinksExternos = $('#listaLinksExternos');

    if (!paginaInput || !urlInput || !btnGuardar || !listaLinksExternos) return;

    let linksExternos = JSON.parse(localStorage.getItem('linksExternos')) || [];
    let editIndex = null;

    function renderLinksExternos() {
      listaLinksExternos.innerHTML = '';
      if (linksExternos.length === 0) {
        listaLinksExternos.innerHTML = '<p>No hay links agregados aún.</p>';
        return;
      }
      linksExternos.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('link-item');
        div.innerHTML = `
          <strong>${item.pagina}</strong>
          <p><a href="${item.url}" target="_blank">${item.url}</a></p>
          <button class="editar-link" data-index="${index}">Editar</button>
          <button class="eliminar-link" data-index="${index}">Eliminar</button>
          <hr>
        `;
        listaLinksExternos.appendChild(div);
      });
      addListenersToButtons();
    }

    btnGuardar.addEventListener('click', () => {
      const pagina = paginaInput.value.trim();
      const url = urlInput.value.trim();
      if (!pagina || !url) return alert('Completá todos los campos');
      if (editIndex === null) linksExternos.push({ pagina, url });
      else { linksExternos[editIndex] = { pagina, url }; editIndex = null; btnCancelar.style.display = 'none'; btnGuardar.textContent = 'Guardar Link'; }
      paginaInput.value = ''; urlInput.value = '';
      localStorage.setItem('linksExternos', JSON.stringify(linksExternos));
      renderLinksExternos();
    });

    btnCancelar.addEventListener('click', () => {
      paginaInput.value = ''; urlInput.value = ''; editIndex = null; btnCancelar.style.display = 'none'; btnGuardar.textContent = 'Guardar Link';
    });

    function addListenersToButtons() {
      $$('.editar-link', listaLinksExternos).forEach(btn => {
        btn.addEventListener('click', () => {
          editIndex = Number(btn.dataset.index);
          const link = linksExternos[editIndex];
          paginaInput.value = link.pagina;
          urlInput.value = link.url;
          btnGuardar.textContent = 'Actualizar';
          btnCancelar.style.display = 'inline-block';
        });
      });
      $$('.eliminar-link', listaLinksExternos).forEach(btn => {
        btn.addEventListener('click', () => {
          const i = Number(btn.dataset.index);
          linksExternos.splice(i, 1);
          localStorage.setItem('linksExternos', JSON.stringify(linksExternos));
          renderLinksExternos();
        });
      });
    }

    renderLinksExternos();
  })();

  /* --------------------------
     Carrusel (url-based)
  -------------------------- */
  (function carouselModule() {
    const imgUrl = $('#imgUrl');
    const imgFile = $('#imgFile');
    const imgDesc = $('#imgDesc');
    const btnAddImg = $('#btnAddImg');
    const carouselList = $('#carouselList');
    const previewImg = $('#previewImg');

    if (!imgUrl || !btnAddImg || !carouselList) return;

    let carousel = JSON.parse(localStorage.getItem('carouselImgs')) || [];
    let currentImage = '';

    function saveCarousel() { localStorage.setItem('carouselImgs', JSON.stringify(carousel)); }

    function validateImageUrl(url, onSuccess, onError) {
      const img = new Image();
      img.onload = () => onSuccess();
      img.onerror = () => onError();
      img.src = url;
    }

     // ---- PREVIEW desde URL (validado) ----
    imgUrl.addEventListener('input', () => {
      const url = imgUrl.value.trim();
      if (!url) return;

      validateImageUrl(
        url,
        () => {
          currentImage = url;
          previewImg.src = url;
          previewImg.style.display = 'block';

          if (imgFile) imgFile.value = '';
        },
        () => {
          currentImage = '';
          previewImg.style.display = 'none';
          alert('La URL no corresponde a una imagen válida.');
        }
      );
    });


    // ---- PREVIEW desde archivo ----
    if (imgFile) {
      imgFile.addEventListener('change', () => {
        const file = imgFile.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
          currentImage = e.target.result; // base64
          previewImg.src = currentImage;
          previewImg.style.display = 'block';

          imgUrl.value = '';
        };
        reader.readAsDataURL(file);
      });
    }

    function renderCarousel() {
      carouselList.innerHTML = '';
      if (carousel.length === 0) { carouselList.innerHTML = '<p>No hay imágenes aún.</p>'; return; }
      carousel.forEach((item, index) => {
        const div = document.createElement('div'); div.classList.add('item');
        div.innerHTML = `
          <img src="${item.src}">
          <div><input 
          type="text"
          class="descInput"
          data-index="${index}"
          placeholder="Descripción de la imagen"
          value="${item.desc || ''}">
          </div>
          <div class="order-buttons">
            <button data-index="${index}" class="btnUp">▲</button>
            <button data-index="${index}" class="btnDown">▼</button>
          </div>
          <button class="btnDelete" data-index="${index}">Eliminar</button>
        `;
        carouselList.appendChild(div);
      });
      addListListeners();
    }

    function addListListeners() {
      $$('.btnDelete', carouselList).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index); carousel.splice(i, 1); saveCarousel(); renderCarousel();
      }));
      $$('.btnUp', carouselList).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index); if (i === 0) return; [carousel[i - 1], carousel[i]] = [carousel[i], carousel[i - 1]]; saveCarousel(); renderCarousel();
      }));
      $$('.btnDown', carouselList).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index); if (i === carousel.length - 1) return; [carousel[i + 1], carousel[i]] = [carousel[i], carousel[i + 1]]; saveCarousel(); renderCarousel();
      }));
      $$('.descInput', carouselList).forEach(input => {
        input.addEventListener('input', () => {
          const i = Number(input.dataset.index);
          carousel[i].desc = input.value;
          saveCarousel();
        });
      });
    }

    // ---- AGREGAR imagen ----
      btnAddImg.addEventListener('click', () => {
        const desc = imgDesc ? imgDesc.value.trim() : '';

        if (!currentImage) {
          alert('Debes ingresar una imagen (link o archivo).');
          return;
        }

        carousel.push({ src: currentImage, desc });

        // reset
        currentImage = '';
        imgUrl.value = '';
        if (imgDesc) imgDesc.value = '';
        if (imgFile) imgFile.value = '';
        previewImg.style.display = 'none';

        saveCarousel();
        renderCarousel();
      });

      renderCarousel();
    })();

/* --------------------------
   Tabs de páginas + estado
-------------------------- */

const tabs = document.querySelectorAll('.tab');
const webNombre = document.getElementById('webNombre');
const webEstado = document.getElementById('webEstado');

// estados simulados por página (alineados con el CSS)
const paginas = [
  { nombre: 'Página 1', estado: '🟢 Activa', clase: 'activa' },
  { nombre: 'Página 2', estado: '🟡 En progreso', clase: 'en-progreso' },
  { nombre: 'Página 3', estado: '🔴 Pendiente de pago', clase: 'pendiente' }
];

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {

    // activar tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // actualizar nombre
    webNombre.textContent = paginas[index].nombre;

    // ✅ reset limpio del estado (SIN romper layout)
    webEstado.classList.remove(
      'activa',
      'en-progreso',
      'pendiente',
      'inactiva'
    );

    // aplicar nuevo estado
    webEstado.classList.add(paginas[index].clase);
    webEstado.textContent = paginas[index].estado;

    console.log('Cambio a:', paginas[index]);
  });
});

 /* --------------------------
   Web selector
-------------------------- */
(function webComponentModule() {
  const websDelUsuario = [
    { nombre: 'Pagina 1', estado: 'Activa', dominio:'web1.com'},
    { nombre: 'Pagina 2', estado: 'En proceso', dominio:'web2.com'},
    { nombre: 'Pagina 3', estado: 'Pendiente de pago', dominio:'web3.com'},
    { nombre: 'Pagina 4', estado: 'suspendida', dominio:'web4.com'}
  ];

  let currentIndex = 0;

  const btnMostrarWebs = document.getElementById('btnMostrarWebs');
  const dropdownWebs = document.getElementById('dropdownWebs');
  const sidebarWebNombre = document.getElementById('webNombre');
  const sidebarWebEstado = document.getElementById('webEstado');

  function actualizarSidebarOpciones(estado) {
  const items = {
    resumen: document.querySelector('[data-seccion="resumen"]'),
    enProceso: document.querySelector('[data-seccion="en-proceso"]'),
    pendiente: document.querySelector('[data-seccion="pendiente-pago"]'),
    suspendida: document.querySelector('[data-seccion="suspendida-web"]'),
  };

  // Ocultar todos por defecto
    Object.values(items).forEach(i => i.style.display = "none");

    const key = estado.toLowerCase();

    if (key.includes("activa")) {
      items.resumen.style.display = "block";
    } 
    else if (key.includes("proceso")) {
      items.enProceso.style.display = "block";
    } 
    else if (key.includes("pendiente")) {
      items.pendiente.style.display = "block";
    } 
    else {
      items.suspendida.style.display = "block";
    }
  }

  // Clase visual según estado
  function estadoClass(estado) {
    const key = estado.toLowerCase();
    if (key.includes('activa')) return 'estado-activa';
    if (key.includes('proceso')) return 'estado-en-proceso';
    if (key.includes('pendiente')) return 'estado-pendiente';
    return 'estado-suspendida';
  }

  // Actualizar cabecera del sidebar
  function renderSidebarCurrent() {
    const web = websDelUsuario[currentIndex];

    sidebarWebNombre.textContent = web.nombre;
    sidebarWebEstado.textContent = web.estado;
    sidebarWebEstado.className = 'web-estado ' + estadoClass(web.estado);

    // NUEVO: actualizar menú del sidebar según estado
    actualizarSidebarOpciones(web.estado);
  }

  function mostrarSeccionSegunEstado(estadoRaw) {
    // Normalizar el estado a un formato uniforme
    const estado = estadoRaw.toLowerCase().trim();

    let clave = "";
    if (estado.includes("activa")) clave = "activa";
    else if (estado.includes("proceso")) clave = "en-proceso";
    else if (estado.includes("pendiente")) clave = "pendiente-pago";
    else if (estado.includes("suspendida")) clave = "suspendida";
    else clave = "activa";

    // Ocultar todas las secciones
    const secciones = [
      "resumen",
      "en-proceso",
      "pendiente-pago",
      "suspendida-web"
    ];

    secciones.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // Mostrar solo la sección correcta
    let seccionCorrespondiente = "";

    switch (clave) {
      case "activa":
        seccionCorrespondiente = "resumen";
        break;

      case "en-proceso":
        seccionCorrespondiente = "en-proceso";
        break;

      case "pendiente-pago":
        seccionCorrespondiente = "pendiente-pago";
        break;

      case "suspendida":
        seccionCorrespondiente = "suspendida-web";
        break;
    }

    const target = document.getElementById(seccionCorrespondiente);
    if (target) target.style.display = "block";
  }

  // Render del dropdown
  function renderDropdown() {
    dropdownWebs.innerHTML = '';

    websDelUsuario.forEach((web, idx) => {
      const div = document.createElement('div');
      div.className = 'web-item';   // <- AHORA COINCIDE CON TU CSS

      div.innerHTML = `
        <div class="left">
          <strong>${web.nombre}</strong>
          <small class="web-estado ${estadoClass(web.estado)}">${web.estado}</small>
        </div>
      `;

      div.addEventListener('click', () => {
        currentIndex = idx;
        renderSidebarCurrent();
        dropdownWebs.style.display = 'none';
      });

      dropdownWebs.appendChild(div);
    });
  }

  // Cuando el usuario hace click en una opción del sidebar
  document.querySelectorAll(".sidebar-opcion").forEach(btn => {
    btn.addEventListener("click", () => {
      const web = websDelUsuario[currentIndex];
      console.log("Click en opción del sidebar → estado:", web.estado);
      mostrarSeccionSegunEstado(web.estado);
    });
  });

  // Hacer click en "Página 1" → toggle dropdown
  btnMostrarWebs.addEventListener('click', (e) => {
    e.preventDefault();
    dropdownWebs.style.display =
      dropdownWebs.style.display === 'block' ? 'none' : 'block';
  });

  // Ocultar al salir del área (opcional pero prolijo)
  document.querySelector('.web-actual-wrapper')
    .addEventListener('mouseleave', () => {
      dropdownWebs.style.display = 'none';
    });

  renderSidebarCurrent();
  renderDropdown();
})();

// --- REFERENCIAS DEL DOM ---
const preview = document.getElementById("preview-foto");
const inputFile = document.getElementById("foto");     // <--- CAMBIADO AQUÍ
const btnEliminar = document.getElementById("eliminar-foto");

const nombreInput = document.getElementById("nombre_usuario");
const emailInput = document.getElementById("user_email");
const telefonoInput = document.getElementById("telefono");

const FOTO_DEFAULT = "/images/panel/perfil.jpg";

// ----------------------------------------------------
// CARGAR PERFIL GUARDADO
// ----------------------------------------------------
cargarPerfilGuardado();

// ----------------------------------------------------
// SUBIR FOTO
// ----------------------------------------------------
inputFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    abrirRecortador(ev.target.result);
  };

  reader.readAsDataURL(file);
});

// ----------------------------------------------------
// ELIMINAR FOTO
// ----------------------------------------------------
btnEliminar.addEventListener("click", () => {
  preview.src = FOTO_DEFAULT;
  guardarPerfil();
});

// ----------------------------------------------------
// RECORTADOR BÁSICO CON CANVAS (SIN LIBRERÍAS)
// ----------------------------------------------------
function abrirRecortador(imgSrc) {
  const modal = document.createElement("div");
  modal.style = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display:flex; align-items:center; justify-content:center;
    z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="background:#fff; padding:15px; border-radius:10px; display:flex; flex-direction:column; align-items:center;">
      <canvas id="crop-canvas" style="max-width:300px; border:1px solid #ccc;"></canvas>
      <div style="margin-top:10px;">
        <button id="crop-ok" style="padding:6px 12px; margin-right:5px;">Recortar</button>
        <button id="crop-cancel" style="padding:6px 12px;">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const canvas = modal.querySelector("#crop-canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = imgSrc;

  img.onload = () => {
    const maxSize = 300;
    const ratio = img.width / img.height;

    if (ratio > 1) {
      canvas.width = maxSize;
      canvas.height = maxSize / ratio;
    } else {
      canvas.height = maxSize;
      canvas.width = maxSize * ratio;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  modal.querySelector("#crop-ok").onclick = () => {
    const finalImg = canvas.toDataURL("image/jpeg");
    preview.src = finalImg;
    guardarPerfil();
    modal.remove();
  };

  modal.querySelector("#crop-cancel").onclick = () => modal.remove();
}

// ----------------------------------------------------
// GUARDAR PERFIL EN LOCALSTORAGE
// ----------------------------------------------------
function guardarPerfil() {
  const data = {
    foto: preview.src || FOTO_DEFAULT,
    nombre: nombreInput.value,
    email: emailInput.value,
    telefono: telefonoInput.value
  };

  localStorage.setItem("perfil_usuario", JSON.stringify(data));
}

// ----------------------------------------------------
// CARGAR PERFIL
// ----------------------------------------------------
function cargarPerfilGuardado() {
  const datos = JSON.parse(localStorage.getItem("perfil_usuario"));

  if (!datos) {
    preview.src = FOTO_DEFAULT;
    return;
  }

  preview.src = datos.foto || FOTO_DEFAULT;
  nombreInput.value = datos.nombre || "";
  emailInput.value = datos.email || "";
  telefonoInput.value = datos.telefono || "";
}

// ----------------------------------------------------
// MODO VISTA / MODO EDICIÓN PERFIL
// ----------------------------------------------------

const configSection = document.getElementById("configuracion");

// Textos
const textoNombre = document.getElementById("texto-nombre");
const textoEmail = document.getElementById("texto-email");
const textoTelefono = document.getElementById("texto-telefono");

// Botones
const btnGuardarPerfil = document.getElementById("guardar-perfil");
const btnEditarPerfil = document.getElementById("editar-perfil");

// Guardar → pasar a modo vista
btnGuardarPerfil.addEventListener("click", () => {
  textoNombre.textContent = nombreInput.value || "—";
  textoEmail.textContent = emailInput.value || "—";
  textoTelefono.textContent = telefonoInput.value || "—";

  guardarPerfil(); // usa tu función existente

  configSection.classList.add("modo-vista");
  btnGuardarPerfil.style.display = "none";
  btnEditarPerfil.style.display = "inline-block";
});

// Editar → volver a modo edición
btnEditarPerfil.addEventListener("click", () => {
  configSection.classList.remove("modo-vista");
  btnGuardarPerfil.style.display = "inline-block";
  btnEditarPerfil.style.display = "none";
});

// ----------------------------------------------------
// INTEGRACIÓN CON CARGA DE PERFIL
// ----------------------------------------------------

const _cargarPerfilOriginal = cargarPerfilGuardado;

cargarPerfilGuardado = function () {
  _cargarPerfilOriginal();

  textoNombre.textContent = nombreInput.value || "—";
  textoEmail.textContent = emailInput.value || "—";
  textoTelefono.textContent = telefonoInput.value || "—";

  if (nombreInput.value || emailInput.value || telefonoInput.value) {
    configSection.classList.add("modo-vista");
    btnGuardarPerfil.style.display = "none";
    btnEditarPerfil.style.display = "inline-block";
  }
};

 }); // <<< end
