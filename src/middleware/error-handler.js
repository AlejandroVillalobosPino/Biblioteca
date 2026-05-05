import { AppError } from '../utils/AppError.js';
import { sendSlackNotification } from '../services/logger.service.js';

export const errorHandler = async (err, req, res, next) => {
    console.error('🔥 Error capturado:', err);

    let error = { ...err };
    error.message = err.message;

    // Errores conocidos (AppError) - Generan 4XX
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            errorCode: err.errorCode
        });
    }

    // Errores NO controlados (5XX) - Se envían a Slack[cite: 6]
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        // Ejecutamos la notificación de forma asíncrona sin bloquear la respuesta al usuario[cite: 6]
        sendSlackNotification({
            method: req.method,
            url: req.originalUrl,
            message: err.message || 'Error interno del servidor',
            stack: err.stack || 'No stack available'
        });
    }

    res.status(statusCode).json({
        status: 'error',
        message: 'Ocurrió un error en el servidor',
        ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
    });
};