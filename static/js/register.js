document.getElementById("Siguiente").addEventListener("click", () => {
  const email = document.getElementById("input_email").value.trim();
  const confirmarEmail = document.getElementById("input_confirmar_email").value.trim();

  if (email === "" || confirmarEmail === "") {
    alert("Por favor completa ambos campos de email.");
    return;
  }

  if (email !== confirmarEmail) {
    alert("Los correos no coinciden. Verifícalos.");
    return;
  }

  // Mostrar paso_contraseña y ocultar paso_email
  document.getElementById("paso_email").style.display = "none";
  document.getElementById("paso_contraseña").style.display = "block";
});

// Validar envío final
document.getElementById("registro_email").addEventListener("submit", (e) => {
  e.preventDefault();

  const pass = document.getElementById("input_contraseña").value.trim();
  const confirmarPass = document.getElementById("input_confirmar_contraseña").value.trim();
  const acepto = document.getElementById("acepto").checked;

  if (pass === "" || confirmarPass === "") {
    alert("Completa ambos campos de contraseña.");
    return;
  }

  if (pass !== confirmarPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (!acepto) {
    alert("Debes aceptar los términos y condiciones.");
    return;
  }

  alert("✅ Registro completado correctamente.");
});