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

  // Función para crear una sección de clasificación si no existe
  function getOrCreateList(clasificacion) {
    let existingSection = mailListContainer.querySelector(
      `[data-clasificacion="${clasificacion.toLowerCase()}"]`
    );

    if (!existingSection) {
      // Crear nuevo bloque
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

    // Evita duplicados dentro de la misma clasificación
    const existingMail = Array.from(ul.querySelectorAll("li")).some(
      li => li.dataset.mail === mail.toLowerCase()
    );
    if (existingMail) {
      alert("Ese mail ya está en esta clasificación.");
      return;
    }

    // Crear elemento del mail
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

  // Copiar todos los mails
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

  // Abrir Gmail directamente en modo redacción
  openGmailBtn.addEventListener("click", () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=", "_blank");
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
