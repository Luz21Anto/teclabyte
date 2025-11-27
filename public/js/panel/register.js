document.getElementById("siguiente1").addEventListener("click", () => {
  const nombre = document.getElementById("input_nombre").value.trim();
  const apellido = document.getElementById("input_apellido").value.trim();

  if (nombre === "" || apellido === "") {
    alert("Por favor completa con tu nombre y apellido");
    return;
  }

  // Mostrar paso_email y ocultar paso_nombre
  document.getElementById("paso_nombre").style.display = "none";
  document.getElementById("paso_email").style.display = "block";
});

document.getElementById("siguiente2").addEventListener("click", () => {
  const email = document.getElementById("input_email").value.trim();
  const confirmar_email = document.getElementById("input_confirmar_email").value.trim();

  if (email === "" || confirmar_email === "") {
    alert("Por favor completa ambos campos de email");
    return;
  }
  else if (email !== confirmar_email) {
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