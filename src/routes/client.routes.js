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
/**
 * @openapi
 * /api/client:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar todos los clientes
 *     description: Obtiene una lista paginada de todos los clientes de la compañía del usuario autenticado.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida con éxito
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 */
router.get('/', getClients);
router.get('/', getClients);
router.get('/:id', getClientById);
router.put('/:id', validate(updateClientValidator), updateClient);
router.delete('/:id', deleteClient);

export default router;