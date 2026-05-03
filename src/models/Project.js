import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    projectCode: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        number: { type: String, trim: true },
        postal: { type: String, trim: true },
        city: { type: String, trim: true },
        province: { type: String, trim: true }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    notes: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Un projectCode no puede repetirse dentro de la misma compañía
projectSchema.index({ company: 1, projectCode: 1 });

export default mongoose.model('Project', projectSchema);