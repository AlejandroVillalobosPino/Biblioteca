import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

export const createProject = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        if (!companyId) return next(AppError.badRequest('No tienes una compañía asignada'));

        const { client, name, projectCode, email, notes, active, address } = req.body;

        // 1. Verificar que el cliente existe y pertenece a la compañía
        const existingClient = await Client.findOne({ _id: client, company: companyId, deleted: false });
        if (!existingClient) return next(AppError.badRequest('El cliente no existe o no pertenece a tu compañía'));

        // 2. Verificar que el código de proyecto no esté duplicado en la compañía
        const existingProject = await Project.findOne({ projectCode, company: companyId });
        if (existingProject) {
            return next(AppError.badRequest('Ya existe un proyecto con este código en tu compañía', 'DUPLICATE_CODE'));
        }

        const newProject = await Project.create({
            user: req.user._id || req.user.id,
            company: companyId,
            client, name, projectCode, email, notes, active, address
        });

        // 3. Emitir evento WebSocket (T10)[cite: 4]
        const io = req.app.get('io');
        if (io) io.to(companyId.toString()).emit('project:new', newProject);

        res.status(201).json({ data: newProject });
    } catch (error) {
        next(error);
    }
};

export const getProjects = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { page = 1, limit = 10, name, client, active, sort = '-createdAt' } = req.query;

        const query = { company: companyId, deleted: false };

        // Filtros opcionales
        if (name) query.name = { $regex: name, $options: 'i' };
        if (client) query.client = client;
        if (active !== undefined) query.active = active === 'true';

        const skip = (Number(page) - 1) * Number(limit);

        const [projects, totalItems] = await Promise.all([
            Project.find(query)
                .populate('client', 'name cif') // Traemos info básica del cliente
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Project.countDocuments(query)
        ]);

        res.status(200).json({
            data: projects,
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

export const getProjectById = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const project = await Project.findOne({ _id: req.params.id, company: companyId, deleted: false })
            .populate('client', 'name cif email phone');

        if (!project) return next(AppError.notFound('Proyecto no encontrado'));

        res.status(200).json({ data: project });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;

        if (req.body.projectCode) {
            const duplicate = await Project.findOne({ projectCode: req.body.projectCode, company: companyId, _id: { $ne: req.params.id } });
            if (duplicate) return next(AppError.badRequest('El nuevo código de proyecto ya está en uso'));
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: companyId, deleted: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) return next(AppError.notFound('Proyecto no encontrado'));

        res.status(200).json({ data: project });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { soft } = req.query;

        const query = { _id: req.params.id, company: companyId };
        const project = await Project.findOne(query);

        if (!project) return next(AppError.notFound('Proyecto no encontrado'));

        if (soft === 'true') {
            project.deleted = true;
            project.active = false; // Al borrar lógicamente, también lo desactivamos
            await project.save();
        } else {
            await Project.deleteOne(query);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getArchivedProjects = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const archived = await Project.find({ company: companyId, deleted: true }).populate('client', 'name');

        res.status(200).json({ data: archived });
    } catch (error) {
        next(error);
    }
};

export const restoreProject = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: companyId, deleted: true },
            { deleted: false, active: true },
            { new: true }
        );

        if (!project) return next(AppError.notFound('Proyecto archivado no encontrado'));

        res.status(200).json({ data: project, message: 'Proyecto restaurado con éxito' });
    } catch (error) {
        next(error);
    }
};