document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const secciones = document.querySelectorAll(".seccion");

  // Toggle menú lateral (modo responsive)
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Click en cada opción del menú
  document.querySelectorAll("[data-seccion]").forEach(item => {
    item.addEventListener("click", () => {
      const id = item.dataset.seccion;

      // Oculta todas las secciones
      secciones.forEach(sec => sec.style.display = "none");

      // Muestra la sección correspondiente
      const activa = document.getElementById(id);
      if (activa) activa.style.display = "block";

      // Cierra el menú si está en móvil
      sidebar.classList.remove("active");
    });
  });
});

//Calendario
document.addEventListener("DOMContentLoaded", () => {
  const diasEl = document.getElementById("dias");
  const mesAnioEl = document.getElementById("mes-anio");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const modal = document.getElementById("modal");
  const cerrarModal = document.getElementById("cerrar-modal");
  const form = document.getElementById("form-actividad");
  const fechaSel = document.getElementById("fecha-seleccionada");
  const listaActividades = document.getElementById("lista-actividades");

  let actividades = JSON.parse(localStorage.getItem("actividades")) || [];
  let fechaSeleccionada = null;
  let fechaActual = new Date();

  function renderCalendario() {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    mesAnioEl.textContent = fechaActual.toLocaleString("es-ES", { month: "long", year: "numeric" });

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diaInicio = primerDia.getDay();
    const totalDias = ultimoDia.getDate();

    diasEl.innerHTML = "";

    for (let i = 0; i < (diaInicio === 0 ? 6 : diaInicio - 1); i++) {
      const vacio = document.createElement("div");
      diasEl.appendChild(vacio);
    }

    for (let d = 1; d <= totalDias; d++) {
      const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const diaEl = document.createElement("div");
      diaEl.classList.add("dia");

      const num = document.createElement("div");
      num.classList.add("dia-num");
      num.textContent = d;
      diaEl.appendChild(num);

      const eventos = actividades.filter(a => a.fecha === fecha);
      eventos.forEach(ev => {
        const eventoEl = document.createElement("div");
        eventoEl.classList.add("evento");
        eventoEl.textContent = ev.titulo;
        diaEl.appendChild(eventoEl);
      });

      diaEl.addEventListener("click", () => abrirModal(fecha));
      diasEl.appendChild(diaEl);
    }
  }

  function abrirModal(fecha) {
    fechaSeleccionada = fecha;
    fechaSel.textContent = fecha;
    renderListaActividades();
    modal.style.display = "flex";
  }

  function renderListaActividades() {
    listaActividades.innerHTML = "";
    const eventos = actividades.filter(a => a.fecha === fechaSeleccionada);

    if (eventos.length === 0) {
      listaActividades.innerHTML = "<li>(Sin actividades)</li>";
      return;
    }

    eventos.forEach((ev, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${ev.hora}</strong> - ${ev.titulo}<br><small>${ev.descripcion || ""}</small>`;
      
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "✖";
      btnEliminar.addEventListener("click", () => eliminarActividad(index, fechaSeleccionada));

      li.appendChild(btnEliminar);
      listaActividades.appendChild(li);
    });
  }

  function eliminarActividad(index, fecha) {
    const eventos = actividades.filter(a => a.fecha === fecha);
    const globalIndex = actividades.findIndex(a => a === eventos[index]);
    if (globalIndex !== -1) actividades.splice(globalIndex, 1);
    localStorage.setItem("actividades", JSON.stringify(actividades));
    renderListaActividades();
    renderCalendario();
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const hora = document.getElementById("hora").value;
    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    actividades.push({ fecha: fechaSeleccionada, hora, titulo, descripcion });
    localStorage.setItem("actividades", JSON.stringify(actividades));

    form.reset();
    renderListaActividades();
    renderCalendario();
  });

  cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  prevBtn.addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    renderCalendario();
  });

  nextBtn.addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    renderCalendario();
  });

  renderCalendario();
});

document.addEventListener("DOMContentLoaded", () => {
  const submenuItems = document.querySelectorAll(".has-submenu");

  submenuItems.forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("open"); // Alterna mostrar/ocultar el submenú
    });
  });
});

// Cambia de color la opción seleccionada.
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los <li> que tengan data-seccion (tus opciones principales y submenús)
  const menuItems = document.querySelectorAll(".sidebar li[data-seccion]");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      // Quita la clase 'active' de todos los elementos
      menuItems.forEach(i => i.classList.remove("active"));

      // Agrega 'active' al elemento clickeado
      item.classList.add("active");
    });
  });
});

//Notificaciones:
const bellBtn = document.getElementById('bellBtn');
const notifMenu = document.getElementById('notifMenu');

bellBtn.addEventListener('click', () => {
  notifMenu.classList.toggle('show');
});

// Cerrar el menú si se hace clic fuera
document.addEventListener('click', (e) => {
  if (!bellBtn.contains(e.target) && !notifMenu.contains(e.target)) {
    notifMenu.classList.remove('show');
  }
});

//captura de mails
document.addEventListener("DOMContentLoaded", () => {
  const addMailBtn = document.getElementById("add-mail-btn");
  const mailInput = document.getElementById("new-mail");
  const clasificacionInput = document.getElementById("clasificacion");
  const mailListContainer = document.querySelector(".mail-list");
  const copyBtn = document.getElementById("copy-mails");
  const copyConfirm = document.getElementById("copy-confirm");
  const openGmailBtn = document.getElementById("open-gmail");
  const selectionType = document.getElementById("selection-type");
  const clasificacionSelector = document.getElementById("clasificacion-selector");
  const clasificacionSelect = document.getElementById("clasificacion-select");

  // Mostrar u ocultar selector según el tipo elegido
  selectionType.addEventListener("change", () => {
    if (selectionType.value === "clasificacion") {
      clasificacionSelector.style.display = "block";
      actualizarClasificaciones(); 
    } else {
      clasificacionSelector.style.display = "none";
    }
  });

  // Crear sección si no existe
  function getOrCreateList(clasificacion) {
    let existingSection = mailListContainer.querySelector(
      `[data-clasificacion="${clasificacion.toLowerCase()}"]`
    );

    if (!existingSection) {
      // crear nueva sección
      const section = document.createElement("div");
      section.classList.add("mail-section");
      section.dataset.clasificacion = clasificacion.toLowerCase();

      const title = document.createElement("h3");
      title.textContent = clasificacion;

      const ul = document.createElement("ul");
      ul.classList.add("mail-group");

      section.appendChild(title);
      section.appendChild(ul);
      mailListContainer.appendChild(section);

      return ul;
    }

    return existingSection.querySelector("ul");
  }

  // Actualizar dropdown de clasificaciones
  function actualizarClasificaciones() {
    const secciones = document.querySelectorAll(".mail-section");
    clasificacionSelect.innerHTML = "";

    secciones.forEach(section => {
      const nombre = section.dataset.clasificacion;
      const option = document.createElement("option");
      option.value = nombre;
      option.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
      clasificacionSelect.appendChild(option);
    });
  }

  // Agregar mail
  addMailBtn.addEventListener("click", () => {
    const mail = mailInput.value.trim();
    const clasificacion = clasificacionInput.value.trim();

    if (!mail || !clasificacion) {
      alert("Por favor completa la clasificación y el mail.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(mail)) {
      alert("Por favor ingresa un mail válido.");
      return;
    }

    const ul = getOrCreateList(clasificacion);

    // Evitar duplicados dentro de la misma clasificación
    const existingMail = Array.from(ul.querySelectorAll("li")).some(
      li => li.dataset.mail === mail.toLowerCase()
    );
    if (existingMail) {
      alert("Ese mail ya está en esta clasificación.");
      return;
    }

    // crear mail
    const li = document.createElement("li");
    li.dataset.mail = mail.toLowerCase();
    li.textContent = mail;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-mail");
    deleteBtn.addEventListener("click", () => li.remove());

    li.appendChild(deleteBtn);
    ul.appendChild(li);

    mailInput.value = "";
  });

  // Copiar mails
  copyBtn.addEventListener("click", () => {
    const mails = Array.from(document.querySelectorAll(".mail-group li")).map(
      li => li.dataset.mail
    );

    if (mails.length === 0) {
      alert("No hay mails para copiar.");
      return;
    }

    navigator.clipboard.writeText(mails.join(", "));
    copyConfirm.style.display = "block";
    setTimeout(() => (copyConfirm.style.display = "none"), 2000);
  });

  // Abrir Gmail
  openGmailBtn.addEventListener("click", () => {
    let mails = [];

    const allMails = Array.from(document.querySelectorAll(".mail-group li")).map(
      li => li.dataset.mail
    );

    if (selectionType.value === "todos") {
      mails = [...new Set(allMails)];

    } else if (selectionType.value === "clasificacion") {
      const clasifElegida = clasificacionSelect.value.toLowerCase();
      const section = document.querySelector(
        `[data-clasificacion="${clasifElegida}"]`
      );
      if (section) {
        mails = Array.from(section.querySelectorAll("li")).map(
          li => li.dataset.mail
        );
      }
    }

    if (mails.length === 0) {
      alert("No hay mails seleccionados.");
      return;
    }

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      mails.join(",")
    )}`;
    window.open(gmailURL, "_blank");
  });
});

// --- Logout ---
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutMsg = document.getElementById("logoutMsg");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          // Redirige al login si todo salió bien
          window.location.href = "/login";
        } else {
          showLogoutError();
        }
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        showLogoutError();
      }
    });
  }

  function showLogoutError() {
    if (logoutMsg) {
      logoutMsg.textContent =
        "No pudimos cerrar tu sesión. Intentá nuevamente.";
      setTimeout(() => (logoutMsg.textContent = ""), 3000);
    } else {
      alert("No pudimos cerrar tu sesión. Intentá nuevamente.");
    }
  }
});

