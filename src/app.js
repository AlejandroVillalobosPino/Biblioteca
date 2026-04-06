require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const loansRoutes = require('./routes/loans.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

console.log("DEPURACIÓN: ¿Cómo llegan las rutas?");
console.log("Auth:", typeof authRoutes);
console.log("Books:", typeof booksRoutes);
console.log("Loans:", typeof loansRoutes);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/books', reviewsRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});