import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333),
    AUTHORIZATION_MASTERUSER: z.string().uuid(),
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
    throw new Error(_env.error.message)
}

export const env = _env.data;