import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Pruebas de la API de Biblioteca', () => {

    // Antes de empezar los tests, interceptamos la llamada a la base de datos
    beforeAll(() => {
        jest.spyOn(prisma.book, 'findMany').mockResolvedValue([
            { id: 1, title: 'El Quijote', author: 'Cervantes', available: 5 },
            { id: 2, title: 'Cien años de soledad', author: 'García Márquez', available: 3 }
        ]);
    });

    // Al terminar, devolvemos Prisma a la normalidad
    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('GET /api/books', () => {
        it('Debería devolver un status 200 y una lista (array) de libros', async () => {
            const response = await request(app).get('/api/books');

            // Verificamos que responde con éxito (200 OK)
            expect(response.statusCode).toBe(200);

            // Verificamos que lo que devuelve es un Array
            expect(Array.isArray(response.body)).toBeTruthy();

            // Verificamos que nuestra base de datos falsa funcionó
            expect(response.body.length).toBe(2);
            expect(response.body[0].title).toBe('El Quijote');
        });
    });

    describe('Rutas inexistentes', () => {
        it('Debería devolver 404 al intentar acceder a una ruta que no existe', async () => {
            const response = await request(app).get('/api/ruta-inventada-que-no-existe');
            expect(response.statusCode).toBe(404);
        });
    });
});