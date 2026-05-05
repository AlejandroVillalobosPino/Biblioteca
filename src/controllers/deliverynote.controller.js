import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import storageService from '../services/storage.service.js';
import pdfService from '../services/pdf.service.js';
import { AppError } from '../utils/AppError.js';

// Crear un albarán
export const createDeliveryNote = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        if (!companyId) return next(AppError.badRequest('No tienes una compañía asignada'));

        const { project, format, description, workDate, material, quantity, unit, hours, workers } = req.body;

        const existingProject = await Project.findOne({ _id: project, company: companyId, deleted: false });
        if (!existingProject) {
            return next(AppError.notFound('El proyecto no existe o no pertenece a tu compañía'));
        }

        const newDeliveryNote = await DeliveryNote.create({
            user: req.user._id || req.user.id,
            company: companyId,
            client: existingProject.client, // Lo sacamos automáticamente del proyecto
            project, format, description, workDate, material, quantity, unit, hours, workers
        });

        const io = req.app.get('io');
        if (io) io.to(companyId.toString()).emit('deliverynote:new', newDeliveryNote);

        res.status(201).json({ data: newDeliveryNote });
    } catch (error) {
        next(error);
    }
};

export const getDeliveryNotes = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { page = 1, limit = 10, project, client, format, signed, from, to, sort = '-workDate' } = req.query;

        const query = { company: companyId, deleted: false };

        // Aplicar filtros
        if (project) query.project = project;
        if (client) query.client = client;
        if (format) query.format = format;
        if (signed !== undefined) query.signed = signed === 'true';

        // Filtro de rango de fechas
        if (from || to) {
            query.workDate = {};
            if (from) query.workDate.$gte = new Date(from);
            if (to) query.workDate.$lte = new Date(to);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [deliveryNotes, totalItems] = await Promise.all([
            DeliveryNote.find(query)
                .populate('user', 'name lastName email')
                .populate('client', 'name cif')
                .populate('project', 'name projectCode')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            DeliveryNote.countDocuments(query)
        ]);

        res.status(200).json({
            data: deliveryNotes,
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

// Obtener un albarán concreto
export const getDeliveryNoteById = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company: companyId, deleted: false })
            .populate('user', 'name lastName email')
            .populate('client', 'name cif address')
            .populate('project', 'name projectCode address');

        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));

        res.status(200).json({ data: deliveryNote });
    } catch (error) {
        next(error);
    }
};

// Eliminar un albarán
export const deleteDeliveryNote = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const { soft } = req.query;

        const query = { _id: req.params.id, company: companyId };
        const deliveryNote = await DeliveryNote.findOne(query);

        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));

        if (deliveryNote.signed) {
            return next(AppError.badRequest('No se puede eliminar un albarán que ya ha sido firmado'));
        }

        if (soft === 'true') {
            deliveryNote.deleted = true;
            await deliveryNote.save();
        } else {
            await DeliveryNote.deleteOne(query);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const signDeliveryNote = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const deliveryNoteId = req.params.id;

        // 1. Verificar si Multer ha capturado la imagen de la firma
        if (!req.file) {
            return next(AppError.badRequest('La imagen de la firma es obligatoria'));
        }

        // 2. Buscar albarán y hacer populate para tener los datos completos para el PDF
        const deliveryNote = await DeliveryNote.findOne({ _id: deliveryNoteId, company: companyId, deleted: false })
            .populate('client', 'name cif')
            .populate('project', 'name projectCode')
            .populate('company', 'name'); // Necesitamos el nombre de la empresa para el PDF

        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));

        // REGLA: Un albarán firmado no se puede volver a firmar
        if (deliveryNote.signed) return next(AppError.badRequest('Este albarán ya ha sido firmado'));

        // 3. Subir firma a Cloudinary (ya optimizada por Sharp en el servicio)
        const signatureUrl = await storageService.uploadSignature(req.file.buffer, deliveryNoteId);

        // 4. Actualizar datos en memoria para generar el PDF correctamente
        deliveryNote.signed = true;
        deliveryNote.signedAt = new Date();
        deliveryNote.signatureUrl = signatureUrl;

        // 5. Generar PDF con los datos y la firma[cite: 1]
        const pdfBuffer = await pdfService.generateDeliveryNotePDF(deliveryNote);

        // 6. Subir PDF a Cloudinary[cite: 1]
        const pdfUrl = await storageService.uploadPDF(pdfBuffer, deliveryNoteId);

        // 7. Guardar todo en la base de datos
        deliveryNote.pdfUrl = pdfUrl;
        await deliveryNote.save();

        // 8. Emitir evento WebSocket (T10)[cite: 4]
        const io = req.app.get('io');
        if (io) io.to(companyId.toString()).emit('deliverynote:signed', deliveryNote);

        res.status(200).json({
            message: 'Albarán firmado y PDF generado correctamente',
            data: deliveryNote
        });
    } catch (error) {
        next(error);
    }
};

export const downloadPDF = async (req, res, next) => {
    try {
        const companyId = req.user.companyID || req.user.company;
        const deliveryNoteId = req.params.id;

        const deliveryNote = await DeliveryNote.findOne({ _id: deliveryNoteId, company: companyId, deleted: false })
            .populate('client', 'name cif')
            .populate('project', 'name projectCode')
            .populate('company', 'name');

        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));

        // REGLA: Si está firmado y tiene PDF en la nube, redirigir allí directamente[cite: 1]
        if (deliveryNote.signed && deliveryNote.pdfUrl) {
            return res.redirect(deliveryNote.pdfUrl);
        }

        // Si NO está firmado, generamos un PDF "al vuelo" a modo de borrador/vista previa[cite: 1]
        const pdfBuffer = await pdfService.generateDeliveryNotePDF(deliveryNote);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="borrador_albaran_${deliveryNoteId}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};