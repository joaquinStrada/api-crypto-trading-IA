import z from 'zod'

export const registerSchema = z.object({
    fullname: z.string({
        error: iss => iss.input === undefined ? 'El nombre completo es requerido' : 'El nombre completo debe ser una cadena de texto'
    })
    .min(6, 'El nombre completo debe tener al menos 6 caracteres')
    .max(100, 'El nombre completo no puede tener más de 100 caracteres'),
    email: z.string({
        error: iss => iss.input === undefined ? 'El email es requerido' : 'El email debe ser una cadena de texto'
    })
    .min(6, 'El email debe tener al menos 6 caracteres')
    .max(255, 'El email no puede tener más de 255 caracteres')
    .email('El email no es válido'),
    password: z.string({
        error: iss => iss.input === undefined ? 'La contraseña es requerida' : 'La contraseña debe ser una cadena de texto'
    })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(20, 'La contraseña no puede tener más de 20 caracteres')
})
