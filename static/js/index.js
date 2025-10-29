function toggleSubmenu() {
    document.getElementById('submenu-plugins').classList.toggle('active');
}

function mostrarPlugin(id) {
    // Oculta columnas izquierda y derecha
    document.querySelector('.left-column').style.display = 'none';
    document.querySelector('.right-column').style.display = 'none';

    // Muestra plugin
    const plugin = document.getElementById(id);
    if(plugin) plugin.style.display = 'block';
}

function cerrarPlugin(id) {
    // Oculta plugin
    const plugin = document.getElementById(id);
    if(plugin) plugin.style.display = 'none';

    // Vuelve a mostrar columnas
    document.querySelector('.left-column').style.display = 'block';
    document.querySelector('.right-column').style.display = 'block';
}

// Asignar click a los items del submenu
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#submenu-plugins li').forEach(li => {
    li.addEventListener('click', () => {
        const pluginId = li.dataset.plugin;
        mostrarPlugin(pluginId);
    });
    });
});