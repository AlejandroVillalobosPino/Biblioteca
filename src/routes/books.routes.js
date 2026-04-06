const express = require('express');
const router = express.Router();

// FIJATE AQUÍ: Tienes que añadir updateBook y deleteBook dentro de las llaves
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/books.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllBooks);
router.get('/:id', getBookById);

router.post('/', authenticate, authorize(['LIBRARIAN', 'ADMIN']), createBook);
router.put('/:id', authenticate, authorize(['LIBRARIAN', 'ADMIN']), updateBook);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteBook);

module.exports = router;