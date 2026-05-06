import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3', // Especificación de OpenAPI
        info: {
            title: 'BildyApp API REST',
            version: '1.0.0',
            description: 'API para la gestión de albaranes, proyectos y clientes. Práctica Final de Node.js.',
            contact: {
                name: 'Tu Nombre'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor local de desarrollo'
            }
        ],
        components: {
            // Configuramos la autenticación por token JWT para poder probar las rutas desde Swagger
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        // Aplicamos la seguridad por defecto a todas las rutas
        security: [{ bearerAuth: [] }]
    },
    // Ruta donde Swagger buscará los comentarios JSDoc
    apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);