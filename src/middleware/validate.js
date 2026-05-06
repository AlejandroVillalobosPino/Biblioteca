export const validate = (schema) => (req, res, next) => {
    try {
        // Zod comprueba el cuerpo de la petición
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        // Si falla, sacamos los errores de Zod y los devolvemos al cliente
        return res.status(400).json({
            status: 'error',
            message: 'Error de validación de datos',
            errors: error.errors.map(err => ({
                campo: err.path.join('.'),
                mensaje: err.message
            }))
        });
    }
};