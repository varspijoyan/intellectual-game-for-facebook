import type { Request, Response, NextFunction } from "express";
import type { Env } from "../env.js";
import type { Db } from "../db.js";
import { verifySignedPlayerInfo } from "../facebook/verifySignedPlayerInfo.js";

declare global {
  namespace Express {
    interface Request {
      fbPlayerId?: string;
    }
  }
}

export function createAuthMiddleware(env: Env, _db: Db) {
  return function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const bypass = env.DEV_AUTH_BYPASS === "1" && env.NODE_ENV !== "production";
    const devId = req.header("X-Dev-Player-Id");
    if (bypass && devId) {
      req.fbPlayerId = devId;
      return next();
    }

    const secret = env.META_APP_SECRET;
    const raw =
      req.header("Authorization")?.replace(/^Bearer\s+/i, "") ||
      req.header("X-Signed-Player-Info") ||
      "";

    if (!secret || !raw) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = verifySignedPlayerInfo(raw, secret);
    if (!payload) {
      res.status(401).json({ error: "Invalid signed player info" });
      return;
    }
    req.fbPlayerId = payload.playerID;
    next();
  };
}
