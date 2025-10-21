document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const menuItems = document.querySelectorAll(".editor-sidebar li");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".editor-sidebar");

  // Botón Aa y submenú
  const toolAa = document.querySelector(".tool-aa");
  const boldBtn = document.querySelector(".format-bold");
  const italicBtn = document.querySelector(".format-italic");
  const colorPicker = document.querySelector(".color-picker");

  // -------------------- SUBMENÚ Aa --------------------
  // Toggle desplegable Aa al hacer click
  toolAa.addEventListener("click", (e) => {
    e.stopPropagation();
    toolAa.classList.toggle("show");
  });

  // Cierra submenú solo si el click no fue sobre Aa ni su submenú
  document.addEventListener("click", (e) => {
    if (!toolAa.contains(e.target)) {
      toolAa.classList.remove("show");
    }
  });

  // Función para aplicar formato y mantener botón activo
  const applyFormat = (button, command) => {
    button.addEventListener("mousedown", (e) => {
      e.preventDefault(); 
      document.execCommand(command);
      editor.focus();

      // Mantener activo mientras el formato esté aplicado
      const isActive = document.queryCommandState(command);
      button.classList.toggle("active", isActive);
    });
  };

  applyFormat(boldBtn, "bold");
  applyFormat(italicBtn, "italic");

  // -------------------- COLOR --------------------
  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      const color = e.target.value;
      document.execCommand("foreColor", false, color);
      editor.focus();

      // opcional: resaltar el color elegido en el input
      colorPicker.style.border = `2px solid ${color}`;
    });
  }

  // -------------------- Resaltar otras opciones del menú --------------------
  menuItems.forEach(item => {
    if (!['tool-aa','format-bold','format-italic','tool-color'].some(cls => item.classList.contains(cls))) {
      item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
      });
    }
  });

  // -------------------- TOGGLE MENÚ MÓVIL --------------------
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
});
