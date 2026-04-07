import { Router } from "express";
import { createPlayerAuthController } from "../controllers/playerAuthController.js";
import { authGuard, ROLE_PLAYER } from "../services/authService.js";

export function createPlayerRoutes(db) {
  const router = Router();
  const player = createPlayerAuthController(db);

  router.post("/auth/register", player.register);
  router.post("/auth/login", player.login);
  router.get("/me", authGuard(ROLE_PLAYER), player.me);

  return router;
}
