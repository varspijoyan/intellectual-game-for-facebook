import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { createDb, type AppEnv } from "./db.js";
import { createApiRouter } from "./routes/api.js";
import { createAdminRouter } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  MYSQL_HOST: z.string().default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default("root"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().default("fb_soccer_quiz_game"),
  META_APP_SECRET: z.string().optional(),
  API_BASE_URL: z.string().optional(),
  DEV_AUTH_BYPASS: z.enum(["0", "1"]).optional(),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten());
  throw new Error("Invalid environment variables");
}
const env: AppEnv = parsedEnv.data;
const db = createDb(env);

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req: any, res: any) => {
  res.json({ ok: true, service: "fb-soccer-quiz-api" });
});

app.use("/api", createApiRouter(env, db));
app.use("/v1/admin", createAdminRouter(db));

app.use((err: unknown, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
