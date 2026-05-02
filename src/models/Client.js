import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    cif: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        number: { type: String, trim: true },
        postal: { type: String, trim: true },
        city: { type: String, trim: true },
        province: { type: String, trim: true }
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índice para búsquedas más rápidas y evitar duplicados exactos (opcional pero recomendado)
clientSchema.index({ company: 1, cif: 1 });

export default mongoose.model('Client', clientSchema);