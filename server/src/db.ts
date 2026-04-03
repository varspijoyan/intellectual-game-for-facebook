import knex from "knex";
import type { Env } from "./env.js";

export function createDb(env: Env) {
  return knex({
    client: "mysql2",
    connection: {
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
    },
    pool: { min: 0, max: 10 },
  });
}

export type Db = ReturnType<typeof createDb>;
