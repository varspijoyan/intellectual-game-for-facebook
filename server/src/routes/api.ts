import { Router } from "express";
import type { Env } from "../env.js";
import type { Db } from "../db.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import * as matches from "../services/matches.js";

export function createApiRouter(env: Env, db: Db) {
  const auth = createAuthMiddleware(env, db);
  const r = Router();

  r.get("/me", auth, (req, res) => {
    res.json({ playerId: req.fbPlayerId! });
  });

  r.get("/matches", auth, async (req, res, next) => {
    try {
      const includeCompleted = req.query.includeCompleted === "1" || req.query.includeCompleted === "true";
      const list = await matches.listMatchesForPlayer(db, req.fbPlayerId!, {
        includeCompleted,
      });
      res.json({ matches: list });
    } catch (e) {
      next(e);
    }
  });

  r.post("/matches/solo", auth, async (req, res, next) => {
    try {
      const { matchId, question } = await matches.createSoloMatch(db, req.fbPlayerId!);
      res.status(201).json({ matchId, match: await matches.getMatchDto(db, matchId), question });
    } catch (e) {
      next(e);
    }
  });

  r.post("/matches/async", auth, async (req, res, next) => {
    try {
      const contextId = typeof req.body?.contextId === "string" ? req.body.contextId : "";
      if (!contextId) {
        res.status(400).json({ error: "contextId required" });
        return;
      }
      const { matchId, question } = await matches.createAsyncMatch(db, req.fbPlayerId!, contextId);
      res.status(201).json({ matchId, match: await matches.getMatchDto(db, matchId), question });
    } catch (e) {
      next(e);
    }
  });

  r.post("/matches/:id/join", auth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const result = await matches.joinAsyncMatch(db, id, req.fbPlayerId!);
      if ("error" in result && result.error) {
        const code = result.error === "Match not found" ? 404 : 400;
        res.status(code).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get("/matches/:id", auth, async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const state = await matches.getMatchState(db, id);
    if (!state) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const allowed = state.match.players.some((p) => p.playerId === req.fbPlayerId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(state);
  });

  r.post("/matches/:id/answer", auth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const answerIndex = Number(req.body?.answerIndex);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const result = await matches.submitAnswer(db, id, req.fbPlayerId!, answerIndex);
      if ("error" in result) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
