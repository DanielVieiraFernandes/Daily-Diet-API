import { z } from "zod";

const mealSchema = z.object({
    name: z.string(),
    description: z.string().nullable(),
    date: z.string(),
    time: z.string(),
    type: z.enum(['inc', 'out']),
})

const userSchema = z.object({
    name: z.string(),
    email: z.string().email('Email inválido'),
})

const updateUserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email('Email inválido'),
    meals_quantity: z.number().int('Este campo deve ser um número inteiro'),
    meals_inc: z.number().int('Este campo deve ser um número inteiro'),
    meals_out: z.number().int('Este campo deve ser um número inteiro'),
    best_sequence: z.number().int('Este campo deve ser um número inteiro'),
})

export {mealSchema, userSchema}