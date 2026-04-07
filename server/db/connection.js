import dotenv from "dotenv";
import knex from "knex";
import knexConfig from "../knexfile.js";

dotenv.config({ path: "./.env" });

const db = knex(knexConfig);

export default db;
