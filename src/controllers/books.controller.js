const prisma = require('../config/prisma');

const getAllBooks = async (req, res) => {
    const books = await prisma.book.findMany();
    res.json(books);
};

const getBookById = async (req, res) => {
    const book = await prisma.book.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
};

const createBook = async (req, res) => {
    const newBook = await prisma.book.create({ data: req.body });
    res.status(201).json(newBook);
};

const updateBook = async (req, res) => {
    const book = await prisma.book.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(book);
};

const deleteBook = async (req, res) => {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
};

// IMPORTANTE: Exporta las 5 funciones
module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};