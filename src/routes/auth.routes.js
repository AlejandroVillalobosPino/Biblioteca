import { Router } from 'express';

// Importamos las funciones del controlador (¡recuerda el .js al final!)
import { register, login, getMe } from '../controllers/auth.controller.js';

// Importamos el middleware para proteger la ruta /me
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

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

// Exportamos el router con el formato moderno
export default router;