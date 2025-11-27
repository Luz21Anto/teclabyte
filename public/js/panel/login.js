document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const errorMsg = document.getElementById("errorMsg");

  // 🔹 Función obligatoria para mostrar error de login
  function userMailError() {
    errorMsg.textContent = "Mail o contraseña incorrecta.";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    errorMsg.textContent = ""; // limpia errores previos

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // importante: permite recibir cookie HttpOnly
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        // ✅ Login exitoso: redirige al panel (index.html)
        window.location.href = "index.html";
      } else if (response.status === 401) {
        // ⚠️ Credenciales incorrectas
        userMailError();
      } else {
        // ⚠️ Otro error del servidor
        errorMsg.textContent = "Error en el servidor. Intentá nuevamente.";
      }
    } catch (err) {
      // 🚫 Si no se puede conectar con el servidor (por ejemplo no hay backend)
      errorMsg.textContent = "No se pudo conectar con el servidor.";
    }
  });
});
