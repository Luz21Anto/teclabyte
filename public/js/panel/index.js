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
    const imgDesc = $('#imgDesc');
    const btnAddImg = $('#btnAddImg');
    const carouselList = $('#carouselList');

    if (!imgUrl || !btnAddImg || !carouselList) return;

    let carousel = JSON.parse(localStorage.getItem('carouselImgs')) || [];

    function saveCarousel() { localStorage.setItem('carouselImgs', JSON.stringify(carousel)); }

    function renderCarousel() {
      carouselList.innerHTML = '';
      if (carousel.length === 0) { carouselList.innerHTML = '<p>No hay imágenes aún.</p>'; return; }
      carousel.forEach((item, index) => {
        const div = document.createElement('div'); div.classList.add('item');
        div.innerHTML = `
          <img src="${item.src}">
          <div><p><strong>${item.desc || '(sin descripción)'}</strong></p></div>
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
    }

    btnAddImg.addEventListener('click', () => {
      const url = imgUrl.value.trim();
      const desc = imgDesc ? imgDesc.value.trim() : '';
      if (!url) return alert('Debes ingresar un link válido a una imagen.');
      carousel.push({ src: url, desc }); imgUrl.value = ''; if (imgDesc) imgDesc.value = ''; saveCarousel(); renderCarousel();
    });

    renderCarousel();
  })();

  /* --------------------------
     Pequeños widgets: tabs / web selector
  -------------------------- */
  (function uiHelpersModule() {
    // tabs superior que cambian texto de .web-nombre
    const webNombre = document.querySelectorAll('.web-nombre')[0];
    if (webNombre) {
      $$('.tab').forEach((tab, index) => tab.addEventListener('click', () => { webNombre.textContent = 'Página ' + (index + 1); }));
    }

    // lista de webs (sidebar quick list)
    const nombreWebHeader = $('.sidebar h2');
    const listaWebs = $('#listaWebs');
    if (nombreWebHeader && listaWebs) {
      const websDelUsuario = [
        { nombre: 'Web 1', estado: 'Activa', url: 'https://web1.com' },
        { nombre: 'Web 2', estado: 'En progreso', url: 'https://web2.com' },
        { nombre: 'Web 3', estado: 'Pendiente de pago', url: 'https://web3.com' },
        { nombre: 'Web 4', estado: 'Inactiva', url: 'https://web4.com' }
      ];

      nombreWebHeader.addEventListener('click', () => {
        listaWebs.style.display = listaWebs.style.display === 'none' ? 'block' : 'none';
        listaWebs.innerHTML = '';
        websDelUsuario.forEach(web => {
          listaWebs.innerHTML += `
            <div class="web-item">
              <span class="web-nombre">${web.nombre}</span>
              <span class="web-estado ${web.estado.toLowerCase().replace(' ', '-')}">${web.estado}</span>
              <a href="${web.url}" target="_blank" class="external-link" title="Ir a la web">
                <span class="icono-externo"></span>
              </a>
            </div>
          `;
        });
      });
    }
  })();

  /* --------------------------
     Web selector + vistas por estado (componente principal)
  -------------------------- */
  (function webComponentModule() {
    // datos de ejemplo
    const websDelUsuario = [
      { nombre: 'Web 1', estado: 'Activa', url: 'https://web1.com', dominio: 'web1.com', hostingPlan: 'Básico', paymentStatus: 'Pagado', expiryDate: '2026-04-15', deactivationDate: '2026-05-01', pluginsActive: ['Blog', 'Galería', 'WhatsApp'], paymentLink: 'https://pagos.com/pagar/web1' },
      { nombre: 'Web 2', estado: 'En progreso', url: 'https://web2.com', dominio: 'web2.com', hostingPlan: 'Pro', paymentStatus: 'Pagado', expiryDate: '2026-06-10', deactivationDate: '2026-06-25', pluginsActive: ['Calendario'], paymentLink: 'https://pagos.com/pagar/web2' },
      { nombre: 'Web 3', estado: 'Pendiente de pago', url: 'https://web3.com', dominio: 'web3.com', hostingPlan: 'Starter', paymentStatus: 'Pendiente', expiryDate: '2025-12-05', deactivationDate: '2025-12-20', pluginsActive: ['Donaciones','Redes Sociales'], paymentLink: 'https://pagos.com/pagar/web3' },
      { nombre: 'Web 4', estado: 'Inactiva', url: 'https://web4.com', dominio: 'web4.com', hostingPlan: 'Básico', paymentStatus: 'Vencido', expiryDate: '2024-10-01', deactivationDate: '2024-10-15', pluginsActive: ['Carrusel','Galería'], paymentLink: 'https://pagos.com/pagar/web4' }
    ];

    let currentIndex = 0;
    const listaWebsEl = $('#listaWebs');
    const btnMostrarWebs = $('#btnMostrarWebs');
    const sidebarExternalLink = $('#sidebarExternalLink');
    const sidebarWebNombre = document.querySelector('.web-actual .web-nombre') || document.querySelector('.web-nombre');
    const sidebarWebEstado = document.querySelector('.web-actual .web-estado') || document.querySelector('.web-estado');

    const resumenSec = $('#resumen');
    const enProgresoSec = $('#en-progreso');
    const pendientePagoSec = $('#pendiente-pago');
    const reactivarSec = $('#reactivar-web');

    const resNombre = $('#res-nombre');
    const resDominio = $('#res-dominio');
    const resPlan = $('#res-plan');
    const resPago = $('#res-pago');
    const resExp = $('#res-exp');
    const resPendienteCta = $('#res-pendiente-cta');

    const ppExp = $('#pp-exp');
    const ppDesact = $('#pp-desact');
    const ppMantBtn = $('#pp-mantener-btn');

    const reactPlugins = $('#reactivar-plugins');
    const reactExp = $('#react-exp');
    const reactDesact = $('#react-desact');
    const reactivarBtn = $('#reactivarBtn');

    const mantenerActivaBtn = $('#mantenerActivaBtn');

    function estadoClass(estado) {
      const key = String(estado).toLowerCase();
      if (key.includes('act')) return 'estado-activa';
      if (key.includes('progreso')) return 'estado-en-progreso';
      if (key.includes('pend')) return 'estado-pendiente-de-pago';
      return 'estado-inactiva';
    }

    function renderSidebarCurrent() {
      const web = websDelUsuario[currentIndex];
      if (sidebarWebNombre) sidebarWebNombre.textContent = web.nombre;
      if (sidebarWebEstado) { sidebarWebEstado.textContent = web.estado; sidebarWebEstado.className = 'web-estado ' + estadoClass(web.estado); }
    }

    function renderWebsList() {
      if (!listaWebsEl) return;
      listaWebsEl.innerHTML = '';
      websDelUsuario.forEach((web, idx) => {
        const div = document.createElement('div');
        div.className = 'web-item';
        div.innerHTML = `
          <div class="left">
            <strong>${web.nombre}</strong>
            <small class="web-estado ${estadoClass(web.estado)}" style="display:block;margin-top:4px;">${web.estado}</small>
          </div>
          <div class="right">
            <a href="${web.url}" target="_blank" title="Ir a la web" rel="noopener" class="external-link">
              <span class="icono-externo"></span>
            </a>
            <button class="select-web" data-index="${idx}" style="background:none;border:0;cursor:pointer;padding:6px 8px;">Seleccionar</button>
          </div>
        `;
        listaWebsEl.appendChild(div);
      });
    }

    function attachListeners() {
      if (btnMostrarWebs && listaWebsEl) {
        btnMostrarWebs.addEventListener('click', (e) => {
          e.preventDefault();
          const isVisible = listaWebsEl.style.display === 'block';
          listaWebsEl.style.display = isVisible ? 'none' : 'block';
          btnMostrarWebs.setAttribute('aria-expanded', String(!isVisible));
        });

        // Delegación para "Seleccionar"
        listaWebsEl.addEventListener('click', (e) => {
          const btn = e.target.closest('.select-web');
          if (!btn) return;
          const idx = Number(btn.dataset.index);
          selectWeb(idx);
          listaWebsEl.style.display = 'none';
        });
      }

      if (mantenerActivaBtn) mantenerActivaBtn.addEventListener('click', () => { const w = websDelUsuario[currentIndex]; if (w.paymentLink) window.open(w.paymentLink, '_blank'); });
      if (ppMantBtn) ppMantBtn.addEventListener('click', () => { const w = websDelUsuario[currentIndex]; if (w.paymentLink) window.open(w.paymentLink, '_blank'); });
      if (reactivarBtn) reactivarBtn.addEventListener('click', () => { const w = websDelUsuario[currentIndex]; if (w.paymentLink) window.open(w.paymentLink, '_blank'); });
    }

    function selectWeb(idx) {
      if (idx < 0 || idx >= websDelUsuario.length) return;
      currentIndex = idx; renderSidebarCurrent(); updateSidebarExternalLink(); showSectionForCurrent();
    }

    function updateSidebarExternalLink() {
      const w = websDelUsuario[currentIndex];
      if (sidebarExternalLink) sidebarExternalLink.href = w.url || '#';
    }

    function populateResumen(w) {
      if (resNombre) resNombre.textContent = w.nombre || '';
      if (resDominio) resDominio.textContent = w.dominio || (new URL(w.url || 'http://example.com')).hostname;
      if (resPlan) resPlan.textContent = w.hostingPlan || '-';
      if (resPago) resPago.textContent = w.paymentStatus || '-';
      if (resExp) resExp.textContent = w.expiryDate || '-';
      if (resPendienteCta) resPendienteCta.style.display = 'none';
    }

    function renderReactivar(w) {
      if (!reactPlugins) return;
      reactPlugins.innerHTML = '';
      (w.pluginsActive || []).forEach(p => {
        const li = document.createElement('li'); li.textContent = p; reactPlugins.appendChild(li);
      });
      if (reactExp) reactExp.textContent = w.expiryDate || '-';
      if (reactDesact) reactDesact.textContent = w.deactivationDate || '-';
    }

    function showSectionForCurrent() {
      const w = websDelUsuario[currentIndex];
      // ocultar todas
      [resumenSec, enProgresoSec, pendientePagoSec, reactivarSec].forEach(s => { if (s) s.style.display = 'none'; });
      if (!w) return;
      if (String(w.estado).toLowerCase().includes('act')) {
        populateResumen(w); if (resumenSec) resumenSec.style.display = 'block';
      } else if (String(w.estado).toLowerCase().includes('progreso')) {
        if (enProgresoSec) enProgresoSec.style.display = 'block';
      } else if (String(w.estado).toLowerCase().includes('pend')) {
        populateResumen(w); if (resumenSec) resumenSec.style.display = 'block';
        if (resPendienteCta) resPendienteCta.style.display = 'block';
        if (ppExp) ppExp.textContent = w.expiryDate || '-';
        if (ppDesact) ppDesact.textContent = w.deactivationDate || '-';
        if (pendientePagoSec) pendientePagoSec.style.display = 'block';
      } else {
        if (reactivarSec) reactivarSec.style.display = 'block';
        renderReactivar(w);
      }
    }

    // Inicial
    renderSidebarCurrent(); renderWebsList(); attachListeners(); showSectionForCurrent();
  })();

  // --- PERFIL – Foto, Inputs y LocalStorage ---
  const inputImagen = document.getElementById("imagen");
  const previewFoto = document.getElementById("preview-foto");
  const eliminarBtn = document.getElementById("eliminar-foto");

  const nombreInput = document.getElementById("nombre_usuario");
  const emailInput = document.getElementById("user_email");
  const telefonoInput = document.getElementById("telefono");

  const FOTO_DEFAULT = "/img/default-profile.png";

  // --------------------------------------
  // CARGAR DATOS GUARDADOS AL INICIAR
  // --------------------------------------
  const datosGuardados = JSON.parse(localStorage.getItem("perfil_usuario"));

  if (datosGuardados) {
    nombreInput.value = datosGuardados.nombre || "";
    emailInput.value = datosGuardados.email || "";
    telefonoInput.value = datosGuardados.telefono || "";
    previewFoto.src = datosGuardados.foto || FOTO_DEFAULT;
  }

  // --------------------------------------
  // PREVISUALIZAR IMAGEN
  // --------------------------------------
  inputImagen.addEventListener("change", () => {
    const file = inputImagen.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewFoto.src = e.target.result;
        guardarPerfil();
      };
      reader.readAsDataURL(file);
    }
  });

  // --------------------------------------
  // ELIMINAR FOTO
  // --------------------------------------
  eliminarBtn.addEventListener("click", () => {
    previewFoto.src = FOTO_DEFAULT;
    inputImagen.value = "";
    guardarPerfil();
  });

  // --------------------------------------
  // GUARDADO AUTOMÁTICO
  // --------------------------------------
  [nombreInput, emailInput, telefonoInput].forEach(input => {
    input.addEventListener("input", guardarPerfil);
  });

  // --------------------------------------
  // FUNCIÓN GUARDAR
  // --------------------------------------
  function guardarPerfil() {
    const datos = {
      nombre: nombreInput.value,
      email: emailInput.value,
      telefono: telefonoInput.value,
      foto: previewFoto.src
    };

    localStorage.setItem("perfil_usuario", JSON.stringify(datos));
  }

}); // <<< end