// --- Galería ---
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imagen");
  const contenedor = document.getElementById("galeria-container");

  if (!input || !contenedor) return; // evita errores si la sección no está visible

  input.addEventListener("change", (event) => {
    const archivos = event.target.files;

    for (let archivo of archivos) {
      const lector = new FileReader();

      lector.onload = (e) => {
        const div = document.createElement("div");
        div.classList.add("galeria-item");

        const img = document.createElement("img");
        img.src = e.target.result;

        const btn = document.createElement("button");
        btn.classList.add("borrar-btn");
        btn.textContent = "×";
        btn.addEventListener("click", () => div.remove());

        div.appendChild(img);
        div.appendChild(btn);
        contenedor.appendChild(div);
      };

      lector.readAsDataURL(archivo);
    }

    input.value = "";
  });
});

// Donaciones
document.addEventListener("DOMContentLoaded", () => {
  const montoSelect = document.getElementById("monto-select");
  const linkInput = document.getElementById("donacion-link");
  const aliasGlobalInput = document.getElementById("alias-global");
  const addBtn = document.getElementById("add-donacion-btn");
  const listContainer = document.getElementById("donaciones-ul");

  let aliasGlobal = "";
  const donaciones = {};

  aliasGlobalInput.addEventListener("input", e => {
    aliasGlobal = e.target.value.trim();
  });

  function renderDonaciones() {
    listContainer.innerHTML = "";
    for (const monto in donaciones) {
      const link = donaciones[monto];

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${monto === "personalizado" ? "Personalizado" : "$" + monto}</strong> 
        - <a href="${link}" target="_blank">${link}</a>
        <button class="editar" data-monto="${monto}">✏️ Editar</button>
        <button class="borrar" data-monto="${monto}">❌</button>
      `;

      listContainer.appendChild(li);
    }
  }

  addBtn.addEventListener("click", () => {
    const monto = montoSelect.value;
    const link = linkInput.value.trim();

    if (!link) {
      alert("Por favor ingresá un link de pago.");
      return;
    }

    donaciones[monto] = link;
    renderDonaciones();
    linkInput.value = "";
  });

  // Delegación de eventos (sí va acá adentro)
  listContainer.addEventListener("click", (e) => {
    const target = e.target;
    const monto = target.dataset.monto;

    if (target.classList.contains("editar")) {
      linkInput.value = donaciones[monto];
      montoSelect.value = monto;
    }

    if (target.classList.contains("borrar")) {
      delete donaciones[monto];
      renderDonaciones();
    }
  });

  // MAPA

  const addressInput = document.getElementById("addressInput");
  const mapFrame = document.getElementById("mapFrame");
  const showMapBtn = document.getElementById("showMapBtn");

  showMapBtn.addEventListener("click", () => {
    const address = addressInput.value.trim();
    if (!address) return alert("Escribí una dirección!");

    const encoded = encodeURIComponent(address);

    // Versión sin API key
    mapFrame.src = `https://www.google.com/maps?q=${encoded}&output=embed`;
  });

// -------------------- PLUGIN REDES SOCIALES --------------------
const redesForm = document.getElementById("redes-form");

function cargarRedes() {
  const data = JSON.parse(localStorage.getItem("plugin_redes")) || {};

  // Cargar valores si existen
  redesForm.instagram.value = data.instagram || "";
  redesForm.x.value = data.x || "";
  redesForm.facebook.value = data.facebook || "";
  redesForm["whatsapp"].value = data.whatsapp || "";
  redesForm.tiktok.value = data.tiktok || "";
  redesForm.youtube.value = data.youtube || "";
  redesForm.linkedin.value = data.linkedin || "";
}

// Guardar / Modificar
redesForm.addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    instagram: redesForm.instagram.value.trim(),
    x: redesForm.x.value.trim(),
    facebook: redesForm.facebook.value.trim(),
    whatsapp: redesForm.whatsapp.value.trim(),
    tiktok: redesForm.tiktok.value.trim(),
    youtube: redesForm.youtube.value.trim(),
    linkedin: redesForm.linkedin.value.trim(),
  };

  localStorage.setItem("plugin_redes", JSON.stringify(data));
  alert("Redes sociales guardadas correctamente.");
});

