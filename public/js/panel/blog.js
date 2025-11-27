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


// -------------------- VARIABLES --------------------
const fontTool = document.querySelector(".tool-font");
const fontItems = document.querySelectorAll(".font-submenu li");
const editor = document.getElementById("editor");

let currentFont = "";       // Fuente activa
let savedSelection = null;  // Para guardar/restaurar selección

// -------------------- GUARDAR/RESTAURAR SELECCIÓN --------------------
function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0).cloneRange();
}

function restoreSelection() {
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection.cloneRange());
  }
}

// Guardamos selección al mover el cursor o seleccionar texto
editor.addEventListener("keyup", saveSelection);
editor.addEventListener("mouseup", saveSelection);

// -------------------- SUBMENÚ DE FUENTES --------------------
if (fontTool) {
  fontTool.addEventListener("mouseenter", () => fontTool.classList.add("show"));
  fontTool.addEventListener("mouseleave", () => fontTool.classList.remove("show"));
}

// -------------------- CAMBIO DE FUENTE --------------------
fontItems.forEach(item => {
  item.addEventListener("click", () => {
    // Actualizar visualmente
    fontItems.forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");

    currentFont = item.dataset.font;

    // Restaurar la selección para no mover el cursor
    restoreSelection();

    // Aplicar la fuente al texto seleccionado si hay
    applyFontToSelection(currentFont);

    editor.focus();
  });
});

// -------------------- FUNCIONES --------------------

// Aplica fuente al texto seleccionado
function applyFontToSelection(font) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  if (!selection.isCollapsed) {
    const span = document.createElement("span");
    span.style.fontFamily = font;

    // Extraemos el contenido seleccionado y lo insertamos en el span
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Mantener la selección dentro del span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);
  }
}

// -------------------- TEXTO FUTURO --------------------
editor.addEventListener("keydown", (e) => {
  if (!currentFont) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  // Solo actuamos si el cursor está colapsado (sin texto seleccionado)
  if (selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    let container = selection.anchorNode;

    // Si estamos en el editor directamente o el nodo padre no tiene la fuente
    if (container === editor || container.nodeType !== Node.TEXT_NODE || container.parentNode.style.fontFamily !== currentFont) {
      const span = document.createElement("span");
      span.style.fontFamily = currentFont;
      span.appendChild(document.createTextNode("\u200B")); // zero-width space

      range.insertNode(span);

      // Mover cursor dentro del span
      const newRange = document.createRange();
      newRange.setStart(span.firstChild, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
});

// -------------------- COLOR --------------------
// Guardar selección real del usuario
function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedSelection = sel.getRangeAt(0).cloneRange();
  }
}

// Reconstruir objeto Selection desde savedSelection
function applyRange(range) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Guardamos selección cuando el usuario realmente selecciona texto
editor.addEventListener("mouseup", saveSelection);
editor.addEventListener("keyup", saveSelection);


// ===================== COLOR PICKER =====================
const colorPicker = document.querySelector(".color-picker");

if (colorPicker) {
  colorPicker.addEventListener("input", e => {
    const color = e.target.value;

    // -------------------------
    // CASO 1: hay texto seleccionado previamente
    // -------------------------
    if (savedSelection && !savedSelection.collapsed) {

      // restauramos sin pedir al navegador la selección actual
      applyRange(savedSelection.cloneRange());

      document.execCommand("foreColor", false, color);

      // guardar nueva selección
      saveSelection();
      return;
    }

    // -------------------------
    // CASO 2: texto futuro
    // -------------------------
    editor.focus();

    // Si no había selección, creamos un rango al final
    const sel = window.getSelection();
    if (sel.rangeCount === 0) {
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.collapse(false);
      sel.addRange(r);
      savedSelection = r.cloneRange();
    }

    document.execCommand("foreColor", false, color);

    saveSelection();
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

      // --- A) Si hay texto antes, forzar salto de línea ---
      const needsBreakBefore =
        range.startOffset !== 0 || range.startContainer.nodeType === 3;

      if (needsBreakBefore) {
        const brBefore = document.createElement("br");
        range.insertNode(brBefore);
        range.setStartAfter(brBefore);
      }

      // Insertar la imagen
      range.insertNode(wrapper);

      // --- B) Salto de línea luego de la imagen ---
      const brAfter = document.createElement("br");
      wrapper.after(brAfter);

      // Mover cursor debajo de la imagen
      range.setStartAfter(brAfter);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.appendChild(wrapper);
      editor.appendChild(document.createElement("br"));
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
 document.addEventListener("DOMContentLoaded", () => {
  console.log("[blog.js] DOM listo");

  const publicarBtn = document.getElementById("publicarBtn");
  const editor = document.getElementById("editor");

  if (!publicarBtn) {
    console.warn("[blog.js] No se encontró #publicarBtn");
    return;
  }
  if (!editor) {
    console.warn("[blog.js] No se encontró #editor");
    // no hacemos return: quizá solo guardás contenido vacío, pero avisamos
  }

  publicarBtn.addEventListener("click", (e) => {
    // evita que un <form> haga submit y recargue la página
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    console.log("[blog.js] Click en Publicar detectado");

    const editorContent = editor ? editor.innerHTML : "";
    const articulo = {
      titulo: "",
      subtitulo: "",
      autor: "",
      fecha: new Date().toISOString().split("T")[0],
      contenidoHTML: editorContent
    };

    try {
      localStorage.setItem("miArticuloGuardado", JSON.stringify(articulo));
      console.log("[blog.js] Artículo guardado en localStorage:", articulo);
    } catch (err) {
      console.error("[blog.js] Error guardando en localStorage:", err);
    }

    // redirección final
    console.log("[blog.js] Redirigiendo a /admin/post");
    // usar location.assign para comportamiento más predecible
    window.location.assign("/admin/post");
  });
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
