import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export interface RequestWithToken extends FastifyRequest {
    userToken?: string;
}

export const checkUserId = async (req: RequestWithToken, res: FastifyReply) => {

    const {authorization} = req.headers;
    const token = authorization?.split(' ')[1];

    const response = await knex('users').where('user_id', token);



    if (token === undefined) {
        return res.status(401).send({
            error: "Unathorized User"
        })
    }

    req.userToken = token;

}