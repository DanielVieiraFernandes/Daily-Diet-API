import { FastifyInstance } from "fastify";
import { knex } from "../config/database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkAuhCreateUser } from "../middlewares/check-auth-create-user";
import { checkUserId, RequestWithToken } from "../middlewares/checkUserId";
import { idSchema } from "../validators/idValidator";
import { mealSchema, userSchema } from "../validators/body-validator";
export const mealsRoutes = async (app: FastifyInstance) => {
    app.get('/users', {
        preHandler: [checkAuhCreateUser]
    }, async (req, res) => {

        const users = await knex('users').select('*');

        if (users === undefined) {
            return res.status(404).send('No users found');
        }

        return res.status(201).send(users.length < 1 ? 'No users found' : users);
    })

    app.post('/users', async (req, res) => {

        const response = userSchema.safeParse(req.body);

        if (response.success === false) {
            return res.status(404).send(response.error.message)
        }

        const { email, name } = userSchema.parse(req.body);

        const id = randomUUID();

        await knex('users').insert({
            user_id: id,
            name,
            email,
        });

        return res.status(200).send({
            id: id,
        });
    });

    app.put('/users/:id', { preHandler: [checkAuhCreateUser] }, async (req, res) => {


        const response = idSchema.safeParse(req.params);
        if (response.success === false) {
            return res.status(404).send(response.error.message)
        }

        const { id } = response.data;

        const userSchema = z.object({
            name: z.string({ required_error: 'Nome inválido' }),
            email: z.string().email('Email inválido'),
        });

        const { email, name } = userSchema.parse(req.body);

        if (email === undefined && name === undefined) {
            return res.status(404).send('Necessário enviar dados para atualizar');
        };

        await knex('users').where({ user_id: id }).update({
            name,
            email
        });

        return res.status(200).send();
    });

    app.delete('/users/:id', { preHandler: [checkAuhCreateUser] }, async (req, res) => {


        const response = idSchema.safeParse(req.params);
        if (response.success === false) {
            return res.status(404).send(response.error.message);
        }

        const { id } = response.data;

        const del = await knex('users').where({ user_id: id }).delete();

        if (del > 0) {
            return res.status(200).send();
        }

        return res.status(404).send('User not found');

    });

    app.get('/meals', { preHandler: [checkUserId] }, async (req, res) => {
        const token = (req as RequestWithToken).userToken;

        const meals = await knex('meals').where({ userId: token }).select('*');

        if (meals.length > 0) {
            return res.status(201).send({ meals })
        }

        return res.status(404).send('No meals found');
    });

    app.get('/meals/:id', {
        preHandler: [checkUserId]
    }, async (req, res) => {

        const token = (req as RequestWithToken).userToken;

        const response = idSchema.safeParse(req.params);
        if (response.success === false) {
            return res.status(404).send({ error: response.error.message })
        }

        const { id } = response.data;

        const meal = await knex('meals').where({
            mealId: id,
            userId: token,
        }).first();

        if (meal) {
            return res.status(201).send(meal);
        }

        return res.status(404).send({
            error: 'Meal not found'
        })

    });

    app.post('/meals', { preHandler: [checkUserId] }, async (req, res) => {
       

        const response = mealSchema.safeParse(req.body);

        if (response.success === false) {
            return res.status(404).send({
                error: response.error.message
            })
        }

        const { date, description, name, time, type } = mealSchema.parse(req.body);

        const token = (req as RequestWithToken).userToken;

        const inc = type === "inc" ? 1 : 0;
        const out = type === "out" ? 1 : 0;

        await knex('users').where({
            user_id: token
        }).update({
            meals_quantity: knex.raw('meals_quantity + ?', [1]),
            meals_inc: knex.raw('meals_inc + ?', [inc]),
            meals_out: knex.raw('meals_out + ?', [out]),
            current_sequence: type === 'inc' ? knex.raw('current_sequence + ?', [inc]) : 0
        })

        const currentSequence = await knex('users').where({
            user_id: token
        }).first('*');
        
        if(currentSequence && currentSequence.current_sequence > currentSequence.best_sequence){
            await knex('users').where({
                user_id: token
            }).update('best_sequence', currentSequence.current_sequence);
        }

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

    app.delete('/meals/:id', {
        preHandler: [checkUserId],
    }, async (req, res) => {
        const token = (req as RequestWithToken).userToken;

        const response = idSchema.safeParse(req.params);
        if (response.success === false) {
            return res.status(404).send({ error: response.error.message })
        }

        const { id } = response.data;


        const del = await knex('meals').where({ mealId: id, userId: token }).delete();

        if (del > 0) {
            return res.status(200).send();
        }

        return res.status(404).send({ error: 'Meal not found' });

    });

    app.put('/meals/:id', {
        preHandler: [checkUserId],
    },
    async (req, res) => {

        const token = (req as RequestWithToken).userToken;

        const response = idSchema.safeParse(req.params);
        if (response.success === false) {
            return res.status(404).send({ error: response.error.message })
        }

        const { id } = response.data;

        const responseBody = mealSchema.safeParse(req.body);
        if(responseBody.success === false){
            return res.status(404).send({ error: responseBody.error.message })
        }

        const {date,description,name,time,type} = responseBody.data;


        const editMeal = await knex('meals').where({
            mealId: id,
            userId: token
        }).update({
            date,
            description,
            name,
            time,
            type,
        })

        if(editMeal === 0){
            return res.status(404).send({
                error: 'Meal Not found'
            })
        }

        return res.status(200).send();
    }
    )
}