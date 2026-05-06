import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

import indexRoutes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const httpServer = createServer(app); // Envolvemos Express en un servidor HTTP[cite: 7]

// === CONFIGURACIÓN DE SOCKET.IO ===
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

// Middleware de autenticación para WebSockets
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) return next(new Error('Autenticación denegada: Token no proporcionado'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Guardamos el usuario en el socket[cite: 7]
        next();
    } catch (error) {
        next(new Error('Token inválido o expirado'));
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado por WebSocket: ${socket.user.email}`);

    // Los eventos solo deben emitirse a los usuarios de la misma compañía
    const companyId = socket.user.companyID || socket.user.company;
    if (companyId) {
        socket.join(companyId.toString()); // Metemos al usuario en la "sala" de su empresa
        console.log(`Usuario unido a la sala (Company): ${companyId}`);
    }

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Hacer 'io' accesible desde los controladores[cite: 7]
app.set('io', io);
// ===================================

app.use(express.json());

// Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Archivo principal de rutas
app.use('/api', indexRoutes);

// Manejador centralizado de errores
app.use(errorHandler);

// Evitamos que listen() se ejecute al lanzar los tests con Jest
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Servidor HTTP y WebSockets corriendo en puerto ${PORT}`);
    });
}

export default app;