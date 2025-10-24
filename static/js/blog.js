document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const menuItems = document.querySelectorAll(".editor-sidebar li");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".editor-sidebar");

  // -------------------- SUBMENÚ Aa --------------------
  const toolAa = document.querySelector(".tool-aa");
  const boldBtn = document.querySelector(".format-bold");
  const italicBtn = document.querySelector(".format-italic");

  toolAa.addEventListener("click", e => {
    e.stopPropagation();
    toolAa.classList.toggle("show");
  });

  document.addEventListener("click", e => {
    if (!toolAa.contains(e.target)) toolAa.classList.remove("show");
  });

  const applyFormat = (button, command) => {
    button.addEventListener("mousedown", e => {
      e.preventDefault();
      document.execCommand(command);
      editor.focus();
    });
  };
  applyFormat(boldBtn, "bold");
  applyFormat(italicBtn, "italic");

  // Submenú de fuentes
const fontTool = document.querySelector(".tool-font");
const fontItems = document.querySelectorAll(".font-submenu li");

// Toggle submenú
fontTool.addEventListener("click", (e) => {
  e.stopPropagation();
  fontTool.classList.toggle("show");
});

// Cerrar si clic fuera
document.addEventListener("click", (e) => {
  if (!fontTool.contains(e.target)) fontTool.classList.remove("show");
});

// Aplicar fuente al texto seleccionado
fontItems.forEach(item => {
  item.addEventListener("click", () => {
    const font = item.getAttribute("data-font");

    // Aplicar a la selección
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      // Si no hay texto seleccionado, aplicar al bloque actual
      let block = range.startContainer;
      while (block && block !== editor && !/^(P|DIV|H[1-5])$/.test(block.nodeName)) {
        block = block.parentNode;
      }
      if (block && block !== editor) block.style.fontFamily = font;
    } else {
      // Texto seleccionado → envolver en span
      const span = document.createElement("span");
      span.style.fontFamily = font;
      span.textContent = range.toString();
      range.deleteContents();
      range.insertNode(span);
    }

    editor.focus();
    fontTool.classList.remove("show");
  });
});


  // -------------------- COLOR --------------------
  const colorPicker = document.querySelector(".color-picker");
  if (colorPicker) {
    colorPicker.addEventListener("input", e => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
    });
  }

  // -------------------- LINK --------------------
  const linkTool = document.querySelector(".tool-link");
  let savedRange = null;

  editor.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) savedRange = selection.getRangeAt(0);
  });
  editor.addEventListener("keyup", () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) savedRange = selection.getRangeAt(0);
  });

  if (linkTool) {
    linkTool.addEventListener("click", e => {
      e.preventDefault();
      const selection = window.getSelection();
      selection.removeAllRanges();
      if (savedRange) selection.addRange(savedRange);

      if (selection.isCollapsed) return alert("Seleccioná primero el texto que querés convertir en enlace.");

      const range = selection.getRangeAt(0);
      const parentNode = selection.anchorNode.parentElement;
      const existingLink = parentNode.closest("a");

      let url = existingLink ? prompt("Editar URL del enlace (vacío para eliminarlo):", existingLink.href) : prompt("Ingresá la URL del enlace:");
      if (url === null) return;

      if (existingLink && url === "") {
        const textNode = document.createTextNode(existingLink.textContent);
        existingLink.replaceWith(textNode);
        editor.focus();
        return;
      }

      if (existingLink) {
        existingLink.href = url;
        editor.focus();
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.textContent = range.toString();
      link.target = "_blank";

      range.deleteContents();
      range.insertNode(link);

      range.setStartAfter(link);
      range.setEndAfter(link);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    });

    editor.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        window.open(e.target.href, "_blank");
      }
    });
  }

  // -------------------- ENCABEZADOS --------------------
  const headingButtons = [
    { selector: ".tool-title", tag: "h1" },
    { selector: ".tool-subtitle", tag: "h2" },
    { selector: ".tool-encabezado3", tag: "h3" },
    { selector: ".tool-encabezado4", tag: "h4" },
    { selector: ".tool-encabezado5", tag: "h5" },
  ];

  headingButtons.forEach(({ selector, tag }) => {
    const btn = document.querySelector(selector);
    if (!btn) return;

    btn.addEventListener("mousedown", e => {
      e.preventDefault();
      document.execCommand("formatBlock", false, tag);
      editor.focus();
    });
  });

  // -------------------- IMAGEN --------------------
  const imageTool = document.querySelector(".tool-image");
  if (imageTool) {
    imageTool.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.alt = "Imagen subida";

          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(img);

            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            editor.appendChild(img);
          }

          editor.focus();
        };
        reader.readAsDataURL(file);
      });

      input.click();
    });
  }

  // -------------------- MENÚ ACTIVO --------------------
  menuItems.forEach(item => {
    if (!['tool-aa', 'format-bold', 'format-italic', 'tool-color'].some(cls => item.classList.contains(cls))) {
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
