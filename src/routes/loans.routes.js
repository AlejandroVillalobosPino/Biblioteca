import { Router } from 'express';
import { requestLoan, returnBook, getMyLoans } from '../controllers/loans.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas
router.use(authenticate); // Todas requieren login
router.get('/', getMyLoans);
router.post('/', requestLoan);
router.put('/:id/return', returnBook);

export default router;