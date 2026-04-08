import {
  ROLE_PLAYER,
  hashPassword,
  normalizeRole,
  signAccessToken,
  verifyPassword,
} from "../services/authService.js";
import { createPlayerUser, findPlayerByUserId, findUserByEmail, findUserById } from "../services/userService.js";

export function createPlayerAuthController(db) {
  async function register(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const displayName = String(req.body?.displayName || "").trim();
    const locale = String(req.body?.locale || "en").trim();

    if (!email || !password) return res.status(400).json({ error: "email and password are required" });
    if (password.length < 8) return res.status(400).json({ error: "password must be at least 8 characters" });

    const exists = await findUserByEmail(db, email);
    if (exists) return res.status(409).json({ error: "email already exists" });

    const passwordHash = await hashPassword(password);
    const user = await createPlayerUser(db, { email, passwordHash, displayName, locale });
    const token = signAccessToken(user);
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }

  async function login(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await findUserByEmail(db, email);
    if (!user || normalizeRole(user.role) !== ROLE_PLAYER || !user.is_active) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signAccessToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }

  async function me(req, res) {
    const userId = Number(req.auth.sub);
    const user = await findUserById(db, userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const player = await findPlayerByUserId(db, user.id);
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      player: player
        ? {
            displayName: player.display_name,
            locale: player.locale,
            coinBalance: player.coin_balance,
            fbPlayerId: player.fb_player_id,
            fbUserId: player.fb_user_id,
          }
        : null,
    });
  }

  return { register, login, me };
}
