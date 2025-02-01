import { knex as setupKnex, Knex } from "knex";
import { env } from "./env";
import sqlite3 from "sqlite3";

export const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
      filename: env.DATABASE_URL,
    },
    useNullAsDefault: true,
    migrations:{
        directory: './database/migrations'
    },
    pool: {
      afterCreate: (conn: sqlite3.Database, done: (err?: Error | null) => void) => {
        conn.run('PRAGMA foreign_keys = ON;', (err) => {
          if (err) {
            done(err);
          } else {
            done(); 
          }
        });
      },
    },
  };
export const knex = setupKnex(config);