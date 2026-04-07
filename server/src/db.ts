import knex from "knex";

export type AppEnv = {
  NODE_ENV?: string;
  PORT: number;
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DATABASE: string;
  META_APP_SECRET?: string;
  DEV_AUTH_BYPASS?: "0" | "1";
};

export function createDb(env: AppEnv) {
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
