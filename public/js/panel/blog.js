// ======================================================
//  BLOG EDITOR – VERSIÓN UNIFICADA Y ESTABLE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const editor = document.getElementById("editor");

  // ======================================================  
// 0) SISTEMA REPARADO DE SUBMENÚS (ABREN/CERRAN POR CLICK)  
// ======================================================

const submenuTools = document.querySelectorAll(".tool-aa, .tool-font");

submenuTools.forEach(tool => {
  tool.addEventListener("click", (e) => {
    e.stopPropagation(); // evita cierre inmediato

    // Cerrar otros submenús
    submenuTools.forEach(t => {
      if (t !== tool) t.classList.remove("show");
    });

    // Mostrar/ocultar solo el actual
    tool.classList.toggle("show");
  });
});

// Cerrar submenús al clickear fuera
document.addEventListener("click", () => {
  submenuTools.forEach(tool => tool.classList.remove("show"));
});


  // ======================================================
  // 1) SISTEMA ÚNICO DE SELECCIÓN (el más importante)
  // ======================================================

  let savedSelection = null;

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.cloneRange());
    }
  }

  // guardar selección siempre que el usuario seleccione
  editor.addEventListener("mouseup", saveSelection);
  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("click", saveSelection);
    
  // Manejar Backspace/Delete para limpiar spans vacíos/residuos raros
    editor.addEventListener("keydown", (e) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const sel = window.getSelection();
      if (!sel.rangeCount) return;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return; // solo cuando caret está colapsado

      // Si el caret está al inicio de un textNode y el nodo anterior es un span vacío -> eliminarlo y ajustar caret.
      const node = range.startContainer;
      let offset = range.startOffset;

      // Si estamos en un text node y offset === 0 => mirar el nodo anterior
      if (node.nodeType === Node.TEXT_NODE && offset === 0) {
        const prev = node.previousSibling;
        if (prev && prev.nodeType === Node.ELEMENT_NODE && prev.tagName === "SPAN") {
          // Si el span está vacío o solo tiene caracteres invisibles, lo eliminamos
          const text = prev.textContent || "";
          if (text.trim() === "" || text === "\u200B") {
            e.preventDefault();
            const parent = prev.parentNode;
            parent.removeChild(prev);

            // Ajustar selección: ponemos caret al comienzo del node actual
            const newRange = document.createRange();
            newRange.setStart(node, 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);

            saveSelection();
          }
        }
      }

      // Si estamos en un element y offset === 0 -> revisar child previo similarmente
      if (node.nodeType === Node.ELEMENT_NODE && offset === 0) {
        const childBefore = node.childNodes[offset - 1];
        // no hacemos nada sofisticado aquí; la limpieza principal viene del uso de fontName
      }
    });

  // ======================================================
// 2) NEGRITA / CURSIVA
// ======================================================

const boldBtn = document.querySelector(".format-bold");
const italicBtn = document.querySelector(".format-italic");

if (boldBtn) {
  boldBtn.addEventListener("click", () => {
    restoreSelection();       // restauramos selección previa
    document.execCommand("bold");  // aplicamos estilo
    editor.focus();
    saveSelection();          // 🔥 guardamos selección final y limpia
    updateButtonStates();     // actualizamos UI
  });
}

if (italicBtn) {
  italicBtn.addEventListener("click", () => {
    restoreSelection();
    document.execCommand("italic");
    editor.focus();
    saveSelection();          // 🔥 mismo ajuste acá
    updateButtonStates();
  });
}

function updateButtonStates() {
  if (boldBtn)
    boldBtn.classList.toggle("active", document.queryCommandState("bold"));

  if (italicBtn)
    italicBtn.classList.toggle("active", document.queryCommandState("italic"));
}

editor.addEventListener("mouseup", updateButtonStates);
editor.addEventListener("keyup", updateButtonStates);



  // ======================================================
// 3) CAMBIO DE FUENTE (mejorado usando execCommand 'fontName')
// ======================================================

const fontTool = document.querySelector(".tool-font");
const fontItems = document.querySelectorAll(".font-submenu li");
let currentFont = "";

fontItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    fontItems.forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");

    currentFont = item.dataset.font;

    restoreSelection();

    // Usamos execCommand fontName: aplica la fuente al selection y a lo que escribas luego.
    // Nota: nombre de fuente tal como espera el navegador (ej: "Arial", "Times New Roman")
    try {
      document.execCommand("fontName", false, currentFont);
    } catch (err) {
      // Fallback: envolver en span (por si algún navegador no lo soporta)
      applyFontToSelectionFallback(currentFont);
    }

    editor.focus();
    saveSelection();
  });
});

function applyFontToSelectionFallback(font) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!sel.isCollapsed) {
    const span = document.createElement("span");
    span.style.fontFamily = font;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

  // ======================================================
  // 4) COLOR DE TEXTO
  // ======================================================

  const colorPicker = document.querySelector(".color-picker");

  if (colorPicker) {
    colorPicker.addEventListener("input", e => {
      const color = e.target.value;

      restoreSelection();
      document.execCommand("foreColor", false, color);
      editor.focus();
      saveSelection();
    });

  }

  // Permitir que el input color abra el picker sin perder selección
    const colorText = document.querySelector(".tool-color span");
    if (colorText) {
      colorText.addEventListener("mousedown", e => {
        saveSelection();   // guardamos antes de que el picker abra
        e.preventDefault(); // evita perder la selección
      });
    }

  // ======================================================
  // 5) LINKS
  // ======================================================

  const linkTool = document.querySelector(".tool-link");

  if (linkTool) {
    linkTool.addEventListener("click", () => {
      restoreSelection();

      const sel = window.getSelection();
      if (sel.isCollapsed) {
        alert("Seleccioná un texto para agregar un enlace.");
        return;
      }

      const url = prompt("Ingresá la URL del enlace:");
      if (!url) return;

      document.execCommand("createLink", false, url);
      saveSelection();
    });

    // abrir enlace al hacer clic
    editor.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        window.open(e.target.href, "_blank");
      }
    });
  }



  // ======================================================
  // 6) ENCABEZADOS (H1–H5)
  // ======================================================

  const headingButtons = [
    { selector: ".tool-title", tag: "h1" },
    { selector: ".tool-subtitle", tag: "h2" },
    { selector: ".tool-encabezado3", tag: "h3" },
    { selector: ".tool-encabezado4", tag: "h4" },
    { selector: ".tool-encabezado5", tag: "h5" }
  ];

  headingButtons.forEach(({ selector, tag }) => {
    const btn = document.querySelector(selector);
    if (!btn) return;

    btn.addEventListener("click", e => {
      e.preventDefault();
      restoreSelection();
      document.execCommand("formatBlock", false, `<${tag}>`);
      saveSelection();
    });
  });



  // ======================================================
  // 7) INSERTAR IMAGEN
  // ======================================================

  const imageTool = document.querySelector(".tool-image");
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.style.display = "none";
  document.body.appendChild(imageInput);

  if (imageTool) {
    imageTool.addEventListener("click", () => {
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

      const img = document.createElement("img");
      img.src = ev.target.result;
      img.style.maxWidth = "100%";

      document.execCommand("insertHTML", false, `<img src="${img.src}" style="max-width:100%;">`);

      saveSelection();
    };
    reader.readAsDataURL(file);
  });



  // ======================================================
  // 8) PEGAR COMO TEXTO PLANO
  // ======================================================

  editor.addEventListener("paste", e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  });



  // ======================================================
  // 9) SI EL EDITOR QUEDA VACÍO
  // ======================================================

  editor.addEventListener("input", () => {
    if (editor.innerHTML.trim() === "" || editor.innerHTML === "<br>") {
      editor.innerHTML = "<p><br></p>";
    }
  });



  // ======================================================
  // 10) PUBLICAR – GUARDAR EN LOCALSTORAGE
  // ======================================================

  const publicarBtn = document.getElementById("publicarBtn");

  if (publicarBtn) {
    publicarBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const articulo = {
        titulo: "",
        subtitulo: "",
        autor: "",
        fecha: new Date().toISOString().split("T")[0],
        contenidoHTML: editor.innerHTML
      };

      localStorage.setItem("miArticuloGuardado", JSON.stringify(articulo));
      window.location.assign("/admin/post");
    });
  }

});
