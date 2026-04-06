const express = require('express');
const router = express.Router();

// Importamos las funciones del controlador
const { register, login, getMe } = require('../controllers/auth.controller');

// Importamos el middleware para proteger la ruta /me
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Rutas Públicas
 */

// POST /api/auth/register -> Para crear un nuevo usuario
router.post('/register', register);

// POST /api/auth/login -> Para obtener el token JWT
router.post('/login', login);

/**
 * Rutas Protegidas
 */

// GET /api/auth/me -> Devuelve los datos del usuario logueado
// Usamos "authenticate" para validar el token antes de dejar pasar la petición
router.get('/me', authenticate, getMe);

// IMPORTANTE: Exportamos el router directamente (sin llaves {})
module.exports = router;