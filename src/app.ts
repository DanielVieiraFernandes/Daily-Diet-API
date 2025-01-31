import fastify from "fastify";
import { mealsRoutes } from "./routes/mealsRoutes";
import cookie from "@fastify/cookie";
import { knex } from "./database";
export const app = fastify();

app.register(cookie);
app.register(mealsRoutes, {
    prefix: 'api'
});