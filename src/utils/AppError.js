export class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        // Si el error empieza por 4 (ej. 400, 404), es un 'fail' del cliente. Si no, es un 'error' del servidor.
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    // Métodos estáticos para crear errores comunes rápidamente
    static badRequest(message, errorCode = 'BAD_REQUEST') {
        return new AppError(message, 400, errorCode);
    }

    static unauthorized(message = 'No autorizado', errorCode = 'UNAUTHORIZED') {
        return new AppError(message, 401, errorCode);
    }

    static forbidden(message = 'Acceso denegado', errorCode = 'FORBIDDEN') {
        return new AppError(message, 403, errorCode);
    }

    static notFound(message = 'Recurso no encontrado', errorCode = 'NOT_FOUND') {
        return new AppError(message, 404, errorCode);
    }

    static conflict(message, errorCode = 'CONFLICT') {
        return new AppError(message, 409, errorCode);
    }
}