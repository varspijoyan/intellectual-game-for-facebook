import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEnvDir = path.resolve(__dirname, "../server");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, serverEnvDir, "");
  return {
    envDir: serverEnvDir,
    base: "./",
    resolve: {
      alias: {
        "@fb-soccer-quiz/shared": path.resolve(__dirname, "../shared/src/index.ts"),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT ?? 5173),
      strictPort: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
