import prisma from '../config/prisma.js';

export const getAllBooks = async (req, res) => {
    const books = await prisma.book.findMany();
    res.json(books);
};

export const getBookById = async (req, res) => {
    const book = await prisma.book.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
};

export const createBook = async (req, res) => {
    const newBook = await prisma.book.create({ data: req.body });
    res.status(201).json(newBook);
};

export const updateBook = async (req, res) => {
    const book = await prisma.book.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(book);
};

export const deleteBook = async (req, res) => {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
};