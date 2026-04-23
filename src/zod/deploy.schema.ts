import z from 'zod'

const deploySchema = z.object({
    name: z.string({
        error: iss => iss.input === undefined ? 'El nombre es requerido' : 'El nombre debe ser una cadena de texto'
    })
    .min(6, 'El nombre debe tener al menos 6 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
    description: z.string({
        error: iss => iss.input === undefined ? 'La descripción es requerida' : 'La descripción debe ser una cadena de texto'
    })
    .min(6, 'La descripción debe tener al menos 6 caracteres')
    .max(400, 'La descripción no puede tener más de 400 caracteres')
})

export default deploySchema