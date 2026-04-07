import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const config = {
  client: "mysql2",
  connection: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "fb_soccer_quiz_game",
  },
  migrations: {
    directory: "./db/migrations",
    tableName: "knex_migrations",
    extension: "js",
  },
  seeds: {
    directory: "./db/seeds",
    extension: "js",
  },
};

export default config;
