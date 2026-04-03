import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createConnection } from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const host = process.env.MYSQL_HOST ?? "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? "root";
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE ?? "fb_soccer_quiz_game";

  const conn = await createConnection({ host, port, user, password });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, "")}\``);
  await conn.end();
  console.log(`Database ready: ${database}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
