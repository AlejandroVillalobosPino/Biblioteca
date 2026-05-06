// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export const protect = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(AppError.unauthorized('No has iniciado sesión. Por favor, envía un token.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_de_desarrollo_por_defecto');

        req.user = decoded;

        next();
    } catch (error) {
        return next(AppError.unauthorized('Token inválido o ha expirado.'));
    }
};