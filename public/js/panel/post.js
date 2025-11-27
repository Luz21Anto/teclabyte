document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("miArticuloGuardado");
  if (!saved) return;

  try {
    const articulo = JSON.parse(saved);
    document.getElementById("titulo").textContent = articulo.titulo;
    document.getElementById("subtitulo").textContent = articulo.subtitulo;
    document.querySelector(".contenido").innerHTML = articulo.contenidoHTML;
    document.getElementById("link").href = articulo.link || "#";
  } catch (e) {
    console.error("Error al leer el artículo:", e);
  }
});

