import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkAuhCreateUser } from "../middlewares/check-auth-create-user";

export const mealsRoutes = async (app:FastifyInstance) => {
    app.get('/users',{
        preHandler: [checkAuhCreateUser]
    }, async (req,res) => {
    
        const users = await knex('users').select('*');        

        if(users === undefined){
            return res.status(404).send('No users found');
        }

        return res.status(201).send(users.length < 1 ? 'No users found' : users);
    })  
    
    app.post('/users',{
        preHandler: [checkAuhCreateUser]
    },async (req,res) => {

        const userSchema = z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email('Email inválido'),
        })

        const response = userSchema.safeParse(req.body);

        if(response.success === false){
            return res.status(404).send(response.error.message)
        }

        const {email,id,name} = userSchema.parse(req.body);

        res.cookie('userId', id, {
            path: '/',
        });

        const existUser = await knex('users').where('user_id', id);

        if(existUser.length > 0) return res.status(409).send({
            error: 'User already exists'
        })

        console.log(existUser);

        await knex('users').insert({
            user_id: id,
            name,
            email,
        });

        return res.status(200).send();
    });
}