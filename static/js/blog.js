document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const menuItems = document.querySelectorAll(".editor-sidebar li, .color-picker, .submenu button");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".editor-sidebar");

  let savedSelection = null;

  // 🟢 Guarda la selección activa
  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0);
  }

  // 🟢 Restaura la selección guardada
  function restoreSelection() {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  }

  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("mouseup", saveSelection);

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

  function applyFormat(button, command) {
    button.addEventListener("mousedown", e => {
      e.preventDefault();
      restoreSelection();
      document.execCommand(command, false, null);
      saveSelection();
      editor.focus();
    });
  }

  applyFormat(boldBtn, "bold");
  applyFormat(italicBtn, "italic");

  // -------------------- SUBMENÚ DE FUENTES --------------------
  const fontTool = document.querySelector(".tool-font");
  const fontItems = document.querySelectorAll(".font-submenu li");

  // Mostrar submenú al pasar el mouse
  fontTool.addEventListener("mouseenter", () => fontTool.classList.add("show"));
  fontTool.addEventListener("mouseleave", () => fontTool.classList.remove("show"));

  let currentFont = "'Nunito', sans-serif";

  fontItems.forEach(item => {
    item.addEventListener("mousedown", e => {
      e.preventDefault();
      e.stopPropagation();

      // Marcar como activa
      fontItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const font = item.getAttribute("data-font");
      currentFont = font;
      restoreSelection();

      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.fontFamily = font;
        range.surroundContents(span);
      } else {
        const placeholder = document.createElement("span");
        placeholder.style.fontFamily = font;
        placeholder.appendChild(document.createTextNode("\u200B"));
        range.insertNode(placeholder);
        const newRange = document.createRange();
        newRange.setStart(placeholder.firstChild, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      saveSelection();
      editor.focus();
    });
  });

  // Aplicar automáticamente la fuente activa al escribir
  editor.addEventListener("beforeinput", e => {
    restoreSelection();
  });

  editor.addEventListener("input", () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer.parentElement;
    if (node && node === editor) {
      const span = document.createElement("span");
      span.style.fontFamily = currentFont;
      range.surroundContents(span);
    }
    saveSelection();
  });

  // -------------------- COLOR --------------------
  const colorPicker = document.querySelector(".color-picker");
  if (colorPicker) {
    colorPicker.addEventListener("input", e => {
      restoreSelection();
      document.execCommand("foreColor", false, e.target.value);
      saveSelection();
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
      document.execCommand("formatBlock", false, tag);
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

  imageTool.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      restoreSelection();

      const wrapper = document.createElement("div");
      wrapper.classList.add("image-wrapper");
      wrapper.style.position = "relative";

      const img = document.createElement("img");
      img.src = ev.target.result;
      img.alt = "Imagen insertada";
      img.style.width = "100%";
      img.style.height = "auto";

      const handle = document.createElement("div");
      handle.classList.add("resize-handle");

      wrapper.appendChild(img);
      wrapper.appendChild(handle);

      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(wrapper);
        range.setStartAfter(wrapper);
        range.setEndAfter(wrapper);
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
