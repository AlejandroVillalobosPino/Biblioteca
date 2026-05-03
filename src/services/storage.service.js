import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class StorageService {
    /**
     * Sube un buffer a Cloudinary usando streams[cite: 1]
     */
    async uploadBuffer(buffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: options.folder || 'bildyapp',
                    resource_type: options.resourceType || 'auto',
                    public_id: options.publicId,
                    ...options
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            const readableStream = Readable.from(buffer);
            readableStream.pipe(uploadStream);
        });
    }

    /**
     * Optimiza y sube la firma de un albarán[cite: 1]
     */
    async uploadSignature(buffer, deliveryNoteId) {
        const optimizedBuffer = await sharp(buffer)
            .resize(800, 400, { fit: 'inside', withoutEnlargement: true }) // Redimensionar[cite: 1]
            .webp({ quality: 80 })
            .toBuffer();

        // 2. Subir a Cloudinary
        const result = await this.uploadBuffer(optimizedBuffer, {
            folder: 'bildyapp/signatures',
            public_id: `sig_${deliveryNoteId}_${Date.now()}`
        });

        return result.secure_url;
    }

    /**
     * Sube el PDF generado[cite: 1]
     */
    async uploadPDF(buffer, deliveryNoteId) {
        const result = await this.uploadBuffer(buffer, {
            folder: 'bildyapp/pdfs',
            public_id: `pdf_${deliveryNoteId}_${Date.now()}`,
            resource_type: 'raw' // IMPORTANTE para PDFs en Cloudinary
        });

        return result.secure_url;
    }
}

export default new StorageService();