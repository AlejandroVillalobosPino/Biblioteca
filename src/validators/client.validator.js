import { z } from 'zod';

export const createClientValidator = z.object({
    name: z.string({ required_error: "El nombre es obligatorio" })
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    cif: z.string({ required_error: "El CIF/NIF es obligatorio" })
        .min(5, "CIF/NIF inválido"),
    email: z.string({ required_error: "El email es obligatorio" })
        .email("Formato de email inválido"),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        number: z.string().optional(),
        postal: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional()
    }).optional()
});

// Para actualizar, hacemos que todos los campos sean opcionales
export const updateClientValidator = createClientValidator.partial();