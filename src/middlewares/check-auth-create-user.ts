import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";

export const checkAuhCreateUser = async (req: FastifyRequest,res:FastifyReply) => {
    

    //  a lógica é pegar a autorização do header e poder criar os usuáios com ela

    // `Bearer fsjfjffn-fsdnmfknsdk-mfdlmfs-fsdknmf-dhashd`

    const {authorization} = req.headers;
    const token = authorization?.split(' ')[1];

    console.log(authorization);
    console.log(token);
    

    if(token !== env.AUTHORIZATION_MASTERUSER){
        return res.status(401).send({
            code: 401,
            error: 'unauthorized, you do not have permission to create a new user'
        });
    }

}