// Eliminar plugin (vaciar)
function eliminarRedes() {
  if (confirm("¿Seguro que querés eliminar todas las redes sociales?")) {
    localStorage.removeItem("plugin_redes");
    redesForm.reset();
    alert("Redes sociales eliminadas.");
  }
}

// Ver solo los campos completos
function obtenerRedesCompletas() {
  const data = JSON.parse(localStorage.getItem("plugin_redes")) || {};
  const completas = {};

  for (const key in data) {
    if (data[key] && data[key].trim() !== "") {
      completas[key] = data[key];
    }
  }

  return completas;
}

/* ---------------------- LINKS EXTERNOS ---------------------- */
const paginaInput = document.getElementById("pagina");
const urlInput = document.getElementById("url");
const btnGuardar = document.getElementById("guardarLink");
const btnCancelar = document.getElementById("cancelarEdicion");
const listaLinksExternos = document.getElementById("listaLinksExternos");

let linksExternos = JSON.parse(localStorage.getItem("linksExternos")) || [];
let editIndex = null; // índice del link que estamos editando

// Renderizar links
function renderLinksExternos() {
  listaLinksExternos.innerHTML = "";

  if (linksExternos.length === 0) {
    listaLinksExternos.innerHTML = "<p>No hay links agregados aún.</p>";
    return;
  }

  linksExternos.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("link-item");

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

// Agregar o actualizar
btnGuardar.addEventListener("click", () => {
  const pagina = paginaInput.value.trim();
  const url = urlInput.value.trim();

  if (!pagina || !url) {
    alert("Completá todos los campos");
    return;
  }

  if (editIndex === null) {
    // Nuevo
    linksExternos.push({ pagina, url });
  } else {
    // Editando
    linksExternos[editIndex] = { pagina, url };
    editIndex = null;
    btnCancelar.style.display = "none";
    btnGuardar.textContent = "Guardar Link";
  }

  paginaInput.value = "";
  urlInput.value = "";

  localStorage.setItem("linksExternos", JSON.stringify(linksExternos));
  renderLinksExternos();
});

// Cancelar edición
btnCancelar.addEventListener("click", () => {
  paginaInput.value = "";
  urlInput.value = "";
  editIndex = null;
  btnCancelar.style.display = "none";
  btnGuardar.textContent = "Guardar Link";
});

// Editar y eliminar
function addListenersToButtons() {
  document.querySelectorAll(".editar-link").forEach(btn => {
    btn.addEventListener("click", () => {
      editIndex = btn.dataset.index;
      const link = linksExternos[editIndex];

      paginaInput.value = link.pagina;
      urlInput.value = link.url;

      btnGuardar.textContent = "Actualizar";
      btnCancelar.style.display = "inline-block";
    });
  });

  document.querySelectorAll(".eliminar-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.index;
      linksExternos.splice(i, 1);

      localStorage.setItem("linksExternos", JSON.stringify(linksExternos));
      renderLinksExternos();
    });
  });
}

