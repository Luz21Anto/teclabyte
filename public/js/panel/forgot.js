document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");
  const mensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) {
      mensaje.textContent = "Por favor ingresá un email válido.";
      mensaje.style.color = "red";
      return;
    }

    mensaje.textContent = "Enviando correo...";
    mensaje.style.color = "gray";

    try {
      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        showRecoverySuccess();
      } else {
        showRecoveryError();
      }
    } catch (error) {
      showRecoveryError();
    }
  });

  function showRecoverySuccess() {
    mensaje.textContent = "Si el correo existe, te enviamos un mail para recuperar tu contraseña. 📧";
    mensaje.style.color = "green";
  }

  function showRecoveryError() {
    mensaje.textContent = "Hubo un error. Volvé a intentarlo.";
    mensaje.style.color = "red";
  }
});
