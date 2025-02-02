import fastify from "fastify";
import { mealsRoutes } from "./routes/mealsRoutes";

export const app = fastify();

app.register(mealsRoutes, {
    prefix: 'api'
});