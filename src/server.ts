import { app } from "./app";
import { env } from "./env";
import { knex } from "./database";


app.listen({
    port: env.PORT,
}).then(() => console.log('listening on port ' + env.PORT))