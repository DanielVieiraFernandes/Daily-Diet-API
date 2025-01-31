import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";
import { env } from "../env";

export const checkAuhCreateUser = async (req: FastifyRequest,res:FastifyReply) => {
    
    const response = await knex('masterUser').select('masterId');

    //  a lógica é pegar a autorização do header e poder criar os usuáios com ela

    // `Bearer fsjfjffn-fsdnmfknsdk-mfdlmfs-fsdknmf-dhashd`

    // const {authorization} = req.headers;
    // const token = authorization?.split(' ')[1];
    

    if(response[0].masterId !== env.AUTHORIZATION_MASTERUSER){
        return res.status(401).send({
            code: 401,
            error: 'unauthorized, you do not have permission to create a new user'
        });
    }

}