// Render inicial
renderLinksExternos();

/* ---------------- CARRUSEL ---------------- */
const imgFile = document.getElementById("imgFile");
const imgDesc = document.getElementById("imgDesc");
const imgLink = document.getElementById("imgLink");
const btnAddImg = document.getElementById("btnAddImg");
const carouselList = document.getElementById("carouselList");

let carousel = JSON.parse(localStorage.getItem("carouselImgs")) || [];

// Render
function renderCarousel() {
  carouselList.innerHTML = "";

  if (carousel.length === 0) {
    carouselList.innerHTML = "<p>No hay imágenes aún.</p>";
    return;
  }

  carousel.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item");

    div.innerHTML = `
      <img src="${item.src}">
      <div>
        <p><strong>${item.desc || "(sin descripción)"}</strong></p>
        <p>${item.link ? `<a href="${item.link}" target="_blank">${item.link}</a>` : "(sin link)"}</p>
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

// Listeners de botones
function addListListeners() {
  document.querySelectorAll(".btnDelete").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.index;
      carousel.splice(i, 1);
      saveCarousel();
      renderCarousel();
    });
  });

  document.querySelectorAll(".btnUp").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      if (i === 0) return;
      [carousel[i - 1], carousel[i]] = [carousel[i], carousel[i - 1]];
      saveCarousel();
      renderCarousel();
    });
  });

  document.querySelectorAll(".btnDown").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      if (i === carousel.length - 1) return;
      [carousel[i + 1], carousel[i]] = [carousel[i], carousel[i + 1]];
      saveCarousel();
      renderCarousel();
    });
  });
}

// Guardar
function saveCarousel() {
  localStorage.setItem("carouselImgs", JSON.stringify(carousel));
}

// Subir imagén (se convierte en base64 así te queda guardada sin backend)
btnAddImg.addEventListener("click", () => {
  const file = imgFile.files[0];
  if (!file) return alert("Seleccioná una imagen");

  const reader = new FileReader();
  reader.onload = () => {
    carousel.push({
      src: reader.result,
      desc: imgDesc.value.trim(),
      link: imgLink.value.trim()
    });

    imgFile.value = "";
    imgDesc.value = "";
    imgLink.value = "";

    saveCarousel();
    renderCarousel();
  };

  reader.readAsDataURL(file);
});

// Inicial
renderCarousel();

});