const express = require('express');
const router = express.Router();

// IMPORTANTE: Tienes que añadir getMyLoans aquí arriba
const { requestLoan, returnBook, getMyLoans } = require('../controllers/loans.controller');

const { authenticate } = require('../middleware/auth.middleware');

// Rutas
router.use(authenticate); // Todas requieren login
router.get('/', getMyLoans); // Esta es la que acabamos de crear
router.post('/', requestLoan);
router.put('/:id/return', returnBook);

module.exports = router;