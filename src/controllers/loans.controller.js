const prisma = require('../config/prisma');

const requestLoan = async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;

    try {
        // 1. Comprobar cuántos préstamos activos tiene el usuario
        const activeLoans = await prisma.loan.count({
            where: { userId, status: 'ACTIVE' }
        });

        if (activeLoans >= 3) {
            return res.status(400).json({ error: 'Límite de préstamos alcanzado (máximo 3).' });
        }

        // 2. Comprobar si ya tiene este libro prestado
        const existingLoan = await prisma.loan.findFirst({
            where: { userId, bookId, status: 'ACTIVE' }
        });

        if (existingLoan) {
            return res.status(400).json({ error: 'Ya tienes este libro en préstamo.' });
        }

        // 3. Comprobar disponibilidad del libro
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.available <= 0) {
            return res.status(400).json({ error: 'No hay ejemplares disponibles.' });
        }

        // 4. Crear préstamo y actualizar inventario (Transacción para asegurar consistencia)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 días de duración

        const [loan, updatedBook] = await prisma.$transaction([
            prisma.loan.create({
                data: { userId, bookId, dueDate }
            }),
            prisma.book.update({
                where: { id: bookId },
                data: { available: { decrement: 1 } } // available--
            })
        ]);

        res.status(201).json({ message: 'Préstamo realizado con éxito', loan });
    } catch (error) {
        res.status(500).json({ error: 'Error procesando el préstamo' });
    }
};

const returnBook = async (req, res) => {
    const loanId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        const loan = await prisma.loan.findFirst({
            where: { id: loanId, userId, status: 'ACTIVE' }
        });

        if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado o ya devuelto.' });

        // Actualizar estado del préstamo y aumentar disponibilidad del libro
        await prisma.$transaction([
            prisma.loan.update({
                where: { id: loanId },
                data: { status: 'RETURNED', returnDate: new Date() }
            }),
            prisma.book.update({
                where: { id: loan.bookId },
                data: { available: { increment: 1 } } // available++
            })
        ]);

        res.json({ message: 'Libro devuelto correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al devolver el libro.' });
    }
};

const getMyLoans = async (req, res) => {
    try {
        const loans = await prisma.loan.findMany({
            where: { userId: req.user.id },
            include: { book: true } // Para ver el título del libro también
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tus préstamos" });
    }
};

module.exports = { requestLoan, returnBook, getMyLoans };