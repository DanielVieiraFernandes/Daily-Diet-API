import { FastifyReply, FastifyRequest } from "fastify";

export const checkUserId = async (req: FastifyRequest, res: FastifyReply) => {

    const userId = req.cookies.userId;

    if (!userId) {
        return res.status(401).send({
            error: "Unathorized User"
        })
    }

}