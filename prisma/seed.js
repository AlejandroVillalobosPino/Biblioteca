const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Encriptamos una contraseña genérica para los usuarios de prueba
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Crear usuario Administrador
    const admin = await prisma.user.upsert({
        where: { email: 'admin@biblioteca.com' },
        update: {},
        create: {
            email: 'admin@biblioteca.com',
            name: 'Admin Principal',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // 2. Crear usuario normal
    const user = await prisma.user.upsert({
        where: { email: 'lector@biblioteca.com' },
        update: {},
        create: {
            email: 'lector@biblioteca.com',
            name: 'Lector Frecuente',
            password: hashedPassword,
            role: 'USER',
        },
    });

    // 3. Crear algunos libros
    await prisma.book.createMany({
        data: [
            {
                isbn: '978-84-376-0494-7',
                title: 'Cien años de soledad',
                author: 'Gabriel García Márquez',
                genre: 'Realismo mágico',
                publishedYear: 1967,
                copies: 5,
                available: 5,
            },
            {
                isbn: '978-84-206-7420-9',
                title: '1984',
                author: 'George Orwell',
                genre: 'Ciencia Ficción',
                publishedYear: 1949,
                copies: 3,
                available: 3,
            }
        ],
        skipDuplicates: true, // Por si ejecutas el seed varias veces
    });

    console.log('Base de datos sembrada con éxito:', { admin: admin.email, user: user.email });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });