document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
});

async function verificarSesion() {
    try {
        const res = await fetch("/api/user/me", {
            method: "GET",
            credentials: "include"
        });

        if (res.status === 200) {
            const data = await res.json();
            renderUserPanel(data);
        } else if (res.status === 401) {
            redirectToLogin();
        } else {
            showPanelLoadError();
        }
    } catch (err) {
        console.error("Error verificando sesión:", err);
        showPanelLoadError();
    }
}

function renderUserPanel(data) {
    const userInfo = document.getElementById("user-info");
    userInfo.innerHTML = `
        <h2>Bienvenido, ${data.user.name}</h2>
        <p><strong>Email:</strong> ${data.user.email}</p>
        <p><strong>Notificaciones:</strong> ${data.user.notifications}</p>
    `;
}

function redirectToLogin() {
    window.location.href = "/login";
}

function showPanelLoadError() {
    const panel = document.getElementById("panel-container");
    panel.innerHTML = `<p style="color:red;">No se pudo cargar la información del usuario.</p>`;
}
