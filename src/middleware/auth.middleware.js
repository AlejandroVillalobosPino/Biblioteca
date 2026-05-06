import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'No has iniciado sesión. Por favor, envía un token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_por_defecto');

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o ha expirado.' });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        // Verificamos si el usuario existe y si su rol está dentro de los permitidos
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acceso denegado. No tienes permisos para realizar esta acción.'
            });
        }
        next();
    };
};