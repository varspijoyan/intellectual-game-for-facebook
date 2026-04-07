import { Router } from "express";
import { createFacebookController } from "../controllers/facebookController.js";

export function createFacebookRoutes(db) {
  const router = Router();
  const facebook = createFacebookController(db);

  router.post("/auth/instant", facebook.instantAuth);
  router.get("/friends", facebook.playerGuard, facebook.friends);

  return router;
}
