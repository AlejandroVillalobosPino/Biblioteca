const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para REGISTRAR usuario
const register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        });
        res.status(201).json({ message: 'Usuario registrado', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar' });
    }
};

// Función para LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};

// Función para PERFIL
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

// --- ¡ESTO ES LO MÁS IMPORTANTE! ---
module.exports = { register, login, getMe };