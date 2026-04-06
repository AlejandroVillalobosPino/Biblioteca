const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Errores específicos de Prisma
    if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Ya existe un registro con ese valor único.' });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'El registro no existe.' });
    }

    res.status(500).json({ error: 'Algo salió mal en el servidor.' });
};

module.exports = errorHandler;