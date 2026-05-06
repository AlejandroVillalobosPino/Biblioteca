import { Router } from 'express';
import clientRoutes from './client.routes.js'; //[cite: 8]
import projectRoutes from './project.routes.js'; //[cite: 8]
import deliveryNoteRoutes from './deliverynote.routes.js'; //[cite: 8]
import mongoose from 'mongoose';

const router = Router();

// Módulos de la Práctica Final[cite: 8]
router.use('/client', clientRoutes);
router.use('/project', projectRoutes);
router.use('/deliverynote', deliveryNoteRoutes);

router.get('/health', async (req, res) => {
    const healthcheck = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };

    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'error';
        res.status(503).json(healthcheck);
    }
});

export default router;