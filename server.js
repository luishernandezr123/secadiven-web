const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const MANIFEST_PATH = path.join(__dirname, 'content/data/galeria-manifest.json');
const UPLOAD_DIR = path.join(__dirname, 'assets/images/galeria');
const DB_PATH = path.join(__dirname, 'content/data/admin.db');

// Admin credentials (default: admin / secadiven2026)
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = bcrypt.hashSync('secadiven2026', 10);

// Ensure directories exist
[path.dirname(MANIFEST_PATH), UPLOAD_DIR, path.dirname(DB_PATH)].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Init manifest if not exists
if (!fs.existsSync(MANIFEST_PATH)) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ images: [] }, null, 2));
}

// Simple user store (in production, use DB)
let users = [{ username: DEFAULT_USER, password: DEFAULT_PASS }];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'galeria-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

// Auth middleware
function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ─── RUTAS ───

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username });
});

// Get gallery
app.get('/api/galeria', (req, res) => {
  const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  res.json(data);
});

// Upload image (auth required)
app.post('/api/galeria/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  
  const caption = req.body.caption || '';
  const src = '/assets/images/galeria/' + req.file.filename;
  
  const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  data.images.push({ src, caption });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2));
  
  res.json({ success: true, image: { src, caption } });
});

// Delete image (auth required)
app.delete('/api/galeria/:index', authMiddleware, (req, res) => {
  const index = parseInt(req.params.index);
  const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  
  if (isNaN(index) || index < 0 || index >= data.images.length) {
    return res.status(404).json({ error: 'Imagen no encontrada' });
  }
  
  const removed = data.images.splice(index, 1)[0];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2));
  
  // Try to delete the file
  const filePath = path.join(__dirname, removed.src);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  
  res.json({ success: true });
});

// Reorder images (auth required)
app.put('/api/galeria/reorder', authMiddleware, (req, res) => {
  const { images } = req.body;
  if (!Array.isArray(images)) return res.status(400).json({ error: 'Formato inválido' });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ images }, null, 2));
  res.json({ success: true });
});

// Check auth
app.get('/api/auth/check', authMiddleware, (req, res) => {
  res.json({ username: req.user.username });
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Admin API corriendo en puerto ' + PORT);
  console.log('📁 Imágenes: ' + UPLOAD_DIR);
  console.log('🔑 Usuario: ' + DEFAULT_USER);
});
