import mongoose from 'mongoose';

// Subesquema para trabajadores (solo usado si format === 'hours')[cite: 1]
const workerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0.1 }
}, { _id: false }); // _id false para que Mongoose no cree un ObjectId por cada trabajador en el array

const deliveryNoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    format: {
        type: String,
        enum: ['material', 'hours'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    workDate: {
        type: Date,
        required: true
    },

    // Campos específicos para format: 'material'
    material: { type: String, trim: true },
    quantity: { type: Number, min: 0 },
    unit: { type: String, trim: true },

    // Campos específicos para format: 'hours'
    hours: { type: Number, min: 0 },
    workers: [workerSchema],

    // Proceso de Firma (Fase 3)[cite: 1]
    signed: { type: Boolean, default: false },
    signedAt: { type: Date },
    signatureUrl: { type: String }, // Cloudinary o R2[cite: 1]
    pdfUrl: { type: String },       // Cloudinary o R2[cite: 1]

    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Validación a nivel de esquema (Custom validation)
deliveryNoteSchema.pre('save', function(next) {
    if (this.format === 'material') {
        if (!this.material || !this.quantity || !this.unit) {
            return next(new Error("Para albaranes de 'material', los campos 'material', 'quantity' y 'unit' son obligatorios."));
        }
    } else if (this.format === 'hours') {
        // Se requiere 'hours', o un array de 'workers' válido
        if (!this.hours && (!this.workers || this.workers.length === 0)) {
            return next(new Error("Para albaranes de 'hours', debes indicar el total de 'hours' o detallar los 'workers'."));
        }
    }
    next();
});

export default mongoose.model('DeliveryNote', deliveryNoteSchema);