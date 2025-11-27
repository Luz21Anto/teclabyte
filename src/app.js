import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Necesario para poder usar __dirname en ESM (import/export)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public
// Ruta: raíz_del_proyecto/public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Servidor funcionando con archivos estáticos" });
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'panel', 'login.html'));
});

app.get('/admin/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'panel', 'register.html'));
});

app.get('/admin/forgot', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'panel', 'forgot.html'));
});

app.get("/admin/website", async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'panel', 'index.html'));
});

app.get("/admin/blog", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'panel', 'blog.html'));
});

app.get("/admin/post", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "panel", "post.html"));
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
