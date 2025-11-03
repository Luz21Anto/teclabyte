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
