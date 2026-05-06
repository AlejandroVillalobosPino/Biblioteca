import { Router } from 'express';
// Importamos tus rutas de la biblioteca (verifica que los nombres de archivo sean estos)
import bookRoutes from './books.routes.js';
import loanRoutes from './loans.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/books', bookRoutes);
router.use('/loans', loanRoutes);
router.use('/auth', authRoutes);

router.get('/health', async (req, res) => {
    const healthcheck = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };

    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'error';
        res.status(503).json(healthcheck);
    }
});

export default router;