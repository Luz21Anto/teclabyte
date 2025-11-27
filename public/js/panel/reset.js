document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-form");
  const mensaje = document.getElementById("mensaje");

  // 1️⃣ Obtener el token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    mensaje.textContent = "Falta el token. Volvé a la página de recuperación.";
    mensaje.style.color = "red";
    form.style.display = "none";
    const link = document.createElement("a");
    link.href = "recuperar.html";
    link.textContent = "Ir a recuperar contraseña";
    mensaje.appendChild(document.createElement("br"));
    mensaje.appendChild(link);
    return;
  }

  // 2️⃣ Escuchar el envío del formulario
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm").value.trim();

    // 3️⃣ Validar coincidencia
    if (password !== confirm) {
      mensaje.textContent = "Las contraseñas no coinciden.";
      mensaje.style.color = "red";
      return;
    }

    mensaje.textContent = "Actualizando contraseña...";
    mensaje.style.color = "gray";

    try {
      // 4️⃣ Llamada al backend
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      // 5️⃣ Manejar respuestas
      if (response.ok) {
        showResetSuccess();
      } else if (response.status === 400 || response.status === 401) {
        showResetErrorInvalid();
      } else {
        showResetErrorServer();
      }
    } catch {
      showResetErrorServer();
    }
  });

  // 🔹 Funciones requeridas
  function showResetSuccess() {
    mensaje.innerHTML = "Tu contraseña fue actualizada correctamente. <br><a href='login.html'>Ir al login</a>";
    mensaje.style.color = "green";
    form.style.display = "none";
  }

  function showResetErrorInvalid() {
    mensaje.innerHTML = "El enlace para recuperar tu contraseña no es válido o expiró. <br><a href='recuperar.html'>Volver a recuperar</a>";
    mensaje.style.color = "red";
    form.style.display = "none";
  }

  function showResetErrorServer() {
    mensaje.textContent = "Error inesperado. Por favor intentá nuevamente.";
    mensaje.style.color = "red";
  }
});
