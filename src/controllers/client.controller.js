import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

// Crear un cliente[cite: 6]
export const createClient = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        if (!companyId) return next(AppError.badRequest('No tienes una compañía asignada'));

        const { name, cif, email, phone, address } = req.body;

        // Verificar si el CIF ya existe en esta compañía[cite: 6]
        const existingClient = await Client.findOne({ cif, company: companyId });
        if (existingClient) {
            return next(AppError.badRequest('Ya existe un cliente con este CIF en tu compañía', 'DUPLICATE_CIF'));
        }

        const newClient = await Client.create({
            user: req.user._id || req.user.id,
            company: companyId,
            name, cif, email, phone, address
        });

        // T10: Notificación en tiempo real a los miembros de la compañía[cite: 4, 6]
        const io = req.app.get('io');
        if (io) {
            io.to(companyId.toString()).emit('client:new', newClient);
        }

        res.status(201).json({ data: newClient });
    } catch (error) {
        next(error);
    }
};

// Listar clientes con paginación y filtros[cite: 6]
export const getClients = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { page = 1, limit = 10, name, sort = '-createdAt' } = req.query;

        // Query base: Solo los clientes de tu empresa que no estén borrados[cite: 6]
        const query = { company: companyId, deleted: false };

        // Filtro por nombre (búsqueda parcial insensible a mayúsculas)[cite: 6]
        if (name) query.name = { $regex: name, $options: 'i' };

        const skip = (Number(page) - 1) * Number(limit);

        const [clients, totalItems] = await Promise.all([
            Client.find(query).sort(sort).skip(skip).limit(Number(limit)),
            Client.countDocuments(query)
        ]);

        res.status(200).json({
            data: clients,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / Number(limit)),
                currentPage: Number(page)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Obtener un cliente concreto[cite: 6]
export const getClientById = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const client = await Client.findOne({ _id: req.params.id, company: companyId, deleted: false });

        if (!client) return next(AppError.notFound('Cliente no encontrado'));

        res.status(200).json({ data: client });
    } catch (error) {
        next(error);
    }
};

// Actualizar un cliente[cite: 6]
export const updateClient = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;

        // Si intenta cambiar el CIF, verificar que no choque con otro[cite: 6]
        if (req.body.cif) {
            const duplicate = await Client.findOne({ cif: req.body.cif, company: companyId, _id: { $ne: req.params.id } });
            if (duplicate) return next(AppError.badRequest('El nuevo CIF ya está en uso por otro cliente'));
        }

        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, company: companyId, deleted: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!client) return next(AppError.notFound('Cliente no encontrado'));

        res.status(200).json({ data: client });
    } catch (error) {
        next(error);
    }
};

// Eliminar (Hard / Soft Delete)[cite: 6]
export const deleteClient = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { soft } = req.query;

        const query = { _id: req.params.id, company: companyId };
        const client = await Client.findOne(query);

        if (!client) return next(AppError.notFound('Cliente no encontrado'));

        if (soft === 'true') {
            // Borrado lógico[cite: 6]
            client.deleted = true;
            await client.save();
        } else {
            // Borrado físico[cite: 6]
            await Client.deleteOne(query);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Listar clientes archivados (borrado lógico)[cite: 6]
export const getArchivedClients = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const archivedClients = await Client.find({ company: companyId, deleted: true });

        res.status(200).json({ data: archivedClients });
    } catch (error) {
        next(error);
    }
};

// Restaurar cliente archivado[cite: 6]
export const restoreClient = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, company: companyId, deleted: true },
            { deleted: false },
            { new: true }
        );

        if (!client) return next(AppError.notFound('Cliente archivado no encontrado'));

        res.status(200).json({ data: client, message: 'Cliente restaurado con éxito' });
    } catch (error) {
        next(error);
    }
};