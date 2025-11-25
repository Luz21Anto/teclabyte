document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const menuItems = document.querySelectorAll(".editor-sidebar li, .color-picker, .submenu button");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".editor-sidebar");

  let savedSelection = null;

  // 🟢 Guarda la selección activa (clonando la Range para mayor robustez)
  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0).cloneRange();
  }

  // 🟢 Restaura la selección guardada (clonando al insertarla)
  function restoreSelection() {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.cloneRange());
    }
  }

  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("mouseup", saveSelection);

 // ---------------------- NEGRITA / CURSIVA --------------------
  const boldBtn = document.querySelector(".format-bold");
  const italicBtn = document.querySelector(".format-italic");
  const toolAa = document.querySelector(".tool-aa");

  // --- Mostrar/Ocultar submenú Aa ---
  toolAa.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que el clic cierre el submenú inmediatamente
    toolAa.classList.toggle("show");
  });

  // Cerrar submenú si se hace clic fuera
  document.addEventListener("click", () => {
    toolAa.classList.remove("show");
  });

  // --- NEGRITA ---
  boldBtn.addEventListener("click", () => {
    restoreSelection();                 // <-- Restauramos la selección
    document.execCommand("bold", false, null);
    saveSelection();                    // <-- Guardamos la selección actualizada
    editor.focus();
    updateButtonStates();
  });

  // --- CURSIVA ---
  italicBtn.addEventListener("click", () => {
    restoreSelection();                 // <-- Restauramos la selección
    document.execCommand("italic", false, null);
    saveSelection();                    // <-- Guardamos la selección actualizada
    editor.focus();
    updateButtonStates();
  });

  // --- Actualizar estado de botones según selección ---
  function updateButtonStates() {
    boldBtn.classList.toggle("active", document.queryCommandState("bold"));
    italicBtn.classList.toggle("active", document.queryCommandState("italic"));
  }

  // Actualizar botones cuando cambia la selección en el editor
  editor.addEventListener("keyup", updateButtonStates);
  editor.addEventListener("mouseup", updateButtonStates);
});

  // -------------------- SUBMENÚ DE FUENTES --------------------
  const fontTool = document.querySelector(".tool-font");
  const fontItems = document.querySelectorAll(".font-submenu li");

  if (fontTool) {
    fontTool.addEventListener("mouseenter", () => fontTool.classList.add("show"));
    fontTool.addEventListener("mouseleave", () => fontTool.classList.remove("show"));
  }

  let currentFont = "'Nunito', sans-serif";

  // Aplicar fuente al texto seleccionado o futura escritura
  fontItems.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();

      fontItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const font = item.getAttribute("data-font");
      currentFont = font;

      restoreSelection();
      const sel = window.getSelection();

      if (sel && !sel.isCollapsed) {
        document.execCommand("fontName", false, font);
      } else if (sel.rangeCount > 0) {
        // Insertar un span visible con un espacio y aplicar la fuente, luego posicionar el cursor dentro
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontFamily = font;
        span.appendChild(document.createTextNode(" "));

        range.insertNode(span);

        // mover el cursor dentro del span (después del espacio)
        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelection = newRange.cloneRange();
      }

      saveSelection();
      editor.focus();
    });
  });

  // -------------------- COLOR --------------------
  const colorPicker = document.querySelector(".color-picker");

  if (colorPicker) {
    colorPicker.addEventListener("input", e => {
      const color = e.target.value;
      restoreSelection();
      const sel = window.getSelection();

      if (sel && !sel.isCollapsed) {
        document.execCommand("foreColor", false, color);
      } else if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.style.color = color;
        span.appendChild(document.createTextNode(" "));

        range.insertNode(span);

        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelection = newRange.cloneRange();
      }

      saveSelection();
      editor.focus();
    });
  }

  // -------------------- LINK --------------------
  const linkTool = document.querySelector(".tool-link");
  let savedRange = null;

  editor.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) savedRange = selection.getRangeAt(0).cloneRange();
  });
  editor.addEventListener("keyup", () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) savedRange = selection.getRangeAt(0).cloneRange();
  });

  if (linkTool) {
    linkTool.addEventListener("click", e => {
      e.preventDefault();
      restoreSelection();

      const selection = window.getSelection();
      if (selection.isCollapsed) return alert("Seleccioná el texto que querés enlazar.");

      const range = selection.getRangeAt(0);
      const parentNode = selection.anchorNode.parentElement;
      const existingLink = parentNode.closest("a");

      let url = existingLink
        ? prompt("Editar URL del enlace (vacío para eliminarlo):", existingLink.href)
        : prompt("Ingresá la URL del enlace:");
      if (url === null) return;

      if (existingLink && url === "") {
        const textNode = document.createTextNode(existingLink.textContent);
        existingLink.replaceWith(textNode);
        saveSelection();
        editor.focus();
        return;
      }

      if (existingLink) {
        existingLink.href = url;
        saveSelection();
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

      saveSelection();
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
      restoreSelection();
      document.execCommand("formatBlock", false, `<${tag}>`);
      saveSelection();
      editor.focus();
    });
  });

  // -------------------- IMAGEN --------------------
  const imageTool = document.querySelector(".tool-image");
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.style.display = "none";
  document.body.appendChild(imageInput);

  if (imageTool) {
    imageTool.addEventListener("mousedown", e => {
      e.preventDefault();
      restoreSelection();
      imageInput.click();
    });
  }

  imageInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      restoreSelection();

      const wrapper = document.createElement("div");
      wrapper.classList.add("image-wrapper");
      wrapper.style.position = "relative";
      wrapper.contentEditable = "false";

      const img = document.createElement("img");
      img.src = ev.target.result;
      img.alt = "Imagen insertada";
      img.style.width = "100%";
      img.style.height = "auto";

      const handle = document.createElement("div");
      handle.classList.add("resize-handle");
      handle.style.pointerEvents = "auto";
      handle.style.cursor = "nwse-resize";
      handle.contentEditable = "false";

      wrapper.appendChild(img);
      wrapper.appendChild(handle);

      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(wrapper);

        // separador visible para posicionar el cursor
        const separator = document.createTextNode(" ");
        wrapper.after(separator);

        // Mover el cursor después del separador
        range.setStartAfter(separator);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editor.appendChild(wrapper);
      }

      activateResize(wrapper, img, handle);
      imageInput.value = "";
      saveSelection();
      editor.focus();
    };
    reader.readAsDataURL(file);
  });

  function activateResize(wrapper, img, handle) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight, aspectRatio;

    handle.addEventListener("mousedown", e => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;

      startX = e.clientX;
      startY = e.clientY;
      const rect = wrapper.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      aspectRatio = startWidth / startHeight;

      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", e => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      const newHeight = newWidth / aspectRatio;

      wrapper.style.width = newWidth + "px";
      wrapper.style.height = newHeight + "px";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = "";
      }
    });
  }

  // -------------------- TOGGLE MENÚ MÓVIL --------------------
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (sidebar) sidebar.classList.toggle("show");
    });
  }

  document.getElementById("publicarBtn").addEventListener("click", () => {
    const editorContent = document.getElementById("editor").innerHTML;

    const articulo = {
      titulo: "",
      subtitulo: "",
      autor: "",
      fecha: new Date().toISOString().split("T")[0],
      contenidoHTML: editorContent
    };

    localStorage.setItem("miArticuloGuardado", JSON.stringify(articulo));
    window.location.href = "post.html";
  });

  // -------------------- PEGAR COMO TEXTO PLANO --------------------
  editor.addEventListener("paste", e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  // -------------------- FALLBACK SI EL EDITOR QUEDA VACÍO --------------------
  editor.addEventListener("input", () => {
    if (editor.innerHTML.trim() === "" || editor.innerHTML === "<br>") {
      editor.innerHTML = "<p><br></p>";

      const range = document.createRange();
      range.setStart(editor.querySelector("p"), 0);
      range.collapse(true);

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
});
