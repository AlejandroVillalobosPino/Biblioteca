const prisma = require('../config/prisma');

const createReview = async (req, res) => {
    // Sacamos el ID del libro de la URL y los datos del cuerpo
    const bookId = parseInt(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user.id;

    try {
        // 1. Validar que el rating sea un número
        const numericRating = parseInt(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: "Rating debe ser un número entre 1 y 5" });
        }

        // 2. Verificar que el libro existe y ha sido devuelto por este usuario
        const hasReturned = await prisma.loan.findFirst({
            where: {
                userId: userId,
                bookId: bookId,
                status: 'RETURNED'
            }
        });

        if (!hasReturned) {
            return res.status(403).json({ error: "Solo puedes reseñar libros que hayas devuelto" });
        }

        // 3. Crear la reseña
        const review = await prisma.review.create({
            data: {
                rating: numericRating,
                comment: comment,
                userId: userId,
                bookId: bookId
            }
        });

        res.status(201).json(review);
    } catch (error) {
        // Esto nos dirá en la terminal de WebStorm qué está pasando exactamente
        console.error("ERROR EN REVIEWS:", error);

        // Si el error es P2002, es que ya existe una reseña de este usuario para este libro
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Ya has reseñado este libro" });
        }

        res.status(500).json({ error: "Error al crear reseña" });
    }
};

const getBookReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { bookId: parseInt(req.params.id) },
            include: { user: { select: { name: true } } }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
};

module.exports = { createReview, getBookReviews };