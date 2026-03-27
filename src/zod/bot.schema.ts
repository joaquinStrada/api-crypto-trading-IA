import z from 'zod'

const botSchema = z.object({
    name: z.string({
        error: iss => iss.input === undefined ? 'El nombre es requerido' : 'El nombre debe ser una cadena de texto'
    })
    .min(6, 'El nombre debe tener al menos 6 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
    description: z.string({
        error: iss => iss.input === undefined ? 'La descripcion es requerida' : 'La descripcion debe ser una cadena de texto'
    })
    .min(6, 'La descripcion debe tener al menos 6 caracteres')
    .max(400, 'La descripcion no puede tener más de 400 caracteres'),
    model: z.enum(['llama-3.1-8b-instant', 
                    'llama-3.3-70b-versatile',
                    'openai/gpt-oss-120b',
                    'openai/gpt-oss-20b',
                    'whisper-large-v3',
                    'whisper-large-v3-turbo'], {
                        error: iss => iss.input === undefined ? 'El modelo es requerido'
                        : typeof iss.input !== 'string' ? 'El modelo debe ser una cadena de texto' : 'El modelo no esta soportado'
                    })
})

export default botSchema