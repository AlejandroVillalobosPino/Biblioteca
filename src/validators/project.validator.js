import { z } from 'zod';

export const createProjectValidator = z.object({
    client: z.string({ required_error: "El ID del cliente es obligatorio" })
        .length(24, "El ID del cliente debe ser un ObjectId válido de Mongoose"),
    name: z.string({ required_error: "El nombre del proyecto es obligatorio" })
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    projectCode: z.string({ required_error: "El código de proyecto es obligatorio" })
        .min(2, "El código debe tener al menos 2 caracteres"),
    email: z.string().email("Formato de email inválido").optional().or(z.literal('')),
    notes: z.string().optional(),
    active: z.boolean().optional(),
    address: z.object({
        street: z.string().optional(),
        number: z.string().optional(),
        postal: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional()
    }).optional()
});

export const updateProjectValidator = createProjectValidator.partial();