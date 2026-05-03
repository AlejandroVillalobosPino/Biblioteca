import { Router } from 'express';
import {
    createClient, getClients, getClientById,
    updateClient, deleteClient, getArchivedClients, restoreClient
} from '../controllers/client.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createClientValidator, updateClientValidator } from '../validators/client.validator.js';

const router = Router();

// Todas las rutas de clientes requieren estar autenticado
router.use(protect);

// IMPORTANTE: Las rutas estáticas (/archived) deben ir ANTES que las rutas con parámetros (/:id)
router.get('/archived', getArchivedClients);
router.patch('/:id/restore', restoreClient);

router.post('/', validate(createClientValidator), createClient);
router.get('/', getClients);
router.get('/:id', getClientById);
router.put('/:id', validate(updateClientValidator), updateClient);
router.delete('/:id', deleteClient);

export default router;