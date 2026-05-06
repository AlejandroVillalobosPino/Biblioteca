import { z } from 'zod';

const baseDeliveryNoteSchema = z.object({
    project: z.string({ required_error: "El ID del proyecto es obligatorio" })
        .length(24, "El ID del proyecto debe ser un ObjectId válido"),
    format: z.enum(['material', 'hours'], { required_error: "El formato debe ser 'material' o 'hours'" }),
    description: z.string({ required_error: "La descripción es obligatoria" })
        .min(5, "La descripción debe tener al menos 5 caracteres"),
    workDate: z.string({ required_error: "La fecha de trabajo es obligatoria" })
        .datetime({ message: "Formato de fecha inválido (usa ISO 8601)" })
        .or(z.date()),

    // Opcionales
    material: z.string().optional(),
    quantity: z.number().positive("La cantidad debe ser mayor a 0").optional(),
    unit: z.string().optional(),

    hours: z.number().positive("Las horas deben ser mayores a 0").optional(),
    workers: z.array(
        z.object({
            name: z.string().min(1, "El nombre del trabajador es obligatorio"),
            hours: z.number().positive("Las horas deben ser mayores a 0")
        })
    ).optional()
});

const deliveryNoteRefinement = (data, ctx) => {
    if (data.format === 'material') {
        if (!data.material || data.quantity === undefined || !data.unit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "En formato 'material', los campos material, quantity y unit son obligatorios",
                path: ['format']
            });
        }
    } else if (data.format === 'hours') {
        if (data.hours === undefined && (!data.workers || data.workers.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "En formato 'hours', debes proporcionar el total de hours o el array de workers",
                path: ['format']
            });
        }
    }
};

export const createDeliveryNoteValidator = baseDeliveryNoteSchema.superRefine(deliveryNoteRefinement);

export const updateDeliveryNoteValidator = baseDeliveryNoteSchema.partial().superRefine(deliveryNoteRefinement);