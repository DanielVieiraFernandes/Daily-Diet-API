import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkAuhCreateUser } from "../middlewares/check-auth-create-user";
import { checkUserId, RequestWithToken } from "../middlewares/checkUserId";

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

        const {email,name, id} = userSchema.parse(req.body);

        await knex('users').insert({
            user_id: id,
            name,
            email,
        });

        return res.status(200).send();
    });

    app.put('/users/:id', {preHandler: [checkAuhCreateUser]}, async (req, res) => {

        const idSchema = z.object({
            id: z.string().uuid(),
        });

        const response = idSchema.safeParse(req.params);
        if(response.success === false){
            return res.status(404).send(response.error.message)
        }

        const {id} = idSchema.parse(req.params);

        const userSchema = z.object({
            name: z.string({required_error: 'Nome inválido'}),
            email: z.string().email('Email inválido'),
        });

        const {email,name} = userSchema.parse(req.body);

        if(email === undefined && name === undefined){
            return res.status(404).send('Necessário enviar dados para atualizar');
        };

        await knex('users').where({user_id: id}).update({
            name,
            email
        });

        return res.status(200).send();
    });

    app.delete('/users/:id', {preHandler: [checkAuhCreateUser]}, async (req,res) => {
        const idSchema = z.object({
            id: z.string().uuid(),
        });

        const response = idSchema.safeParse(req.params);
        if(response.success === false){
            return res.status(404).send(response.error.message);
        }

        const {id} = response.data;

        const del = await knex('users').where({user_id: id}).delete();
        
        if(del > 0){
            return res.status(200).send();
        }

        return res.status(404).send('User not found');

    });

    app.get('/meals', {preHandler: [checkUserId]}, async (req,res) => {
        const token = (req as RequestWithToken).userToken;

        const meals = await knex('meals').where({userId: token}).select('*');

        if(meals.length > 0){
            return res.status(201).send({meals})
        }

        return res.status(404).send('No meals found');
    });

    app.post('/meals',{preHandler: [checkUserId]}, async (req,res) => {
        const mealSchema = z.object({
            name: z.string(),
            description: z.string().nullable(),
            date: z.string(),
            time: z.string(),
            type: z.enum(['inc', 'out']),
        })

        const response = mealSchema.safeParse(req.body);

        if(response.success === false){
            return res.status(404).send({
                error: response.error.message
            })
        }

        const {date,description,name,time,type} = mealSchema.parse(req.body);

        const token = (req as RequestWithToken).userToken;

        await knex('meals').insert({
            mealId: randomUUID(),
            name,
            description,
            date,
            time,
            type,
            userId: token,
        })

       return res.status(200).send();
    });
}