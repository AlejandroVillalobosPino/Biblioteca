import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Usamos almacenamiento en memoria para procesar con Sharp antes de subir a Cloudinary[cite: 1]
const memoryStorage = multer.memoryStorage();

// Filtro estricto para aceptar solo imágenes de firmas[cite: 1]
const signatureFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(AppError.badRequest('Formato de imagen no válido. Usa JPG, PNG o WebP.'));
    }
};

// Exportamos el middleware configurado
export const uploadSignatureMiddleware = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: signatureFilter
});